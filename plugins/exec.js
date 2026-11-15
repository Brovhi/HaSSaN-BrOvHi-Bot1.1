const util = require('util')
const axios = require('axios')
const Jimp = global.Jimp || require('jimp')

let sentOnce = new Set()

// 👇 Aapki Branding
const OWNER_NAME = '👑 HaSSaN BrOvHi 👑';
const USER_PIC = 'https://i.imgur.com/oeMC33b.jpeg';

module.exports = {
    name: 'exec',
    aliases: ['$'],
    description: 'Execute JavaScript code (Owner only)',

    async execute() {},

    async onMessage(sock, m) {
        if (!m?.text) return
        if (!m.text.startsWith('$')) return
        if (sentOnce.has(m.id)) return
        sentOnce.add(m.id)

        try {
            if (!m.isOwner) return

            const code = m.text.slice(1).trim()

            if (!code) {
                await m.reply(`☑️ ʀᴇsᴜʟᴛ:\n\`\`\`\nᴜɴᴅᴇғɪɴᴇᴅ\n\`\`\``)
                return
            }

            // 👇 Yahan Naam Change kiya hai
            const info = `*${OWNER_NAME} Exec*`

            const sandbox = {
                sock,
                m,
                axios,
                util,
                Jimp: global.Jimp,
                console,
                proto: global.proto,
                prepareWAMessageMedia: global.prepareWAMessageMedia,
                generateWAMessageContent: global.generateWAMessageContent,
                generateWAMessageFromContent: global.generateWAMessageFromContent,
                generateMessageID: global.generateMessageID
            }

            const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

            let result
            if (code.includes('await') || code.includes('\n')) {
                result = await new AsyncFunction(...Object.keys(sandbox), code)(
                    ...Object.values(sandbox)
                )
            } else {
                result = await new Function(
                    ...Object.keys(sandbox),
                    `return (${code})`
                )(...Object.values(sandbox))
            }

            let output
            if (result === undefined) {
                output = 'ᴜɴᴅᴇғɪɴᴇᴅ'
            } else if (typeof result === 'string') {
                output = result
            } else {
                output = util.inspect(result, {
                    depth: 3,
                    colors: false,
                    maxArrayLength: 50
                })
            }

            const text = `☑️ ʀᴇsᴜʟᴛ:\n\`\`\`\n${output.slice(0, 4000)}\n\`\`\``

            // Safe image sending
            let imageBuffer = null
            try {
                imageBuffer = (await axios.get(USER_PIC, { responseType: 'arraybuffer' })).data
            } catch {}

            if (imageBuffer) {
                await sock.sendMessage(m.chat || m.from, { 
                    image: imageBuffer, 
                    caption: `${info}\n${text}`
                }, { quoted: m })
            } else {
                await m.reply(`${info}\n${text}`)
            }

        } catch (err) {
            await m.reply(`❌ Error:\n\`\`\`\n${err.stack || err.message}\n\`\`\``)
        } finally {
            setTimeout(() => sentOnce.delete(m.id), 5000)
        }
    }
            }
