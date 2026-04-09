# Docker Up

This document explains how to run FASTCHAT-WEB with Docker Compose.

## Files used

- `docker-compose.dev.yaml`
- `dockerfile`

## Run with Docker Compose

```bash
docker compose -f docker-compose.dev.yaml up --build
```

App URL:

- http://localhost:3000

## Stop containers

```bash
docker compose -f docker-compose.dev.yaml down
```

## Pass environment variables

You can define runtime variables by enabling an env file in `docker-compose.dev.yaml`.

Current compose file includes commented example:

```yaml
# env_file:
#   - .env
```

If you enable it, make sure `.env` contains the required frontend variables:

- `REACT_APP_WS_URL`
- `REACT_APP_TOKEN`
- `REACT_APP_CHAT_ID` (optional)

## Notes

- The frontend still requires a reachable fastchat-mcp backend over WebSocket.
- Ensure your backend host/port is reachable from the browser where FASTCHAT-WEB is opened.
