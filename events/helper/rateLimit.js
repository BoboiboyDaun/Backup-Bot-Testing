const { yellow } = require('colorette');
const { logMessage } = require('../../helpers/logHelper');

module.exports = (client, info) => {
  const message = `Rate limit hit: ${JSON.stringify(info)}`;
  console.warn(yellow(message));
  logMessage(message);
};