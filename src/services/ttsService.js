function createTtsService() {
  return { createAudioUrl(text) {
    if (typeof text !== 'string' || !text.trim()) throw new Error('TTS_UNAVAILABLE');
    const query = new URLSearchParams({ ie: 'UTF-8', q: text.slice(0, 200), tl: 'es', client: 'tw-ob' });
    return `https://translate.google.com/translate_tts?${query}`;
  } };
}
module.exports = { createTtsService };
