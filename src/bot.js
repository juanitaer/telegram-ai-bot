const { Telegraf } = require('telegraf');
const { registerHandlers } = require('./handlers/registerHandlers');
function createBot({ token, services, botFactory = (value) => new Telegraf(value) }) { return registerHandlers(botFactory(token), services); }
module.exports = { createBot };
