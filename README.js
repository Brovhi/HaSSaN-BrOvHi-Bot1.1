# HaSSaN BrOvHi MD — private pairing website (Heroku)

This edition runs the WhatsApp bot and a small **owner-authenticated** pairing website in the **same Node.js process** on one Heroku `web` dyno. Do not split them into separate web/worker dynos: they need access to the same live Baileys socket.

## Deploy to Heroku

1. Create a new Heroku app.
2. Upload this project to a GitHub repository, then connect that repository in Heroku **Deploy**; or deploy with the Heroku CLI.
3. In **Settings → Config Vars**, set:
   - `PAIRING_NUMBER`: your own WhatsApp number including country code, digits only, no `+` (example format: `15551234567`).
   - `PAIRING_USER`: a private username.
   - `PAIRING_PASSWORD`: a unique random password of at least 20 characters. Do not share it.
   - Set the bot's other config values as needed (`OWNER_NUMBER`, `PREFIX`, etc.).
4. Deploy the app. Ensure the app has exactly one `web` dyno running.
5. Open `https://YOUR-APP-NAME.herokuapp.com`. Your browser will ask for the owner username and password (HTTP Basic Auth over Heroku HTTPS).
6. Press **Generate pairing code**. In WhatsApp on the number configured in `PAIRING_NUMBER`, open **Linked devices → Link a device → Link with phone number instead**, then enter the code.
7. Keep the code private. It can authorize a linked device. Never send it to another person or enter a code supplied by someone else.

## Important security and hosting notes

- The portal does not accept a phone number from website visitors. The recipient number is fixed in the Heroku Config Var, so a visitor cannot request codes for arbitrary numbers.
- Every page and API endpoint requires owner authentication. Pair-code requests are rate-limited. Use a unique long password and do not share it.
- This is a private admin tool, not a public pairing-code generator.
- **Heroku dyno filesystems are ephemeral.** The existing `useMultiFileAuthState` session folder can be lost when a dyno restarts or is replaced. This starter is suitable for testing, but reliable production sessions require secure persistent storage or a host with a persistent volume. Never commit or publish the `HaSSaN BrOvHi MD` session folder.
- Keep dependencies updated and review Baileys/WhatsApp terms and platform rules. Use only with an account you own or are authorized to manage.
- If WhatsApp is already linked, the site will refuse to generate another code. Log out/unlink intentionally before setting up a fresh session.

## Run locally

```bash
npm install
cp .env.example .env
# Set PAIRING_NUMBER, PAIRING_USER, PAIRING_PASSWORD in .env
npm start
```
Open `http://localhost:3000`; enter your owner credentials when prompted. Use only your own WhatsApp account.
