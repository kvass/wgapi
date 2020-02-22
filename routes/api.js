const express = require('express');
const router = express.Router();//这里用到了express的路由级中间件
const Goods = require('../models/goods');
const Desks = require('../models/desks');
const mongoose = require('mongoose');

//路由获取
router.get('/goods', function (req, res, next) {
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
router.get('/desk/cut', function (req, res) {
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
router.post('/desk/cut', function (req, res) {
    // Desks.insert({title: '此处明白'});
    // res.json(req.body);
    let AAA = req.body;
    Desks.updateOne({_id: mongoose.Types.ObjectId(AAA[0]), 'OCards._id': AAA[1]}, {$set: {'OCards.$.own': req.body[2]}}, (err) => {
        if (err) {
            res.send({'status': 1002, 'message': '修改失败', 'data': err, 'AAA': AAA[0]});
        } else {
            res.send({'status': 1000, 'message': '修改成功!', 'AAA': AAA});
        }
    })
});
router.get('/desk', function (req, res, next) {
    Desks.find({}, function (err, doc) {
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
router.post('/desk', (req, res) => {
    // res.json(req.body);
    // Desks.insert({title: '共花边缘精度呆在'});
    // let desk = new Desks({
    //     title: '中你继续人中国粮棉原种场',
    //     member: ['周大笨', 'database', 'NoSQL'],
    //     OCards: req.body
    // });
    // desk.save((err, result) => {
    //     if (err) {
    //         res.send({'status': 1002, 'message': '注册失败！', 'data': err});
    //     } else {
    //         // res.json(result);
    //         res.send({'status': 1000, 'message': '注册成功!', 'AA': result});
    //     }
    // });
    // Desks.insertOne({
    //     title: 'MongoDB 教程',
    //     member: ['mongodb', 'database', 'NoSQL'],
    // })
    Desks.insertMany({OCards: req.body, title: '共花边缘精度呆在'},(err, result) => {
        if (err) {
            res.send({'status': 1002, 'message': '添加失败', 'data': err});
        } else {
            res.json(result);
            // res.send({'status': 1000, 'message': '注册成功!', 'AA': result});
        }
    });
    // Desks.update({}, {$set: {OCards: req.body, title: '第一桌'}}, (err) => {
    //     if(!err){
    //         console.log('删除成功---');
    //     }
    // });
    // Desks.create({title:"故国不堪回首月明中", member: ['伊妹儿','东冬']})
    // Desks.update(req.body);
    // Desks.remove({title:'真的很有看头哟'},(err) => {
    //     if(!err){
    //         console.log('删除成功---');
    //     }
    // })
    console.log("可以了!");
})

//注册账号的接口
//  /api为代理的服务
router.post('/api/user/register',(req,res) => {
    //这里的req.body 其实使用了body-parser中间件 用来对前端发送来的数据进行解析
    //查询数据库中name= req.body.name 的数据
    models.Login.find({name: req.body.name},(err,data) => {
        if(err){
            res.send({'status': 1002, 'message': '查询失败', 'data': err});
        }else{
            console.log('查询成功'+data)
            //data为返回的数据库中的有相同name的集合
            if(data.length > 0){
                res.send({'status': 1001, 'message': '该用户名已经注册！'});
            }else{
                let newName = new models.Login({
                    name : req.body.name,
                    password : req.body.password
                });
                //newName.save 往数据库中插入数据
                newName.save((err,data) => {
                    if (err) {
                        res.send({'status': 1002, 'message': '注册失败！', 'data': err});
                    } else {
                        res.send({'status': 1000, 'message': '注册成功!'});
                    }
                });
            }
        }
    })
})
//登录接口
router.post('/api/user/login',(req,res) => {
    models.Login.find({name: req.body.name, password: req.body.password},(err,data) => {
        if (err) {
            // res.send(err);
            res.send({'status': 1002, 'message': '查询数据库失败!', 'data': err});
        } else {
            console.log(data)
            if (data.length > 0) {
                res.send({'status': 1000, 'message': '登录成功!', 'data': data});
            } else {
                res.send({'status': 1001, 'message': '登录失败，该用户没有注册!', 'data': err});
            }
        }
    })
})
//获取所有账号的接口
router.get('/api/user/all',(req,res) => {
    // 通过模型去查找数据库
    models.Login.find((err,data) => {
        if (err) {
            res.send(err);
        } else {
            res.send(data);
        }
    });
});
//删除账号接口
router.post('/api/user/delete',(req,res) => {
    // 通过模型去查找数据库
    models.Login.remove({name: req.body.name},(err,data) => {
        // if (err) {
        //     res.send(err);
        // } else {
        //   res.send({'status': 1003, 'message': '删除成功!', 'data': data});
        // }
    });
    models.Login.find((err,data) => {
        if (err) {
            console.log(err)
        } else {
            res.send({'status': 1000, 'message': '更新成功！', 'data': data});
        }
    });
});

module.exports = router;
