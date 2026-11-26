# HaSSaN BrOvHi MD

A modular WhatsApp bot using Node.js ES modules and `@whiskeysockets/baileys@7.0.0-rc14`.

## Requirements

- Node.js 20+
- A WhatsApp account you are authorized to link
- Bot admin role for moderation commands

## Install

```bash
npm install
cp .env.example .env
```

Edit `.env` and set `OWNER_NUMBER` to the owner's full international phone number using digits only (no `+`).

Start:

```bash
npm start
```

Scan the QR shown in the terminal using WhatsApp → Settings → Linked devices → Link a device. The session is saved under `sessions/`; do not share it or commit it.

## Commands

| Command | Description |
|---|---|
| `.ping` | Response latency |
| `.alive` | Bot status |
| `.menu` | List commands |
| `.owner` | Owner contact card |
| `.groupinfo` | Group details |
| `.tagall [message]` | Mention group members (admin) |
| `.delete` / `.del` | Reply to a message to delete it (admin) |
| `.antilink on/off` | Toggle invite-link moderation (admin) |
| `.welcome on/off` | Toggle join messages (admin) |
| `.goodbye on/off` | Toggle leave messages (admin) |

Group settings are stored in `data/group-settings.json`.

## Security / deployment notes

- Keep `.env`, `sessions/`, and `data/group-settings.json` private.
- Use a process supervisor such as PM2, systemd, or Docker restart policies. Uncaught exceptions are logged and terminate the process because continuing after an unknown exception is unsafe.
- `useMultiFileAuthState` is convenient for a small bot. For high-volume production deployments, use a purpose-built persistent auth/key store and back it up securely.
- Anti-link removes a non-admin member who posts a WhatsApp invite link only when the setting is enabled and the bot is a group admin. Test in a private group first.
- The bot ignores its own messages, status broadcasts, and configured blocked numbers. Add blocked numbers to `BLOCKED_NUMBERS` as a comma-separated list.
- Plugins are trusted local JavaScript modules. Do not load plugins supplied by untrusted users.
- Baileys is an unofficial WhatsApp Web client library. Use it responsibly and follow applicable WhatsApp terms and local rules.
