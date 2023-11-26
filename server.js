const express = require('express');
const { createServer } = require('node:http');
const { join, parse } = require('node:path');
const { Server } = require('socket.io');
const fs = require('fs')


const app = express();
const server = createServer(app);
const io = new Server(server);
let playersOnline = 0;
  
fs.writeFile("./games.json", JSON.stringify({games: {}}), (err) => {if (err) throw err})

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.get('/src/app.js', (req, res) => {
    res.sendFile(join(__dirname, 'app.js'));
  });

  io.on('connection', (socket) => {
    playersOnline++
    socket.broadcast.emit('playersOnlineUpdate', playersOnline)
    socket.emit('playersOnlineUpdate', playersOnline)
    //console.log(socket.id)
    socket.on('chat message', (msg) => {
        socket.broadcast.emit('chat message', msg);
        console.log('user: '+msg)
    });
    console.log('a user connected');
    socket.on('disconnect', (e) => {
      playersOnline--
      socket.broadcast.emit('playersOnlineUpdate', playersOnline)
      console.log('user disconnected');
    });

    socket.on('requestPlayerCount', (uuid) => {
      socket.broadcast.emit('playersOnlineUpdate', playersOnline)
    })
    
    socket.on('requestGame', (info) => {    
        fs.readFile('./games.json','utf-8', function (err, data) {
            const parsedData = JSON.parse(data)
            const id =  Math.floor(Math.random() * 10000000)
            const d = new Date()
            parsedData.games["game"+ id] = {id: id, player1: info[0], player2: undefined, ongoing: false, time_played: d, ships1: info[1], ships2: [], moves1: [], moves2: [], winner: "", createdBy: info[0], turn: true, sunk1: 0, sunk2: 0}
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
                parsedData.games["game"+msg[0]].ongoing = true;
                parsedData.games["game"+msg[0]].ships2 = msg[2]
                const rd = (Math.round(Math.random()*1))
                if (rd == 0) {
                  parsedData.games["game"+msg[0]].turn = parsedData.games["game"+msg[0]].player1
                }
                if (rd == 1) {
                  parsedData.games["game"+msg[0]].turn = msg[1]
                }
                parsedData.games["game"+msg[0]].ships
                fs.writeFile("./games.json", JSON.stringify(parsedData), (err) => {if (err) console.log(err);})
                socket.emit('gameJoinedID', [msg[0], parsedData.games["game"+msg[0]].turn]);

                //change this for a direct message to the user who created the game
                socket.broadcast.emit('yourGameJoined', [msg[0], parsedData.games["game"+msg[0]].createdBy, parsedData.games["game"+msg[0]].turn])
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
          let jsonData = JSON.parse(data)

          if (jsonData.games["game"+info[1]].turn != info[2]) {
            return;
          }

          if (jsonData.games["game"+info[1]].player1 == info[2]) { // if player 1 makes the move
            //change this for a direct message to the user who created the game
            
            let attackedBefore = false;

            for (let i = 0; i < jsonData.games["game"+info[1]].moves1; i++) {
              if (jsonData.games["game"+info[1]].moves1[i] == parseInt(info[0])) {attackedBefore = true; continue;}
            }

            if (attackedBefore == true) return;

            socket.emit('moveSuccess', {
              move: info[0],
              game: jsonData.games["game"+info[1]].id,
            })

            const opponentShips = jsonData.games["game"+info[1]].ships2
            let hit = false;
            for (let i = 0; i < opponentShips.length; i++) {
              if (opponentShips[i] == info[0]) {
                hit = true; continue
              }
            }
            jsonData.games["game"+info[1]].moves1.push(parseInt(info[0]))
            if (hit == true) {
              jsonData.games["game"+info[1]].sunk1++;
              if (jsonData.games["game"+info[1]].sunk1 >= 20) {
                socket.broadcast.emit('gameEnded', {
                  winner: jsonData.games["game"+info[1]].player1,
                  loser: jsonData.games["game"+info[1]].player2,
                  game: jsonData.games["game"+info[1]].id,
                  move: info[0]
                });
                socket.emit('gameEnded', {
                  winner: jsonData.games["game"+info[1]].player1,
                  loser: jsonData.games["game"+info[1]].player2,
                  game: jsonData.games["game"+info[1]].id,
                  move: info[0]
                })
                jsonData.games["game"+info[1]] = undefined;
                fs.writeFile('./games.json', JSON.stringify(jsonData), (err) => {if (err) throw err})
                return;
              } else {
                socket.emit('hitTrue', [info[1],jsonData.games["game"+info[1]].player1,info[0]])
              }
            } else {
              jsonData.games["game"+info[1]].turn = jsonData.games["game"+info[1]].player2
            }
            fs.writeFile('./games.json', JSON.stringify(jsonData), (err) => {if (err) throw err})
            socket.broadcast.emit('opponentMove2', [info[1],jsonData.games["game"+info[1]].player2,info[0]])
          }
          if (jsonData.games["game"+info[1]].player2 == info[2]) { // if player 2 makes the move
            
            let attackedBefore = false;

            for (let i = 0; i < jsonData.games["game"+info[1]].moves2; i++) {
              if (jsonData.games["game"+info[1]].moves2[i] == parseInt(info[0])) {attackedBefore = true; continue;}
            }

            if (attackedBefore == true) return;

            socket.emit('moveSuccess', {
              move: info[0],
              game: jsonData.games["game"+info[1]].id,
            })

            const opponentShips = jsonData.games["game"+info[1]].ships1
            let hit = false;
            for (let i = 0; i < opponentShips.length; i++) {
              if (opponentShips[i] == info[0]) {

                hit = true; continue
              }
            }
            jsonData.games["game"+info[1]].moves2.push(parseInt(info[0]))
            if (hit == true) {
              jsonData.games["game"+info[1]].sunk2++;
              if (jsonData.games["game"+info[1]].sunk2 >= 20) {
                socket.broadcast.emit('gameEnded', {
                  winner: jsonData.games["game"+info[1]].player2,
                  loser: jsonData.games["game"+info[1]].player1,
                  game: jsonData.games["game"+info[1]].id,
                  move: info[0]
                })
                socket.emit('gameEnded', {
                  winner: jsonData.games["game"+info[1]].player2,
                  loser: jsonData.games["game"+info[1]].player1,
                  game: jsonData.games["game"+info[1]].id,
                  move: info[0]
                })
                jsonData.games["game"+info[1]] = undefined;
                fs.writeFile('./games.json', JSON.stringify(jsonData), (err) => {if (err) throw err})
                return;
              } else {
                socket.emit('hitTrue', [info[1],jsonData.games["game"+info[1]].player2,info[0]])
              }
            }else {
              jsonData.games["game"+info[1]].turn = jsonData.games["game"+info[1]].player1
            }
            fs.writeFile('./games.json', JSON.stringify(jsonData), (err) => {if (err) throw err})
            //change this for a direct message to the user who created the game
            socket.broadcast.emit('opponentMove1', [info[1],jsonData.games["game"+info[1]].player1,info[0]])
          }
        })
      }
    })
  });

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});