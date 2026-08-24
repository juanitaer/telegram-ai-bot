const OpenAI = require('openai');
function normalizeResponse(response) {
  const content = response?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) throw new Error('EMPTY_OPENAI_RESPONSE');
  return content.trim();
}
function createOpenAIService({ apiKey, model, client } = {}) {
  const openai = client || new OpenAI({ apiKey, timeout: 15000, maxRetries: 1 });
  async function complete(messages) {
    try { return normalizeResponse(await openai.chat.completions.create({ model, messages })); }
    catch { throw new Error('OPENAI_UNAVAILABLE'); }
  }
  return {
    answer: (question) => complete([{ role: 'system', content: 'Eres un bot de Telegram útil y conciso. Responde en español con claridad.' }, { role: 'user', content: question }]),
    story: (characters) => complete([{ role: 'system', content: 'Cuenta una historia breve en español, en tres párrafos, y termina con una moraleja.' }, { role: 'user', content: `Personajes: ${characters}` }]),
  };
}
module.exports = { createOpenAIService, normalizeResponse };
