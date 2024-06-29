const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

const channelsDir = path.resolve(__dirname, '../Feedback/Channels');
const dataPath = path.resolve(channelsDir, 'data.json');

module.exports = {
    name: "report",
    aliases: ["rp"],
    category: "Misc",
    description: "To report us any bugs or anything !!",
    example: `1report Bot is not working`,

    run: async (client, message, args) => {
        if (!fs.existsSync(dataPath)) {
            const reply = await message.reply(`:x: The report log channel is not set. Please ask an administrator to set it up using \`${config.PREFIX}setupreport\`.`);
            setTimeout(() => {
                reply.delete().catch(err => console.error('Failed to delete message:', err));
            }, 7000);
            return;
        }

        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const report_log = data.reportLogChannel;
        if (!report_log) {
            const reply = await message.reply(":x: The report log channel is not set. Please ask an administrator to set it up using `*setupreport`.");
            setTimeout(() => {
                reply.delete().catch(err => console.error('Failed to delete message:', err));
            }, 7000);
            return;
        }

        const channel = client.channels.cache.get(report_log);

        if (!args[0]) {
            const reply = await message.reply(`:x: Please provide a report so that we can look through !! **\`*report [Your report]\`**`);
            setTimeout(() => {
                reply.delete().catch(err => console.error('Failed to delete message:', err));
            }, 7000);
            return;
        }

        let report = message.content.slice(message.content.indexOf(args[0]), message.content.length);

        const Embed = new Discord.MessageEmbed()
            .setTitle('__Report__')
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(report)
            .addField('User', `\`${message.member.user.tag}\` | \`${message.member.id}\``)
            .addField('Server', `\`${message.guild.name}\` | \`${message.guild.id}\``)
            .setTimestamp()
            .setColor(config.EMBED_COLOR);

        const mentionsText = data.mentions ? data.mentions.join(' ') : '';
        const descriptionText = data.description || '';

        const fullMessage = `${mentionsText} ${descriptionText}`;

        // combine message and embed
        await channel.send(fullMessage, Embed);

        const response = await message.channel.send(`âœ¨ Your report has been sent to my developer !!`);
        setTimeout(() => {
            response.delete().catch(err => console.error('Failed to delete message:', err));
        }, 7000);

        message.delete().catch(err => console.error('Failed to delete command message:', err));
    }
}