const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  birthDate: String,
  role: { type: String, default: 'user' }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)