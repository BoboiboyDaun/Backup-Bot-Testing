const fs = require('fs');
const path = require('path');
const { red, green, yellow, blue, cyan, purple } = require('colorette');

module.exports = (client) => {
    const eventsDir = path.resolve(__dirname, '../events');

    const loadEvents = (dir) => {
        fs.readdir(dir, (err, files) => {
            if (err) {
                console.error(red(`[EVENT_ERROR] => Error reading ${dir} directory:`, err));
                return;
            }

            files.forEach((file) => {
                const filePath = path.join(dir, file);
                if (fs.statSync(filePath).isDirectory()) {
                    loadEvents(filePath);
                } else if (file.endsWith(".js")) {
                    try {
                        const event = require(filePath);
                        const eventName = file.split(".")[0];
                        const category = path.relative(eventsDir, dir);
                        console.log(green(`[EVENT_SUCCESS] => ${category} | ${eventName} loaded`));
                        client.on(eventName, event.bind(null, client));
                    } catch (error) {
                        console.error(red(`[EVENT_ERROR] => Error loading event ${file}:`), error);
                    }
                } else {
                    console.log(yellow(`[EVENT_SKIPPED] => not javascript file: ${file}`));
                }
            });
        });
    };

    loadEvents(eventsDir);
};