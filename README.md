# FASTCHAT-WEB

FASTCHAT-WEB is a React-based web client for fastchat-mcp.

Its main purpose is to connect to a fastchat-mcp backend over WebSocket and provide a clean UI for:

- sending natural-language queries,
- visualizing intermediate workflow/subquery steps,
- receiving streamed assistant responses,
- configuring additional MCP servers from the browser.

Related repositories:

- fastchat-mcp backend: https://github.com/rb58853/fastchat-mcp
- FASTCHAT-WEB frontend: https://github.com/rb58853/fastchat-web

## Table of Contents

- [Architecture at a Glance](#architecture-at-a-glance)
- [Documentation Index](#documentation-index)
- [Configuration Overview](#configuration-overview)
- [Additional MCP Servers (UI)](#additional-mcp-servers-ui)
- [Security Notice](#security-notice)
- [Project Structure](#project-structure)

## Architecture at a Glance

1. The frontend builds a WebSocket URL from environment variables.
2. It connects to the fastchat-mcp WebSocket endpoint at `/chat/admin`.
3. If additional MCP servers exist in browser storage, it sends them once as an `additional_servers` envelope.
4. It then sends user queries and renders workflow steps plus final response.

## Documentation Index

- [Quickstart](docs/quickstart.md)
- [Docker Run Guide](docs/docker-up.md)

## Configuration Overview

Environment variables are read from `.env` (based on `.env.example`):

- `REACT_APP_WS_URL`: base backend URL (http/https/ws/wss supported; normalized to WebSocket).
- `REACT_APP_TOKEN`: backend token.
- `REACT_APP_CHAT_ID` (optional): chat/session identifier.

For step-by-step setup, see [Quickstart](docs/quickstart.md).

## Additional MCP Servers (UI)

The Home screen lets you add MCP servers one by one.

- Server entries are stored in browser `localStorage` under `fastchat-additional-servers`.
- On the first message of a WebSocket session, the app sends:

```json
{
  "type": "additional_servers",
  "data": {
    "example_private_mcp": {
      "protocol": "httpstream",
      "httpstream-url": "http://127.0.0.1:8000/example-mcp-server/mcp",
      "name": "example-mpc-server",
      "description": "Example MCP server with oauth required."
    }
  }
}
```

Reference format for server config:

- fastchat-mcp config docs: https://github.com/rb58853/fastchat-mcp?tab=readme-ov-file#file-fastchatconfigjson

## Security Notice

This project is intended for development and testing.

- Sensitive data entered in server JSON fields (headers, auth payloads, tokens) is stored in browser localStorage.
- Avoid using production secrets in shared or untrusted environments.
- For production-grade usage, fork and harden the project to your security standards.

## Project Structure

```text
src/
  componets/
    home/   # Home page, MCP server configuration UI
    chat/   # WebSocket chat logic and message rendering
  i18n/     # EN/ES translations
```
