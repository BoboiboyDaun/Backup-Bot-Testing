const Discord = require("discord.js");
const { MessageEmbed } = require("discord.js");
const config = require("../../config.json");

module.exports = {
  name: "online",
  aliases: ["on","o","up"],
  category: "uptime",
  run: async(client, message, args) => {
    
    let days = Math.floor(client.uptime / 86400000 );
    let hours = Math.floor(client.uptime / 3600000 ) % 24;
    let minutes = Math.floor(client.uptime / 60000) % 60;
    let seconds = Math.floor(client.uptime / 1000) % 60;
    
    let upembed = new Discord.MessageEmbed()
    .setColor(config.EMBED_COLOR)
    .setTitle(`⏳ | I've been online for ${days}d ${hours}h ${minutes}m ${seconds}s`)
    
    message.channel.send(upembed)
    }
  
}