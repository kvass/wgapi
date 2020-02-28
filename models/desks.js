const mongoose = require('./db');
const Schema = mongoose.Schema;

const desksSchema = new Schema({
    title: String,
    users: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
    state: String,
    pans: [{ type: Schema.Types.ObjectId, ref: 'Pans' }],
    date: {type: Date, default: Date.now}
})

module.exports = mongoose.model('desks',desksSchema)
