const Discord = require('discord.js');
const backup = require('discord-backup');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

module.exports = {
    name: "backup-create",
    aliases: ["bc", "backupcreate", "backup"],
    category: "backup",
    usage: "backup-create",
    description: "Create a server backup",
    run: async (client, message, args) => {
        try {
            if (!message.member.hasPermission("ADMINISTRATOR") && !message.member.hasPermission("MANAGE_GUILD")) {
                return message.channel.send("You don't have `ADMINISTRATOR` or `MANAGE_GUILD` permission!");
            }

            const processingMessage = await message.channel.send("**[Please Wait]** `Creating backup servers...`");

            const username = message.author.username;
            const serverName = message.guild.name;
            const userFolderPath = path.join(__dirname, "BackupsID", username);
            const serverFolderPath = path.join(userFolderPath, serverName);

            if (!fs.existsSync(userFolderPath)) {
                fs.mkdirSync(userFolderPath, { recursive: true });
            }
            if (!fs.existsSync(serverFolderPath)) {
                fs.mkdirSync(serverFolderPath, { recursive: true });
            }

            backup.setStorageFolder(serverFolderPath);

            const backupData = await backup.create(message.guild, {
                maxMessagesPerChannel: 0,
                jsonSave: true,
                jsonBeautify: true,
                saveImages: "base64"
            });

            const backupID = backupData.id;
            const backupDataSize = backupData.size;
            await processingMessage.delete();

            message.channel.send("**[Success]** `Backup created successfully! Check your DM for details.`");

            const dmEmbed = new Discord.MessageEmbed()
                .setColor(config.EMBED_COLOR)
                .setTitle("Backup Information")
                .setDescription("`Your backup has been created successfully!`")
                .addField("Server Name", message.guild.name)
                .addField("Backup ID", backupID)
                .addField("Backup Size", backupDataSize)
                .setThumbnail(client.user.displayAvatarURL())
                .setTimestamp()
                .setFooter(`${client.user.tag}`, client.user.displayAvatarURL());

            await message.author.send(backupID, dmEmbed);
        } catch (error) {
            console.error("Error creating backup:", error);
            return message.channel.send(`:x: An error occurred while creating the backup. If the issue persists, please type \`[ ${config.PREFIX}report Your_Report_Message ]\`.`);
        }
    }
};