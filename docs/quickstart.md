# Quickstart

This guide gets FASTCHAT-WEB running locally against a fastchat-mcp backend.

## Prerequisites

- Node.js 20+ (Node.js 22 recommended)
- npm
- A running fastchat-mcp backend

Backend reference:

- https://github.com/rb58853/fastchat-mcp

## 1. Install dependencies

```bash
npm install
```

## 2. Create environment file

```bash
cp .env.example .env
```

Example `.env`:

```env
REACT_APP_WS_URL=ws://localhost:8000/
REACT_APP_TOKEN=your-master-token-here
# Optional
# REACT_APP_CHAT_ID=your-chat-id
```

Notes:

- `REACT_APP_WS_URL` may be `http(s)` or `ws(s)`; the app converts it to a WebSocket URL.
- The client appends `/chat/admin` path internally.

## 3. Start development server

```bash
npm run start
```

Open:

- http://localhost:3000

## 4. Configure additional MCP servers (optional)

On the Home page:

1. Add one MCP server config at a time.
2. Save entries to the local list.
3. Edit/remove entries as needed.

At runtime, the client sends all saved entries as `additional_servers` on the first WebSocket message.

## 5. Build for production

```bash
npm run build
```

Output:

- `build/`

## Troubleshooting

- If port `3000` is already in use, stop the existing process or run on another port.
- If connection fails, verify backend status, `REACT_APP_WS_URL`, and `REACT_APP_TOKEN`.
- If server configs behave unexpectedly, clear browser localStorage key `fastchat-additional-servers` and re-add entries.
