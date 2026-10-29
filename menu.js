module.exports = {
    pattern: 'menu',
    execute: async (message, args) => {
        const menuText = `╭━━━━━•❥•━━━━━╮
   👑 *HaSSaN BrOvHi MD* 👑
 ✦ *MY OWN CUSTOM BOT* ✦
╰━━━━━•❥•━━━━━╯

Hello!
Main aapka khud ka banaya hua bot hoon.

*Available Commands:*
.menu - Show this menu

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ 👑 𝐇𝐚𝐒𝐒𝐚𝐧 𝐁𝐫𝐎𝐯𝐇𝐢 👑`
        await message.reply(menuText)
    }
}
