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


## Deploy to Heroku

This bot is a long-running WhatsApp WebSocket client and does not provide an
HTTP website. The included `Procfile` therefore declares a single `worker`
process, not a `web` process.

### Deploy with Heroku CLI

1. Install Git and the Heroku CLI, then sign in:

   ```bash
   heroku login
   ```

2. From the project root, initialize Git if needed and create the app:

   ```bash
   git init
   git add .
   git commit -m "Prepare HaSSaN BrOvHi MD for Heroku"
   heroku create your-unique-app-name
   ```

3. Set the required config vars (use your real owner number):

   ```bash
   heroku config:set BOT_NAME="HaSSaN BrOvHi MD"
   heroku config:set OWNER_NUMBER="923001234567"
   heroku config:set PREFIX="."
   heroku config:set SESSION_NAME="sessions/hassan-brovhi-md"
   ```

4. Deploy and start one worker:

   ```bash
   git push heroku main
   heroku ps:scale worker=1
   heroku logs --tail
   ```

   If your branch is named `master`, use `git push heroku master` instead.

5. On the first run, the worker prints a QR code in its logs. Open the logs
   and link the WhatsApp account using WhatsApp → Linked devices → Link a device.

### Important: Heroku storage and WhatsApp sessions

Heroku dyno filesystems are ephemeral. Files written to `sessions/` and
`data/group-settings.json` can disappear whenever a dyno restarts or is replaced.
This means the linked-device session may be lost and a new QR scan may be needed;
group preferences may also reset.

Do not scale this bot to multiple worker dynos: each instance would try to use
the same WhatsApp account independently. Keep exactly one worker.

For reliable production use, replace local Baileys auth-file storage and the
local group-settings JSON file with a secure persistent external store (for
example, an encrypted database/object store with restricted access and backups).
Do not put session credentials in Git, logs, or public storage. The project
does not claim to provide persistent Heroku session storage by itself.

Official Heroku references:
- https://devcenter.heroku.com/articles/getting-started-with-nodejs
- https://devcenter.heroku.com/articles/dynos
- https://devcenter.heroku.com/articles/preparing-a-codebase-for-heroku-deployment


## Link with a phone-number pairing code (instead of QR)

A WhatsApp pairing code is requested by the bot before the WhatsApp account
has been linked. It cannot be requested by a `.pair` message sent to the bot:
before linking, the bot is not connected to WhatsApp and cannot receive commands.

Set `PAIRING_NUMBER` to the phone number you own or are authorized to link,
including country code, digits only (no `+` or spaces). Example:

```bash
PAIRING_NUMBER=923001234567 npm start
```

On Heroku:

```bash
heroku config:set PAIRING_NUMBER=923001234567
heroku restart
heroku logs --tail
```

The worker prints a one-time linking code. In WhatsApp on the phone being
linked, open **Linked devices → Link a device → Link with phone number instead**
and enter the code. After linking, remove the variable so a new code is not
requested unnecessarily:

```bash
heroku config:unset PAIRING_NUMBER
```

Treat the pairing code like a password: do not post it publicly or send it to
anyone. The code is for linking your own account, not for authorizing another
person's account.
  
