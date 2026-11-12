const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  requestId: { type: String, required: true, trim: true },
  patientPhone: { type: String, required: true, trim: true },
  doctorId: { type: String, required: true, trim: true },
  slotTime: { type: Date, required: true },
}, { timestamps: true, versionKey: false });

appointmentSchema.index({ requestId: 1 }, { unique: true, name: 'uniq_appointment_request_id' });
appointmentSchema.index({ doctorId: 1, slotTime: 1 }, { unique: true, name: 'uniq_doctor_slot' });

module.exports = mongoose.model('Appointment', appointmentSchema);
