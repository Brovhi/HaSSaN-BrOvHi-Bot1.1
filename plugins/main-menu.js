const axios = require('axios');

const OWNER_NAME = '👑 𝐇𝐚𝐒𝐒𝐚𝐧 𝐁𝐫𝐎𝐯𝐇𝐢 👑';
const BOT_NAME = '𝐇𝐚𝐒𝐒𝐚𝐧 𝐁𝐫𝐎𝐯𝐇𝐢 𝐌𝐃';
const MENU_IMG = 'https://i.imgur.com/oeMC33b.jpeg'; // Aapki Pic

module.exports = {
    name: 'menu',
    description: 'Show available bot commands',
    aliases: ['help', 'cmdlist', 'commands'],

    async execute(sock, m) {
        await m.react('✔️');
        
        const prefix = global.BOT_PREFIX || '.';

        const now = new Date();

        // 👇 Timezone Pakistan (Asia/Karachi) kar diya hai
        const date = now.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'Asia/Karachi'
        });

        const time = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: 'Asia/Karachi'
        });

        const user = m.pushName || m.sender?.split('@')[0] || 'User';

        // 👇 Menu Text (Aapki Branding ke sath)
        const menuText = `
┌─ム ${BOT_NAME}
│ *ᴏᴡɴᴇʀ:* ${OWNER_NAME}
│ *ᴜsᴇʀ:* ${user}
│ *ᴅᴀᴛᴇ:* ${date}
│ *ᴛɪᴍᴇ:* ${time} (PKT)
│ *ᴘʀᴇғɪx:* ${prefix}
╰──────────────────╯

┌─ム ᴀᴠᴀɪʟᴀʙʟᴇ ᴄᴏᴍᴍᴀɴᴅs
│
├─ム *ɢᴇɴᴇʀᴀʟ*
│ ᪣ ${prefix}ᴀʟɪᴠᴇ
│ ᪣ ${prefix}ᴘɪɴɢ
│ ᪣ ${prefix}ᴜᴘᴛɪᴍᴇ
│ ᪣ ${prefix}ᴏᴡɴᴇʀ
│ ᪣ ${prefix}ᴍᴇɴᴜ
│
├─ム *ᴅᴏᴡɴʟᴏᴀᴅᴇʀs*
│ ᪣ ${prefix}ᴛɪᴋᴛᴏᴋ / ${prefix}ᴛᴛ
│ ᪣ ${prefix}ʏᴛᴍᴘ3
│ ᪣ ${prefix}ɪɢ
│ ᪣ ${prefix}ᴘʟᴀʏ
│
├─ム *ᴛᴏᴏʟs*
│ ᪣ ${prefix}sᴛɪᴄᴋᴇʀ
│ ᪣ ${prefix}ᴏᴄʀ
│ ᪣ ${prefix}ᴡʀɪᴛᴇ
│ ᪣ ${prefix}ᴛᴛs
│ ᪣ ${prefix}ᴘᴏʟʟ
│
├─ム *ᴀɪ*
│ ᪣ ${prefix}ᴀɪ
│ ᪣ ${prefix}ᴀɪsᴇᴀʀᴄʜ
│ ᪣ ${prefix}ɢᴇɴ
│
├─ム *ɢʀᴏᴜᴘ*
│ ᪣ ${prefix}ᴛᴀɢᴀʟʟ
│ ᪣ ${prefix}ᴀʟʟ
│ ᪣ ${prefix}ᴄᴏᴜᴘʟᴇᴘᴘ
│ ᪣ ${prefix}ɢɪɴғᴏ
│
├─ム *ᴀᴅᴍɪɴ*
│ ᪣ ${prefix}ᴋɪᴄᴋ
│ ᪣ ${prefix}ᴘʀᴏᴍᴏᴛᴇ
│ ᪣ ${prefix}ᴅᴇᴍᴏᴛᴇ
│ ᪣ ${prefix}ᴀɴᴛɪʟɪɴᴋ
│
╰─────────◆────────╯

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}
`.trim();

        try {
            const imageBuffer = (await axios.get(MENU_IMG, {
                responseType: 'arraybuffer'
            })).data;

            // Image ke sath caption bhejein
            await sock.sendMessage(m.from, {
                image: Buffer.from(imageBuffer),
                caption: menuText
            }, { quoted: m });

        } catch (err) {
            console.error('Menu error:', err);
            
            // Agar image load na ho, toh sirf text bhej dein
            await m.reply(menuText);
        }
    }
};
