const Discord = require('discord.js');
const config = require('../../config.json');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "yt-remove",
    aliases: ["yt-unsubscribe", "youtube-remove"],
    category: "notifications",
    usage: "yt-remove <YouTube Channel ID> <upload|stream>",
    description: "Remove YouTube channel notifications",
    run: async (client, message, args) => {
        message.delete().catch(console.error);

        if (!message.member.hasPermission("ADMINISTRATOR") && 
            !message.member.hasPermission("MANAGE_CHANNELS") && 
            !message.member.hasPermission("MANAGE_GUILD")) {
            const noPermissionMsg = await message.channel.send("You don't have `ADMINISTRATOR`, `MANAGE_CHANNELS`, or `MANAGE_GUILD` permission!");
            noPermissionMsg.delete({ timeout: 10000 }).catch(console.error);
            return;
        }

        const youtubeChannelId = args[0];
        const type = args[1];

        if (!youtubeChannelId || !type || !["upload", "stream"].includes(type.toLowerCase())) {
            const usageMsg = await message.channel.send("Usage: yt-remove <YouTube Channel ID> <upload|stream>");
            usageMsg.delete({ timeout: 10000 }).catch(console.error);
            return;
        }

        try {
            const guildFolderPath = path.join(__dirname, "YouTubeChannel", message.guild.name);
            const folders = fs.readdirSync(guildFolderPath);

            let channelFound = false;
            let filePathToRemove = null;

            folders.forEach(folder => {
                const channelFolderPath = path.join(guildFolderPath, folder);
                const channelFilePath = path.join(channelFolderPath, 'channel.json');
                const streamFilePath = path.join(channelFolderPath, 'stream.json');

                if (type.toLowerCase() === "upload" && fs.existsSync(channelFilePath)) {
                    const channelData = JSON.parse(fs.readFileSync(channelFilePath, 'utf-8'));
                    if (channelData.youtubeChannelId === youtubeChannelId) {
                        filePathToRemove = channelFilePath;
                        channelFound = true;
                    }
                }

                if (type.toLowerCase() === "stream" && fs.existsSync(streamFilePath)) {
                    const streamData = JSON.parse(fs.readFileSync(streamFilePath, 'utf-8'));
                    if (streamData.youtubeChannelId === youtubeChannelId) {
                        filePathToRemove = streamFilePath;
                        channelFound = true;
                    }
                }

                if (channelFound && filePathToRemove) {
                    fs.unlinkSync(filePathToRemove);
                    const remainingFiles = fs.readdirSync(channelFolderPath);
                    if (remainingFiles.length === 0) {
                        fs.rmdirSync(channelFolderPath);
                    }
                }
            });

            if (channelFound) {
                const successMsg = await message.channel.send(`Successfully removed ${type} notifications for YouTube channel with ID: ${youtubeChannelId}.`);
                successMsg.delete({ timeout: 10000 }).catch(console.error);
            } else {
                const notFoundMsg = await message.channel.send(`YouTube channel with ID: ${youtubeChannelId} not found.`);
                notFoundMsg.delete({ timeout: 10000 }).catch(console.error);
            }
        } catch (error) {
            console.error("Error removing YouTube channel:", error);
            const errorMsg = await message.channel.send(`:x: An error occurred while removing the YouTube channel. If the issue persists, please type \`[ ${config.PREFIX}report Your_Report_Message ]\`.`);
            errorMsg.delete({ timeout: 10000 }).catch(console.error);
        }
    }
};