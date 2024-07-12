const Discord = require('discord.js');
const config = require('../../config.json');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const youtube = google.youtube('v3');

module.exports = {
    name: "yt-add",
    aliases: ["yt", "youtube"],
    category: "notifications",
    usage: "yt-add <#DiscordChannel> <YouTube Channel ID>",
    description: "Notify about new YouTube videos",
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
            const usageMsg = await message.channel.send("Usage: yt-add <#DiscordChannel> <YouTube Channel ID>");
            usageMsg.delete({ timeout: 10000 }).catch(console.error);
            return;
        }

        try {
            const response = await youtube.channels.list({
                part: 'snippet',
                id: youtubeChannelId,
                key: config.YOUTUBE_API_KEY
            });

            if (!response.data.items.length) {
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

            const channelFilePath = path.join(channelFolderPath, 'channel.json');
            let lastCheckedVideoId = null;
            
            if (fs.existsSync(channelFilePath)) {
                const channelData = JSON.parse(fs.readFileSync(channelFilePath, 'utf-8'));
                lastCheckedVideoId = channelData.lastCheckedVideoId || null;
            } else {
                const dataToSave = {
                    youtubeChannelId,
                    discordChannelId: discordChannel.id,
                    type: 'upload',
                    lastCheckedVideoId: null
                };
                fs.writeFileSync(channelFilePath, JSON.stringify(dataToSave, null, 2));
            }

            const successMsg = await message.channel.send(`Successfully added ${channelName} to the notification list for ${discordChannel.name}.`);
            successMsg.delete({ timeout: 10000 }).catch(console.error);

            setInterval(async () => {
                try {
                    const videosResponse = await youtube.search.list({
                        part: 'snippet',
                        channelId: youtubeChannelId,
                        order: 'date',
                        maxResults: 1,
                        key: config.YOUTUBE_API_KEY
                    });

                    if (videosResponse.data.items.length) {
                        const latestVideo = videosResponse.data.items[0];
                        if (latestVideo.id.videoId === lastCheckedVideoId) return;
                        
                        lastCheckedVideoId = latestVideo.id.videoId;

                        const videoEmbed = new Discord.MessageEmbed()
                            .setColor(config.EMBED_COLOR)
                            .setTitle(latestVideo.snippet.title)
                            .setURL(`https://www.youtube.com/watch?v=${latestVideo.id.videoId}`)
                            .setDescription(latestVideo.snippet.description)
                            .setImage(latestVideo.snippet.thumbnails.high.url)
                            .setTimestamp(new Date(latestVideo.snippet.publishedAt))
                            .setFooter(`${latestVideo.snippet.channelTitle}`, channelData.thumbnails.default.url);

                        const notificationChannel = message.guild.channels.cache.get(discordChannel.id);
                        if (notificationChannel) {
                            const notificationMessage = `# YOUTUBE ANNOUNCEMENT\n> Hi everyone, **${latestVideo.snippet.channelTitle}** has uploaded a new video...watch it now!!\n\n> Title: **${latestVideo.snippet.title}**\n> Thumbnail: [Click Here!!](${latestVideo.snippet.thumbnails.high.url})\n> Link YouTube: [Click Here](https://www.youtube.com/watch?v=${latestVideo.id.videoId})`;

                            notificationChannel.send(notificationMessage, videoEmbed);

                            // Update the last checked video ID
                            const updatedData = {
                                youtubeChannelId,
                                discordChannelId: discordChannel.id,
                                type: 'upload',
                                lastCheckedVideoId
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
