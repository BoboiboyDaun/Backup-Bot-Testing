const Discord = require('discord.js');
const { OWNER_ID, CLIENT_ID, EMBED_COLOR } = require('../../config.json');

module.exports = {
  name: "botinfo",
  aliases: ["infobot", "ib", "about", "status"],
  category: "Utilities",
  description: "Returns bot info",
  run: async (client, message, args) => {
    let days = Math.floor(client.uptime / 86400000);
    let hours = Math.floor(client.uptime / 3600000) % 24;
    let minutes = Math.floor(client.uptime / 60000) % 60;
    let seconds = Math.floor(client.uptime / 1000) % 60;

    let ownerTag = "zetoboymaccalan_01";
    const ownerUser = client.users.cache.get(OWNER_ID);
    if (ownerUser) {
      ownerTag = ownerUser.tag;
    }

    const embedstats = new Discord.MessageEmbed()
      .setAuthor(`${client.user.username} Statistics`)
      .setColor(EMBED_COLOR)
      .addField("Developer", `<@${OWNER_ID}> | \`${ownerTag}\``, true)
      .addField("Library", `\`Discord.Js ${Discord.version}\``, true)
      .addField("Uptime", `\`${days}d ${hours}h ${minutes}m ${seconds}s\``, true)
      .addField("Total Guilds", `\`${client.guilds.cache.size} Guilds\``, true)
      .addField("Total Users", `\`${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} Users\``, true)
      .addField("Total Channels", `\`${client.channels.cache.size} Channels\``, true)
      .addField("Total Commands", `\`${client.commands.size} cmds\``, true)
      .addField("Bot Latency", `\`${Math.round(client.ws.ping)}ms\``, true)
      .addField("Message Latency", `\`${Date.now() - message.createdTimestamp}ms\``, true)
      .addField("Bot Created At", `\`${client.user.createdAt.toDateString()}\``, true)
      .addField("Memory Disk", `\`${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB RSS\n${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB Heap\``, true)
      .setDescription(`[Invite Me](https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8) | [Add more if needed]()`)
      .setThumbnail(message.author.displayAvatarURL())
      .setFooter(`${message.author.tag}`, message.author.displayAvatarURL())
      .setTimestamp();

    return message.channel.send(embedstats);
  }
};
