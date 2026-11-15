const { bot, isUrl } = require('../lib')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

const OWNER_NAME = '👑 𝐇𝐚𝐒𝐒𝐚𝐧 𝐁𝐫𝐎𝐯𝐇𝐢 👑'

bot(
  {
    pattern: 'tt ?(.*)',
    desc: `TikTok Downloader — By ${OWNER_NAME}`,
    type: 'download',
  },
  async (message, match) => {
    let url = match || (message.reply_message && message.reply_message.text)
    
    // Check karein ke valid TikTok link hai ya nahi
    if (!url || !isUrl(url) || !url.includes('tiktok.com')) {
      return await message.send(
        `╭━━━━━•❥•━━━━━╮
   🎵 𝖳𝖨𝖪𝖳𝖮𝖪 𝖣𝖫 🎵
╰━━━━━•❥•━━━━━╯

*Example :*
.tt <tiktok link>

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`
      )
    }

    const statusMsg = await message.send('_⏳ Downloading TikTok video..._')

    try {
      // TikWM API (No watermark HD video)
      const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`
      const res = await fetch(apiUrl)
      const json = await res.json()

      if (json.code !== 0 || !json.data) {
        throw new Error('Failed to fetch video. Link might be invalid or private.')
      }

      const videoUrl = json.data.play || json.data.hdplay || json.data.wmplay
      const title = json.data.title || 'TikTok Video'
      const author = json.data.author?.nickname || 'Unknown'
      const music = json.data.music_info?.title || 'Original Audio'

      // 🖤 AAPKA NAAM YAHAN SHOW HOGA 🖤
      const caption = `🎵 *${title}*\n\n👤 *Author:* ${author}\n🎧 *Music:* ${music}\n\n*Downloaded by ${OWNER_NAME}* 🖤\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`

      // Video send kar rahe hain (bina memory crash kiye)
      await message.sendFromUrl(videoUrl, { caption })
      
      // "Downloading..." wala message delete kar dein
      try {
        await message.client.sendMessage(message.jid, { delete: statusMsg.key })
      } catch (e) {}

    } catch (err) {
      console.error('TikTok DL Error:', err)
      await message.send(`❌ *Download failed!*\n\n*Reason:* ${err.message}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`)
      
      try {
        await message.client.sendMessage(message.jid, { delete: statusMsg.key })
      } catch (e) {}
    }
  }
)
