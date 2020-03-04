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
        console.log('socket 破成功')
        let soSession = socket.handshake.session;
        //数组随机函数
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
        //根据属性值排序
        const compare = (property) => {
            return (a,b) => {
                var value1 = a[property];
                var value2 = b[property];
                return value1 - value2;
            }
        }

        socket.on('chooseRole', function(members, mindex, oindex){
            //获取角色激活数
            let userChNum = members.filter(item => item.state == true).length;
            if (userChNum < 4) {
                if (oindex) {
                    members[oindex].sort = ''
                    members[oindex].sid = ''
                    members[mindex].sort = userChNum
                    members[mindex].sid = socket.id
                } else {
                    members[mindex].sort = userChNum
                    members[mindex].sid = socket.id
                }
                soSession.user = members[mindex]
                // 把激活角色状态广播
                io.emit('roleMSG', members)
                // socket.emit('YesiamMSG2', soSession.user.sid)
                // io.to(socket.id).emit('DCutMsg2', soSession.user.name + '在这里安心的测试下了')

                //当所有角色都激活了，执行下面函数
                if (userChNum == 3) {
                    // 把 角色（用户） 存进库里
                    Users.insertMany(members, (err, result) => {
                        if (err) {
                            console.log("保存用户失败" + err);
                        } else {
                            let users = result
                            let usersID = (users).map(item => item._id)
                            Desks.insertMany({users: usersID}, (err, result) => {
                                if (err) {
                                    console.log("保存 desk 失败" + err);
                                } else {
                                    let panUsers = users.sort(compare('sort'))
                                    io.emit('DStartMsg', false, result[0]._id, panUsers)
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
                        } //if end
                    })//goods.find end
                    //打乱原牌，生成乱牌传给 OCards,为创建 盘 做准备
                }//当所有用户都激活了，执行下面函数 end
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
                            let panUsers = users.sort(compare('sort'))
                            io.emit('createDeskMsg', false, result[0]._id, panUsers)
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
        socket.on('DCut', (DeskID, users, OCards) => {
            let usersID = (users).map(item => item._id)
            Pans.insertMany({users: usersID, OCards: OCards}, async (err, result) => {
                if (err) {
                    socket.emit('DCutMsg', "破建盘出错：" + err);
                } else {
                    // socket.emit('新盘ID', );
                    let Pan = result[0]
                    let panID = Pan._id
                    Desks.updateOne({'_id': DeskID}, {$push: {pans: panID}}, (err, result) => {
                        if (err) {
                            socket.emit('DCutMsg', "破放入desk出错：" + err);
                        } else {
                            io.emit('DCutMsg', panID, OCards, users, result._id)
                        } //3 if end
                    })//Desks.updateOne end
                    // 发牌

                    // Pans.findOne({_id: panID}, (err, doc) => {
                    //     if (err) {
                    //         console.log('查不到盘')
                    //     } else {
                    //         console.log(doc)
                    //     } //1 if end
                    // })

                    //发牌 start
                    let panUsers = users.sort(compare('sort'))
                    let userSIDs = (panUsers).map(item => item.sid)
                    let userCodes = (panUsers).map(item => item.code)
                    let usersID = (result).map(item => item._id)
                    let i = OCards.length //获得 ocards 的个数   54
                    let ol = i - 1 //存起来作为参考  53
                    FPJSQ = setInterval(() => {
                        i --
                        if (i >= 30) {
                            if (i == ol) {
                                OCards[i].own = userCodes[0];
                                console.log(OCards[i].own)
                            } else if (i == ol - 1) {
                                OCards[i].own = userCodes[1];
                            } else if (i == ol - 2) {
                                OCards[i].own = userCodes[2];
                                ol = i - 1
                            }
                        } else if (i < 30 && i > 23) {
                            OCards[i].open = true;
                            OCards[i].own = 'WC';
                        }  else {
                            clearInterval(FPJSQ);
                            FPJSQ = null;
                        }
                        io.emit('dealCardMsg', OCards)
                        if(soSession.user) {

                        }
                    }, 50)// 发牌 end
                } //建盘callback end
            }) //pans.insertMany end
        }),//createPan end
        socket.on('Diao', (cards, fn) => {
            io.emit('DiaoMsg', cards);
            console.log('出牌了')
            fn('非常大条')
        }),
        socket.on('Diao2', (cards) => {
            io.emit('DiaoMsg2', cards);
            console.log('翻出牌了')
        })
    });

    return router;
}
