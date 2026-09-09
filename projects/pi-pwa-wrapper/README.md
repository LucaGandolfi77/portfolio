# Pi Agent PWA wrapper

A dependency-light PWA shell around the [Pi coding agent](https://pi.dev). It gives
you a chat UI in the browser — and as an installable app — over Pi's RPC mode:

- **Streaming transcript**: text, thinking, tool calls and results rendered as they arrive
- **Workspace picker**: choose which directory the agent reads / runs bash in / edits
- **Models & thinking**: switch model or reasoning level from the toolbar
- **Images**: attach screenshots/photos with your message (sent to the model)
- **Extension UI**: `select` / `confirm` / `input` / `editor` dialogs plus
  `notify` / `setStatus` / `setWidget` / `setTitle` from Pi extensions
- **Queue controls**: steer (interrupt after the current tool batch), follow-up, abort
- **Session tools**: new session, token/cost stats, context-compaction notices
- **PWA**: manifest + service worker + icons — install it as a standalone app

```
┌──────────────────────┐   WebSocket (JSON)   ┌──────────────────────────────┐   JSONL over   ┌──────────────┐
│  Browser / PWA app   │ ◄──────────────────► │  server/index.js             │ ◄────────────► │  pi --mode   │
│  public/ (chat UI)   │                      │  one AgentBridge per client  │   stdin/stdout │  rpc         │
└──────────────────────┘                      └──────────────────────────────┘                └──────────────┘
```

Each browser connection gets its own `pi --mode rpc` subprocess, so multiple tabs/users
are isolated. The agent works in the workspace you pick (the server's root directory or
one of its subdirectories).

## Requirements

- Node.js ≥ 18
- [Pi](https://pi.dev) installed and available as `pi` on PATH (or point the server at
  it with `PI_BINARY`, e.g. the path to the npm global `.../dist/bundle/cli.js`)
- Model credentials Pi can use (set the usual env vars, or run `pi auth` first)

## Quick start

```bash
npm install
npm start            # http://localhost:8787
```

Open http://localhost:8787 in a browser, pick a workspace from the dropdown, and chat.
To try the demo extension that exercises the PWA dialogs:

```bash
PI_ARGS="--extension $(pwd)/examples-extension/pwa-demo.js" npm start
# then send  /pwa-select   /pwa-confirm   /pwa-input   /pwa-editor   /pwa-widget
```

### Install as an app

On the site, use the browser menu **Install app / Add to Home screen**, or trigger the
install prompt if the browser offers it. The service worker caches the UI shell so it
loads offline (chatting still needs the server).

## Configuration (environment)

| Variable          | Default              | Purpose                                                        |
| ----------------- | -------------------- | -------------------------------------------------------------- |
| `PORT`            | `8787`               | HTTP + WebSocket port                                          |
| `HOST`            | `0.0.0.0`            | Bind address                                                   |
| `PI_PWA_ROOT`     | server working dir   | Root directory browsed for workspaces                          |
| `PI_PWA_TOKEN`    | *(unset)*            | If set, WebSocket clients must connect with `?token=…`         |
| `PI_BINARY`       | auto-detect          | Override the pi executable (or path to its `cli.js`)           |
| `PI_ARGS`         | *(unset)*            | Extra CLI args for each agent, e.g. `--extension /path/x.ts`   |
| `NODE_ENV`        | *(unset)*            | Currently unused (kept for future logging controls)            |

The token is meant to stop casual access on a LAN, **not** to secure the agent from a
malicious client: whoever can reach the WebSocket can ask the agent to run shell
commands. Run the server on a machine you trust and keep it off the public internet,
or put it behind your own reverse proxy / VPN.

## Browser ⇄ server protocol

The WebSocket endpoint is `/ws`. Both directions use JSON messages with a `kind` field.

Client → server:

| kind             | payload                                   | effect                          |
| ---------------- | ----------------------------------------- | ------------------------------- |
| `rpc`            | `{ msg }`                                 | forward one Pi RPC command      |
| `list_workspaces`|                                           | list root + subdirectories      |
| `set_workspace`  | `{ path }`                                | restart agent in that directory |
| `restart`        |                                           | fresh agent session             |
| `status`         |                                           | ask for agent status            |

Server → client:

| kind            | payload                                             |
| --------------- | --------------------------------------------------- |
| `hello`         | `{ root, pi, time }`                                |
| `workspaces`    | `{ entries: [{name, path, isRoot}] }`               |
| `status`        | `{ phase: starting\|running\|exited\|failed, cwd }` |
| `agent_event`   | `{ event }` — one parsed Pi RPC event/response      |
| `agent_stderr`  | `{ text }`                                          |
| `error`         | `{ message }`                                       |

Everything Pi emits on stdout (responses, `message_update`, `tool_execution_*`,
`agent_*`, `extension_ui_request`, …) is re-emitted verbatim as `agent_event`, so the
wrapper stays forward-compatible with Pi's RPC protocol — see the Pi docs
(`docs/rpc.md`) for the event reference. Dialog-type `extension_ui_request`s are
rendered by the PWA; the user's answer is sent back with a Pi `extension_ui_response`.

## Layout

```
pi-pwa-wrapper/
├── package.json
├── README.md
├── server/
│   ├── index.js         # static server + WebSocket bridge
│   ├── agent-bridge.js  # one pi RPC subprocess per connection
│   ├── pi.js            # pi discovery / spawn + JSONL framing
│   └── workspaces.js    # safe workspace listing under a root
├── public/
│   ├── index.html
│   ├── manifest.webmanifest
│   ├── sw.js            # offline app shell
│   ├── css/style.css
│   ├── js/
│   │   ├── ws-client.js # resilient WebSocket client
│   │   ├── render.js    # bubbles + small safe markdown renderer
│   │   └── app.js       # state machine, streaming, dialogs
│   └── icons/           # generated icons (scripts/make-icons.mjs)
├── examples-extension/
│   └── pwa-demo.js       # extension exercising all wrapper UI surfaces
└── scripts/
    ├── make-icons.mjs   # regenerate PNG icons (no deps)
    ├── smoke.mjs        # end-to-end bridge check (needs a working model)
    └── smoke-ext.mjs    # extension-UI dialog round-trip check
```

## Security notes

- The agent runs **real shell commands as your user** inside the chosen workspace.
  It can read and modify files there. That is the point — treat it like running `pi`.
- Sessions are ephemeral: when the browser tab closes, the per-tab agent process is
  terminated. The on-screen transcript is persisted locally (localStorage) so history
  survives reloads, but the agent itself starts fresh on the next visit.
- Attachment images are sent to the model provider, base64 inline, exactly like Pi's
  own prompt-image support.

## Development

Regenerate icons after changing `scripts/make-icons.mjs`:

```bash
npm run icons
```
