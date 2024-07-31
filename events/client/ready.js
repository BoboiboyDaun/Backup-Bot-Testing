const statusActivity = require('./statusActivity');
const { red, yellow, green, blue, cyan, purple } = require('colorette');

module.exports = async (client) => {
  statusActivity(client); // Set up bot status activity
console.log(cyan(`Ready as ${client.user.tag} to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${client.users.cache.size} users.`));
};