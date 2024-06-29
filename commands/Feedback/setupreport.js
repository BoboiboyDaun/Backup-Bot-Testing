const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

const channelsDir = path.resolve(__dirname, '../Feedback/Channels');
const dataPath = path.resolve(channelsDir, 'data.json');

module.exports = {
    name: "setupreport",
    aliases: ["srp"],
    category: "Admin",
    description: "Setup a channel for report logs with mentions and optional description",
    example: `*setupreport #report-log @mention_user || @mention_role Custom message`,

    run: async (client, message, args) => {
        if (!message.member.hasPermission('ADMINISTRATOR') || !message.member.hasPermission('MANAGE_GUILD') || !message.member.hasPermission('MANAGE_CHANNELS')) {
            const reply = await message.reply(":x: You don't have ADMINISTRATOR, MANAGE_GUILD, or MANAGE_CHANNELS permission.");
            setTimeout(() => {
                reply.delete().catch(err => console.error('Failed to delete message:', err));
            }, 7000);
            return;
        }

        if (fs.existsSync(dataPath)) {
            const existingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            const reply = await message.reply(`:x: The report log channel is already set to <#${existingData.reportLogChannel}>.`);
            setTimeout(() => {
                reply.delete().catch(err => console.error('Failed to delete message:', err));
            }, 7000);
            return;
        }

        const channelMention = args[0];
        if (!channelMention) {
            const reply = await message.reply(`:x: Please mention a channel to set up as the report log channel. **\`*setupreport [#channel] [@mention] [description]\`**`);
            setTimeout(() => {
                reply.delete().catch(err => console.error('Failed to delete message:', err));
            }, 7000);
            return;
        }

        const channel = message.mentions.channels.first();
        if (!channel) {
            const reply = await message.reply(":x: Please mention a valid channel.");
            setTimeout(() => {
                reply.delete().catch(err => console.error('Failed to delete message:', err));
            }, 7000);
            return;
        }

        const mentions = [];
        let argsCopy = args.slice(1); // Skip the first argument (channel mention)

        while (argsCopy.length > 0) {
            const mention = argsCopy[0];
            if (mention.startsWith('<@') || mention.startsWith('<@&')) {
                mentions.push(mention);
                argsCopy.shift();
            } else {
                break;
            }
        }

        if (mentions.length === 0) {
            const reply = await message.reply(`:x: You must mention at least one user or role. **\`*setupreport [#channel] [@mention] [description]\`**`);
            setTimeout(() => {
                reply.delete().catch(err => console.error('Failed to delete message:', err));
            }, 7000);
            return;
        }

        const description = argsCopy.join(' ') || null;

        if (!fs.existsSync(channelsDir)) {
            fs.mkdirSync(channelsDir, { recursive: true });
        }

        const data = {
            reportLogChannel: channel.id,
            mentions: mentions,
            description: description
        };
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

        const response = await message.channel.send(`âœ”ï¸ The report log channel has been set to ${channel}.`);
        setTimeout(() => {
            response.delete().catch(err => console.error('Failed to delete message:', err));
        }, 7000);

        message.delete().catch(err => console.error('Failed to delete command message:', err));
    }
};