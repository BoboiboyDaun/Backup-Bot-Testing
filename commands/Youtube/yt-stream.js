const Discord = require('discord.js');
const config = require('../../config.json');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const youtube = google.youtube('v3');

module.exports = {
    name: "yt-stream",
    aliases: ["yt-live", "youtubelive"],
    category: "notifications",
    usage: "yt-stream <#DiscordChannel> <YouTube Channel ID>",
    description: "Notify about YouTube live streams",
    run: async (client, message, args) => {
        message.delete().catch(console.error);

        if (!message.member.hasPermission("ADMINISTRATOR") && 
            !message.member.hasPermission("MANAGE_CHANNELS") && 
            !message.member.hasPermission("MANAGE_GUILD")) {
            const noPermissionMsg = await message.channel.send("You don't have `ADMINISTRATOR`, `MANAGE_CHANNELS`, or `MANAGE_GUILD` permission!");
            noPermissionMsg.delete({ timeout: 10000 }).catch(console.error);
            return;
        }

        const discordChannel = message.mentions.channels.first();
        const youtubeChannelId = args[1];

        if (!discordChannel || !youtubeChannelId) {
            const usageMsg = await message.channel.send("Usage: yt-stream <#DiscordChannel> <YouTube Channel ID>");
            usageMsg.delete({ timeout: 10000 }).catch(console.error);
            return;
        }

        try {
            const response = await youtube.channels.list({
                part: 'snippet',
                id: youtubeChannelId,
                key: config.YOUTUBE_API_KEY
            });

            if (response.data.items.length === 0) {
                const invalidIdMsg = await message.channel.send("Invalid YouTube Channel ID.");
                invalidIdMsg.delete({ timeout: 10000 }).catch(console.error);
                return;
            }

            const channelData = response.data.items[0].snippet;
            const channelName = channelData.title.replace(/[\\/:*?"<>|]/g, ''); 

            const guildFolderPath = path.join(__dirname, "YouTubeChannel", message.guild.name);
            const channelFolderPath = path.join(guildFolderPath, channelName);
            if (!fs.existsSync(channelFolderPath)) {
                fs.mkdirSync(channelFolderPath, { recursive: true });
            }

            const channelFilePath = path.join(channelFolderPath, 'stream.json');
            let lastCheckedStreamId = null;
            
            if (fs.existsSync(channelFilePath)) {
                const channelFileData = JSON.parse(fs.readFileSync(channelFilePath, 'utf-8'));
                lastCheckedStreamId = channelFileData.lastCheckedStreamId || null;
            } else {
                const dataToSave = {
                    youtubeChannelId,
                    discordChannelId: discordChannel.id,
                    type: 'stream',
                    lastCheckedStreamId: null
                };
                fs.writeFileSync(channelFilePath, JSON.stringify(dataToSave, null, 2));
            }

            const successMsg = await message.channel.send(`Successfully added ${channelName} to the notification list for ${discordChannel.name}.`);
            successMsg.delete({ timeout: 10000 }).catch(console.error);

            setInterval(async () => {
                try {
                    const liveResponse = await youtube.search.list({
                        part: 'snippet',
                        channelId: youtubeChannelId,
                        eventType: 'live',
                        type: 'video',
                        order: 'date',
                        maxResults: 1,
                        key: config.YOUTUBE_API_KEY
                    });

                    if (liveResponse.data.items.length > 0) {
                        const latestStream = liveResponse.data.items[0];
                        if (latestStream.id.videoId === lastCheckedStreamId) return;
                        
                        lastCheckedStreamId = latestStream.id.videoId;

                        const streamEmbed = new Discord.MessageEmbed()
                            .setColor(config.EMBED_COLOR)
                            .setTitle(latestStream.snippet.title)
                            .setURL(`https://www.youtube.com/watch?v=${latestStream.id.videoId}`)
                            .setDescription(latestStream.snippet.description)
                            .setImage(latestStream.snippet.thumbnails.high.url)
                            .setTimestamp(new Date(latestStream.snippet.publishedAt))
                            .setFooter(`${latestStream.snippet.channelTitle}`, channelData.thumbnails.default.url);

                        const notificationChannel = message.guild.channels.cache.get(discordChannel.id);
                        if (notificationChannel) {
                            const notificationMessage = `# YOUTUBE ANNOUNCEMENT\n> Hi everyone, **${latestStream.snippet.channelTitle}** is currently streaming now!...watch it now!!\n\n> Title: **${latestStream.snippet.title}**\n> Thumbnail: [Click Here!!](${latestStream.snippet.thumbnails.high.url})\n> Link Youtube: [Click Here](https://www.youtube.com/watch?v=${latestStream.id.videoId})`;

                            notificationChannel.send(notificationMessage, streamEmbed);

                            // Update the last checked stream ID
                            const updatedData = {
                                youtubeChannelId,
                                discordChannelId: discordChannel.id,
                                type: 'stream',
                                lastCheckedStreamId
                            };
                            fs.writeFileSync(channelFilePath, JSON.stringify(updatedData, null, 2));
                        } else {
                            const configErrorMsg = await message.channel.send("Notification channel not found. Please check your configuration.");
                            configErrorMsg.delete({ timeout: 10000 }).catch(console.error);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching YouTube data:", error);
                }
            }, config.NOTIFICATION_INTERVAL);
        } catch (error) {
            console.error("Error fetching YouTube data:", error);
            const errorMsg = await message.channel.send(`:x: An error occurred while adding the YouTube channel. If the issue persists, please type \`[ ${config.PREFIX}report Your_Report_Message ]\`.`);
            errorMsg.delete({ timeout: 10000 }).catch(console.error);
        }
    }
};