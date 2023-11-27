const express = require('express');
const { createServer } = require('http');
const { join, parse } = require('path');
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
    console.log('An user connected');
    socket.on('disconnect', (e) => {
      playersOnline--
      socket.broadcast.emit('playersOnlineUpdate', playersOnline)
      console.log('An user disconnected');
    });

    socket.on('requestPlayerCount', (uuid) => {
      socket.broadcast.emit('playersOnlineUpdate', playersOnline)
    })

    socket.on('createAccount', (details) => {
      if (details.name != undefined) {
        if (details.uuid != undefined) {
          fs.readFile('./users.json', 'utf-8', (err, data) => {
            const parsedData = JSON.parse(data)
            if (parsedData['user'+details.uuid] == undefined) {
              parsedData['user'+details.uuid] = {
                name: details.name,
                uuid: details.uuid,
                elo: 1000,
                win: 0,
                loses: 0,
                hits: 0,
              }
              fs.writeFile('./users.json', JSON.stringify(parsedData), (err) => {
                if (err) throw err;
                socket.emit('userCreated', {
                  name: details.name,
                  uuid: details.uuid,
                  elo: 1000,
                  win: 0,
                  loses: 0,
                  hits: 0,
                })
              })
            } else {
              socket.emit('userAlreadyExist', {})
            }
          })
        }
      }
    })


    socket.on('getUser', (uuid) => {
      fs.readFile('./users.json', 'utf-8', (err, data) => {
        const jsonData = JSON.parse(data);

        if (jsonData['user'+uuid] != undefined) {
          socket.emit('userDetails', jsonData['user'+uuid])
        } else {
          socket.emit('noUserFound', {})
        }
      })
    })
    
    socket.on('requestGame', (info) => {    
        fs.readFile('./games.json','utf-8', function (err, data) {
            const parsedData = JSON.parse(data)
            const id =  Math.floor(Math.random() * 10000000)
            const d = new Date()
            fs.readFile('./users.json','utf-8', function (err2, data2) {
              parsedData.games["game"+ id] = {id: id, player1: info[0], player2: undefined, ongoing: false, time_played: d, ships1: info[1], ships2: [], moves1: [], moves2: [], winner: "", createdBy: info[0], turn: true, sunk1: 0, sunk2: 0, name1: JSON.parse(data2)["user"+info[0]].name, name2: ""}
              fs.writeFile('./games.json', JSON.stringify(parsedData), (err) => {
                  if (err) throw err;
              })
              socket.emit('gameId', id);
            })
        })

    })


    socket.on('joinGame', (msg) => {
        fs.readFile('./games.json','utf-8', function (err, data) {
            const parsedData = JSON.parse(data)
            if (parsedData.games["game"+msg[0]] != undefined) {
              if (parsedData.games["game"+msg[0]].ongoing == true) {
                return;
              }
              if (msg[1] != parsedData.games["game"+msg[0]].createdBy) {
                parsedData.games["game"+msg[0]].player2 = msg[1]
                parsedData.games["game"+msg[0]].ongoing = true;
                parsedData.games["game"+msg[0]].ships2 = msg[2]
                fs.readFile('./users.json','utf-8', function (err2, data2) {
                  parsedData.games["game"+msg[0]].name2 = JSON.parse(data2)["user"+msg[1]].name
                  const rd = (Math.round(Math.random()*1))
                  if (rd == 0) {
                    parsedData.games["game"+msg[0]].turn = parsedData.games["game"+msg[0]].player1
                  }
                  if (rd == 1) {
                    parsedData.games["game"+msg[0]].turn = msg[1]
                  }
                  parsedData.games["game"+msg[0]].ships
                  fs.writeFile("./games.json", JSON.stringify(parsedData), (err) => {if (err) console.error3(err);})
                  socket.emit('gameJoinedID', [msg[0], parsedData.games["game"+msg[0]].turn, parsedData.games["game"+msg[0]].name2, parsedData.games["game"+msg[0]].name1]);
  
                  //change this for a direct message to the user who created the game
                  socket.broadcast.emit('yourGameJoined', [msg[0], parsedData.games["game"+msg[0]].createdBy, parsedData.games["game"+msg[0]].turn, parsedData.games["game"+msg[0]].name1, parsedData.games["game"+msg[0]].name2])
                })
              } else {
                socket.emit('gameJoinedID', '400');
              }
            } else {
                socket.emit('gameJoinedID', "404");
            }
        })
    })

    // This method is only used in the educational version of the game so if the player fails to answer a question his move goes to the other player without making a move.
    socket.on('wasteMove', (info) => {
      fs.readFile('./games.json','utf-8', function (err, data) {
        const jsonData = JSON.parse(data)
        if (jsonData.games["game"+info.game] != undefined) {
          if (jsonData.games["game"+info.game].turn == info.player) {
            socket.emit('yourMovedSkipped', {game: info.game})
            if (info.player == jsonData.games["game"+info.game].player1) {
              jsonData.games["game"+info.game].turn = jsonData.games["game"+info.game].player2
              socket.broadcast.emit('opponentMovedSkipped', {game: info.game, player: jsonData.games["game"+info.game].player2}) 
            }

            if (info.player == jsonData.games["game"+info.game].player2) {
              jsonData.games["game"+info.game].turn = jsonData.games["game"+info.game].player1
              socket.broadcast.emit('opponentMovedSkipped', {game: info.game, player: jsonData.games["game"+info.game].player1}) 
            }
            fs.writeFile('./games.json', JSON.stringify(jsonData), function (err) { if (err) throw err })
          }
        }
      })
    })

    socket.on('makeMove', (info) => {
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

            //update ai memory

            fs.readFile('./memory.json', 'utf-8', function (err, data) {
              const parsedData = JSON.parse(data)

              parsedData.target[parseInt(info[0])-1] = parsedData.target[parseInt(info[0])] + 1;

              fs.writeFile('./memory.json', JSON.stringify(parsedData), (err) => {if (err) throw err})
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
            socket.broadcast.emit('opponentMove2', [info[1],jsonData.games["game"+info[1]].player2,info[0], hit])
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

            //update ai memory

            fs.readFile('./memory.json', 'utf-8', function (err, data) {
              const parsedData = JSON.parse(data)
            
              parsedData.target[parseInt(info[0])-1] = parsedData.target[parseInt(info[0])] + 1;
            
              fs.writeFile('./memory.json', JSON.stringify(parsedData), (err) => {if (err) throw err})
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
            socket.broadcast.emit('opponentMove1', [info[1],jsonData.games["game"+info[1]].player1,info[0],hit])
          }
        })
      }
    })
  });

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});