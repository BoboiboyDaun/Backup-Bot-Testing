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

      let commandsData = {};

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
          commandsData[category] = commandString.slice(0, -2); // Removes the last comma
        }
      });

      return commandsData;
    };

    const commandsData = readCommands(path.join(__dirname, '..'));

    const generateMainEmbed = () => {
      const embed = new MessageEmbed()
        .setColor(`${config.EMBED_COLOR}`)
        .setTitle("ðŸ“¦ List Of Commands")
        .setDescription("`Type the category number below to see commands in that category.`\n**[NOTE]** | `Type` **0** `to see all commands.`\n`Type` **Menu** `to return to the main menu.`")
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter(`Requested By ${message.author.username}`, message.author.displayAvatarURL())
        .setTimestamp();

      const categoryNames = Object.keys(commandsData);
      let categoriesString = "";
      categoryNames.forEach((category, index) => {
        categoriesString += `**${index + 1}. ${category}**\n`;
      });

      embed.addField("Commands Category", categoriesString, true);

      return embed;
    };

    const mainEmbed = generateMainEmbed();
    const mainMessage = await message.channel.send(mainEmbed);

    const filter = (response) => {
      return response.author.id === message.author.id && (response.content.toLowerCase() === "menu" || !isNaN(response.content));
    };

    const collector = message.channel.createMessageCollector(filter, { time: 60000 });

    collector.on('collect', async (response) => {
      if (response.content.toLowerCase() === "menu") {
        await mainMessage.edit(generateMainEmbed());
        response.delete();
        return;
      }

      const selectedNumber = parseInt(response.content);
      if (selectedNumber === 0) {
        let allCommandsString = "";
        Object.keys(commandsData).forEach(category => {
          allCommandsString += `**${category}**\n${commandsData[category]}\n\n`;
        });

        const allCommandsEmbed = new MessageEmbed()
          .setColor(`${config.EMBED_COLOR}`)
          .setTitle(`ðŸ“¦ All Commands`)
          .setThumbnail(client.user.displayAvatarURL())
          .setFooter(`Requested By ${message.author.username}`, message.author.displayAvatarURL())
          .setTimestamp()
          .setDescription(allCommandsString);

        await mainMessage.edit(allCommandsEmbed);
        response.delete();
        return;
      }

      const categoryNames = Object.keys(commandsData);
      if (selectedNumber > 0 && selectedNumber <= categoryNames.length) {
        const selectedCategory = categoryNames[selectedNumber - 1];

        if (commandsData[selectedCategory]) {
          const categoryEmbed = new MessageEmbed()
            .setColor(`${config.EMBED_COLOR}`)
            .setTitle(`ðŸ“¦ Commands in ${selectedCategory}`)
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter(`Requested By ${message.author.username}`, message.author.displayAvatarURL())
            .setTimestamp()
            .setDescription(commandsData[selectedCategory]);

          await mainMessage.edit(categoryEmbed);
        }
      }

      response.delete();
    });

    collector.on('end', async () => {
      const timeoutEmbed = new MessageEmbed()
        .setColor(`${config.EMBED_COLOR}`)
        .setTitle("Response time is timeout")
        .setDescription("This message will be deleted in 7 seconds.");

      await mainMessage.edit(timeoutEmbed);
      setTimeout(() => mainMessage.delete(), 7000);
    });

    if (!args.length) return;
  }
};