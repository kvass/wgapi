const mongoose = require('./db');
const Schema = mongoose.Schema;

const panSchema = new Schema({
     users: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
    OCards: [{
          _id: String,
          des: String,
        title: String,
          num: Number,
         open: Boolean,
         name: String,
          own: String
    }],
     state: String,
     score: [],
      date: {type: Date, default: Date.now}
})
module.exports = mongoose.model('pan',panSchema)
