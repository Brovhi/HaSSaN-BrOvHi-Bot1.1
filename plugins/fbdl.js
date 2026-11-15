module.exports = {
    name: 'facebook',
    description: 'Download Facebook videos',
    aliases: ['fb', 'fbdl', 'facebookdl'],
    tags: ['downloader'],
    command: /^\.?(facebook|fb|fbdl|facebookdl)$/i,

    async execute(sock, m, args) {
        try {
            if (!args.length) {
                return await m.reply(`ᴜsᴀɢᴇ: .ꜰᴀᴄᴇʙᴏᴏᴋ <ᴜʀʟ>

ᴇxᴀᴍᴘʟᴇ: .ꜰᴀᴄᴇʙᴏᴏᴋ https://www.facebook.com/share/r/12Jhv1vQ85G/`);
            }

            const url = args[0];

            if (!url.includes('facebook.com') && !url.includes('fb.watch')) {
                return await m.reply('ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ꜰᴀᴄᴇʙᴏᴏᴋ ᴜʀʟ');
            }

            await m.reply('ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ꜰᴀᴄᴇʙᴏᴏᴋ ᴠɪᴅᴇᴏ...');

            const MAX_SIZE = 64 * 1024 * 1024;
            const apiUrl = `https://api-abztech.zone.id/download/omdown?url=${encodeURIComponent(url)}`;

            const response = await fetch(apiUrl);
            const data = await response.json();

            if (!response.ok || !data.success || data.platform !== 'FACEBOOK') {
                return await m.reply('ғᴀɪʟᴇᴅ ᴛᴏ ꜰᴇᴛᴄʜ ꜰᴀᴄᴇʙᴏᴏᴋ ᴠɪᴅᴇᴏ');
            }

            const videoFormat = data.formats?.find(
                item => item.kind === 'video' &&
                        item.ext === 'mp4' &&
                        item.label?.includes('720p')
            ) || data.formats?.find(
                item => item.kind === 'video' && item.ext === 'mp4'
            );

            const videoUrl = videoFormat?.url || data.video;

            if (!videoUrl) {
                return await m.reply('ɴᴏ ᴠɪᴅᴇᴏ ᴜʀʟ ꜰᴏᴜɴᴅ');
            }

            const videoResponse = await fetch(videoUrl);

            if (!videoResponse.ok || !videoResponse.body) {
                throw new Error('Failed to fetch video stream');
            }

            const contentLength = Number(videoResponse.headers.get('content-length'));

            if (contentLength > MAX_SIZE) {
                await videoResponse.body.cancel();
                return await m.reply('❌ ᴠɪᴅᴇᴏ ᴇxᴄᴇᴇᴅs 64 MB. ᴅᴏᴡɴʟᴏᴀᴅ ᴄᴀɴᴄᴇʟʟᴇᴅ.');
            }

            const chunks = [];
            let totalSize = 0;

            for await (const chunk of videoResponse.body) {
                totalSize += chunk.length;

                if (totalSize > MAX_SIZE) {
                    await videoResponse.body.cancel();
                    return await m.reply('❌ ᴠɪᴅᴇᴏ ᴇxᴄᴇᴇᴅs 64 MB. ᴅᴏᴡɴʟᴏᴀᴅ ᴄᴀɴᴄᴇʟʟᴇᴅ.');
                }

                chunks.push(Buffer.from(chunk));
            }

            const videoBuffer = Buffer.concat(chunks);
            const title = data.title || 'Facebook Video';

            const caption = `*ꜰᴀᴄᴇʙᴏᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*

ᴛɪᴛʟᴇ: ${title}

ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ ʙʏ XLICON V2`;

            await m.reply({
                video: videoBuffer,
                caption,
                mimetype: 'video/mp4'
            });

        } catch (err) {
            console.error('Facebook Error:', err);
            await m.reply(`ᴇʀʀᴏʀ: ${err.message}`);
        }
    }
};
