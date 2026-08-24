const express = require('express');
const { loadConfig } = require('./config/env');
const { createBot } = require('./bot');
const { createOpenAIService } = require('./services/openaiService');
const { createWeatherService } = require('./services/weatherService');
const { createTtsService } = require('./services/ttsService');
const { validateUpdate } = require('./utils/validation');
function createApp({ bot, webhookSecret }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.post('/telegram-bot', (req, res, next) => {
    const supplied = req.get('X-Telegram-Bot-Api-Secret-Token');
    if (!supplied || supplied !== webhookSecret) return res.status(401).json({ error: 'unauthorized' });
    if (!validateUpdate(req.body)) return res.status(400).json({ error: 'invalid_update' });
    return bot.webhookCallback('/telegram-bot', { secretToken: webhookSecret })(req, res, next);
  });
  app.use((error, _req, res, _next) => {
    const status = error instanceof SyntaxError ? 400 : 500;
    console.error(`${new Date().toISOString()} [http] request_failed`);
    res.status(status).json({ error: status === 400 ? 'invalid_payload' : 'internal_error' });
  });
  return app;
}
function createRuntime({ config = loadConfig(), dependencies = {} } = {}) {
  const services = {
    openai: dependencies.openai || createOpenAIService({ apiKey: config.openaiApiKey, model: config.openaiModel }),
    weather: dependencies.weather || createWeatherService({ apiKey: config.openweatherApiKey }),
    tts: dependencies.tts || createTtsService(),
  };
  const bot = dependencies.bot || createBot({ token: config.telegramBotToken, services });
  return { app: createApp({ bot, webhookSecret: config.telegramWebhookSecret }), config, bot, registerWebhook: () => bot.telegram.setWebhook(`${config.telegramWebhookUrl}/telegram-bot`, { secret_token: config.telegramWebhookSecret, allowed_updates: ['message'] }) };
}
module.exports = { createApp, createRuntime };
