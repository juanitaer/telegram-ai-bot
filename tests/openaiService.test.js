const test = require('node:test');
const assert = require('node:assert/strict');
const { createOpenAIService, normalizeResponse } = require('../src/services/openaiService');
test('normalizes an OpenAI response', () => assert.equal(normalizeResponse({ choices: [{ message: { content: ' hola ' } }] }), 'hola'));
test('normalizes OpenAI provider failures', async () => {
  const client = { chat: { completions: { create: async () => { throw new Error('private provider detail'); } } } };
  await assert.rejects(createOpenAIService({ model: 'test', client }).answer('hola'), /OPENAI_UNAVAILABLE/);
});
