const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shop');

mongoose.connection.on('connected', function () {
    console.log("恭喜破棋子--连接成功");
})
mongoose.connection.on('error', function () {
    console.log("哭吧破棋子，连接失败");
})
mongoose.connection.on('disconnected', function () {
    console.log("哈哈哈，破棋子。断开连接");
})


module.exports = mongoose;
