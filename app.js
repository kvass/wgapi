const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sio = require( "socket.io" );
const bodyParser = require('body-parser');

const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
// const flash = require('connect-flash')

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const api = require('./routes/api');

const app = express();
// Socket.io
const io = sio();
app.io = io;
const routes = require('./routes/index')(io);

const sharedsession = require("express-socket.io-session");


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// 自定义跨域中间件
const allowCors = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8095');
    // res.header('Access-Control-Allow-Origin', 'http://www.wagoz.cn');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials','true');
    next();
};
app.use(allowCors);//使用跨域中间件

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session 中间件
const sess = session({
    name: 'wagoz', // 设置 cookie 中保存 session id 的字段名称
    secret: 'wangongzai', // 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
    resave: true, // 强制更新 session
    saveUninitialized: true, // 设置为 false，强制创建一个 session，即使用户未登录
    cookie: {
      maxAge: 1000 * 60 * 60 * 24// 过期时间，过期后 cookie 中的 session id 自动删除
    },
    store: new MongoStore({// 将 session 存储到 mongodb
      url: 'mongodb://localhost:27017/shop'// mongodb 地址
    })
})
app.use(sess)
io.use(sharedsession(sess, {
    autoSave: true
}));
// flash 中间件，用来显示通知
// app.use(flash())
app.use(api);
app.use(routes);

app.use('/', indexRouter);
app.use('/users', usersRouter);
// app.use('/goods', goodsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
