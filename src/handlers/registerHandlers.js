const { getMessageText, validateCity } = require('../utils/validation');
function safeLog(category, operation) { console.error(`${new Date().toISOString()} [${category}] ${operation}`); }
function registerHandlers(bot, { openai, weather, tts }) {
  bot.command('test', async (ctx) => { await ctx.reply('Funciona!!!'); await ctx.replyWithDice(); });
  bot.command('tiempo', async (ctx) => {
    try {
      const city = validateCity(getMessageText(ctx).replace(/^\/tiempo(?:@\w+)?/i, ''));
      const result = await weather.getWeather(city);
      await ctx.replyWithHTML(`El tiempo en <b>${result.city}</b>:\n🌡️ Temperatura: ${result.temperature}°\n🌞 Máxima: ${result.maximum}°\n🥶 Mínima: ${result.minimum}°\n💧 Humedad: ${result.humidity}%`);
      await ctx.replyWithLocation(result.latitude, result.longitude);
    } catch (error) {
      const messages = { EMPTY_CITY: 'Indica una ciudad. Ejemplo: /tiempo Bogotá', CITY_TOO_LONG: 'El nombre de la ciudad es demasiado largo.', CITY_NOT_FOUND: 'No encontré esa ciudad.' };
      await ctx.reply(messages[error.message] || 'No pude consultar el tiempo en este momento.');
    }
  });
  bot.command('historia', async (ctx) => {
    try {
      const characters = getMessageText(ctx).replace(/^\/historia(?:@\w+)?/i, '').trim();
      if (!characters) return await ctx.reply('Indica los personajes de la historia.');
      await ctx.reply(await openai.story(characters));
    } catch { await ctx.reply('No pude crear la historia en este momento. Inténtalo más tarde.'); }
  });
  bot.on('text', async (ctx) => {
    try {
      const response = await openai.answer(getMessageText(ctx));
      await ctx.reply(response);
      try { await ctx.replyWithAudio(tts.createAudioUrl(response)); }
      catch { safeLog('tts', 'delivery_failed'); }
    } catch (error) {
      await ctx.reply(error.message === 'TEXT_TOO_LONG' ? 'El mensaje es demasiado largo.' : 'No pude responder en este momento. Inténtalo más tarde.');
    }
  });
  bot.catch(() => safeLog('telegram', 'handler_failed'));
  return bot;
}
module.exports = { registerHandlers };
