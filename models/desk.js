const mongoose = require('./db');
const Schema = mongoose.Schema;

const desksSchema = new Schema({
    title: String,
    roles: [{ type: Schema.Types.ObjectId, ref: 'roles' }],
    state: String,
    sort: String,
    pans: [{ type: Schema.Types.ObjectId, ref: 'pans' }],
    date: {type: Date, default: Date.now}
})

module.exports = mongoose.model('desks',desksSchema)
