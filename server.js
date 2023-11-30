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

app.get('/icon.png', (req, res) => {
  res.sendFile(join(__dirname, 'icon.png'));
})

app.get('/index.css', (req, res) => {
  res.sendFile(join(__dirname, 'css/index.css'));
})

app.get('/chat.css', (req, res) => {
  res.sendFile(join(__dirname, 'css/chat.css'));
})

app.get('/modal.css', (req, res) => {
  res.sendFile(join(__dirname, 'css/modal.css'));
})

app.get('/socket', (req, res) => {
  res.sendFile(join(__dirname, 'src/socket.js'));
})

app.get('/functions', (req, res) => {
  res.sendFile(join(__dirname, 'src/functions.js'));
})

app.get('/ai', (req, res) => {
  res.sendFile(join(__dirname, 'src/ai.js'));
})

app.get('/background1', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background.webp'));
})

app.get('/background2', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background2.png'));
})

app.get('/background3', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background3.png'));
})

app.get('/background4', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background4.png'));
})

app.get('/background5', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background5.png'));
})


app.get('/background6', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background6.png'));
})


app.get('/background7', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background7.png'));
})

app.get('/background8', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background8.png'));
})


app.get('/background9', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background9.png'));
})

app.get('/background10', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background10.png'));
})

app.get('/background11', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background11.png'));
})

app.get('/background12', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background12.png'));
})


app.get('/background13', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background13.png'));
})

app.get('/background14', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background14.png'));
})

app.get('/background15', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background15.png'));
})

app.get('/background16', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background16.png'));
})

app.get('/background17', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background17.png'));
})

app.get('/background18', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background18.png'));
})

app.get('/background19', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background19.png'));
})

app.get('/background20', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background20.png'));
})

app.get('/background21', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background21.png'));
})

app.get('/background22', (req, res) => {
  res.sendFile(join(__dirname, 'themes/background22.png'));
})


app.get('/src/app.js', (req, res) => {
    res.sendFile(join(__dirname, 'app.js'));
  });

  io.on('connection', (socket) => {
    playersOnline++
    console.log("+ " +socket.id)
    socket.broadcast.emit('playersOnlineUpdate', playersOnline)
    socket.emit('playersOnlineUpdate', playersOnline)
    console.log('An user connected');
    socket.on('disconnect', (e) => {
      console.log("- "+socket.id)
      playersOnline--

      fs.readFile('./games.json', 'utf-8', (err, dataAbout) => {
        const parsedData = JSON.parse(dataAbout)   

        for (const key in parsedData.games) {
          if (parsedData.games.hasOwnProperty(key)) {
            if (parsedData.games[key].socket1 == socket.id) {
              // player 1 has disconnected

              socket.broadcast.emit('gameResigned', {
                otherPlayer: parsedData.games[key].player2,
                resigner: parsedData.games[key].player1,
                game: parsedData.games[key].id,
              });
              fs.readFile('./users.json', 'utf-8', (err, userData) => {
                let parsedJSONData = JSON.parse(userData)

                if (parsedJSONData['user'+parsedData.games[key].player2] != undefined) {
                  parsedJSONData['user'+parsedData.games[key].player2].win++
                  parsedJSONData['user'+parsedData.games[key].player1].loses++
                  parsedJSONData['user'+parsedData.games[key].player2].elo = calculateNewRating(parsedJSONData['user'+parsedData.games[key].player2].elo, parsedJSONData['user'+parsedData.games[key].player1].elo, 1);
                  parsedJSONData['user'+parsedData.games[key].player1].elo = calculateNewRating(parsedJSONData['user'+parsedData.games[key].player1].elo, parsedJSONData['user'+parsedData.games[key].player2].elo, 0);
                }

                parsedData.games[key] = undefined
                fs.writeFile('./games.json', JSON.stringify(parsedData), (err) => {if (err) throw err})
                fs.writeFile('./users.json', JSON.stringify(parsedJSONData), (err) => {if (err) throw err})
              })


            }
            if (parsedData.games[key].socket2 == socket.id) {
              // player 2 has disconnected

              socket.broadcast.emit('gameResigned', {
                otherPlayer: parsedData.games[key].player1,
                resigner: parsedData.games[key].player2,
                game: parsedData.games[key].id,
              });
              fs.readFile('./users.json', 'utf-8', (err, userData) => {
                let parsedJSONData = JSON.parse(userData)

                parsedJSONData['user'+parsedData.games[key].player1].win++
                parsedJSONData['user'+parsedData.games[key].player2].loses++
                parsedJSONData['user'+parsedData.games[key].player1].elo = calculateNewRating(parsedJSONData['user'+parsedData.games[key].player1].elo, parsedJSONData['user'+parsedData.games[key].player2].elo, 1);
                parsedJSONData['user'+parsedData.games[key].player2].elo = calculateNewRating(parsedJSONData['user'+parsedData.games[key].player2].elo, parsedJSONData['user'+parsedData.games[key].player1].elo, 0);
                parsedData.games[key] = undefined
                fs.writeFile('./games.json', JSON.stringify(parsedData), (err) => {if (err) throw err})
                fs.writeFile('./users.json', JSON.stringify(parsedJSONData), (err) => {if (err) throw err})
              })

            }
          }
        }
      })

      socket.broadcast.emit('playersOnlineUpdate', playersOnline)
      console.log('An user disconnected');
    });

    socket.on('playerChat', (message) => {
      fs.readFile('./games.json', 'utf-8', (err, games) => {
        const gamesParsed = JSON.parse(games)
        if (gamesParsed.games['game'+message.game] != undefined) {
          if (gamesParsed.games['game'+message.game].player2 == message.uuid) {
            socket.broadcast.emit('messageFromOpponent', {
              game: message.game,
              receiver: gamesParsed.games['game'+message.game].player1,
              message: message.message,
              from: message.name
            })
            socket.emit('messageSentToOpponent', {
              game: message.game,
              message: message.message,
              from: message.name
            })
          }
          if (gamesParsed.games['game'+message.game].player1 == message.uuid) {
            socket.broadcast.emit('messageFromOpponent', {
              game: message.game,
              receiver: gamesParsed.games['game'+message.game].player2,
              message: message.message,
              from: message.name
            })
            socket.emit('messageSentToOpponent', {
              game: message.game,
              message: message.message,
              from: message.name
            })
          }
        }
      })
    })

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
        try {
          const jsonData = JSON.parse(data);

          if (jsonData['user'+uuid] != undefined) {
            socket.emit('userDetails', jsonData['user'+uuid])
          } else {
            socket.emit('noUserFound', {})
          } 
        } catch (error) {
          socket.emit('errorMessage', {title: "Something Went Wrong", message: "Something went wrong when the application was loaded, please reload your browser window."})
        }
      })
    })

    socket.on('requestUsers', (data) => {
      if (data.uuid != undefined) {
        fs.readFile('./users.json', 'utf-8', (err, userData) => {
          try {
            const jsonData = JSON.parse(userData);
  
            socket.emit('users', jsonData)
          } catch (e) {
            console.log(e)
          }
        })
      }
    })

    socket.on('resignGame', (data) => {
      fs.readFile('./games.json', 'utf-8', (err, games) => {
        const jsonGames = JSON.parse(games)
        if (jsonGames.games["game"+data.game] != undefined) {
          if (data.playerResigning == jsonGames.games["game"+data.game].player1 || data.playerResigning == jsonGames.games["game"+data.game].player2) {
            let otherPlayer;
            if (data.playerResigning == jsonGames.games["game"+data.game].player1) {otherPlayer =jsonGames.games["game"+data.game].player2} else {
              otherPlayer = jsonGames.games["game"+data.game].player1
            }

            fs.readFile('./users.json', 'utf-8', (err, useData) => {
              const JSONUserData = JSON.parse(useData)
              JSONUserData["user"+otherPlayer].win++
              JSONUserData["user"+data.playerResigning].loses++
              JSONUserData["user"+otherPlayer].elo = calculateNewRating(JSONUserData["user"+otherPlayer].elo, JSONUserData["user"+data.playerResigning].elo, 1);
              JSONUserData["user"+data.playerResigning].elo = calculateNewRating(JSONUserData["user"+data.playerResigning].elo, JSONUserData["user"+otherPlayer].elo, 0);
              fs.writeFile('./users.json', JSON.stringify(JSONUserData), (err) => {if (err) throw err})
            })
            socket.emit('gameResigned', {
              game: data.game,
              resigner: data.playerResigning,
              otherPlayer: otherPlayer 
            })
            socket.broadcast.emit('gameResigned', {
              game: data.game,
              resigner: data.playerResigning,
              otherPlayer: otherPlayer,  
            })
            jsonGames.games["game"+data.game] = undefined
            fs.writeFile('./games.json', JSON.stringify(jsonGames), (err) => {if (err) throw err})
          }
        }
      })
    })
    
    const CHARS = [1,2,3,4,5,6,7,8,9,0,1,"A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]
    const idLength = 8;

    socket.on('requestGame', (info) => { 
        if (info[1].length != 20) {
          socket.emit('errorMessage', {
            title: "Something Went Wrong", 
            message: "Your board was missing some ships, please try again."
          })
          return 
        }
        fs.readFile('./games.json','utf-8', function (err, data) {
            const parsedData = JSON.parse(data)
            let id = '';
            for (let i = 0; i < idLength;i++) {
              id = id + CHARS[Math.floor(Math.random()*CHARS.length)]
            }
            const d = new Date()
            fs.readFile('./users.json','utf-8', function (err2, data2) {
              parsedData.games["game"+ id] = {id: id, player1: info[0], player2: undefined, ongoing: false, time_played: d, ships1: info[1], ships2: [], moves1: [], moves2: [], winner: "", createdBy: info[0], turn: true, sunk1: 0, sunk2: 0, name1: JSON.parse(data2)["user"+info[0]].name, name2: "", socket1: socket.id, socket2: ''}
              fs.writeFile('./games.json', JSON.stringify(parsedData), (err) => {
                  if (err) throw err;
              })
              socket.emit('gameId', id);
            })
        })

    })


    socket.on('joinGame', (msg) => {
      if (msg[2].length != 20) {
        socket.emit('errorMessage', {
          title: "Something Went Wrong", 
          message: "Your board was missing some ships, please try again."
        })
        return 
      }
        fs.readFile('./games.json','utf-8', function (err, data) {
            const parsedData = JSON.parse(data)
            if (parsedData.games["game"+msg[0]] != undefined) {
              if (parsedData.games["game"+msg[0]].ongoing == true) {
                return;
              }
              if (msg[1] != parsedData.games["game"+msg[0]].createdBy) {

                for (const key in parsedData.games) {
                  if (parsedData.games.hasOwnProperty(key)) {
                    if (parsedData.games[key].createdBy == msg[1]) {
                      parsedData.games[key] = undefined
                    }
                  }
                }

                parsedData.games["game"+msg[0]].player2 = msg[1]
                parsedData.games["game"+msg[0]].ongoing = true;
                parsedData.games["game"+msg[0]].ships2 = msg[2]
                parsedData.games["game"+msg[0]].socket2 = socket.id
                fs.readFile('./users.json','utf-8', function (err2, data2) {
                  if (JSON.parse(data2)["user"+msg[1]].name != undefined) {
                    parsedData.games["game"+msg[0]].name2 = JSON.parse(data2)["user"+msg[1]].name
                  } else {
                    return
                  }
                  const rd = (Math.round(Math.random()*1))
                  if (rd == 0) {
                    parsedData.games["game"+msg[0]].turn = parsedData.games["game"+msg[0]].player1
                  }
                  if (rd == 1) {
                    parsedData.games["game"+msg[0]].turn = msg[1]
                  }
                  parsedData.games["game"+msg[0]].ships
                  fs.writeFile("./games.json", JSON.stringify(parsedData), (err) => {if (err) console.error3(err);})
                  fs.readFile("./users.json", 'utf-8', (err, da) => {
                    socket.emit('gameJoinedID', {
                      id: msg[0], 
                      turn: parsedData.games["game"+msg[0]].turn, 
                      player2: parsedData.games["game"+msg[0]].name2, 
                      player1: parsedData.games["game"+msg[0]].name1,
                      elo1: JSON.parse(da)["user"+parsedData.games["game"+msg[0]].player1].elo,
                      elo2: JSON.parse(da)["user"+msg[1]].elo,
                    });
    
                    //change this for a direct message to the user who created the game
                    socket.broadcast.emit('yourGameJoined', {
                      id: msg[0], 
                      createdBy: parsedData.games["game"+msg[0]].createdBy, 
                      turn: parsedData.games["game"+msg[0]].turn, 
                      player1: parsedData.games["game"+msg[0]].name1, 
                      player2: parsedData.games["game"+msg[0]].name2,
                      elo1: JSON.parse(da)["user"+parsedData.games["game"+msg[0]].player1].elo,
                      elo2: JSON.parse(da)["user"+parsedData.games["game"+msg[0]].player2].elo,
                    })
                  })
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
          if (jsonData.games["game"+info[1]] == undefined) {
            return;
          }
          if (jsonData.games["game"+info[1]].turn != info[2]) {
            return;
          }

          if (jsonData.games["game"+info[1]].player1 == info[2]) { // if player 1 makes the move
            //change this for a direct message to the user who created the game
            
            let attackedBefore = false;

            for (let i = 0; i < jsonData.games["game"+info[1]].moves1.length; i++) {
              if (jsonData.games["game"+info[1]].moves1[i] == parseInt(info[0])) {return}
            }

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
              fs.readFile('./users.json', 'utf-8', (err, userData) => {
                let parsedJSONData = JSON.parse(userData)
                parsedJSONData['user'+jsonData.games["game"+info[1]].player1].hits++

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
                  parsedJSONData['user'+jsonData.games["game"+info[1]].player1].win++
                  parsedJSONData['user'+jsonData.games["game"+info[1]].player2].loses++
                  parsedJSONData['user'+jsonData.games["game"+info[1]].player1].elo = calculateNewRating(parsedJSONData['user'+jsonData.games["game"+info[1]].player1].elo, parsedJSONData['user'+jsonData.games["game"+info[1]].player2].elo, 1);
                  parsedJSONData['user'+jsonData.games["game"+info[1]].player2].elo = calculateNewRating(parsedJSONData['user'+jsonData.games["game"+info[1]].player2].elo, parsedJSONData['user'+jsonData.games["game"+info[1]].player1].elo, 0);
                  jsonData.games["game"+info[1]] = undefined;
                  fs.writeFile('./games.json', JSON.stringify(jsonData), (err) => {if (err) throw err})
                  fs.writeFile('./users.json', JSON.stringify(parsedJSONData), (err) => {if (err) throw err})
                  
                  return;
                } else {
                  socket.emit('hitTrue', [info[1],jsonData.games["game"+info[1]].player1,info[0]])
                  fs.writeFile('./games.json', JSON.stringify(jsonData), (err) => {if (err) throw err})
                }
                fs.writeFile('./users.json', JSON.stringify(parsedJSONData), (err) => {if (err) throw err})
              })
            } else {
              jsonData.games["game"+info[1]].turn = jsonData.games["game"+info[1]].player2
            }
            fs.writeFile('./games.json', JSON.stringify(jsonData), (err) => {if (err) throw err})
            socket.broadcast.emit('opponentMove2', [info[1],jsonData.games["game"+info[1]].player2,info[0], hit])
          }
          if (jsonData.games["game"+info[1]].player2 == info[2]) { // if player 2 makes the move
            
            let attackedBefore = false;

            for (let i = 0; i < jsonData.games["game"+info[1]].moves2.length; i++) {
              if (jsonData.games["game"+info[1]].moves2[i] == parseInt(info[0])) {return}
            }


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
              fs.readFile('./users.json', 'utf-8', (err, userData) => {
                let parsedJSONData = JSON.parse(userData)
                parsedJSONData['user'+jsonData.games["game"+info[1]].player2].hits++
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
                  parsedJSONData['user'+jsonData.games["game"+info[1]].player2].win++
                  parsedJSONData['user'+jsonData.games["game"+info[1]].player1].loses++
                  parsedJSONData['user'+jsonData.games["game"+info[1]].player1].elo = calculateNewRating(parsedJSONData['user'+jsonData.games["game"+info[1]].player1].elo, parsedJSONData['user'+jsonData.games["game"+info[1]].player2].elo, 0);
                  parsedJSONData['user'+jsonData.games["game"+info[1]].player2].elo = calculateNewRating(parsedJSONData['user'+jsonData.games["game"+info[1]].player2].elo, parsedJSONData['user'+jsonData.games["game"+info[1]].player1].elo, 1);
                  jsonData.games["game"+info[1]] = undefined
                  fs.writeFile('./games.json', JSON.stringify(jsonData), (err) => {if (err) throw err})
                  fs.writeFile('./users.json', JSON.stringify(parsedJSONData), (err) => {if (err) throw err})
                  return;
                } else {
                  socket.emit('hitTrue', [info[1],jsonData.games["game"+info[1]].player2,info[0]])
                  fs.writeFile('./games.json', JSON.stringify(jsonData), (err) => {if (err) throw err})
                } 
                fs.writeFile('./users.json', JSON.stringify(parsedJSONData), (err) => {if (err) throw err})            
              })
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

function eloRating(playerRating, opponentRating, playerScore, kFactor) {
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    let newRating = playerRating + kFactor * (playerScore - expectedScore);
    newRating = Math.max(0, newRating);
    return newRating;
}

function calculateNewRating(playerRating, opponentRating, playerScore) {
    const kFactor = playerRating < 1500 ? 50 : (playerRating < 2000 ? 20 : 10);
    return Math.round(eloRating(playerRating, opponentRating, playerScore, kFactor));
}


server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});