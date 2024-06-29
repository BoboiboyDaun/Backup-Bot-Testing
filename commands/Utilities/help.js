const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require('../../config.json');

module.exports = {
  name: "help",
  aliases: ["h"],
  description: "Help Command!",
  usage: "Help | <Command Name>",
  run: async (client, message, args) => {
    message.delete();
    const readCommands = (dir) => {
      const categories = fs.readdirSync(dir);

      let embed = new MessageEmbed()
        .setColor(`${config.EMBED_COLOR}`)
        .setTitle("📦 List Of Commands")
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter(`Requested By ${message.author.username}`, message.author.displayAvatarURL())
        .setTimestamp();

      categories.forEach(category => {
        const categoryPath = path.join(dir, category);
        const commands = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

        let commandString = "";
        commands.forEach(file => {
          const commandName = file.split('.')[0];
          const command = require(path.join(categoryPath, file));
          commandString += `\`${commandName}\`, `;
        });

        if (commandString.trim() !== "") {
          embed.addField(category, commandString.slice(0, -2)); // Removes the last comma
        }
      });

      return embed;
    };
      
    const embed = readCommands(path.join(__dirname, '..'));
      
    if (!args.length) return message.channel.send(embed);
  }
};
