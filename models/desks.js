const mongoose = require('./db');
const Users = require('../models/user');

const Schema = mongoose.Schema;
//定义Schema,描述该集合有哪些字段，哪些类型，只有定义过的才能被放入数据库
const desksSchema = new Schema({
    'OCards': [{
        '_id': String,
        'des': String,
        'title': String,
        'num': Number,
        'open': Boolean,
        'name': String,
        'own' : [{ type: Schema.Types.ObjectId, ref: 'Users' }]
    }]
})

module.exports = mongoose.model('desks',desksSchema)
