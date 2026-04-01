// Vercel serverless entry point — delegates all /api/* requests to Express
// v2
let app;
try {
  app = require('../server/index.js');
} catch (err) {
  console.error('[STARTUP ERROR]', err.message, err.stack);
  app = (req, res) => res.status(500).json({ startup_error: err.message });
}
module.exports = app;
