const axios = require('axios');

const OWNER_NAME = '👑 HaSSaN BrOvHi 👑';

module.exports = {
    name: 'bluearchive',
    aliases: ['ba', 'blue'],
    
    async execute(sock, m, args) {
        try {
            await m.reply(`⏳ Fetching Blue Archive image...\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`);
            
            const imageUrl = `https://api-rebix.zone.id/api/bluearchive`;
            
            const response = await axios({
                method: 'get',
                url: imageUrl,
                responseType: 'arraybuffer',
                timeout: 30000
            });
            
            const buffer = Buffer.from(response.data);
            
            // 🛡️ Safe send using sock.sendMessage
            await sock.sendMessage(m.chat || m.from || (m.key && m.key.remoteJid), { 
                image: buffer, 
                caption: `Here is your Blue Archive image! 🖤\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}` 
            }, { quoted: m });
            
        } catch (err) {
            console.error('bluearchive error:', err);
            await m.reply(`❌ Failed to fetch image.\n\n${err.message}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`);
        }
    }
};
