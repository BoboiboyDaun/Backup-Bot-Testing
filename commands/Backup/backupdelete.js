const Discord = require("discord.js");
const backup = require('discord-backup');
const fs = require('fs');
const path = require('path');
const config = require("../../config.json");

module.exports = {
    name: "backup-delete",
    aliases: ["bd", "backupdelete", "backupdel"],
    category: "backup",
    usage: "backup-delete <backup_id>",
    description: "Delete the backup of the server!",
    run: async (client, message, args) => {
        
        if (!message.member.hasPermission("ADMINISTRATOR") && !message.member.hasPermission("MANAGE_GUILD")) {
            return message.channel.send("You don't have `ADMINISTRATOR` or `MANAGE_GUILD` permission!");
        }
        
        if (!args[0]) {
            const missingIDEmbed = new Discord.MessageEmbed()
                .setColor(config.ERROR_COLOR)
                .setTitle("Missing Backup ID")
                .setDescription("```\nPlease provide the ID of the backup you want to delete.\n\nExample: backup-delete 1191279611900781738\n\nYou can also use the command backup-list [Soon], to list all your backup IDs look at direct messages [DM]!.\n```");

            return message.channel.send(missingIDEmbed);
        }

        const backupID = args[0];

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

        traverseFolders(path.join(__dirname, "../Backup/BackupsID"));

        if (!backupFound) {
            return message.channel.send(`:x: No backup found for ID ${backupID}!`);
        }

        backup.setStorageFolder(backupFolderPath);

        const backupInfo = await backup.fetch(backupID).catch((error) => {
            console.error("Error fetching backup information:", error);
            return null;
        });

        if (!backupInfo) {
            return message.channel.send("No backup found with that ID.");
        }

        const serverName = backupInfo.data ? backupInfo.data.name : "Unknown Server";

        const confirmationEmbed = new Discord.MessageEmbed()
            .setColor(config.EMBED_COLOR)
            .setTitle("Confirmation")
            .setDescription(`Are you sure you want to delete the backup of ${serverName}? Reply with \`yes\` to confirm or \`cancel\` to cancel.`);

        const msg = await message.channel.send(confirmationEmbed);

        const filter = (response) => ['yes', 'cancel'].includes(response.content.toLowerCase()) && response.author.id === message.author.id;

        message.channel.awaitMessages(filter, { max: 1, time: 10000, errors: ['time'] })
            .then(async (collected) => {
                const response = collected.first().content.toLowerCase();
                if (response === 'yes') {
                    const initialEmbed = new Discord.MessageEmbed()
                        .setColor(config.PROCESSING_COLOR)
                        .setTitle("Processing...")
                        .setDescription("```\nPlease wait while we process your request.\n```");

                    await msg.edit(initialEmbed);

                    let delay = (duration) => new Promise(resolve => setTimeout(resolve, duration));

                    try {
                        await delay(2000);
                        const embed1 = new Discord.MessageEmbed()
                            .setColor(config.PROCESSING_COLOR)
                            .setTitle("Search for backup server data")
                            .setDescription("```\nSearching for backup server data...\n```");

                        await msg.edit(embed1);

                        await delay(2000);
                        const embed2 = new Discord.MessageEmbed()
                            .setColor(config.PROCESSING_COLOR)
                            .setTitle("An in-depth search is underway")
                            .setDescription("```\nAn in-depth search is being conducted...\n```");

                        await msg.edit(embed2);

                        await delay(2000);
                        const embed3 = new Discord.MessageEmbed()
                            .setColor(config.PROCESSING_COLOR)
                            .setTitle("Get backup server data")
                            .setDescription("```\nRetrieving backup server data...\n```");

                        await msg.edit(embed3);

                        await delay(2000);
                        const embed4 = new Discord.MessageEmbed()
                            .setColor(config.PROCESSING_COLOR)
                            .setTitle("Initiate backup server deletion")
                            .setDescription("```\nInitiating backup server deletion...\n```");

                        await msg.edit(embed4);

                        await delay(2000);
                        const embed5 = new Discord.MessageEmbed()
                            .setColor(config.EMBED_COLOR)
                            .setTitle("Removal complete")
                            .setDescription("```\nBackup server of `" + serverName + "` has been successfully deleted. Thank you for using our bot! 😁👍🏻\n```");

                        await msg.edit(embed5).then(msg => {
                            setTimeout(() => msg.delete(), 7000);
                        });

                        await backup.remove(backupID);

                        message.delete();

                        const user = await client.users.fetch(message.author.id);
                        const userDM = await user.createDM();
                        const messages = await userDM.messages.fetch();

                        messages.forEach(async (msg) => {
                            if (msg.content.includes(backupID)) {
                                await msg.delete();
                            }
                        });

                        return;
                    } catch (error) {
                        console.error("Error deleting backup:", error);
                        return message.channel.send(`:x: An error occurred while deleting the backup. If the issue persists, please type \`[ ${config.PREFIX}report your_message_report ]\`.`);
                    }
                } else if (response === 'cancel') {
                    return message.channel.send("Backup deletion cancelled.");
                } else {
                    return message.channel.send("Invalid response. Backup deletion cancelled.");
                }
            })
            .catch(() => {
                message.channel.send('You didn\'t reply within 10 seconds. Backup deletion cancelled.');
            });
    }
};