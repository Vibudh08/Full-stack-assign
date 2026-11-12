const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const app = require('../src/app');
const Appointment = require('../src/models/appointment');

const uri = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/doctor_booking_test';
let server;
let baseUrl;

before(async () => {
  await mongoose.connect(uri);
  await Appointment.init();
  await Appointment.deleteMany({});
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
});

async function book(payload) {
  const response = await fetch(`${baseUrl}/api/appointments/book`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload),
  });
  return { status: response.status, body: await response.json() };
}

function payload(overrides = {}) {
  return { requestId: `req_${Math.random().toString(36).slice(2)}`, patientPhone: '+19876543210', doctorId: 'doc_101', slotTime: '2026-10-25T10:00:00Z', ...overrides };
}

test('booking API enforces idempotency, slot uniqueness, validation, and MongoDB indexes', async () => {
  const firstRequest = payload({ requestId: 'first' });
  const first = await book(firstRequest);
  assert.equal(first.status, 201);
  assert.equal(first.body.success, true);
  assert.equal(new Date(first.body.appointment.slotTime).toISOString(), new Date(firstRequest.slotTime).toISOString());

  const retry = await book(firstRequest);
  assert.equal(retry.status, 200);
  assert.equal(retry.body.appointment._id, first.body.appointment._id);

  const changedReuse = await book({ ...firstRequest, patientPhone: '+447700900123' });
  assert.equal(changedReuse.status, 409);

  const racedRequest = payload({ requestId: 'same-concurrent', doctorId: 'doc_same_request', slotTime: '2026-10-26T10:00:00Z' });
  const sameRequestRace = await Promise.all(Array.from({ length: 8 }, () => book(racedRequest)));
  assert.equal(sameRequestRace.filter((result) => result.status === 201).length, 1);
  assert.equal(sameRequestRace.filter((result) => result.status === 200).length, 7);
  assert.equal(await Appointment.countDocuments({ requestId: racedRequest.requestId }), 1);

  const contested = payload({ requestId: 'contested-a', doctorId: 'doc_race', slotTime: '2026-11-01T10:00:00Z' });
  const contestedRace = await Promise.all([
    book(contested),
    book({ ...contested, requestId: 'contested-b', patientPhone: '+447700900123' }),
  ]);
  assert.deepEqual(contestedRace.map((result) => result.status).sort(), [201, 409]);
  assert.equal(await Appointment.countDocuments({ doctorId: 'doc_race', slotTime: new Date(contested.slotTime) }), 1);

  assert.equal((await book(payload({ requestId: 'other-doctor', doctorId: 'doc_other' }))).status, 201);
  assert.equal((await book(payload({ requestId: 'other-slot', doctorId: 'doc_101', slotTime: '2026-10-25T11:00:00Z' }))).status, 201);

  for (const invalid of [
    {}, { ...payload(), requestId: '' }, { ...payload(), patientPhone: 'not-a-phone' },
    { ...payload(), slotTime: 'not-a-date' }, { ...payload(), slotTime: null },
  ]) assert.equal((await book(invalid)).status, 400);

  const indexes = await Appointment.collection.indexes();
  assert.ok(indexes.some((index) => index.name === 'uniq_appointment_request_id' && index.unique));
  assert.ok(indexes.some((index) => index.name === 'uniq_doctor_slot' && index.unique));
});
