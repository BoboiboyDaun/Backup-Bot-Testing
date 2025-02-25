const Discord = require('discord.js');
const config = require('../../config.json');

module.exports = async (client, message) => {
    if (message.author.bot) return;

    // Mentioned
    if (message.content.match(new RegExp(`^<@!?${client.user.id}>$`))) {
        const mentionEmbed = new Discord.MessageEmbed()
            .setColor(config.EMBED_COLOR)
            .setTitle("Have I been called?")
            .setDescription(`\`Hey ${message.author.username}, are you the one who called me? My prefix is: ${config.PREFIX}\``)
            .setTimestamp()
            .setFooter(client.user.tag, client.user.displayAvatarURL({ dynamic: true }));

        message.channel.send(mentionEmbed).then(sentMessage => {
            setTimeout(() => {
                if (!sentMessage.deleted) sentMessage.delete().catch(console.error);
            }, 7000);
        });

        return;
    }

    // Commands with prefix
    if (message.content.startsWith(config.PREFIX) || message.content.match(new RegExp(`^<@!?${client.user.id}>\\s*`))) {
        // Extract command and arguments
        let args = [];
        let command = "";

        if (message.content.startsWith(config.PREFIX)) {
            args = message.content.slice(config.PREFIX.length).trim().split(/ +/);
            command = args.shift().toLowerCase();
        } else if (message.content.match(new RegExp(`^<@!?${client.user.id}>\\s*`))) {
            args = message.content.trim().split(/ +/);
            args.shift();
            command = args.shift().toLowerCase();
        }

        const cmd = client.commands.get(command) || client.commands.find(a => a.aliases && a.aliases.includes(command));

        if (cmd) {
            try {
                await cmd.run(client, message, args);
            } catch (err) {
                console.error(`Error running command ${command}: ${err}`);
                message.channel.send(`Error: ${err.message}`);
            }
        } else {
            const unknownCommandEmbed = new Discord.MessageEmbed()
                .setColor(config.EMBED_COLOR)
                .setTitle("Unknown Command")
                .setDescription(`\`Hey ${message.author.username}, I didn't understand that command. Try using my prefix: ${config.PREFIX}help to followed by a valid command.\``)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({ dynamic: true }));

            message.channel.send(unknownCommandEmbed).then(sentMessage => {
                setTimeout(() => {
                    if (!sentMessage.deleted) sentMessage.delete().catch(console.error);
                }, 7000); 
            });
        }

        return;
    }
};