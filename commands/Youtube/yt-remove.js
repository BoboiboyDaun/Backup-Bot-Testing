const Discord = require('discord.js');
const config = require('../../config.json');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "yt-remove",
    aliases: ["yt-rm", "yt-delete"],
    category: "notifications",
    usage: "yt-remove <upload|stream> <YouTube Channel ID>",
    description: "Remove YouTube channel notifications for uploads or streams",
    run: async (client, message, args) => {
        message.delete()
        
        if (!message.member.hasPermission("ADMINISTRATOR") && 
            !message.member.hasPermission("MANAGE_CHANNELS") && 
            !message.member.hasPermission("MANAGE_GUILD")) {
            return message.channel.send("You don't have `ADMINISTRATOR`, `MANAGE_CHANNELS`, or `MANAGE_GUILD` permission!");
        }

        const type = args[0];  // "upload" or "stream"
        const youtubeChannelId = args[1];

        if (!type || !youtubeChannelId) {
            return message.channel.send("Usage: yt-remove <upload|stream> <YouTube Channel ID>");
        }

        if (type !== 'upload' && type !== 'stream') {
            return message.channel.send("Invalid type specified. Use 'upload' or 'stream'.");
        }

        const serverFolderPath = path.join(__dirname, "YouTubeChannel", message.guild.name);
        const channelFolderPath = path.join(serverFolderPath, youtubeChannelId);
        const filePath = path.join(channelFolderPath, `${type}.json`);

        if (!fs.existsSync(channelFolderPath) || !fs.existsSync(filePath)) {
            return message.channel.send(`This YouTube channel is not being monitored for ${type} notifications in this server.`);
        }

        try {
            fs.unlinkSync(filePath);

            // Remove the folder if both files are deleted
            const remainingFiles = fs.readdirSync(channelFolderPath);
            if (remainingFiles.length === 0) {
                fs.rmdirSync(channelFolderPath);
            }

            message.channel.send(`Successfully removed ${type} notifications for the YouTube channel.`);
        } catch (error) {
            console.error("Error removing YouTube channel data:", error);
            message.channel.send(`:x: An error occurred while removing the YouTube channel notifications. If the issue persists, please type \`[ ${config.PREFIX}report Your_Report_Message ]\`.`);
        }
    }
};
