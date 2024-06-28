const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const { red, green, yellow, blue, cyan, purple } = require('colorette');

module.exports = (client) => {
    client.commands = new Collection();
    const commandsDir = path.resolve(__dirname, '../commands');

    const loadCommands = (dir) => {
        fs.readdir(dir, (err, categories) => {
            if (err) return console.error(red('Error reading commands directory:', err));

            categories.forEach((category) => {
                const categoryDir = path.join(dir, category);
                if (!fs.statSync(categoryDir).isDirectory()) return;

                fs.readdir(categoryDir, (err, files) => {
                    if (err) return console.error(red(`[ERROR] => Error reading ${category} directory:`, err));

                    files.forEach((file) => {
                        if (!file.endsWith(".js")) {
                            console.log(yellow(`[SKIPPED] => not javascript file: ${file}`));
                            return;
                        }
                        try {
                            const props = require(path.join(categoryDir, file));
                            const commandName = file.split(".")[0];
                            client.commands.set(commandName, props);
                            console.log(green(`[SUCCESS] => ${category} | ${commandName} loaded`));
                        } catch (error) {
                            console.error(red(`[ERROR] => error loading ${category}/${file}:`), error);
                        }
                    });
                });
            });
        });
    };

    loadCommands(commandsDir);
};