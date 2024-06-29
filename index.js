const { Client, Collection } = require('discord.js');
const client = new Client();
const config = require('./config.json');

client.commands = new Collection();
client.config = config;

require('./handlers/loadEvent')(client);
require('./handlers/loadCommand')(client);

// Client Login
client.login(config.TOKEN);
