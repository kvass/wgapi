var mongoose =require('mongoose')//加载模块
var Schema = mongoose.Schema;
//定义Schema,描述该集合有哪些字段，哪些类型，只有定义过的才能被放入数据库
var produtSchema = new Schema({
  'des': String,
  'title': String,
  'num': Number,
  'open': Boolean,
  'name': String
})

module.exports =mongoose.model('goods',produtSchema)
//goods 是我们的匹配的数据库内部创建的collection名，但它不用一模一样，因为mongoose内部创建的collection
//时将我们传递的数据库名小写化，同时如果小写化的名称后面没有字母s，
// 会针对我们刚建的collection，命名加s
