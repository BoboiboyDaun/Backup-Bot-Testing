const Discord = require("discord.js");

module.exports = {
  name: "nuke",
  aliases: ["nuke", "nukes", "nuked", "NukeChannel", "Nukechannel", "ServerNuke", "Servernuke"],
  category: "moderation",
  description: "nuke",
  run: async (client, message, args) => {
    if (!message.member.hasPermission("ADMINISTRATOR") &&!message.member.hasPermission("MANAGE_GUILD")) {
      return message.channel.send("You don't have `ADMINISTRATOR` or `MANAGE_GUILD` permission!");
    }

    const confirmation = await message.channel.send("Are you sure you want to delete this channel? Click 💥 to detonate... and click 💤 to cancel. You have 10-15 seconds to react.");

    await confirmation.react('💥');
    await confirmation.react('💤');

    const filter = (reaction, user) => ['💥', '💤'].includes(reaction.emoji.name) && user.id === message.author.id;
    const collector = confirmation.createReactionCollector(filter, { time: 15000 });

    collector.on('collect', async (reaction) => {
      if (reaction.emoji.name === '💥') {
        const response = await message.channel.send("👨‍💻 Preparing nuke...");

        setTimeout(() => {
          response.edit("🚀 Launching nuke...");
        }, 5000);

        setTimeout(() => {
          response.edit("🛰️ Nuke successfully launched...");
        }, 2000);

        setTimeout(() => {
          response.edit("💥 Nuke successfully launched, detonating nuke...");
        }, 4000);

        setTimeout(() => {
          response.delete();
        }, 7000);

        setTimeout(() => {
          message.channel.clone().then((ch) => {
            ch.setParent(message.channel.parent);
            ch.setPosition(message.channel.position);
            message.channel.delete().then(() => {
              setTimeout(() => {
                ch.send(`> <#${message.channel.id}>\n> <@${message.author.id}>` + " " + '`Nuke has been completed, this channel has been reset to like new!!`')
                 .then(msg => msg.delete({ timeout: 5000 }));
              }, 2000);
            });
          });
        }, 10000);

        collector.stop();
      } else if (reaction.emoji.name === '💤') {
        message.channel.send("Nuking channel has been cancelled.");
        collector.stop();
      }
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        message.channel.send("You didn't react in time. Nuking channel has been cancelled.");
      }
      confirmation.delete();
    });
  }
}