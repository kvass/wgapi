const express = require('express');
const mongoose = require('mongoose');
const Users = require('../models/user');
const Desks = require('../models/desks');
const Pans = require('../models/pan');
const Goods = require('../models/goods');

module.exports = function(io) {
    const app = require('express');
    const router = app.Router();

    io.on('connection', function(socket) {
        let soSession = socket.handshake.session;
        const shuffle = (arr) => {
            var i, j, temp;
            for (i = arr.length - 1; i > 0; i--) {
                j = Math.floor(Math.random() * (i + 1));
                temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
            return arr;
        }

        console.log('socket连接成功');
        console.log(socket.id)

        socket.on('chooseRole',function(members, mindex){
            members[mindex].sid = socket.id
            let userChNum = members.filter(item => item.state == true).length;
            if (userChNum < 3) {
                members[mindex].sort = userChNum
                soSession.user = members[mindex]
                io.emit('roleMSG', members)
                socket.emit('YesiamMSG2', soSession.user.sid)
                io.to(socket.id).emit('DCutMsg2', soSession.user.name + '在这里安心的测试下了')
            }
        }),
        // 创建 1\用户 2\桌
        socket.on('createDesk', (members) => {
            // 把 用户 存进库里
            Users.insertMany(members, (err, result) => {
                if (err) {
                    socket.emit('createDeskMsg', "添加失败" + err);
                } else {
                    let usersID = (result).map(item => item._id)
                    Desks.insertMany({users: usersID}, (err, result) => {
                        if (err) {
                            socket.emit('createDeskMsg', "添加desk失败" + err);
                        } else {
                            io.emit('createDeskMsg', false, result[0]._id, usersID)
                        }
                    })
                }
            }); //Users end
            Goods.find({}, function (err, doc) {
                if (err) {
                    socket.emit('createPanMsg', "破查出错信息：" + err);
                } else {
                    let OCards = shuffle(doc);
                    io.emit('sendCards', OCards)
                } //1 if end
            })//goods.find end
        }), //createDesk end
        // 1\查询 GOODS 里的数据 2\放入 OCards 并创建 盘 3\把 盘 放入 桌
        socket.on('DCut', (DeskID, usersID, OCards) => {
            // socket.emit('createPanMsg', "查到了：" + OCards);


            Pans.insertMany({users: usersID, OCards: OCards}, (err, result) => {
                if (err) {
                    socket.emit('DCutMsg', "破建盘出错：" + err);
                } else {
                    // socket.emit('新盘ID', );
                    let panID = result[0]._id
                    Desks.updateOne({'_id': DeskID}, {$push: {pans: result[0]._id}}, (err, result) => {
                        if (err) {
                            socket.emit('DCutMsg', "破放入desk出错：" + err);
                        } else {
                            io.emit('DCutMsg', panID, OCards, usersID, socket.id)
                        } //3 if end
                    })//Desks.updateOne end
                } //2 if end
            }) //pans.insertMany end

            // 发牌
            let cl = OCards.length - 1 //获得 ocards 的个数
            let ol = ol //存起来作为参考
            FPJSQ = setInterval(() => {
                cl --
                if (cl == ol) {
                    // OCards[cl].own = true;
                    // this.MMcards.unshift(OCards.poOCp());
                    if (soSession.user) {
                        console.log(soSession.user)
                        io.to(socket.id).emit('DCutMsg2', soSession.user.name + '：在这里安心的测试下了')
                    } else {console.log('没有session')}
                } else if (cl == ol - 1){
                    if (soSession.user) {
                        console.log(soSession.user)
                        io.to(socket.id).emit('DCutMsg2', soSession.user.name + '：1 在这里安心的测试下了')
                    } else {console.log('没有session')}
                } else if (cl == ol - 2) {
                    ol = cl - 1
                    if (soSession.user) {
                        console.log(soSession.user)
                        io.to(socket.id).emit('DCutMsg2', soSession.user.name + '：2 在这里安心的测试下了')
                    } else {console.log('没有session')}
                } else {
                    clearInterval(FPJSQ);
                    this.FPJSQ = null;
                }
            }, 50)// 发牌 end

        })//createPan end
        // socket.on('DCut', msg => {
        //     socket.emit('DCutMsg', "后台" + msg);
        // })
    });

    return router;
}
