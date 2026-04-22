# healthaiatlas — backend

This folder will hold the server-side stack for healthaiatlas. Stack is TBD — likely Node/Express or FastAPI.

Not yet implemented. The frontend (`../frontend`) is a pure static SPA and does not require a backend to run.

When backend lands here, update:

- `.github/workflows/deploy.yml` — add a backend build + deploy job
- `../ansible/playbook.yml` — add nginx `/api/` reverse proxy and a systemd unit for the backend process
- `../README.md` (root) — document API endpoints and integration points

## Contract expected by frontend (future)

Frontend currently reads all data from TypeScript modules in `frontend/src/data/`. When backend comes online, those data modules will be replaced by fetch calls. Backend should expose:

- `GET /api/players` — directory entities
- `GET /api/claims` — verified claims
- `GET /api/domains` — domain metadata
- (etc. — match the shape of files in `frontend/src/data/`)

Auth, write endpoints, and per-user state are out of scope until the use case demands them.
