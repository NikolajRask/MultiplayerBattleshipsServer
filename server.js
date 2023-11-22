const express = require('express');
const { createServer } = require('node:http');
const { join, parse } = require('node:path');
const { Server } = require('socket.io');
const fs = require('fs')


const app = express();
const server = createServer(app);
const io = new Server(server);
  

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.get('/src/app.js', (req, res) => {
    res.sendFile(join(__dirname, 'app.js'));
  });

  io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        socket.broadcast.emit('chat message', msg);
        console.log('user: '+msg)
    });
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    
    socket.on('requestGame', () => {    
        fs.readFile('./games.json','utf-8', function (err, data) {
            const parsedData = JSON.parse(data)
            const id =  Math.floor(Math.random() * 10000000)
            const d = new Date()
            parsedData.games["game"+ id] = {id: id, board1: '', board2: '', player1: undefined, player2: undefined, ongoing: false, time_played: d, ships1: '', ships2: '', moves1: [], moves2: [], winner: ""}
            fs.writeFile('./games.json', JSON.stringify(parsedData), (err) => {
                if (err) throw err;
            })
            socket.emit('gameId', id);
        })

    })

    socket.on('joinGame', (msg) => {
        fs.readFile('./games.json','utf-8', function (err, data) {
            const parsedData = JSON.parse(data)

            if (parsedData.games["game"+msg] != undefined) {
                socket.emit('gameJoinedID', JSON.stringify(parsedData.games["game"+msg]));
            } else {
                socket.emit('gameJoinedID', "404");
            }
        })
    })
  });

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});