const Discord = require("discord.js");
const backup = require('discord-backup');
const fs = require('fs');
const path = require('path');
const config = require("../../config.json");

module.exports = {
    name: "backupinfo",
    aliases: ["infobackup", "bi"],
    category: 'backup',
    run: async (client, message, args) => {
        if (!message.member.hasPermission("ADMINISTRATOR") && !message.member.hasPermission("MANAGE_GUILD")) {
            return message.channel.send("You don't have `ADMINISTRATOR` or `MANAGE_GUILD` permission!");
        }

        const backupID = args.join(' ');

        if (!backupID) {
            return message.channel.send(':x: Please specify a valid backup ID!');
        }

        const initialEmbed = new Discord.MessageEmbed()
            .setColor(config.PROCESSING_COLOR)
            .setTitle("Processing...")
            .setDescription("```\nPlease wait while we process your request.\n```");

        const msg = await message.channel.send(initialEmbed);

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
            const errorEmbed = new Discord.MessageEmbed()
                .setColor(config.EMBED_COLOR)
                .setDescription(`:x: No backup found for ID ${backupID}!`);
            return msg.edit(errorEmbed);
        }
        
        backup.setStorageFolder(backupFolderPath);

        backup.fetch(backupID).then((backupData) => {
            const date = new Date(backupData.data.createdTimestamp);
            const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1)}/${date.getDate()}`;
            const owner = backupData.owner ? backupData.owner.tag : "Unknown";

            const embed = new Discord.MessageEmbed()
                .setColor(config.EMBED_COLOR)
                .setAuthor(':information_source: Backup', backupData.data.iconURL)
                .addField('Server Name', backupData.data.name)
                .addField('Size', backupData.size + ' kb')
                .addField('Creator', owner)
                .addField('Created At', formattedDate)
                .setFooter('Backup ID: Hidden for Security');

            setTimeout(() => {
                msg.edit(embed);
            }, 2100);

            message.delete();
        }).catch((err) => {
            const errorMessage = (err === 'No backup found') ? `:x: No backup found for ID ${backupID}!` : `:x: An error occurred: ${typeof err === 'string' ? err : JSON.stringify(err)} If you still experience the same problem, you can report your problem by typing \`[ ${config.PREFIX}report Your_Report_Message ]\``;
            const errorEmbed = new Discord.MessageEmbed().setColor(config.ERROR_COLOR).setDescription(errorMessage);

            setTimeout(() => {
                msg.edit(errorEmbed);
            }, 2100);
        });
    }
};
