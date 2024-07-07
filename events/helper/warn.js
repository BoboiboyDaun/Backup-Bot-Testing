const { yellow } = require('colorette');
const { logMessage } = require('../../helpers/logHelper');

module.exports = (client, info) => {
  const message = `Warning: ${info}`;
  console.warn(yellow(message));
  logMessage(message);
};