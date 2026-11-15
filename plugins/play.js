const axios = require('axios');
const pix = require('pixcore');
const yts = require('yt-search');

const OWNER_NAME = '👑 𝐇𝐚𝐒𝐒𝐚𝐧 𝐁𝐫𝐎𝐯𝐇𝐢 👑';

module.exports = {
    name: 'play',
    description: 'Search YouTube and choose MP3 or MP4 to download',
    aliases: ['yt', 'song'],
    command: /^\.?(play|yt|song)/i,

    async execute(sock, m, args) {
        await m.react('🎧');
        const prefix = global.BOT_PREFIX || '.';
        const chatId = m.key.remoteJid;
        const query = args.join(" ").trim();

        if (!query) {
            return await m.reply(`Usage:\n${prefix}play <youtube link or search query>\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`);
        }

        try {
            await sock.sendMessage(chatId, {
                react: { text: '🎵', key: m.key }
            });

            let finalUrl = query;
            let title = "YouTube Video";
            let thumbUrl = null;

            // 🔍 Search YouTube if input is not a link
            if (!query.includes("youtube.com") && !query.includes("youtu.be")) {
                const results = await yts(query);

                if (!results || !results.videos || results.videos.length === 0) {
                    return await m.reply(`❌ No results found on YouTube.\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`);
                }

                finalUrl = results.videos[0].url;
                title = results.videos[0].title;
                thumbUrl = results.videos[0].thumbnail;
            } else {
                const results = await yts(query);
                if (results && results.videos && results.videos.length > 0) {
                    title = results.videos[0].title;
                    thumbUrl = results.videos[0].thumbnail;
                }
            }

            // 🖼️ Process Thumbnail
            let thumb;
            try {
                const { data } = await axios.get(thumbUrl, { responseType: 'arraybuffer' });
                const img = await pix.read(Buffer.from(data));
                const resized = await img.resize(120, 120, { fit: 'cover' });
                thumb = await resized.toBuffer({ format: 'jpeg', quality: 85 });
            } catch {
                thumb = null;
            }

            // 📤 Send Interactive Buttons
            await sock.relayMessage(
                chatId,
                {
                    buttonsMessage: {
                        text: `🎬 *${title}*\n\nChoose a format to download:`,
                        contentText: `🎬 *${title}*\n\nChoose a format to download:`,
                        // 👇 Footer changed to your branding
                        footerText: `> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`, 
                        locationMessage: {
                            name: title,
                            address: "YouTube Downloader",
                            jpegThumbnail: thumb
                        },
                        buttons: [
                            {
                                buttonId: `${prefix}ytmp3 ${finalUrl}`,
                                buttonText: { displayText: '🎵 MP3' },
                                type: 1
                            },
                            {
                                buttonId: `${prefix}ymp4 ${finalUrl}`,
                                buttonText: { displayText: '🎬 MP4' },
                                type: 1
                            }
                        ],
                        headerType: 6
                    }
                },
                {
                    additionalNodes: [
                        {
                            tag: 'biz',
                            attrs: {},
                            content: [
                                {
                                    tag: 'interactive',
                                    attrs: { type: 'native_flow', v: '1' },
                                    content: [
                                        { tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            );

        } catch (err) {
            console.error('Play error:', err);
            await m.reply(`❌ Failed to process request.\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`);
        }
    }
};
