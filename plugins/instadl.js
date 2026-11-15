const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'instadl',
    aliases: ['insta', 'instagram', 'ig'],
    
    async execute(sock, m, args) {
        try {
            const chatId = m.chat || m.from || (m.key && m.key.remoteJid);
            
            if (!args || args.length === 0) {
                return await m.reply("📸 Usage: .ig <url>");
            }
            
            const url = args[0];
            if (!url.includes('instagram.com')) {
                return await m.reply("❌ Invalid Instagram URL.");
            }

            await m.reply("⏳ Downloading Instagram media...");

            let finalUrl = null;
            let isVideo = false;

            // 🟢 API 1: BTCH Downloader
            try {
                const res = await axios.get(`https://btch-downloader-api-green.vercel.app/api/download/instagram?url=${encodeURIComponent(url)}`, { timeout: 20000 });
                if (res.data && res.data.success && res.data.normalized && res.data.normalized.media && res.data.normalized.media[0]) {
                    finalUrl = res.data.normalized.media[0].url;
                    isVideo = res.data.normalized.media[0].type === 'video';
                }
            } catch(e) { console.log('API 1 failed'); }

            // 🟢 API 2: Siputzx (Fallback)
            if (!finalUrl) {
                try {
                    const res = await axios.get(`https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(url)}`, { timeout: 20000 });
                    if (res.data && res.data.status && res.data.data && res.data.data[0]) {
                        finalUrl = res.data.data[0].url;
                        isVideo = finalUrl.includes('.mp4') || res.data.data[0].type === 'video';
                    }
                } catch(e) { console.log('API 2 failed'); }
            }

            // 🟢 API 3: JerryCoder API (Fallback)
            if (!finalUrl) {
                try {
                    const res = await axios.get(`https://jerrycoder.oggyapi.workers.dev/instagram?url=${encodeURIComponent(url)}`, { timeout: 20000 });
                    if (res.data && res.data.status === 'success' && res.data.data && res.data.data.media) {
                        finalUrl = res.data.data.media[0].url;
                        isVideo = res.data.data.media[0].type === 'video';
                    }
                } catch(e) { console.log('API 3 failed'); }
            }

            if (!finalUrl) {
                return await m.reply("❌ Failed to fetch media. Link might be private or APIs are down.");
            }

            // 📥 Download media as buffer
            const mediaRes = await axios.get(finalUrl, { 
                responseType: 'arraybuffer',
                timeout: 30000,
                maxContentLength: 100 * 1024 * 1024, // 100MB limit
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const buffer = Buffer.from(mediaRes.data);

            // 🕵️ Validate buffer (Check agar file sahi hai ya nahi)
            if (!buffer || buffer.length < 1000) {
                return await m.reply("❌ Downloaded file is empty or corrupted. Please try again.");
            }

            // 🕵️ Content Type Check (Asli format pehchanne ke liye)
            const contentType = mediaRes.headers['content-type'] || '';
            
            // Agar content-type 'text' ya 'html' hai, iska matlab API ne error page bheja hai
            if (contentType.includes('text') || contentType.includes('html')) {
                return await m.reply("❌ API returned an error page instead of media. Please try again later.");
            }

            // Agar URL ya content-type video ki taraf ishara kare toh video samjhein
            const videoCheck = isVideo || contentType.includes('video') || finalUrl.includes('.mp4');

            const caption = "📸 Downloaded by 👑 HaSSaN BrOvHi 👑";

            // ✅ Sahi format mein bhejein
            if (videoCheck) {
                await sock.sendMessage(chatId, { 
                    video: buffer, 
                    mimetype: 'video/mp4',
                    caption: caption 
                });
            } else {
                await sock.sendMessage(chatId, { 
                    image: buffer, 
                    mimetype: 'image/jpeg',
                    caption: caption 
                });
            }

        } catch (err) {
            console.log('Instagram Error:', err.message);
            await m.reply(`❌ Error: ${err.message}`);
        }
    }
}
