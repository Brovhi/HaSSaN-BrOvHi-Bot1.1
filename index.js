require('./config')
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const http = require('http');
const QRCode = require('qrcode');
const { Boom } = require('@hapi/boom');
const { sendButtons, sendInteractiveMessage } = require('gifted-btns');
const { getSession } = require('./lib/fetchSession.js')
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage, generateWAMessageContent, generateWAMessageFromContent, generateMessageID, prepareWAMessageMedia, fetchLatestWaWebVersion, proto, generateProfilePicture, Browsers } = require('@whiskeysockets/baileys');
const serializeMessage = require('./handler.js');
const JimpImport = require('jimp');

const Jimp =
  JimpImport.read
    ? JimpImport
    : JimpImport.Jimp
    ? JimpImport.Jimp
    : JimpImport.default;

global.generateWAMessageContent = generateWAMessageContent;
global.generateWAMessageFromContent = generateWAMessageFromContent;
global.generateMessageID = generateMessageID;
global.prepareWAMessageMedia = prepareWAMessageMedia;
global.proto = proto;
global.Jimp = Jimp;
global.generateProfilePicture = generateProfilePicture;
global.downloadMediaMessage = downloadMediaMessage;
global.bannedChats = global.bannedChats || [];


async function ensureSession() {
    const credsPath = path.join(__dirname, 'session', 'creds.json');

    if (fs.existsSync(credsPath)) {
        console.log('[session] creds.json already exists, skipping fetch');
        return;
    }
    if (!global.sessionid) {
        console.log('[session] no SESSIONID set, will use QR/pairing');
        return;
    }

    console.log('[session] fetching session from API...');
    const raw = await getSession(global.sessionid);
    if (!raw) throw new Error('getSession returned empty');

    const sessionData = typeof raw === 'string' ? JSON.parse(raw) : raw;

    if (!sessionData || typeof sessionData !== 'object' || !sessionData.noiseKey) {
        throw new Error('Fetched session is not a valid Baileys creds object');
    }

    fs.mkdirSync(path.dirname(credsPath), { recursive: true });
    fs.writeFileSync(credsPath, JSON.stringify(sessionData, null, 2));
    console.log('[session] creds.json written');
}


const AUTH_FOLDER = './session';
const PLUGIN_FOLDER = './plugins';
const PORT = process.env.PORT || 8000;

let latestQR = '';
let botStatus = 'disconnected';
let pairingCodes = new Map();
let presenceInterval = null;
let isConnecting = false;

async function loadPrefix() {
    const configPath = path.join(__dirname, 'config.json');
    if (fs.existsSync(configPath)) {
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (config.prefix) {
                global.BOT_PREFIX = config.prefix;
                console.log(`Loaded prefix: ${global.BOT_PREFIX}`);
            }
        } catch (err) {
            console.error('Error loading config:', err);
        }
    }

    try {
        await ensureSession();
    } catch (err) {
        console.error('[session] failed:', err.message);
    }

    await startBot();
}

async function startBot() {
    console.log('Starting HaSSaN BrOvHi MD...');
    isConnecting = true;

    if (!fs.existsSync(AUTH_FOLDER)) {
        fs.mkdirSync(AUTH_FOLDER, { recursive: true });
    }

    const credsPath = path.join(AUTH_FOLDER, 'creds.json');
    if (fs.existsSync(credsPath)) {
        try {
            const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
            if (creds.noiseKey && creds.noiseKey.private) {
                console.log('Using existing session...');
            } else {
                console.log('Invalid session detected, will create new one...');
            }
        } catch (err) {
            console.log('Corrupted session, will create new one...');
        }
    }

    try {
        const { version, isLatest } = await fetchLatestWaWebVersion();
        console.log(`Using WA v${version.join(".")}, isLatest: ${isLatest}`);

        const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
            
        const sock = makeWASocket({
            version, 
            logger: pino({ level: 'silent' }),
            auth: state,
            keepAliveIntervalMs: 10000,
            markOnlineOnConnect: true,
            syncFullHistory: false,
            browser: Browsers.ubuntu('Chrome'),
            connectTimeoutMs: 60000
        });
            
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                QRCode.toDataURL(qr, (err, url) => {
                    if (!err) {
                        latestQR = url;
                    }
                });
            }

            if (connection === 'close') {
                botStatus = 'disconnected';
                isConnecting = false;

                if (presenceInterval) {
                    clearInterval(presenceInterval);
                    presenceInterval = null;
                }

                const statusCode = (lastDisconnect?.error instanceof Boom)
                    ? lastDisconnect.error.output.statusCode
                    : 0;

                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                if (shouldReconnect) {
                    setTimeout(async () => await startBot(), 3000);
                } else {
                    if (fs.existsSync(AUTH_FOLDER)) {
                        fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
                    }
                    setTimeout(async () => await startBot(), 3000);
                }
            } else if (connection === 'open') {
                botStatus = 'connected';
                isConnecting = false;

                if (!global.owners) global.owners = [];
                
                // 👇 Yahan aapka number hardcode kar diya hai
                const myNumber = '923373730931@s.whatsapp.net';
                if (!global.owners.includes(sock.user.id)) {
                    global.owners.push(sock.user.id);
                }
                if (!global.owners.includes(myNumber)) {
                    global.owners.push(myNumber);
                }

                try {
                    await sock.sendMessage(sock.user.id, {
                        text: `👑 *HaSSaN BrOvHi MD* \n\n✅ Bot linked successfully!\n⚙️ Current prefix: ${global.BOT_PREFIX || '.'}\n👤 Owners: ${global.owners.length}\n⏰ Connected at: ${new Date().toLocaleString()}`
                    });
                } catch (err) {}
                
            } else if (connection === 'connecting') {
                botStatus = 'connecting';
                isConnecting = true;
            }
        });
        

        sock.ev.on('creds.update', async () => {
            await saveCreds();
            console.log('Credentials updated');
        });

        const plugins = new Map();
        const pluginPath = path.join(__dirname, PLUGIN_FOLDER);
            
        if (fs.existsSync(pluginPath)) {
            try {
                const pluginFiles = fs.readdirSync(pluginPath).filter(file => file.endsWith('.js'));
                    
                for (const file of pluginFiles) {
                    try {
                        const plugin = require(path.join(pluginPath, file));
                        if (plugin.name && typeof plugin.execute === 'function') {
                            plugins.set(plugin.name.toLowerCase(), plugin);
                            if (Array.isArray(plugin.aliases)) {
                                plugin.aliases.forEach(alias => {
                                    plugins.set(alias.toLowerCase(), plugin);
                                });
                            }
                            console.log(`Loaded plugin: ${plugin.name}`);
                        } else {
                            console.warn(`Invalid plugin structure in ${file}`);
                        }
                    } catch (error) {
                        console.error(`Failed to load plugin ${file}:`, error.message);
                    }
                }
                console.log(`Total plugins loaded: ${plugins.size}`);
            } catch (error) {
                console.error('Error loading plugins:', error);
            }
        } else {
            console.log('No plugins folder found');
        }
        
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify' && type !== 'append') return;
    
            // 👇 ABZTECH ka Newsletter Auto-React hata diya hai
            
            for (const rawMsg of messages) {
                if (rawMsg.key.remoteJid === 'status@broadcast' && rawMsg.key.participant) {
                    try {
                        console.log(`Status detected from: ${rawMsg.key.participant}`);
                        await sock.readMessages([rawMsg.key]);
                        continue;
                    } catch (err) {
                        console.log('Status viewer error:', err.message);
                    }
                }
            }

            const rawMsg = messages[0];
            if (!rawMsg.message) return;

            const m = await serializeMessage(sock, rawMsg);

            for (const plugin of plugins.values()) {
                if (typeof plugin.onMessage === 'function') {
                    try { 
                        const blocked = await plugin.onMessage(sock, m);
                        if (blocked === true) return;
                    } catch (err) { 
                        console.error(`onMessage error (${plugin.name}):`, err); 
                    }
                }
            }

            if (m.body && m.body.startsWith(global.BOT_PREFIX || '.')) {
                const args = m.body.slice((global.BOT_PREFIX || '.').length).trim().split(/\s+/);
                const commandName = args.shift().toLowerCase();
                const plugin = plugins.get(commandName);
        
                if (plugin) {
                    try { 
                        await plugin.execute(sock, m, args); 
                    } catch (err) { 
                        console.error(`Plugin error (${commandName}):`, err); 
                        await m.reply('Error running command.'); 
                    }
                }
            }
        });
        
        sock.ev.on('group-participants.update', async (update) => {
            try {
                if (!global.welcomeConfig?.enabled) return
                const groupId = update.id

                for (const participant of update.participants) {
                    const userId = typeof participant === 'string' ? participant : participant.phoneNumber || participant.id
                    if (!userId) continue
                    
                    const memberName = userId.split('@')[0]
                    if (update.action === 'add') {
                        if (userId === sock.user.id) continue
                        const text = `👋 Welcome @${memberName}!\n\nGlad to have you in this group! 🖤`

                        await sock.sendMessage(groupId, {
                            text,
                            mentions: [userId]
                        })

                    } else if (update.action === 'remove') {
                        const text = `👋 Bye @${memberName}.\n\nWe are not gonna miss you! 🤡`

                        await sock.sendMessage(groupId, {
                            text,
                            mentions: [userId]
                        })
                    }
                }
            } catch (err) {
                console.error('group-participants.update error:', err)
            }
        })

    } catch (error) {
        console.error('Bot startup error:', error);
        isConnecting = false;
        setTimeout(async () => await startBot(), 10000);
    }
}

// 🛠️ HTTP SERVER (Pura fix kar diya hai)
const server = http.createServer((req, res) => {
    const url = req.url;
    
    if (url === '/api/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: botStatus,
            qr: latestQR,
            uptime: process.uptime(),
            pairingCode: null 
        }));
        return;
    }

    if (url === '/' || url === '/qr') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HaSSaN BrOvHi MD - Bot Status</title>
    <style>
        body { background-color: #121212; color: #fff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .container { max-width: 600px; margin: 40px auto; padding: 20px; background: #1e1e1e; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); text-align: center; }
        h1 { color: #25D366; }
        #qrArea { margin: 20px 0; padding: 20px; border: 1px dashed #444; border-radius: 8px; min-height: 250px; display: flex; align-items: center; justify-content: center; flex-direction: column; }
        #statusLabel { font-weight: bold; padding: 5px 10px; border-radius: 20px; background: #333; }
        .status-connected { color: #28a745 !important; }
        .status-connecting { color: #ffc107 !important; }
        .status-disconnected { color: #dc3545 !important; }
    </style>
</head>
<body>
    <div class="container">
        <h1>👑 HaSSaN BrOvHi MD 👑</h1>
        <p>Status: <span id="statusLabel" class="status-disconnected">Disconnected</span></p>
        <p>Prefix: <b>${global.BOT_PREFIX || '.'}</b></p>
        <p>Uptime: <span id="uptime">0s</span></p>
        <hr style="border-color: #333;">
        <div id="qrArea">
            <p>Waiting for QR Code...</p>
        </div>
    </div>

    <script>
        let refreshInterval = setInterval(fetchStatus, 3000);
        
        function updateUptime(uptime) {
            const seconds = Math.floor(uptime);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            document.getElementById('uptime').innerText = 
                (hours > 0 ? hours + 'h ' : '') + 
                (minutes % 60 > 0 ? minutes % 60 + 'm ' : '') + 
                (seconds % 60) + 's';
        }

        async function fetchStatus() {
            try {
                const resp = await fetch('/api/status');
                const data = await resp.json();
                
                const statusElem = document.getElementById('statusLabel');
                statusElem.innerText = data.status.toUpperCase();
                statusElem.className = 'status-' + data.status;
                updateUptime(data.uptime);

                const qrArea = document.getElementById('qrArea');
                if (data.status === 'connected') {
                    qrArea.innerHTML = '<h2 style="color:#25D366;">✅ Bot Connected Successfully!</h2>';
                    clearInterval(refreshInterval); // Stop checking when connected
                } else if (data.qr) {
                    qrArea.innerHTML = '<img src="' + data.qr + '" style="width:250px; height:250px; border-radius:8px; background:#fff; padding:10px;"><p>Scan with WhatsApp</p>';
                }
            } catch (err) {
                console.log('Error fetching status');
            }
        }
        fetchStatus();
    </script>
</body>
</html>`);
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`\n🌐 Web Server running on port ${PORT}`);
    console.log(`👉 Open the website to scan QR or check status.\n`);
});

// Start the bot
loadPrefix();
