const mongoose = require('./db');
const Schema = mongoose.Schema;

const panSchema = new Schema({
       roles: [{ type: Schema.Types.ObjectId, ref: 'roles' }],
     OCards: [{
           _id: String,
           des: String,
         title: String,
           num: Number,
          open: Boolean,
          name: String,
           own: String,
          sort: Number
     }],
     ZCards: [{
           _id: String,
           des: String,
         title: String,
           num: Number,
          open: Boolean,
          name: String,
           own: String,
          sort: Number
     }],
     state: String,
     score: [],
      date: {type: Date, default: Date.now}
})
module.exports = mongoose.model('pan',panSchema)
