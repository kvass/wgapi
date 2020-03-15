const mongoose = require('./db');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  code: String,
  state: Boolean,
  name: String,
  sid: String,
  sort: Number,
  playing: Boolean,
  date: { type: Date, default: Date.now }
})

module.exports = mongoose.model('users',userSchema)
