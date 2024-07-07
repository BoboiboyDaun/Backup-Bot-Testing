const { red } = require('colorette');
const { logMessage } = require('../../helpers/logHelper');

module.exports = (client, error) => {
  const message = `Error: ${error.message}`;
  console.error(red(message));
  logMessage(message);
};