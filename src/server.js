const mongoose = require('mongoose');
const app = require('./app');
const Appointment = require('./models/appointment');
const { mongoUri, port } = require('./config');

async function start() {
  await mongoose.connect(mongoUri);
  // Do not accept requests until MongoDB has built and confirmed both unique indexes.
  await Appointment.init();
  const server = app.listen(port, () => console.log(`Booking API listening on port ${port}`));
  const shutdown = async () => {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

start().catch((error) => {
  console.error('Unable to start booking API:', error.message);
  process.exit(1);
});
