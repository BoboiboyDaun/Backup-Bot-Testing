const { blue } = require('colorette');
const { logMessage } = require('../../helpers/logHelper');

module.exports = (client) => {
  const message = 'Reconnecting...';
  console.log(blue(message));
  logMessage(message);
};