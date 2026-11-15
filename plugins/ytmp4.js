const yts = require('yt-search');

// 👇 Aapki Branding
const OWNER_NAME = '👑 𝐇𝐚𝐒𝐒𝐚𝐧 𝐁𝐫𝐎𝐯𝐇𝐢 👑';
const BOT_NAME = 'HaSSaN BrOvHi MD';
const USER_PIC = 'https://i.imgur.com/oeMC33b.jpeg'; // Aapki Pic

let lastQuality = 720;

module.exports = {
    name: 'ymp4',
    description: 'Download YouTube video as MP4 (link or search)',
    aliases: ['ytmp4', 'ytvideo'],
    tags: ['downloader'],
    command: /^\.?(ymp4|ytmp4|ytvideo)\b/i,

    async execute(sock, m, args) {
        const chatId = m.key.remoteJid;
        const input = args.join(' ').trim();

        if (!input) {
            return m.reply(`Usage:\n.ymp4 <YouTube link or search query>\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`);
        }

        try {
            await sock.sendMessage(chatId, {
                react: { text: '🎬', key: m.key }
            });

            let finalUrl = input;
            let searchInfo = null;

            if (!/^https?:\/\//i.test(input)) {
                const results = await yts(input);

                if (!results?.videos?.length) {
                    return m.reply(`❌ No YouTube results found.\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`);
                }

                searchInfo = results.videos[0];
                finalUrl = searchInfo.url;
            }

            const apiUrl = 'https://api-abztech.zone.id/download/omdown?url=' + encodeURIComponent(finalUrl);

            const apiRes = await fetch(apiUrl);
            const data = await apiRes.json();

            if (!apiRes.ok || !data?.success) {
                return m.reply(`❌ API Error: ${data?.message || 'Failed to get video.'}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`);
            }

            const title = data.title || searchInfo?.title || 'YouTube Video';

            const videos = data.formats
                .filter(f => f.kind === 'video' && f.ext === 'mp4')
                .map(f => ({
                    ...f,
                    quality: Number(f.label.match(/(\d+)p/i)?.[1] || 0)
                }));

            lastQuality = lastQuality === 480 ? 720 : 480;

            const selected = videos.find(v => v.quality === lastQuality) || videos[0];

            if (!selected) {
                return m.reply(`❌ No MP4 format found.\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`);
            }

            const MAX_SIZE = 64 * 1024 * 1024;

            await m.reply(`⏳ Checking video size...\n\n🎬 ${title}\n📺 Quality: ${selected.quality}p\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`);

            const videoRes = await fetch(selected.url);

            if (!videoRes.ok) {
                throw new Error(`Download failed: HTTP ${videoRes.status}`);
            }

            const contentLength = Number(videoRes.headers.get('content-length'));

            if (contentLength > MAX_SIZE) {
                await videoRes.body?.cancel();
                return m.reply(`❌ Video exceeds 64 MB. Download cancelled.\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`);
            }

            const chunks = [];
            let totalSize = 0;

            for await (const chunk of videoRes.body) {
                totalSize += chunk.length;

                if (totalSize > MAX_SIZE) {
                    await videoRes.body?.cancel();
                    return m.reply(`❌ Video exceeds 64 MB. Download cancelled.\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`);
                }

                chunks.push(chunk);
            }

            const buffer = Buffer.concat(chunks);

            if (!buffer.length) {
                throw new Error('Downloaded video is empty.');
            }

            const safeName = title
                .replace(/[\\/:*?"<>|]/g, '')
                .trim()
                .slice(0, 100) || 'video';

            await sock.sendMessage(
                chatId,
                {
                    video: buffer,
                    mimetype: 'video/mp4',
                    fileName: `${safeName}.mp4`,
                    caption: `🎬 *${title}*\n\n` +
                             `📺 *Quality:* ${selected.quality}p\n` +
                             `📦 *Size:* ${(buffer.length / (1024 * 1024)).toFixed(2)} MB\n\n` +
                             `ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ ʙʏ ${OWNER_NAME}`,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363230794474148@newsletter',
                            // 👇 Newsletter Name Change
                            newsletterName: BOT_NAME, 
                            serverMessageId: 1
                        },
                        // 👇 Premium Ad-Reply Card add kar diya hai
                        externalAdReply: {
                            title: title.substring(0, 30) + (title.length > 30 ? '...' : ''),
                            body: `Downloaded by ${BOT_NAME}`,
                            thumbnailUrl: USER_PIC,
                            mediaType: 1,
                            sourceUrl: "https://wa.me/923373730931", // Aapka number
                            renderLargerThumbnail: true,
                            showAdAttribution: false
                        }
                    }
                },
                m.quoted ? { quoted: m.quoted } : {}
            );

            await sock.sendMessage(chatId, {
                react: { text: '✅', key: m.key }
            });

        } catch (err) {
            console.error('YMP4 error:', err);
            await m.reply(`❌ Download failed.\n\n${err.message || 'Unknown error'}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`);
        }
    }
};
