const PHONE_RE = /^\+[1-9]\d{7,14}$/;

function validateBooking(body) {
  const errors = [];
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: ['Request body must be a JSON object.'] };
  }
  for (const field of ['requestId', 'patientPhone', 'doctorId']) {
    if (typeof body[field] !== 'string' || !body[field].trim()) errors.push(`${field} must be a non-empty string.`);
  }
  if (typeof body.patientPhone === 'string' && body.patientPhone.trim() && !PHONE_RE.test(body.patientPhone.trim())) {
    errors.push('patientPhone must be in international format, for example +19876543210.');
  }
  const parsedTime = typeof body.slotTime === 'string' || body.slotTime instanceof Date ? new Date(body.slotTime) : null;
  if (!parsedTime || Number.isNaN(parsedTime.getTime())) errors.push('slotTime must be a valid date.');
  if (errors.length) return { errors };
  return { value: {
    requestId: body.requestId.trim(),
    patientPhone: body.patientPhone.trim(),
    doctorId: body.doctorId.trim(),
    // BSON Date stores an absolute instant; ISO serialization is always UTC.
    slotTime: parsedTime,
  } };
}

module.exports = { validateBooking };
