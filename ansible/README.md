# Server provisioning (ansible)

One-shot playbook that configures the EC2 host to serve healthaiatlas as static files via nginx. Replaces the legacy `next start` systemd services.

## Prerequisites

- `ansible` installed locally (`pip install ansible` or `brew install ansible`)
- SSH access to the EC2 host with sudo privileges
- The following env vars in your shell:
  - `DEPLOY_HOST` — e.g. `ec2-XX-XX-XX-XX.compute-1.amazonaws.com`
  - `DEPLOY_USER` — default `ubuntu`
  - `DEPLOY_PORT` — default `22`
  - `DEPLOY_SSH_KEY_PATH` — absolute path to the SSH private key

## Dry run (no changes)

```bash
ansible-playbook -i ansible/inventory.yml ansible/playbook.yml --check --diff
```

## Apply

```bash
ansible-playbook -i ansible/inventory.yml ansible/playbook.yml \
  -e prod_domain=<your-prod-domain> \
  -e dev_domain=<your-dev-domain>
```

Default domains in `playbook.yml` are placeholders — override with `-e` or edit `vars:` in the playbook.

## After running

SSL/HTTPS is not handled by this playbook. If certs existed for the old vhosts, they may already work on new listeners. Otherwise:

```bash
ssh $DEPLOY_USER@$DEPLOY_HOST
sudo certbot --nginx -d <prod_domain> -d <dev_domain>
```

Check:
- `curl -I http://<prod_domain>/` → 200, `Server: nginx`
- `curl -I http://<prod_domain>/path/founder` → 200 with `Content-Type: text/html` (SPA fallback)
- `sudo systemctl status nginx` → active
- `sudo systemctl status healthaiatlas-main.service` → inactive/disabled (legacy)

## What the playbook does

1. Installs nginx (idempotent).
2. Stops and disables `healthaiatlas-main.service` and `healthaiatlas-dev.service` (the old Next.js `next start` units). Fails silently if they never existed.
3. Creates `/var/www/healthaiatlas/` and `/var/www/healthaiatlas-dev/` with ownership for the deploy user (so GitHub Actions rsync can write).
4. Installs nginx vhosts from the Jinja template — SPA fallback (`try_files`), aggressive cache for hashed assets, no-cache for `index.html`, basic security headers.
5. Enables both vhosts and removes the default nginx site.
6. Validates config and reloads nginx.
