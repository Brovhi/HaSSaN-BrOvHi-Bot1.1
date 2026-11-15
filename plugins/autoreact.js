const OWNER_NAME = '👑 HaSSaN BrOvHi 👑';

module.exports = {
    name: 'autoreact',
    description: `Auto-reacts to messages from ${OWNER_NAME}`,

    async execute() {},

    async onMessage(sock, m) {
        try {
            if (!m.body) return;

            // 👇 Yahan aapka number add kar diya hai
            const owners = [
                '923373730931@s.whatsapp.net'
            ];

            // Check karein ke message owner ne bheja hai ya nahi
            if (owners.includes(m.sender)) {
                await m.react('👑'); // 👈 Yahan aap emoji change kar sakte hain
            }
        } catch (err) {
            console.error('❌ Auto-react error:', err);
        }
    }
};
