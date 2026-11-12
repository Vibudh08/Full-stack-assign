const Appointment = require('../models/appointment');
const { validateBooking } = require('../validation');

function sameBooking(existing, requested) {
  return existing.patientPhone === requested.patientPhone
    && existing.doctorId === requested.doctorId
    && new Date(existing.slotTime).getTime() === requested.slotTime.getTime();
}

function duplicateKey(error) {
  return error && error.code === 11000;
}

async function bookAppointment(req, res, next) {
  const { errors, value } = validateBooking(req.body);
  if (errors) return res.status(400).json({ success: false, message: 'Invalid booking request.', errors });

  try {
    const appointment = await Appointment.create(value);
    return res.status(201).json({ success: true, message: 'Appointment booked successfully.', appointment });
  } catch (error) {
    if (!duplicateKey(error)) return next(error);

    try {
      // Resolve request id first: a retry is idempotent even if a competing request
      // also targeted the same slot. The unique index serializes concurrent inserts.
      const existing = await Appointment.findOne({ requestId: value.requestId }).lean();
      if (existing) {
        if (!sameBooking(existing, value)) {
          return res.status(409).json({ success: false, message: 'requestId has already been used for a different booking.' });
        }
        return res.status(200).json({ success: true, message: 'This booking request was already processed.', appointment: existing });
      }
      return res.status(409).json({ success: false, message: 'This doctor slot is already booked.' });
    } catch (lookupError) {
      return next(lookupError);
    }
  }
}

module.exports = { bookAppointment };
