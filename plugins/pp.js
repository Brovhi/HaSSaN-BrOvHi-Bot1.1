module.exports = {
  name: 'profilepic',
  description: 'Get profile picture',
  aliases: ['pp', 'dp'],
  tags: ['tools'],
  command: /^\.?(profilepic|pp|dp)/i,

  async execute(sock, m) {
    try {
      await m.react('🖼️');

      const jid = m.quoted?.key?.participant || m.sender;

      let ppUrl;
      try {
        ppUrl = await sock.profilePictureUrl(jid, 'image');
      } catch {
        ppUrl = await sock.profilePictureUrl(jid, 'preview');
      }

      const quotedMsg = m.quoted || {
        key: {
          remoteJid: m.from,
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
        m.from,
        {
          image: { url: ppUrl },
          caption: 'Profile picture',
          contextInfo: {
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363230794474148@newsletter',
              newsletterName: '𝘈𝘉-𝘡𝘛𝘌𝘊𝘏🇬🇭「 𝙏𝙞𝙢𝙚 - 𝙏𝙞𝙢𝙚𝙡𝙚𝙨𝙨 」'
            },
            isForwarded: true
          }
        },
        { quoted: quotedMsg }
      );
    } catch (err) {
      console.error('Profile pic error:', err);
      await m.reply('Failed to fetch profile picture.');
    }
  }
};
