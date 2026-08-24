const dotenv = require('dotenv');
const REQUIRED = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_WEBHOOK_URL', 'TELEGRAM_WEBHOOK_SECRET', 'OPENAI_API_KEY', 'OPENAI_MODEL', 'OPENWEATHER_API_KEY'];

function loadConfig(source = process.env, { loadDotenv = true } = {}) {
  if (loadDotenv) dotenv.config();
  for (const name of REQUIRED) {
    if (!source[name] || !String(source[name]).trim()) throw new Error(`Missing required environment variable: ${name}`);
  }
  const port = Number(source.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid environment variable: PORT');
  return Object.freeze({
    telegramBotToken: source.TELEGRAM_BOT_TOKEN,
    telegramWebhookUrl: source.TELEGRAM_WEBHOOK_URL.replace(/\/$/, ''),
    telegramWebhookSecret: source.TELEGRAM_WEBHOOK_SECRET,
    openaiApiKey: source.OPENAI_API_KEY,
    openaiModel: source.OPENAI_MODEL,
    openweatherApiKey: source.OPENWEATHER_API_KEY,
    port,
  });
}
module.exports = { loadConfig, REQUIRED };
