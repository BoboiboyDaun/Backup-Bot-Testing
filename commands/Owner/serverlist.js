const config = require("../../config.json");
const Discord = require("discord.js");

module.exports = {
    name: "serverList",
    aliases: ["slt", "list", "serverlist", "sl"],
    category: "owner",
    description: "Displays the list of Servers!",
    usage: "",

    run: async (bot, message, args) => {
        if (message.author.id !== '941138254961442838') {
            return message.channel.send(`Hello <@${message.author.id}>, I'm sorry but this command is only accessible by my developer`)
                .then(msg => msg.delete({ timeout: 5000 }));
        }

        message.channel.send("<a:sky_prefix:1168764705947533323> `Hey you!!, check your DM please... I've sent it to your DM!!`");

        let i0 = 0;
        let i1 = 10;
        let page = 1;

        const guilds = bot.guilds.cache.sort((a, b) => b.memberCount - a.memberCount);

        const embed = new Discord.MessageEmbed()
            .setAuthor(bot.user.tag, bot.user.displayAvatarURL({ dynamic: true }))
            .setColor(config.EMBED_COLOR)
            .setFooter(`Page - ${page}/${Math.ceil(guilds.size / 10)}`)
            .setDescription(getGuildDescription(guilds, i0, i1));

        const msg = await message.author.send(embed);

        await msg.react("⬅️");
        await msg.react("➡️");
        await msg.react("❌");

        const collector = msg.createReactionCollector(
            (reaction, user) => user.id === message.author.id
        );

        collector.on("collect", async (reaction) => {
            if (reaction.emoji.name === "⬅️") {
                i0 = Math.max(i0 - 10, 0);
                i1 = i0 + 10;
                page--;

            } else if (reaction.emoji.name === "➡️") {
                i0 = Math.min(i0 + 10, guilds.size - 10);
                i1 = i0 + 10;
                page++;
            } else if (reaction.emoji.name === "❌") {
                await msg.delete();
                collector.stop();
                return;
            }

            embed
                .setFooter(`Page - ${page}/${Math.ceil(guilds.size / 10)}`)
                .setDescription(getGuildDescription(guilds, i0, i1));

            await msg.edit(embed);
            await reaction.users.remove(message.author.id);
        });

        collector.on("end", () => {
            msg.reactions.removeAll().catch(() => {});
        });

        function getGuildDescription(guilds, i0, i1) {
            return `Total Servers - ${guilds.size}\n\n` +
                guilds
                    .array()
                    .slice(i0, i1)
                    .map((guild, i) => `**${i + 1}** - ${guild.name} | ${guild.memberCount} Members\nID - ${guild.id}`)
                    .join("\n\n");
        }
    }
};