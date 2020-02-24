const mongoose =require('mongoose')//加载模块
const Schema = mongoose.Schema;

const userSchema = new Schema({
  'code': String,
  'state': Boolean,
  'name': String,
  date: { type: Date, default: Date.now }
})

module.exports = mongoose.model('users',userSchema)
