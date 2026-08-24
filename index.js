const { createRuntime } = require('./src/app');

async function start() {
  const runtime = createRuntime();
  const server = runtime.app.listen(runtime.config.port, () => {
    console.info(`${new Date().toISOString()} [server] started`);
  });
  try {
    await runtime.registerWebhook();
    console.info(`${new Date().toISOString()} [webhook] registered`);
  } catch {
    console.error(`${new Date().toISOString()} [webhook] registration_failed`);
    server.close();
    process.exitCode = 1;
  }
}

if (require.main === module) {
  start().catch(() => {
    console.error(`${new Date().toISOString()} [server] startup_failed`);
    process.exitCode = 1;
  });
}

module.exports = { start };
