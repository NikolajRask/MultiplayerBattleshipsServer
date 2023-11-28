const board = document.getElementById('board')
        const opponentBoard = document.getElementById('opponentBoard')
        let ships = []

        function openModal() {
            document.getElementById('modal').style.display = "block"
            document.getElementById('overlay-2').style.display = "block"
        }

        function closeModal() {
            document.getElementById('modal').style.display = "none"
            document.getElementById('overlay-2').style.display = "none"     
        }

        document.getElementById('overlay-2').addEventListener('click', () => {
            closeModal();
        })

        function playAgain() {
            document.getElementById('newGameBox').style.display = "none"
            document.getElementById('actions').style.display = "block"
            document.getElementById('gameInfo').style.display = "none"
            document.getElementById("createGame").style.display = "block"
            document.getElementById("gameId").innerHTML = ""
            clearBoards();
        }

        function clearBoards() {
            for (let i = 0; i < 100; i++) {
                document.getElementById('oBlock-'+(i+1)).style.background = "rgba(255,255,255,0.15)"
                document.getElementById('block-'+(i+1)).style.background = ""
                document.getElementById('AIblock-'+(i+1)).style.background = ""
            }
            for (let i = 0; i < ships.length; i++) {
                placeShipOnBoard(ships[i])
            }
        }

        function createBoard(id = "board", ai = false) {
            let x = 0;
            for (let i = 0; i < 10; i++) {
                const row = document.createElement('div')
                row.style.display = "flex";
                document.getElementById(id).appendChild(row)
                for (let i = 0; i < 10; i++) {
                    x++;
                    if (!ai) {
                        row.innerHTML = row.innerHTML + `<div class='block' id='block-${x}'></div>`
                    } else {
                        row.innerHTML = row.innerHTML + `<div class='block' id='AIblock-${x}'></div>`
                    }
                }

            }
        }


        function createOpponentBoard(id = "opponentBoard", ai = false) {
            let x = 0;
            for (let i = 0; i < 10; i++) {
                const row = document.createElement('div')
                row.style.display = "flex";
                document.getElementById(id).appendChild(row)
                for (let i = 0; i < 10; i++) {
                    x++;
                    if (!ai) {
                        row.innerHTML = row.innerHTML + `<div class='block-2' id='oBlock-${x}' onClick="attack('${x}')"></div>`
                    } else {
                        row.innerHTML = row.innerHTML + `<div class='block-2' id='AIoBlock-${x}' onClick="attack('${x}')"></div>`
                    }
                    
                }

            }
        }

        createBoard()
        createOpponentBoard()
        createBoard('ai-board', true)
        createOpponentBoard('ai-opponentBoard', true)


        function createUser() {
            if (document.getElementById('username-input').value != "") {
                if (document.getElementById('username-input').value.length > 3) {
                    if (document.getElementById('username-input').value.length < 21) {
                        const uuid = getUUID()
                        socket.emit('createAccount', {
                            name: document.getElementById('username-input').value,
                            uuid: uuid
                        })
                        document.getElementById('stat-wins').innerHTML = 0
                        document.getElementById('stat-loses').innerHTML = 0
                        document.getElementById('stat-elo').innerHTML = 1000
                        document.getElementById('stat-hits').innerHTML = 0
                        document.getElementById('account-name').innerHTML = document.getElementById('username-input').value
                        document.getElementById('uuid-placeholder').innerHTML = "UUID-"+uuid;
                    } else {
                        document.getElementById("username-input").style.border = "2px solid rgb(242, 54, 54)"
                        document.getElementById('errorMessage').innerHTML = "Nickname needs to be longer than 20 characters"
                    }
                } else {
                    document.getElementById("username-input").style.border = "2px solid rgb(242, 54, 54)"
                    document.getElementById('errorMessage').innerHTML = "Nickname needs to be at least 4 characters long"
                }
            } else {
                document.getElementById("username-input").style.border = "2px solid rgb(242, 54, 54)"
                document.getElementById('errorMessage').innerHTML = "You forgot to tell us your Nickname"
            }
        }



        function attack(x) {
            if (getCurrentGame() != undefined) {
                if (attackEnabled) {
                    socket.emit('makeMove',[x, getCurrentGame(), getUUID()])
                    document.getElementById('equationBox').style.display = "none"
                }
            }
        }   

        function getUUID() {
            return localStorage.getItem('uuid');
        }

        function makeUUID() {
            const UUID = Math.floor(Math.random() * 10000000000000)
            localStorage.setItem('uuid',UUID);
        }

        function setCurrentGame(id) {
            currentGame = id
        }

        function getCurrentGame() {
            return currentGame;
        }

        const shipAmount = 20;

        // function generateRandomShips() {
        //     for (let i = 0; i < shipAmount; i++) {
        //         let randomU;
        //         let x = true;
        //         while (x == true) {
        //             randomU = Math.floor(Math.random()*100)+1; 
        //             if (document.getElementById('block-'+randomU).style.background != "gray") {x = false;}
        //         }
                
        //         placeShip2(randomU) 
        //     }
        // }

        function isShipPlacementValid(board, shipSize, row, col, horizontal) {
            if (horizontal) {
                if (col + shipSize > 10) return false;
                for (let i = -1; i < shipSize + 1; i++) {
                    for (let j = -1; j < 2; j++) {
                        if (row + j >= 0 && row + j < 10 && col + i >= 0 && col + i < 10 && board[row + j][col + i] === 1) {
                            return false;
                        }
                    }
                }
            } else {
                if (row + shipSize > 10) return false;
                for (let i = -1; i < shipSize + 1; i++) {
                    for (let j = -1; j < 2; j++) {
                        if (row + i >= 0 && row + i < 10 && col + j >= 0 && col + j < 10 && board[row + i][col + j] === 1) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }

        function placeShip(board, shipSize, row, col, horizontal) {
            for (let i = 0; i < shipSize; i++) {
                if (horizontal) {
                    board[row][col + i] = 1;
                } else {
                    board[row + i][col] = 1;
                }
            }
        }

        function createBoardWithShips() {
            const ships = [5, 4, 4, 3, 2, 2];  // Ship sizes
            const board = Array.from({ length: 10 }, () => Array(10).fill(0));

            for (const shipSize of ships) {
                let placed = false;
                while (!placed) {
                    const row = Math.floor(Math.random() * 10);
                    const col = Math.floor(Math.random() * 10);
                    const horizontal = Math.random() < 0.5;

                    if (isShipPlacementValid(board, shipSize, row, col, horizontal)) {
                        placeShip(board, shipSize, row, col, horizontal);
                        placed = true;
                    }
                }
            }

            return board;
        }
        let lastTimeout;
        function sendMessage(title, message, timeout=7000) {
            clearTimeout(lastTimeout)
            document.getElementById('messageBox').style.opacity = 1;
            document.getElementById('messageTitle').innerHTML = title;
            document.getElementById('message').innerHTML = message
            lastTimeout = window.setTimeout(() => {
                hideMessage()
            }, timeout)
        }

        function hideMessage() {
            document.getElementById('messageBox').style.opacity = 0;
            window.setTimeout(() => {
                document.getElementById('messageTitle').innerHTML = "";
                document.getElementById('message').innerHTML = "";
            },1100)
        }

        function randomizeShips(x) {
            if (x) {
                ships = []
                for (let i = 0; i < 100; i++) {
                    document.getElementById('block-'+(i+1)).style.background = ""
                    document.getElementById('AIblock-'+(i+1)).style.background = ""
                }
            }

            const gameBoard = createBoardWithShips();
            for (let i = 0; i < gameBoard.length; i++) {
                for (let e = 0; e < 10; e++) {
                    if (gameBoard[i][e] == 1) {
                        ships.push((i*10)+e + 1)
                        placeShipOnBoard((i*10)+e + 1)
                    }
                }
            }
        }

        function createLeaderboard() {
            socket.emit('requestUsers', {uuid: getUUID()})
        }

        socket.on('users', (users) => {
            document.getElementById('leaderboard-container').innerHTML = ""
            let leaderboard = [];
            for (const key in users) {
                if (users.hasOwnProperty(key)) {
                    leaderboard.push(users[key])
                }
            }
            leaderboard.sort((a, b) => b.elo - a.elo); // change hits to elo
            for (let i = 0; i < leaderboard.length; i++) {
                document.getElementById('leaderboard-container').innerHTML = document.getElementById('leaderboard-container').innerHTML + `
                <div class="leaderboard-row">
                    <div>
                        <p>#${i+1}</p>
                    </div>
                    <div>
                        <p>${leaderboard[i].elo}</p>
                    </div>
                    <div>
                        <p>${leaderboard[i].name}</p>
                    </div>
                    <div>
                        <p>${leaderboard[i].win}</p>
                    </div>
                    <div>
                        <p>${leaderboard[i].hits}</p>
                    </div>
                </div>
                `
            }
        })

        createLeaderboard()


        randomizeShips(false)
        

        function placeShipOnBoard(i) {
            document.getElementById('block-'+i).style.background = "rgba(0,0,0,0.7)"
            document.getElementById('AIblock-'+i).style.background = "rgba(0,0,0,0.7)"
        }
        function getShips() {
            return ships;
        }

        function endGame() {
            currentGame = undefined
        }

        function disconnect() {
            if (getCurrentGame() != undefined) {
                const thisGame = getCurrentGame();
                const id = getUUID();
                socket.emit('resignGame', {
                    game: thisGame,
                    playerResigning: id,
                })
            }
        }

        function generateNewEquation() {
            function getRandomInt(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            const a = getRandomInt(1, 10);
            const b = getRandomInt(-10, 10);
            const c = getRandomInt(-10, 10);

            const x = (c - b) / a;
            const equationMathML = `<math xmlns='http://www.w3.org/1998/Math/MathML'>
                <mrow>
                    <mrow><mn>${a}</mn><mo>×</mo><mi>x</mi></mrow>
                    <mo>+</mo>
                    <mn>${b}</mn>
                    <mo>=</mo>
                    <mn>${c}</mn>
                </mrow>
            </math>`;
            currentAnswer = x;
            document.getElementById('math').innerHTML = equationMathML
            return { equationMathML, solution: x };
        }

        generateNewEquation();