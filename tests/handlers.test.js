const test = require('node:test');
const assert = require('node:assert/strict');
const { registerHandlers } = require('../src/handlers/registerHandlers');
function setup(overrides = {}) {
  const commands = new Map(); let textHandler;
  const bot = { command: (name, fn) => commands.set(name, fn), on: (_type, fn) => { textHandler = fn; }, catch: () => {} };
  const services = { openai: { answer: async () => 'respuesta', story: async () => 'historia demo' }, weather: { getWeather: async () => ({ city: 'Bogotá', temperature: 20, maximum: 22, minimum: 15, humidity: 60, latitude: 1, longitude: 2 }) }, tts: { createAudioUrl: () => 'https://example.com/audio.mp3' }, ...overrides };
  registerHandlers(bot, services); return { commands, textHandler };
}
function context(text) {
  const replies = [];
  return { ctx: { message: { text }, reply: async (value) => replies.push(['text', value]), replyWithDice: async () => replies.push(['dice']), replyWithHTML: async (value) => replies.push(['html', value]), replyWithLocation: async (...value) => replies.push(['location', ...value]), replyWithAudio: async (value) => replies.push(['audio', value]) }, replies };
}
test('/tiempo requires a city', async () => { const { commands } = setup(); const { ctx, replies } = context('/tiempo'); await commands.get('tiempo')(ctx); assert.match(replies[0][1], /Indica una ciudad/); });
test('/historia returns text without requesting a photo', async () => { const { commands } = setup(); const { ctx, replies } = context('/historia Aurora y Brío'); await commands.get('historia')(ctx); assert.deepEqual(replies, [['text', 'historia demo']]); });
test('TTS failure preserves the text response', async () => { const { textHandler } = setup({ tts: { createAudioUrl: () => { throw new Error('fail'); } } }); const { ctx, replies } = context('hola'); await textHandler(ctx); assert.deepEqual(replies, [['text', 'respuesta']]); });
