const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

module.exports = {
    name: "backup-list",
    aliases: ["backuplist"],
    category: "backup",
    usage: "backup-list",
    description: "List all server backups",
    run: async (client, message, args) => {
        try {
            if (!message.member.hasPermission("ADMINISTRATOR") && !message.member.hasPermission("MANAGE_GUILD")) {
                return message.channel.send("You don't have `ADMINISTRATOR` or `MANAGE_GUILD` permission!");
            }

            const username = message.author.username;
            const userFolderPath = path.join(__dirname, "../Backup/BackupsID", username);

            if (!fs.existsSync(userFolderPath)) {
                return message.channel.send(`No backups found for user ${username}.`);
            }

            const servers = fs.readdirSync(userFolderPath, { withFileTypes: true }).filter(dirent => dirent.isDirectory());

            if (servers.length === 0) {
                return message.channel.send(`No backups found for user ${username}.`);
            }

            const backupList = [];

            servers.forEach(server => {
                const serverFolderPath = path.join(userFolderPath, server.name);
                const backupFiles = fs.readdirSync(serverFolderPath).filter(file => file.endsWith('.json'));

                backupFiles.forEach(file => {
                    const backupID = file.replace('.json', '');
                    backupList.push({ serverName: server.name, backupID });
                });
            });

            if (backupList.length === 0) {
                return message.channel.send(`No backups found for user ${username}.`);
            }
            
            const chunkedBackupList = chunkArray(backupList, 10);

            let currentPage = 0;

            const generateEmbed = () => {
                const embed = new Discord.MessageEmbed()
                    .setColor(config.EMBED_COLOR)
                    .setTitle(`Backup List for ${username}`)
                    .setDescription(chunkedBackupList[currentPage].map(b => `**${b.serverName}**\n  - ||\`${b.backupID}\`||`).join('\n'))
                    .setThumbnail(client.user.displayAvatarURL())
                    .setTimestamp()
                    .setFooter(`Page ${currentPage + 1} of ${chunkedBackupList.length} | ${client.user.tag}`, client.user.displayAvatarURL());

                return embed;
            };

            const msg = await message.channel.send(generateEmbed());

            await msg.react('⬅️');
            await msg.react('➡️');
            await msg.react('❌');

            const filter = (reaction, user) => ['⬅️', '➡️', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;

            const collector = msg.createReactionCollector(filter, { time: 60000 });

            collector.on('collect', async (reaction, user) => {
                try {
                    if (reaction.emoji.name === '➡️') {
                        if (currentPage < chunkedBackupList.length - 1) {
                            currentPage++;
                            await msg.edit(generateEmbed());
                        }
                    } else if (reaction.emoji.name === '⬅️') {
                        if (currentPage !== 0) {
                            currentPage--;
                            await msg.edit(generateEmbed());
                        }
                    } else {
                        collector.stop();
                        await msg.delete();
                    }
                    await reaction.users.remove(user);
                } catch (error) {
                    console.error('Error handling reaction:', error);
                }
            });

            collector.on('end', () => {
                msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions:', error));
            });

        } catch (error) {
            console.error("Error listing backups:", error);
            return message.channel.send(":x: An error occurred while listing the backups. If the issue persists, please type `[ 1report Your_Report_Message ]`.");
        }
    }
};

function chunkArray(array, chunkSize) {
    const chunkedArray = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunkedArray.push(array.slice(i, i + chunkSize));
    }
    return chunkedArray;
}