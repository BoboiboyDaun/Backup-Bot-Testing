const { google } = require('googleapis');
const config = require('../../config.json');
const youtube = google.youtube('v3');
const Discord = require('discord.js');

module.exports = {
    name: "get-id",
    aliases: ["youtube-id", "yt-id"],
    category: "utilities",
    usage: "get-id <YouTube Channel URL>",
    description: "Convert YouTube Channel URL to Channel ID",
    run: async (client, message, args) => {
        message.delete().catch(console.error);

        if (!message.member.hasPermission("ADMINISTRATOR") && 
            !message.member.hasPermission("MANAGE_CHANNELS") && 
            !message.member.hasPermission("MANAGE_GUILD")) {
            const noPermissionMsg = await message.channel.send("You don't have `ADMINISTRATOR`, `MANAGE_CHANNELS`, or `MANAGE_GUILD` permission!");
            noPermissionMsg.delete({ timeout: 10000 }).catch(console.error);
            return;
        }

        const youtubeChannelUrl = args[0];

        if (!youtubeChannelUrl) {
            const usageMsg = await message.channel.send("Usage: get-id <YouTube Channel URL>");
            usageMsg.delete({ timeout: 10000 }).catch(console.error);
            return;
        }

        const usernameMatch = youtubeChannelUrl.match(/youtube\.com\/@(\w+)/);
        if (!usernameMatch || usernameMatch.length < 2) {
            const invalidUrlMsg = await message.channel.send("Invalid YouTube Channel URL.");
            invalidUrlMsg.delete({ timeout: 10000 }).catch(console.error);
            return;
        }

        const username = usernameMatch[1];

        try {
            const response = await youtube.search.list({
                part: 'snippet',
                q: username,
                type: 'channel',
                key: config.YOUTUBE_API_KEY
            });

            if (!response.data.items.length) {
                const noChannelMsg = await message.channel.send("No channel found for the provided username.");
                noChannelMsg.delete({ timeout: 10000 }).catch(console.error);
                return;
            }

            const channelId = response.data.items[0].id.channelId;
            const channelTitle = response.data.items[0].snippet.title;

            const successMsg = await message.channel.send(`Channel ID for **${channelTitle}** (@${username}) is **${channelId}**.`);
            successMsg.delete({ timeout: 10000 }).catch(console.error);
        } catch (error) {
            console.error("Error fetching YouTube data:", error);
            const errorMsg = await message.channel.send(`:x: An error occurred while fetching the channel ID. If the issue persists, please type \`[ ${config.PREFIX}report Your_Report_Message ]\`.`);
            errorMsg.delete({ timeout: 10000 }).catch(console.error);
        }
    }
};