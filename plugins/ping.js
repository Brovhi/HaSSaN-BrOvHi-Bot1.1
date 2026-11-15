const OWNER_NAME = '👑 HaSSaN BrOvHi 👑';
const BOT_NAME = 'HaSSaN BrOvHi MD';

module.exports = {
    name: 'ping',
    aliases: ['speed', 'latency'],
    description: `Check bot response speed — By ${OWNER_NAME}`,

    async execute(sock, m, args) {
        try {
            // React with a stopwatch
            try { await m.react('⏱️'); } catch (e) {}
            
            const start = Date.now();
            const sentMsg = await m.reply('_🏓 Pinging..._');
            const latency = Date.now() - start;

            // 📊 Speedometer Logic
            let statusText = '100% Fast!';
            let bar = '████████████████████';
            
            if (latency > 200 && latency <= 500) {
                statusText = '70% Normal';
                bar = '██████████████░░░░░░';
            } else if (latency > 500) {
                statusText = '40% Slow';
                bar = '████████░░░░░░░░░░░░';
            }

            const info = `⚡ *PING RESULT* ⚡\n` +
                         `🚀 *Latency:* ${latency} ms\n` +
                         `[${bar}] ${statusText}\n\n` +
                         `> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`;

            const chatId = m.chat || m.from || (m.key && m.key.remoteJid);

            // 🛡️ Safe Edit
            try {
                await sock.sendMessage(chatId, {
                    text: info,
                    edit: sentMsg.key
                });
            } catch (err) {
                // Agar edit fail ho jaye (jo ke common hai), toh naya message bhej dein
                console.error('Ping edit error, sending new message');
                await sock.sendMessage(chatId, { text: info }, { quoted: m });
            }

        } catch (error) {
            console.error('Ping Error:', error);
            await m.reply(`❌ *Error:* ${error.message}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`);
        }
    }
};
