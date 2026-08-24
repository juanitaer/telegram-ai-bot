const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');
async function withServer(run) {
  const bot = { webhookCallback: () => (_req, res) => res.status(200).json({ accepted: true }) };
  const server = createApp({ bot, webhookSecret: 'test-secret' }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`); } finally { await new Promise((resolve) => server.close(resolve)); }
}
test('health works without exposing configuration', () => withServer(async (url) => { const response = await fetch(`${url}/health`); assert.equal(response.status, 200); assert.deepEqual(await response.json(), { status: 'ok' }); }));
test('webhook rejects a missing secret', () => withServer(async (url) => { const response = await fetch(`${url}/telegram-bot`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ update_id: 1 }) }); assert.equal(response.status, 401); }));
test('webhook rejects an incorrect secret', () => withServer(async (url) => { const response = await fetch(`${url}/telegram-bot`, { method: 'POST', headers: { 'content-type': 'application/json', 'X-Telegram-Bot-Api-Secret-Token': 'wrong' }, body: JSON.stringify({ update_id: 1 }) }); assert.equal(response.status, 401); }));
test('webhook accepts the correct secret and a valid update', () => withServer(async (url) => { const response = await fetch(`${url}/telegram-bot`, { method: 'POST', headers: { 'content-type': 'application/json', 'X-Telegram-Bot-Api-Secret-Token': 'test-secret' }, body: JSON.stringify({ update_id: 1, message: { message_id: 1 } }) }); assert.equal(response.status, 200); }));
test('webhook rejects an invalid payload', () => withServer(async (url) => { const response = await fetch(`${url}/telegram-bot`, { method: 'POST', headers: { 'content-type': 'application/json', 'X-Telegram-Bot-Api-Secret-Token': 'test-secret' }, body: '{}' }); assert.equal(response.status, 400); }));
