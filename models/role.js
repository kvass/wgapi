const mongoose = require('./db');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  code: String,
  state: Boolean,
  name: String,
  sid: String,
  sort: Number,
  playing: Boolean,
  user: { type: Schema.Types.ObjectId, ref: 'users' },
  date: { type: Date, default: Date.now }
})

module.exports = mongoose.model('roles', roleSchema)
