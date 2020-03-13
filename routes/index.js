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
        socket.on('reload', (members) => {
            if(soSession.user) {
                let userCode = soSession.user.code
                let userIndex = members.findIndex(item => {item.code == userCode})
                members[userIndex] = soSession.user
            }
            io.emit('reloadMSG', members)
        })
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
                            OCards[i].sort = i;
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
        socket.on('Diao', (cards, code, panID) => {
            io.emit('DiaoMsg', cards);
            function DiaoC() {
                //找出所有翻出来的牌 WC
                let WCards = cards.filter(item => item.own == 'WC')
                let NCard = cards.find(item => item.own == 'NC' + code)
                let num = NCard.num
                let DiaoNum
                if (num < 10) {
                    DiaoNum = 10 - num;
                } else if (num == 20) {
                    DiaoNum = 21;
                } else if (num == 21) {
                    DiaoNum = 20;
                } else {
                    DiaoNum = num;
                }

                //找出所有能‘对’的牌
                if (WCards.length != 0) {
                    let DiaoCards = WCards.filter(item => item.num == DiaoNum)
                    //判断 有没有 ‘对’的牌
                    if (DiaoCards.length == 0) {
                        console.log('没有牌')
                        WCards = WCards.sort(compare('sort'))
                        NCard.sort = WCards[WCards.length -1].sort + 2
                        NCard.own = 'WC'
                    } else if (DiaoCards.length == 1) {
                        console.log('只有一张牌')
                        let MCnum = cards.filter(item => item.own == 'MC' + code).length
                        let OCard = cards.find(item => item._id == DiaoCards[0]._id)
                        OCard.own = 'MC' + code
                        OCard.sort = MCnum + 2
                        NCard.sort = MCnum + 1
                        NCard.own = 'MC' + code
                    } else if (DiaoCards.length > 1) {
                        // 考虑 当它 为一对三的情况
                        let MCnum = cards.filter(item => item.own == 'MC' + code).length
                        if (DiaoNum >= 10 && DiaoCards.length == 3) {
                            cards.find(item => item._id == DiaoCards[0]._id).own = 'MC' + code
                            cards.find(item => item._id == DiaoCards[1]._id).own = 'MC' + code
                            cards.find(item => item._id == DiaoCards[2]._id).own = 'MC' + code
                            cards.find(item => item._id == DiaoCards[0]._id).sort = MCnum + 2
                            cards.find(item => item._id == DiaoCards[1]._id).sort = MCnum + 3
                            cards.find(item => item._id == DiaoCards[2]._id).sort = MCnum + 4
                        } else {
                            let DiaoAC = DiaoCards.find(item => item.des == 'A' || item.des == 'C')
                            if(!DiaoAC) {
                                DiaoAC = DiaoCards.find(item => item.des == 'B' || item.des == 'D')
                            }
                            let OCard = cards.find(item => item._id == DiaoAC._id)
                            OCard.own = 'MC' + code
                            OCard.sort = MCnum + 2
                        }
                        NCard.sort = MCnum + 1
                        NCard.own = 'MC' + code
                    }
                } else {
                    NCard.sort = 2
                    NCard.own = 'WC'
                }
                io.emit('DiaoMsg', cards);

                // 判断底牌是否为零，决定是否结束且显示结果
                let DCards = cards.filter(item => item.own == 'DC')
                if (DCards.length > 0) {
                    console.log('破有牌:' + DCards.length);
                } else {
                    console.log('破无牌:' + DCards.length);

                    let FC = cards.filter(item => item.own == 'MCF');
                    let LC = cards.filter(item => item.own == 'MCL');
                    let ZC = cards.filter(item => item.own == 'MCZ');
                    // console.log(FC);
                    FC = FC.filter(item => item.des == 'A' || item.des == 'C' || item.des == 'Z')
                    LC = LC.filter(item => item.des == 'A' || item.des == 'C' || item.des == 'Z')
                    ZC = ZC.filter(item => item.des == 'A' || item.des == 'C' || item.des == 'Z')
                    console.log(FC);
                    let Fscore = 0, Zscore = 0, Lscore = 0
                    for (i=0; i<FC.length; i ++) {
                        if(FC[i].num == 1 || FC[i].num == 5 || FC[i].num > 8 || FC[i].num == 21) {
                            Fscore += 10
                        } else if (FC[i].num < 10 && FC[i].num > 1) {
                            Fscore += FC[i].num
                        }
                    }
                    for (i=0; i<ZC.length; i ++) {
                        if(ZC[i].num == 1 || ZC[i].num == 5 || ZC[i].num > 8 || ZC[i].num == 21) {
                            Zscore += 10
                        } else if (ZC[i].num < 10 && ZC[i].num > 1) {
                            Zscore += ZC[i].num
                        }
                    }
                    for (i=0; i<LC.length; i ++) {
                        if(LC[i].num == 1 || LC[i].num == 5 || LC[i].num > 8 || LC[i].num == 21) {
                            Lscore += 10
                        } else if (LC[i].num < 10 && LC[i].num > 1) {
                            Lscore += LC[i].num
                        }
                    }
                    let score = {Z: Zscore - 70,F: Fscore - 70,L: Lscore - 70}
                    Pans.updateOne({_id: panID}, {$set: {ZCards: cards, score: score}}, (err) => {
                        if(!err) {
                            console.log('一盘结束，更新成功');
                        }
                    })
                    setTimeout(() => {io.emit('endMsg', score);}, 1000)
                }
            }
            // DiaoChu()
            setTimeout(DiaoC, 500)//setTimeout end
            function DiaoF() {
                let DCards = cards.filter(item => item.own == 'DC')
                let lastDC = DCards[DCards.length - 1]
                cards.find(item => item._id == lastDC._id).open = true
                cards.find(item => item._id == lastDC._id).own = 'NC' + code
                io.emit('DiaoMsg', cards);
            }
            setTimeout(DiaoF, 700)//setTimeout end
            setTimeout(DiaoC, 1200)//setTimeout end
        })
    });

    return router;
}
