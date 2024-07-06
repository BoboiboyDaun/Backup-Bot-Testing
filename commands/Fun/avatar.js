const { MessageEmbed } = require("discord.js");
const config = require("../../config.json");
const fetch = require('node-fetch');

module.exports = {
  name: "avatar",
  aliases: ["icon", "pfp", "avatar", "pic", "avt"],
  category: "Fun",
  description: "Show Member Avatar and Banner!",
  usage: `${config.PREFIX}avatar | <Mention Member>`,
  accessableby: "everyone",
  run: async (client, message, args) => {
    let Member = message.mentions.users.first() || message.guild.members.cache.get(args[0])?.user || message.author;

    const avatarURL = Member.displayAvatarURL({ format: "png", dynamic: true, size: 4096 });

    const bannerURL = null; // You can replace this with a default image if needed

    // Avatar size
    const avatarResponse = await fetch(avatarURL);
    const avatarBuffer = await avatarResponse.buffer();
    const avatarSizeInBytes = avatarBuffer.length;
    const avatarSizeInKB = (avatarSizeInBytes / 1024).toFixed(2);
    const avatarSizeInMB = (avatarSizeInBytes / (1024 * 1024)).toFixed(2);

    // Banner size
    let bannerSizeInKB = "N/A";
    let bannerSizeInMB = "N/A";
    if (bannerURL) {
      const bannerResponse = await fetch(bannerURL);
      const bannerBuffer = await bannerResponse.buffer();
      const bannerSizeInBytes = bannerBuffer.length;
      bannerSizeInKB = (bannerSizeInBytes / 1024).toFixed(2);
      bannerSizeInMB = (bannerSizeInBytes / (1024 * 1024)).toFixed(2);
    }

    let embed = new MessageEmbed()
     .setColor(config.EMBED_COLOR)
     .addField(
        `Avatar of ${Member.username}`,
        `[PNG](${Member.displayAvatarURL({ format: "png", dynamic: true, size: 4096 })}) | [JPG](${Member.displayAvatarURL({ format: "jpg", dynamic: true, size: 4096 })}) | [WEBP](${Member.displayAvatarURL({ format: "webp", dynamic: true, size: 4096 })}) | [GIF](${Member.displayAvatarURL({ format: "gif", dynamic: true, size: 4096 })})`
      )
     .setImage(avatarURL)
     .addField(
        `Banner of ${Member.username}`,
        bannerURL? `[View Banner](${bannerURL})` : "`This user does not have a banner.`"
      )
     .addField(
        'Size',
        `\`Avatar: ${avatarSizeInKB} KB (${avatarSizeInMB} MB) | Banner: ${bannerSizeInKB} KB (${bannerSizeInMB} MB)\``
      )
     .setFooter(message.author.username,message.author.displayAvatarURL())
     .setTimestamp();

    message.channel.send(embed);
  }
};