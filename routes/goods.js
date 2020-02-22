var express = require('express');//加载模块
var router = express.Router();//引用router
//引用数据模块
var Goods = require('../models/goods')
//连接数据库
mongoose.connect('mongodb://localhost:27017/shop', {useNewUrlParser: true})
//下面就进行判断，（连接成功，连接失败，连接断开）
mongoose.connection.on('connected', function () {
  console.log("连接成功");
})
mongoose.connection.on('error', function () {
  console.log("连接失败");
})
mongoose.connection.on('disconnected', function () {
  console.log("断开连接");
})

//路由获取
router.get('/', function (req, res, next) {
  //查询mongoDB的goods数据
  Goods.find({}, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      })
    } else {
      res.json(doc)
    }
  })
});
router.post('/', (req, res) => {
    res.json(req.body);
    let newName = req.body;
    newName.save((err) => {
        if (err) {
            res.send({'status': 1002, 'message': '注册失败！', 'data': err});
        } else {
            res.send({'status': 1000, 'message': '注册成功!'});
        }
    });
})
module.exports = router;//暴露路由
