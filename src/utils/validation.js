const MAX_TEXT_LENGTH = 2000;
const MAX_CITY_LENGTH = 100;
function validateUpdate(update) {
  return Boolean(
    update &&
    typeof update === 'object' &&
    !Array.isArray(update) &&
    Number.isInteger(update.update_id) &&
    update.message &&
    typeof update.message === 'object' &&
    !Array.isArray(update.message),
  );
}
function getMessageText(ctx) {
  const text = ctx?.message?.text;
  if (typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (!trimmed) throw new Error('EMPTY_TEXT');
  if (trimmed.length > MAX_TEXT_LENGTH) throw new Error('TEXT_TOO_LONG');
  return trimmed;
}
function validateCity(value) {
  const city = typeof value === 'string' ? value.trim() : '';
  if (!city) throw new Error('EMPTY_CITY');
  if (city.length > MAX_CITY_LENGTH) throw new Error('CITY_TOO_LONG');
  return city;
}
module.exports = { validateUpdate, getMessageText, validateCity, MAX_TEXT_LENGTH, MAX_CITY_LENGTH };
