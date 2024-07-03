const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

module.exports = {
    name: "dmclear",
    aliases: ["dmc", "dmclear"],
    category: "Backup",
    usage: "dmclear",
    description: "Clear backup DM if the backup ID is not available in the folder path",
    run: async (client, message, args) => {
        try {
            /*if (!message.member.hasPermission("ADMINISTRATOR") && !message.member.hasPermission("MANAGE_GUILD")) {
                return message.channel.send("You don't have `ADMINISTRATOR` or `MANAGE_GUILD` permission!");
            }*/

            const username = message.author.username;
            const serverName = message.guild.name;
            const userFolderPath = path.join(__dirname, "../Backup/BackupsID", username);
            const serverFolderPath = path.join(userFolderPath, serverName);

            if (!fs.existsSync(serverFolderPath)) {
                return message.channel.send("**[Error]** `No backups found for this server.`");
            }

            const backupFiles = fs.readdirSync(serverFolderPath);
            const backupIDs = backupFiles.map(file => path.basename(file, path.extname(file)));

            if (!message.author.dmChannel) {
                await message.author.createDM();
            }

            const dms = await message.author.dmChannel.messages.fetch({ limit: 100 });
            const dmEmbeds = dms.filter(dm => dm.embeds.length > 0 && dm.embeds[0].title === "Backup Information" && dm.embeds[0].fields.find(field => field.name === "Server Name").value === serverName);

            for (const dm of dmEmbeds.values()) {
                const backupID = dm.embeds[0].fields.find(field => field.name === "Backup ID").value;
                if (!backupIDs.includes(backupID)) {
                    await dm.delete();
                }
            }

            message.channel.send("**[Success]** `Cleared backup DMs for unavailable backup IDs.`");
        } catch (error) {
            console.error("Error clearing backup DMs:", error);
            return message.channel.send(`:x: An error occurred while clearing the backup DMs. If the issue persists, please type \`[ ${config.PREFIX}report Your_Report_Message ]\`.`);
        }
    }
};
