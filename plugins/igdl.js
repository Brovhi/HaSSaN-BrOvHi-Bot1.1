const { bot, isUrl } = require('../lib')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

const OWNER_NAME = '👑 𝐇𝐚𝐒𝐒𝐚𝐧 𝐁𝐫𝐎𝐯𝐇𝐢 👑'

bot(
  {
    pattern: 'ig ?(.*)',
    desc: `Instagram Downloader — By ${OWNER_NAME}`,
    type: 'download',
  },
  async (message, match) => {
    let url = match || (message.reply_message && message.reply_message.text)
    
    // Check karein ke valid Instagram link hai ya nahi
    if (!url || !isUrl(url) || !url.includes('instagram.com')) {
      return await message.send(
        `╭━━━━━•❥•━━━━━╮
   📸 𝖨𝖭𝖲𝖳𝖠𝖦𝖱𝖠𝖬 𝖣𝖫 📸
╰━━━━━•❥•━━━━━╯

*Example :*
.ig <instagram link>

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`
      )
    }

    const statusMsg = await message.send('_⏳ Downloading Instagram media..._')

    try {
      // Naya reliable API endpoint
      const apiUrl = `https://btch-downloader-api-green.vercel.app/api/download/instagram?url=${encodeURIComponent(url)}`
      const res = await fetch(apiUrl)
      const json = await res.json()

      // Check agar API fail ho jaye ya link private ho
      if (!json.success || !json.normalized || !json.normalized.media) {
        throw new Error(json.error?.message || 'Failed to fetch media. Account might be private.')
      }

      const medias = json.normalized.media

      // Loop through all media files (agar carousel/slide ho)
      for (let item of medias) {
        const mediaUrl = item.url

        // 🖤 AAPKA NAAM YAHAN SHOW HOGA 🖤
        const caption = `*Downloaded by ${OWNER_NAME}* 🖤\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`

        // Direct URL se send karenge
        await message.sendFromUrl(mediaUrl, { caption })
        
        // Thoda delay taake WhatsApp block na kare
        await new Promise(r => setTimeout(r, 1500))
      }

      // "Downloading..." wala message delete kar dein
      try {
        await message.client.sendMessage(message.jid, { delete: statusMsg.key })
      } catch (e) {}

    } catch (err) {
      console.error('IG DL Error:', err)
      // Ab error aayega toh exact reason batayega
      await message.send(`❌ *Download failed!*\n\n*Reason:* ${err.message}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`)
    }
  }
)
