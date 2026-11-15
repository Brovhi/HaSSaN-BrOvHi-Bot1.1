const axios = require('axios');

const OWNER_NAME = '👑 HaSSaN BrOvHi 👑';

module.exports = {
    name: 'brovhi',
    description: 'Auto reply audio when Brovhi is detected',

    async execute() {},

    async onMessage(sock, m) {
        if (!m.text) return;

        const text = m.text.trim().toLowerCase();

        // 👇 Yahan trigger word change kar diya hai (xlicon ki jagah brovhi/hassan)
        if (text !== 'brovhi' && text !== 'hassan') return;

        try {
            const prefix = global.BOT_PREFIX || '.';

            // 👇 Reply text mein aapki branding add ki hai
            await m.reply(
                `ɪꜰ ʏᴏᴜ ɴᴇᴇᴅ ʜᴇʟᴘ, ᴛʏᴘᴇ ${prefix}ᴍᴇɴᴜ\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`
            );

            const audioUrl = 'https://files.catbox.moe/bo5yvg.mp3';

            const response = await axios.get(audioUrl, {
                responseType: 'arraybuffer'
            });

            const audio = Buffer.from(response.data);

            await sock.sendMessage(m.from, {
                audio,
                mimetype: 'audio/mpeg',
                ptt: false
            });

        } catch (err) {
            console.error('❌ Brovhi Plugin Error:', err);
        }
    }
};
