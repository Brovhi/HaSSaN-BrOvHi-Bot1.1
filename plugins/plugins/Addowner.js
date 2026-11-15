const fs = require('fs');
const path = require('path');

const OWNER_NAME = '👑 HaSSaN BrOvHi 👑';

async function getRealJid(sock, id) {
    if (!id.includes('@lid')) return id;
    
    const groups = await sock.groupFetchAllParticipating();
    for (const group of Object.values(groups)) {
        const participant = group.participants.find(p => p.id === id);
        if (participant?.phoneNumber) {
            return participant.phoneNumber;
        }
    }
    return id;
}

function loadOwners() {
    try {
        const configPath = path.join(__dirname, '..', 'config.json');
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            global.owners = config.owners || [];
        } else {
            global.owners = [];
        }
    } catch(e) {
        global.owners = [];
    }
}

function saveOwners() {
    try {
        const configPath = path.join(__dirname, '..', 'config.json');
        let config = {};
        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
        config.owners = global.owners;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch(e) {}
}

loadOwners();

module.exports = {
    name: 'owner',
    aliases: ['owners', 'addowner', 'removeowner', 'delowner'],
    
    async execute(sock, m, args) {
        // Fallback prefix agar global.BOT_PREFIX na ho
        const prefix = global.BOT_PREFIX || '.';
        const command = args[0]?.toLowerCase();
        
        let target = null;
        if (m.mentionedJid && m.mentionedJid.length > 0) {
            target = m.mentionedJid[0];
        } else if (args[1]) {
            let input = args[1];
            if (/^\d+$/.test(input)) {
                target = input + '@s.whatsapp.net';
            } else {
                target = input;
            }
        } else if (m.quoted) {
            target = m.quoted.sender;
        }
        
        // 1. Show Owner List
        if (!command || command === 'list') {
            if (!global.owners || global.owners.length === 0) {
                return m.reply(`❌ No owners configured yet for ${OWNER_NAME}.`);
            }
            let list = `*👑 ${OWNER_NAME} Owners*\n\n`;
            global.owners.forEach((owner, i) => {
                const number = owner.split('@')[0];
                list += `${i+1}. ${number}\n`;
            });
            list += `\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`;
            return m.reply(list);
        }
        
        // Check if sender is owner
        const senderJid = m.sender;
        const isOwner = global.owners?.includes(senderJid) || 
                        global.owners?.includes(senderJid.replace('@lid', '@s.whatsapp.net')) ||
                        global.owners?.includes(senderJid.split('@')[0] + '@s.whatsapp.net');
                        
        if (!isOwner) {
            return m.reply(`❌ Only ${OWNER_NAME}'s owners can use this command!`);
        }
        
        // 2. Add Owner
        if (command === 'add') {
            if (!target) {
                return m.reply(`*Usage:* ${prefix}owner add @user or 923001234567`);
            }
            
            const realJid = await getRealJid(sock, target);
            
            if (global.owners.includes(realJid)) {
                return m.reply('⚠️ User is already an owner');
            }
            
            global.owners.push(realJid);
            saveOwners();
            
            await m.reply(`✅ Added ${realJid.split('@')[0]} as an owner for ${OWNER_NAME}`);
        }
        
        // 3. Remove Owner
        else if (command === 'remove' || command === 'del') {
            if (!target) {
                return m.reply(`*Usage:* ${prefix}owner remove @user`);
            }
            
            const realJid = await getRealJid(sock, target);
            
            if (realJid === m.sender || realJid === m.sender.replace('@lid', '@s.whatsapp.net')) {
                return m.reply('❌ You cannot remove yourself!');
            }
            
            if (!global.owners.includes(realJid)) {
                return m.reply('⚠️ User is not an owner');
            }
            
            global.owners = global.owners.filter(id => id !== realJid);
            saveOwners();
            
            await m.reply(`✅ Removed ${realJid.split('@')[0]} from owners`);
        }
        
        // 4. Help Message
        else {
            m.reply(`*👑 ${OWNER_NAME} Owner Commands:*\n\n` +
                    `${prefix}owner list - Show all owners\n` +
                    `${prefix}owner add @user - Add owner\n` +
                    `${prefix}owner remove @user - Remove owner\n\n` +
                    `> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${OWNER_NAME}`);
        }
    }
};
