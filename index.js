const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')
const fs = require('fs')
const path = require('path')
const config = require('./config')

const plugins = new Map()

const loadPlugins = () => {
    const pluginFolder = path.join(__dirname, 'plugins')
    if (!fs.existsSync(pluginFolder)) fs.mkdirSync(pluginFolder)
    
    const files = fs.readdirSync(pluginFolder).filter(file => file.endsWith('.js'))
    for (const file of files) {
        try {
            delete require.cache[require.resolve(path.join(pluginFolder, file))]
            const plugin = require(path.join(pluginFolder, file))
            if (plugin.pattern) {
                plugins.set(plugin.pattern, plugin)
                console.log(`✅ Loaded Plugin: ${file}`)
            }
        } catch (e) {
            console.log(`❌ Error in ${file}:`, e.message)
        }
    }
}
loadPlugins()

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
        logger: P({ level: 'silent' })
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) startBot()
        } else if (connection === 'open') {
            console.log(`\n👑 ${config.botName} is Online!\n`)
        }
    })

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        if (!msg.message || msg.key.fromMe) return

        const type = Object.keys(msg.message)[0]
        const text = (type === 'conversation') ? msg.message.conversation 
                   : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : ''
        
        if (!text || !text.startsWith(config.prefix)) return

        const args = text.slice(config.prefix.length).trim().split(/ +/)
        const commandName = args.shift().toLowerCase()
        
        for (const [pattern, plugin] of plugins.entries()) {
            if (pattern === commandName) {
                try {
                    const fakeMessage = {
                        key: msg.key,
                        text: text,
                        sender: msg.key.participant || msg.key.remoteJid,
                        reply: (txt) => sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg }),
                        sock: sock
                    }
                    await plugin.execute(fakeMessage, args)
                } catch (e) {
                    console.log(`Error in ${commandName}:`, e)
                }
                break
            }
        }
    })
}

startBot()
