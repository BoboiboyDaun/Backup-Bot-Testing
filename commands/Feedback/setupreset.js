const fs = require('fs');
const path = require('path');

const channelsDir = path.resolve(__dirname, '../Feedback/Channels');
const dataPath = path.resolve(channelsDir, 'data.json');

module.exports = {
    name: "setupreset",
    aliases: ["sr"],
    category: "Admin",
    description: "Reset the report log channel setup",
    example: `1setupreset`,

    run: async (client, message, args) => {
        if (!message.member.hasPermission('ADMINISTRATOR') || !message.member.hasPermission('MANAGE_GUILD') || !message.member.hasPermission('MANAGE_CHANNELS')) {
            const reply = await message.reply(":x: You don't have `[ADMINISTRATOR, MANAGE_GUILD, MANAGE_CHANNELS]` permission.");
            setTimeout(() => {
                reply.delete().catch(err => console.error('Failed to delete message:', err));
            }, 7000);
            return;
        }

        if (fs.existsSync(dataPath)) {
            fs.unlinkSync(dataPath);
            const response = await message.channel.send("📭 The report log channel setup has been reset.");
            setTimeout(() => {
                response.delete().catch(err => console.error('Failed to delete message:', err));
            }, 7000);
        } else {
            const response = await message.channel.send(":x: No report log channel setup found to reset.");
            setTimeout(() => {
                response.delete().catch(err => console.error('Failed to delete message:', err));
            }, 7000);
        }

        message.delete().catch(err => console.error('Failed to delete command message:', err));
    }
}