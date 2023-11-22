const express = require('express');
const { createServer } = require('node:http');
const { join, parse } = require('node:path');
const { Server } = require('socket.io');
const fs = require('fs')


const app = express();
const server = createServer(app);
const io = new Server(server);
  
fs.writeFile("./games.json", JSON.stringify({games: {}}), (err) => {if (err) throw err})

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
    
    socket.on('requestGame', (uuid) => {    
        fs.readFile('./games.json','utf-8', function (err, data) {
            const parsedData = JSON.parse(data)
            const id =  Math.floor(Math.random() * 10000000)
            const d = new Date()
            parsedData.games["game"+ id] = {id: id, board1: '', board2: '', player1: uuid, player2: undefined, ongoing: false, time_played: d, ships1: '', ships2: '', moves1: [], moves2: [], winner: "", createdBy: uuid, turn: true}
            fs.writeFile('./games.json', JSON.stringify(parsedData), (err) => {
                if (err) throw err;
            })
            socket.emit('gameId', id);
        })

    })

    socket.on('joinGame', (msg) => {
        fs.readFile('./games.json','utf-8', function (err, data) {
            const parsedData = JSON.parse(data)
            if (parsedData.games["game"+msg[0]] != undefined) {
              if (msg[1] != parsedData.games["game"+msg[0]].createdBy) {
                parsedData.games["game"+msg[0]].player2 = msg[1]
                fs.writeFile("./games.json", JSON.stringify(parsedData), (err) => {if (err) console.log(err);})
                socket.emit('gameJoinedID', parsedData.games["game"+msg[0]]);

                //change this for a direct message to the user who created the game
                socket.broadcast.emit('yourGameJoined', parsedData.games["game"+msg[0]])
              } else {
                socket.emit('gameJoinedID', '400');
              }
            } else {
                socket.emit('gameJoinedID', "404");
            }
        })
    })

    socket.on('makeMove', (info) => {
      console.log(info)
      if (info[1] != null) {
        fs.readFile('./games.json','utf-8', function (err, data) {
          if (info[1].player1 == info[2]) {
            //change this for a direct message to the user who created the game
            socket.broadcast.emit('opponentMove2', [info[1],info[0]])
          }
          if (info[1].player2 == info[2]) {
            //change this for a direct message to the user who created the game
            socket.broadcast.emit('opponentMove1', [info[1],info[0]])
          }
        })
      }
    })
  });

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});