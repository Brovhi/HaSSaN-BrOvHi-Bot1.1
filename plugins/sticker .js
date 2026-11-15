const { Sticker, StickerTypes } = require('wa-sticker-formatter');

const OWNER_NAME = '👑 HaSSaN BrOvHi 👑';
const BOT_NAME = 'HaSSaN BrOvHi MD';

module.exports = {
    name: 'sticker',
    aliases: ['s', 'stiker', 'sg'],
    description: 'Convert image or short video to sticker',
    tags: ['tools'],
    command: /^(s|sticker|stiker|sg)$/i,

    async execute(sock, m, args) {
        try {
            // 🛡️ Safe Check: Agar kisi image/video ko reply nahi kiya gaya
            if (!m.quoted || !m.quoted.isMedia) {
                return await m.reply(`⚠️ *Cara pakai:*\nReply ke gambar atau video pendek dengan command *.s* atau *.sticker*`);
            }

            // 👇 Cek apakah yang di-reply itu gambar atau video
            const isVideo = m.quoted.type === 'videoMessage' || m.quoted.mtype === 'videoMessage';
            
            // 🛡️ Video limit (max 10 detik biasanya aman untuk RAM bot)
            if (isVideo && m.quoted.seconds > 10) {
                return await m.reply(`❌ Video terlalu panjang! Maksimal 10 detik untuk dijadikan sticker.`);
            }

            // React loading
            try { await m.react('⏳'); } catch(e) {}

            // Download media
            const buffer = await m.quoted.download();

            if (!buffer || buffer.length === 0) {
                return await m.reply(`❌ Gagal mengunduh media. Coba kirim ulang gambarnya.`);
            }

            // 👇 PROSES PEMBUATAN STICKER (Dengan Nama Anda)
            const sticker = new Sticker(buffer, {
                pack: BOT_NAME,          // Nama Pack (Atas)
                author: OWNER_NAME,      // Nama Author (Bawah)
                type: StickerTypes.FULL, // FULL = tidak crop (bisa juga CROPPED)
                quality: 70,             // Kualitas (70 aman untuk RAM)
                background: 'transparent'
            });

            const stickerBuffer = await sticker.toBuffer();

            if (!stickerBuffer) {
                return await m.reply(`❌ Gagal membuat sticker.`);
            }

            // Kirim Sticker
            await sock.sendMessage(m.chat || m.from, { sticker: stickerBuffer }, { quoted: m });
            
            // React sukses
            try { await m.react('✅'); } catch(e) {}

        } catch (err) {
            console.error('Sticker Error:', err);
            await m.reply(`❌ Error: ${err.message}`);
        }
    }
};
