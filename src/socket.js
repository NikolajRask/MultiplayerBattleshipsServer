let currentGame;
let useEqations = true;
let currentAnswer;
let attackEnabled = false;
let name;

if (localStorage.getItem('currentPage') == null) {
    localStorage.setItem('currentPage', 'game')
}

let pages = {
    game: document.getElementById('page-game'),
    leaderboard: document.getElementById('page-leaderboard'),
    account: document.getElementById('page-account'),
    ai: document.getElementById('page-ai')
}
const socket = io();

pages[localStorage.getItem('currentPage')].style.display = "block"

function switchPage(page) {
    localStorage.setItem('currentPage', page)
    pages.game.style.display = "none"
    pages.leaderboard.style.display = "none"
    pages.account.style.display = "none"
    pages.ai.style.display = "none"

    pages[page].style.display = "block"
}


socket.on('playersOnlineUpdate', (playerCount) => {
        if (playerCount == '1' || playerCount == 1) {
            document.getElementById('playerOnline').innerHTML = playerCount + " Player Online"
        } else {
            document.getElementById('playerOnline').innerHTML = playerCount + " Players Online"
        }
})
socket.emit('requestPlayerCount', 0)


document.addEventListener('DOMContentLoaded', () => {
    
    if (localStorage.getItem('uuid') == null) {
        makeUUID();
    }

    socket.emit('getUser', getUUID())

    const gameId = document.getElementById('gameId');
    const createGame = document.getElementById('createGame');
    const joinGame = document.getElementById('joinGame');
    const input = document.getElementById('gameIdInput');
    const messages = document.getElementById('messages');

    createGame.addEventListener('click', () => {
        if (getShips().length == 20) {
            socket.emit('requestGame', [getUUID(), getShips()])
            document.getElementById("createGame").style.display = "none"
        } else {
            sendMessage('Something Went Wrong', "Your board was missing some ships, please try again.");
            randomizeShips(true)
        }

    })

    
    joinGame.addEventListener('click', () => {
        if (getShips().length == 20) {
            if (input.value != "") {
                socket.emit("joinGame", [input.value.replace("#",""), getUUID(), getShips()])
                input.value = ""
            }
        } else {
            sendMessage('Something Went Wrong', "Your board was missing some ships, please try again.");
            randomizeShips(true)
        }
    })

    socket.on('noUserFound', (data) => {
        document.getElementById('accountModal').style.display = "block"
        document.getElementById('overlay').style.display = "block"
    })

    socket.on('errorMessage', (details) => {
        sendMessage(details.title, details.message)
    })

    socket.on('moveSuccess', (data) => {
        if (data.game == getCurrentGame()) {
            attackEnabled = false;
            document.getElementById('oBlock-'+data.move).style.background = "rgba(0,0,0,0.4)"
            document.getElementById('opponentBoard').style.opacity = '0.3'
        }
    })

    socket.on('gameId', (msg) => {
        gameId.innerHTML = "#"+msg + `<svg id="copy-svg" xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-copy" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" /><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" /></svg>`
        document.getElementById('gameIdPlaceholder').value = msg

        document.getElementById('copy-svg').addEventListener('click', () => {
            document.getElementById('gameIdPlaceholder').select()
            document.getElementById('gameIdPlaceholder').setSelectionRange(0, 99999);
            navigator.clipboard.writeText(document.getElementById('gameIdPlaceholder').value);
        })
    })


    //When you join a game
    socket.on('gameJoinedID', (data) => {
        if (parseInt(data) != 400 && parseInt(data) != 404) {
            setCurrentGame(data.id)
            document.querySelector('#opponentBoard').style.opacity = "0.3"
            if (data.turn != getUUID()) {
                document.getElementById('opponentBoard').style.opacity = '0.3'
            } else {
                generateNewEquation()
                document.getElementById('equationBox').style.display = "block"
            }
            document.getElementById('actions').style.display = "none"
            document.getElementById('gameInfo').style.display = "block"
            document.getElementById('player1').style.color = "white"
            document.getElementById('player2').style.color = "white"
            document.getElementById('player2Elo').style.color = "white"
            document.getElementById('player1Elo').style.color = "white"
            document.getElementById('player1').innerHTML = data.player2
            document.getElementById('player2').innerHTML = data.player1
            document.getElementById('player2Elo').innerHTML = data.elo1
            document.getElementById('player1Elo').innerHTML = data.elo2
        } else {
            if (parseInt(data) == 404) {
                sendMessage("Wrong code", "No game with the code you tried to input exists!")
            } 
            if (parseInt(data) == 400) {
                sendMessage("Tried to join own game", "You cannot join games that was created by you!")
            }
        }
    })

    // When someone joins your game
    socket.on('yourGameJoined', (data) => {
        if (data.createdBy == getUUID()) {
            setCurrentGame(data.id)
            document.querySelector('#opponentBoard').style.opacity = "0.3"
            if (data.turn != getUUID()) {
                document.getElementById('opponentBoard').style.opacity = '0.3'
            } else {
                generateNewEquation()
                document.getElementById('equationBox').style.display = "block"
            }
            document.getElementById('actions').style.display = "none"
            document.getElementById('gameInfo').style.display = "block"
            document.getElementById('player1').style.color = "white"
            document.getElementById('player2').style.color = "white"
            document.getElementById('player2Elo').style.color = "white"
            document.getElementById('player1Elo').style.color = "white"
            document.getElementById('player1').innerHTML = data.player1
            document.getElementById('player2').innerHTML = data.player2
            document.getElementById('player2Elo').innerHTML = data.elo2
            document.getElementById('player1Elo').innerHTML = data.elo1
        }
    })

    socket.on('opponentMove2', (move) => {
        if (move[0] == getCurrentGame()) {
            if (move[1] == getUUID()) {
                console.log(document.getElementById("block-"+move[2]).style.background)
                if (document.getElementById("block-"+move[2]).style.background == "") {
                    document.getElementById("block-"+move[2]).style.background = "rgba(0,0,0,0.3)"
                } else {
                    document.getElementById("block-"+move[2]).style.background = "rgba(245, 69,66, 0.6)"
                }
                if (move[3] == false) {
                    document.getElementById('opponentBoard').style.opacity = '0.3'
                    generateNewEquation()
                    document.getElementById('equationBox').style.display = "block"
                }
            }
        }
    })

    socket.on('opponentMove1', (move) => {
        if (move[0] == getCurrentGame()) {
            if (move[1] == getUUID()) {
                console.log(document.getElementById("block-"+move[2]).style.background)
                if (document.getElementById("block-"+move[2]).style.background == "") {
                    document.getElementById("block-"+move[2]).style.background = "rgba(0,0,0,0.3)"
                } else {
                    document.getElementById("block-"+move[2]).style.background = "rgba(245, 69,66, 0.6)"
                }
                if (move[3] == false) {
                    generateNewEquation()
                    document.getElementById('equationBox').style.display = "block"
                    document.getElementById('opponentBoard').style.opacity = '0.3'
                }
            }
        }
    })

    socket.on('hitTrue', (data) => {
        if (data[1] == getUUID()) {
            document.getElementById("oBlock-"+data[2]).style.background = "rgba(245, 69,66, 0.4)"
            document.getElementById('opponentBoard').style.opacity = '0.3'
            generateNewEquation()
            document.getElementById('equationBox').style.display = "block"
            socket.emit('getUser', getUUID())
        }
    })

    socket.on('gameEnded', (data) => {
        if (data.game == getCurrentGame()) {
            if (data.winner == getUUID()) { //This Client Won
                document.getElementById('player1Elo').innerHTML = "Winner"
                document.getElementById('player2Elo').innerHTML = "Loser"
                document.getElementById('player1Elo').style.color = "green"
                document.getElementById('player2Elo').style.color = "red"
                document.getElementById('player1').style.color = "green"
                document.getElementById('player2').style.color = "red"
                document.getElementById('newGameBox').style.display = "block"
                document.getElementById('winOrLose').innerHTML = "You Won"
                endGame();
                socket.emit('getUser', getUUID())
                createLeaderboard()
            }
            if (data.loser == getUUID()) { // This Client Lost
                document.getElementById('player2Elo').innerHTML = "Winner"
                document.getElementById('player1Elo').innerHTML = "Loser"
                document.getElementById('player2Elo').style.color = "green"
                document.getElementById('player1Elo').style.color = "red"
                document.getElementById('player2').style.color = "green"
                document.getElementById('player1').style.color = "red"
                document.getElementById('newGameBox').style.display = "block"
                document.getElementById('winOrLose').innerHTML = "You Lost"
                endGame();
                socket.emit('getUser', getUUID())
                createLeaderboard()
            }
        }
    })


    socket.on('userAlreadyExist', (data) => {
        makeUUID();
        document.getElementById("username-input").style.border = "2px solid rgb(242, 54, 54)"
        document.getElementById('errorMessage').innerHTML = "Something went wrong, please try again"
    })


    socket.on('userDetails', (data) => {
        name = data.name

        document.getElementById('stat-wins').innerHTML = data.win
        document.getElementById('stat-loses').innerHTML = data.loses
        document.getElementById('stat-elo').innerHTML = data.elo
        document.getElementById('stat-hits').innerHTML = data.hits
        document.getElementById('account-name').innerHTML = data.name
        document.getElementById('uuid-placeholder').innerHTML = "UUID-"+getUUID();
    })

    socket.on('userCreated', (data) => {
        name = data.name
        createLeaderboard()
        document.getElementById('accountModal').style.display = "none"
        document.getElementById('overlay').style.display = "none"
    })

    socket.on('yourMovedSkipped', (data) => {
        sendMessage("Wrong answer", "Your answer to the equation was not right, so you wasted your move")
        
        document.getElementById('equationBox').style.display = "none"
        document.getElementById('opponentBoard').style.opacity = '0.3'
    })

    socket.on('opponentMovedSkipped', (data) => {
        if (getCurrentGame() == data.game) {
            if (getUUID() == data.player) {
                generateNewEquation()
                document.getElementById('equationBox').style.display = "block"
                document.getElementById('opponentBoard').style.opacity = '1'
            }
        }
    })

    socket.on('gameResigned', (data) => {
        if (getCurrentGame() == data.game) {
            if (data.resigner == getUUID()) { // this player has resigned
                document.getElementById('player2Elo').innerHTML = "Winner"
                document.getElementById('player1Elo').innerHTML = "Loser"
                document.getElementById('player2Elo').style.color = "green"
                document.getElementById('player1Elo').style.color = "red"
                document.getElementById('player2').style.color = "green"
                document.getElementById('player1').style.color = "red"
                document.getElementById('equationBox').style.display = "none"
                document.getElementById('newGameBox').style.display = "block"
                document.getElementById('winOrLose').innerHTML = "You Resigned"
                endGame();
                socket.emit('getUser', getUUID())
                createLeaderboard()
            }
            if (data.otherPlayer == getUUID()) { // the other player has resigned
                document.getElementById('player1Elo').innerHTML = "Winner"
                document.getElementById('player2Elo').innerHTML = "Loser"
                document.getElementById('player1Elo').style.color = "green"
                document.getElementById('player2Elo').style.color = "red"
                document.getElementById('player1').style.color = "green"
                document.getElementById('player2').style.color = "red"
                document.getElementById('equationBox').style.display = "none"
                document.getElementById('winOrLose').innerHTML = "You Won"
                document.getElementById('newGameBox').style.display = "block"
                endGame();
                socket.emit('getUser', getUUID())
                sendMessage("Resigned", "The other player has resigned or disconnected")
                createLeaderboard()
            }
        }
    })

    document.getElementById('math-input').addEventListener('change', () => {
        const uuidC = getUUID();
        const gameC = getCurrentGame()
        const inputValue = document.getElementById('math-input').value;
        document.getElementById('math-input').value = ""
        if (parseFloat(inputValue).toFixed(1) == currentAnswer.toFixed(1)) { // Correct Answer
            sendMessage('Correct Answer', "You can shoot at your opponent now")
            attackEnabled = true;
            document.getElementById('equationBox').style.display = "none"
            document.getElementById('opponentBoard').style.opacity = '1'
        } else { // Wrong Answer
            socket.emit('wasteMove', {
                game: gameC,
                player: uuidC,
            })
        }
    })

})
