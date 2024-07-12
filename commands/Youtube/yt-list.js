const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "yt-list",
    aliases: ["ytlist", "youtube-list"],
    category: "notifications",
    usage: "yt-list",
    description: "View the list of YouTube channels being monitored",
    run: async (client, message, args) => {
        message.delete().catch(console.error);

        if (!message.member.hasPermission("ADMINISTRATOR") && 
            !message.member.hasPermission("MANAGE_CHANNELS") && 
            !message.member.hasPermission("MANAGE_GUILD")) {
            const noPermissionMsg = await message.channel.send("You don't have `ADMINISTRATOR`, `MANAGE_CHANNELS`, or `MANAGE_GUILD` permission!");
            noPermissionMsg.delete({ timeout: 10000 }).catch(console.error);
            return;
        }

        const guildFolderPath = path.join(__dirname, "YouTubeChannel", message.guild.name);
        console.log(`Checking guild folder path: ${guildFolderPath}`); // Debugging log

        if (!fs.existsSync(guildFolderPath)) {
            const noChannelsMsg = await message.channel.send("No YouTube channels are being monitored in this server.");
            noChannelsMsg.delete({ timeout: 10000 }).catch(console.error);
            return;
        }

        const channelFolders = fs.readdirSync(guildFolderPath);
        console.log(`Channel folders found: ${channelFolders}`); // Debugging log

        if (!channelFolders.length) {
            const noChannelsMsg = await message.channel.send("No YouTube channels are being monitored in this server.");
            noChannelsMsg.delete({ timeout: 10000 }).catch(console.error);
            return;
        }

        let currentIndex = 0;

        const createEmbed = () => {
            const channelName = channelFolders[currentIndex];
            const channelFolderPath = path.join(guildFolderPath, channelName);
            const channelFilePath = path.join(channelFolderPath, 'channel.json');
            const streamFilePath = path.join(channelFolderPath, 'stream.json');

            let channelData = null;
            let type = '';

            if (fs.existsSync(channelFilePath)) {
                channelData = JSON.parse(fs.readFileSync(channelFilePath, 'utf-8'));
                type += 'Upload';
            }
            if (fs.existsSync(streamFilePath)) {
                channelData = JSON.parse(fs.readFileSync(streamFilePath, 'utf-8'));
                type = type ? `${type}, Stream` : 'Stream';
            }

            const embed = new Discord.MessageEmbed()
                .setTitle("Monitored YouTube Channels")
                .setDescription(`**${channelName}**\n<https://www.youtube.com/channel/${channelData?.youtubeChannelId || 'Unknown'}>`)
                .setThumbnail(channelData?.thumbnails?.default?.url || '')
                .addField("Type", type || 'Unknown')
                .addField("Streaming Status", fs.existsSync(streamFilePath) ? "Currently Streaming" : "Not Streaming")
                .setFooter(`Channel ${currentIndex + 1} of ${channelFolders.length}`);

            return embed;
        };

        const sentMessage = await message.channel.send(createEmbed());
        await sentMessage.react('◀️');
        await sentMessage.react('▶️');
        await sentMessage.react('❌');

        const filter = (reaction, user) => ['◀️', '▶️', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
        const collector = sentMessage.createReactionCollector(filter, { time: 60000 });

        collector.on('collect', (reaction, user) => {
            reaction.users.remove(user).catch(console.error);

            switch (reaction.emoji.name) {
                case '◀️':
                    currentIndex = (currentIndex === 0) ? channelFolders.length - 1 : currentIndex - 1;
                    sentMessage.edit(createEmbed()).catch(console.error);
                    break;
                case '▶️':
                    currentIndex = (currentIndex === channelFolders.length - 1) ? 0 : currentIndex + 1;
                    sentMessage.edit(createEmbed()).catch(console.error);
                    break;
                case '❌':
                    sentMessage.delete().catch(console.error);
                    break;
            }
        });

        collector.on('end', collected => {
            sentMessage.reactions.removeAll().catch(console.error);
        });
    }
};