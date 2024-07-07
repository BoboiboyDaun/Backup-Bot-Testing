const { red } = require('colorette');
const { logMessage } = require('../../helpers/logHelper');
const config = require('../../config.json');

module.exports = (client, event) => {
  const message = `Disconnected: ${event.code} - ${event.reason}`;
  console.error(red(message));
  logMessage(message);

  // Reconnect
  if (event.code !== 1000) {
    setTimeout(() => {
      client.login(config.TOKEN).catch(console.error);
    }, 5000); // Retry after 5 seconds
  }
};
