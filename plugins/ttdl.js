const axios = require('axios');
const fs = require('fs');

module.exports = {
    name: 'tiktok',
    description: 'Download TikTok videos without watermark',
    aliases: ['tt', 'tiktokdl', 'ttdl'],
    tags: ['downloader'],
    command: /^\.?(tiktok|tt|tiktokdl|ttdl)$/i,

    async execute(sock, m, args) {
        let filePath;
        try {
            if (!args.length) {
                return await m.reply(`ᴜsᴀɢᴇ: .ᴛɪᴋᴛᴏᴋ <ᴜʀʟ>

ᴇxᴀᴍᴘʟᴇ: .ᴛɪᴋᴛᴏᴋ https://www.tiktok.com/@scout2015/video/6718335390845095173`);
            }

            const url = args[0];

            if (!url.includes('tiktok.com')) {
                return await m.reply('ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ᴛɪᴋᴛᴏᴋ ᴜʀʟ');
            }

            await m.reply('ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ᴛɪᴋᴛᴏᴋ ᴠɪᴅᴇᴏ...');

            const apiUrl = `https://api-abztech.zone.id/download/ttdnl?url=${encodeURIComponent(url)}`;

            const response = await axios.get(apiUrl, { timeout: 30000 });
            const data = response.data;

            if (!data || data.success !== true || data.type !== 'video' || !data.video) {
                return await m.reply('ғᴀɪʟᴇᴅ ᴛᴏ ғᴇᴛᴄʜ ᴛɪᴋᴛᴏᴋ ᴠɪᴅᴇᴏ\nᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ');
            }

            const videoUrl = data.video;

            const videoResponse = await axios.get(videoUrl, {
                responseType: 'arraybuffer',
                timeout: 60000,
                maxContentLength: 200 * 1024 * 1024,
                headers: {
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Origin': 'https://www.tikwm.com',
                    'Referer': 'https://www.tikwm.com/',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const videoBuffer = Buffer.from(videoResponse.data);
            const fileName = `tiktok_${Date.now()}.mp4`;

            if (!fs.existsSync('./temp')) {
                fs.mkdirSync('./temp', { recursive: true });
            }

            filePath = `./temp/${fileName}`;
            fs.writeFileSync(filePath, videoBuffer);

            const stats = data.stats || {};
            const author = data.author || {};

            const caption = `*ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*

ᴛɪᴛʟᴇ: ${data.title || 'ɴᴏ ᴛɪᴛʟᴇ'}
ᴅᴜʀᴀᴛɪᴏɴ: ${data.duration || 'ɴ/ᴀ'}s
ᴠɪᴇᴡs: ${stats.play || 0}
ʟɪᴋᴇs: ${stats.like || 0}
ᴄᴏᴍᴍᴇɴᴛs: ${stats.comment || 0}
sʜᴀʀᴇs: ${stats.share || 0}

ᴀᴜᴛʜᴏʀ: ${author.nickname || 'ᴜɴᴋɴᴏᴡɴ'}
@${author.username || ''}

𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿𝙀𝘿 𝘽𝙔 𝙃𝙖𝙎𝙎𝙖𝙉 𝘽𝙧𝙊𝙫𝙃𝙞`;

            await sock.sendMessage(m.from, {
                video: fs.readFileSync(filePath),
                caption: caption,
                mimetype: 'video/mp4'
            });

        } catch (err) {
            console.error('TikTok Error:', err);
            await m.reply(`ᴇʀʀᴏʀ: ${err.message}`);
        } finally {
            if (filePath && fs.existsSync(filePath)) {
                try { fs.unlinkSync(filePath); } catch (_) {}
            }
        }
    }
};
        
