const OWNER_NAME = '👑 HaSSaN BrOvHi 👑';
const BOT_NAME = 'HaSSaN BrOvHi MD';

module.exports = {
  name: 'profilepic',
  description: `Get profile picture — By ${OWNER_NAME}`,
  aliases: ['pp', 'dp'],
  tags: ['tools'],
  command: /^\.?(profilepic|pp|dp)/i,

  async execute(sock, m) {
    try {
      try { await m.react('🖼️'); } catch (e) {}
      
      const chatId = m.chat || m.from || (m.key && m.key.remoteJid);
      const jid = m.quoted?.key?.participant || m.sender;

      let ppUrl;
      try {
        ppUrl = await sock.profilePictureUrl(jid, 'image');
      } catch {
        ppUrl = await sock.profilePictureUrl(jid, 'preview');
      }

      const quotedMsg = m.quoted || {
        key: {
          remoteJid: chatId,
          fromMe: false,
          id: m.id,
          participant: m.sender
        },
        message: {
          extendedTextMessage: {
            text: m.body
          }
        }
      };

      await sock.sendMessage(
        chatId,
        {
          image: { url: ppUrl },
          caption: `📸 *Profile Picture*\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`,
          contextInfo: {
            // 👇 Purana ABZTECH channel hata kar aapki details
            forwardedNewsletterMessageInfo: {
              newsletterJid: ' https://wa.me/923373730931',
              newsletterName: BOT_NAME
            },
            isForwarded: true
          }
        },
        { quoted: quotedMsg }
      );
    } catch (err) {
      console.error('Profile pic error:', err);
      await m.reply(`❌ Failed to fetch profile picture.\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`);
    }
  }
};
