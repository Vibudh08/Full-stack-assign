const express = require('express');
const appointmentRoutes = require('./routes/appointments');

const app = express();
app.use(express.json({ limit: '16kb' }));
app.use('/api/appointments', appointmentRoutes);
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ success: false, message: 'Request body must contain valid JSON.' });
  }
  console.error(error);
  return res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
});

module.exports = app;
