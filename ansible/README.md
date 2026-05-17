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
  -e dev_domain=<your-dev-domain> \
  -e letsencrypt_email=<address-for-expiry-notices>
```

`letsencrypt_email` is **required** — the playbook fails fast if it's missing. The mailbox must accept Let's Encrypt expiry notifications (use the same address you'd put in a future `security.txt`).

Default domains in `playbook.yml` are placeholders — override with `-e` or edit `vars:` in the playbook.

DNS must resolve `prod_domain` and `dev_domain` to the EC2 public IP before applying, otherwise the ACME http-01 challenge will fail. Verify with `dig +short <prod_domain>` first.

## After running

TLS is now handled inline. The playbook:
- installs a bootstrap HTTP-only vhost on port 80,
- requests a Let's Encrypt cert per domain via `certbot --webroot` (idempotent — skipped if `/etc/letsencrypt/live/<domain>/fullchain.pem` already exists),
- replaces the bootstrap vhost with the full TLS-enabled template (HSTS, CSP, OCSP stapling, TLS 1.2/1.3 only),
- enables `certbot.timer` for automatic renewal.

Check:
- `curl -I http://<prod_domain>/` → `301` redirect to `https://`
- `curl -I https://<prod_domain>/` → `200`, with `Strict-Transport-Security` + `Content-Security-Policy` headers
- `curl -I https://<prod_domain>/path/founder` → `200`, `Content-Type: text/html` (SPA fallback)
- `sudo systemctl list-timers certbot.timer` → active timer scheduled
- `sudo systemctl status nginx` → active
- `sudo systemctl status healthaiatlas-main.service` → inactive/disabled (legacy)

## What the playbook does

1. Installs nginx, certbot, and the certbot nginx plugin (idempotent).
2. Stops and disables `healthaiatlas-main.service` and `healthaiatlas-dev.service` (the old Next.js `next start` units). Fails silently if they never existed.
3. Creates `/var/www/healthaiatlas/`, `/var/www/healthaiatlas-dev/`, and the ACME challenge webroot `/var/www/letsencrypt/.well-known/acme-challenge/`.
4. Installs a bootstrap HTTP-only vhost if no cert exists yet, so certbot can answer the http-01 challenge before the TLS vhost is in place.
5. Requests a Let's Encrypt cert per domain via webroot if one doesn't already exist.
6. Installs the final TLS-enabled nginx vhost from the Jinja template — 80→443 redirect, TLS 1.2/1.3, HSTS, CSP, SPA fallback (`try_files`), aggressive cache for hashed assets, no-cache for `index.html`.
7. Enables both vhosts, removes the default nginx site, enables `certbot.timer`.
8. Validates config and reloads nginx.
