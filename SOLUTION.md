# Full-Stack Developer Technical Assessment

## Problem 1: Doctor slot booking

The duplicate records occurred because retries were treated as independent inserts, while a check-then-insert availability flow could let simultaneous patients both observe a free slot. The API uses a unique `requestId` index to make retries idempotent and a compound unique `{ doctorId, slotTime }` index to make MongoDB arbitrate competing bookings atomically; duplicate-key errors are resolved into either the original matching appointment or a clear HTTP 409 response.

### Implementation decisions

- Express handles the HTTP endpoint and Mongoose defines the MongoDB appointment model.
- `requestId` and `{ doctorId, slotTime }` have named MongoDB unique indexes. The server waits for `Appointment.init()` before listening, so index build errors prevent startup.
- Booking inserts are attempted directly; correctness does not depend on a prior availability read. A duplicate-key response first looks up the `requestId`: matching details return HTTP 200, mismatched details return 409, and an occupied slot with another request id returns 409.
- Phone numbers are validated in international E.164 form. `slotTime` must parse to a valid date and is stored as a BSON Date (an absolute instant); responses serialize it in UTC.
- Invalid requests return 400, successful inserts 201, repeated matching requests 200, conflicts 409, and unexpected server errors 500 without exposing database details.

### Run locally

1. Install Node.js 20 or later and MongoDB 6 or later; start MongoDB.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` if needed.
3. Run `npm install`, then `npm start`.
4. Run integration tests against a real MongoDB with `npm test`. Tests default to `mongodb://127.0.0.1:27017/doctor_booking_test`; set `MONGODB_TEST_URI` to use another test database.

Example request:

```http
POST /api/appointments/book
Content-Type: application/json
```

```json
{
  "requestId": "req_abc123",
  "patientPhone": "+19876543210",
  "doctorId": "doc_101",
  "slotTime": "2026-10-25T10:00:00Z"
}
```

New booking response (201):

```json
{
  "success": true,
  "message": "Appointment booked successfully.",
  "appointment": {
    "requestId": "req_abc123",
    "patientPhone": "+19876543210",
    "doctorId": "doc_101",
    "slotTime": "2026-10-25T10:00:00.000Z"
  }
}
```

## Problems 2 and 3

The provided assessment document contains no descriptions or acceptance criteria for Problems 2 or 3, and none were found elsewhere in the workspace. They have not been invented or implemented; provide their original requirements to complete those portions.

## Verification

Integration coverage is provided in `test/booking.test.js` for success, matching retries, simultaneous identical requests, conflicting reuse of a request id, simultaneous competing slot requests, distinct doctors and times, invalid payloads, record counts, and actual MongoDB index definitions. Verification completed against the installed local MongoDB 7.0 server: `npm test` passed (1 integration test, 0 failures), and a live `npm start` server returned HTTP 201 for an actual booking request.
