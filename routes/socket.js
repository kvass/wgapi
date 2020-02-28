const express = require('express');
const socketIo = require('socket.io');
const Goods = require('../models/goods');
const Desks = require('../models/desks');
const mongoose = require('mongoose');
 
let io = {};  
// 获取io
io.getSocketio = function(server){ // http(s) server
    let io = socketIo.listen(server);
    io.sockets.on('connection', (socket) => {
        console.log('socket连接成功');
        socket.on('login',function(data){ //接收连接中的login事件
            console.log(data);
            // io.emit('TT','你发过来的数据是：'+ data)
            io.sockets.emit('TT', '你发过来的数据是：'+ data, socket.id);
        }),
        socket.on('Yesiam',function(members, mindex){
            if(members[mindex].id == '') {
                let ids = members.filter((item) => {return item.id == socket.id})
                if(ids.length < 1) {
                    members[mindex].id = socket.id
                    members[mindex].state = true
                    console.log(members[mindex].id)
                }
            }
            io.sockets.emit('YesiamMSG', members);
            io.emit('YesiamMSG2', 'true')
        })
    })
};

module.exports = io;
