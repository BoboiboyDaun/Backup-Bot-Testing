const Discord = require('discord.js');

const report_log = ('1175752034167836703'); //Channel Id For Report Logs
const OWNER_USER_ID = ('<@941138254961442838>'); //Your Discord ID to ping you if there's a bug report or whatever!!.

module.exports = {
    name: "report",
    aliases: ["rp"],
    category: "Misc",
    description: "To report us any bugs or anything !!",
    example: `1report Bot is not working`,

    run: async (client, message, args) => {
        
        const channel = client.channels.cache.get(report_log);

        if(!args[0])
        return message.reply(`:x: Please provide a report so that we can look through !! **\`*report [Your report]\`**`)

        let report = message.content.slice(message.content.indexOf(args[0]), message.content.length);


        const Embed = new Discord.MessageEmbed()
        .setTitle('__Report__')
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setDescription(report)
        .addField('User', `\`${message.member.user.tag}\` | \`${message.member.id}\``)
        .addField('Server', `\`${message.guild.name}\` | \`${message.guild.id}\``)
        .setTimestamp()
        .setColor("BLUE");

        channel.send(OWNER_USER_ID,Embed)
        
        await message.channel.send(`✨ Your report has been sent to my developer !!`)
        return message.delete();
    }
}