const Discord = require("discord.js");
const backup = require('discord-backup');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "backup-load",
    aliases: ["bload", "backupload", "bl", "load"],
    category: "backup",
    usage: "backup-load <backup_id>",
    description: "Load a server backup",
    run: async (client, message, args) => {

        if (!message.member.hasPermission("ADMINISTRATOR") && !message.member.hasPermission("MANAGE_GUILD")) {
            return message.channel.send("You don't have `ADMINISTRATOR` or `MANAGE_GUILD` permission!");
        }

        const backupID = args.join(' ');

        if (!backupID) {
            return message.channel.send(':x: Please specify a valid backup ID!');
        }

        const backupsFolder = path.join(__dirname, "../Backup/BackupsID");
        let backupFound = false;
        let backupFolderPath = '';
        
        const traverseFolders = (dir) => {
            const users = fs.readdirSync(dir, { withFileTypes: true });
            for (const user of users) {
                if (user.isDirectory()) {
                    const userPath = path.join(dir, user.name);
                    const servers = fs.readdirSync(userPath, { withFileTypes: true });
                    for (const server of servers) {
                        if (server.isDirectory()) {
                            const serverPath = path.join(userPath, server.name);
                            const backupFilePath = path.join(serverPath, `${backupID}.json`);
                            if (fs.existsSync(backupFilePath)) {
                                backupFolderPath = serverPath;
                                backupFound = true;
                                return;
                            }
                        }
                    }
                }
            }
        };

        traverseFolders(backupsFolder);

        if (!backupFound) {
            return message.channel.send(`:x: No backup found for ID ${backupID}!`);
        }

        backup.setStorageFolder(backupFolderPath);

        backup.fetch(backupID).then(() => {
            const embed = new Discord.MessageEmbed()
                .setTitle("Read below")
                .setDescription(':warning: All the server channels, roles, and settings will be cleared. Do you want to continue? Send `yes` or `cancel`!')
                .setThumbnail(client.user.displayAvatarURL())
                .setTimestamp()
                .setFooter(`${client.user.tag}`, client.user.displayAvatarURL());

            message.channel.send(embed);

            const collector = message.channel.createMessageCollector(
                (m) => m.author.id === message.author.id && ['yes', 'cancel'].includes(m.content.toLowerCase()),
                { time: 60000, max: 1 }
            );

            collector.on('collect', (m) => {
                const confirm = m.content.toLowerCase() === 'yes';
                collector.stop();
                if (confirm) {
                    backup.load(backupID, message.guild).then(() => {
                        const embed1 = new Discord.MessageEmbed()
                            .setTitle("Read below")
                            .setDescription('🚀 | Backup loaded successfully on `' + message.guild.name + '`!');

                        message.author.send(embed1).then(msg => {
                            setTimeout(() => msg.delete(), 15000); // Delete the message after 15 seconds
                        });
                    }).catch((err) => {
                        const errorMessage = (err === 'No backup found') ? ':x: No backup found for ID ' + backupID + '!' : ':x: An error occurred: ' + (typeof err === 'string' ? err : JSON.stringify(err));
                        return message.channel.send(errorMessage);
                    });
                } else {
                    return message.channel.send(':x: Cancelled.');
                }
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    return message.channel.send(':x: Command timed out! Please retry.');
                }
            });

        }).catch(() => {
            return message.channel.send(`:x: No backup found for ID ${backupID}!`);
        });
    }
};
