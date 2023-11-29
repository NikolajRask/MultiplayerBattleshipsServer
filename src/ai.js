const startGameAI = document.getElementById('startGameAI')
const equationBoxAI = document.getElementById('equationBoxAI')
let currentAnswerAI = undefined;
let getToShootAI = false;
let playerHitsAI = 0;
let aiHits = 0;
let aiPlayerMoves = []
let aiMoves = []

startGameAI.addEventListener('click', () => {
    if (name != undefined) {
        startGameAI.style.display = "none"
        equationBoxAI.style.display = "block"
        generateNewEquationAI()
        document.getElementById('actionsAI').style.display = "none"
        document.getElementById('gameInfoAI').style.display = "block"

        document.getElementById('player1AI').style.color = "white"
        document.getElementById('player1EloAI').style.color = "white"
        document.getElementById('player2AI').style.color = "white"
        document.getElementById('player2EloAI').style.color = "white"

        document.getElementById('player1AI').innerHTML = name;
        document.getElementById('player1EloAI').innerHTML = document.getElementById('stat-elo').innerHTML
        document.getElementById('player2AI').innerHTML = "Computer";
        document.getElementById('player2EloAI').innerHTML = "???"
        document.getElementById('ai-opponentBoard').style.opacity = "0.3"
        let aiPlayerMoves = []
        let aiMoves = []
    }
})


function playAgainAI() {
    playerHitsAI = 0;
    aiHits = 0;
    startGameAI.style.display = "none"
    equationBoxAI.style.display = "block"
    generateNewEquationAI()
    document.getElementById('actionsAI').style.display = "none"
    document.getElementById('gameInfoAI').style.display = "block"

    document.getElementById('player1AI').style.color = "white"
    document.getElementById('player1EloAI').style.color = "white"
    document.getElementById('player2AI').style.color = "white"
    document.getElementById('player2EloAI').style.color = "white"

    document.getElementById('player1AI').innerHTML = name;
    document.getElementById('player1EloAI').innerHTML = document.getElementById('stat-elo').innerHTML
    document.getElementById('player2AI').innerHTML = "Computer";
    document.getElementById('player2EloAI').innerHTML = "???"
    document.getElementById('ai-opponentBoard').style.opacity = "0.3"
    document.getElementById('newGameBoxAI').style.display = "none"
    clearBoardsAI()
    aiPlayerMoves = []
    aiMoves = []
    for (let i = 0; i < ships.length; i++) {
        placeShipOnBoardAI(ships[i])
    }
}

function disconnectAI(x = true) {
    currentAnswerAI = undefined;
    getToShootAI = false;
    playerHitsAI = 0;
    aiHits = 0;
    aiPlayerMoves = []
    aiMoves = []
    if (x == true) {
        document.getElementById('player1AI').style.color = "red"
        document.getElementById('player1EloAI').style.color = "red"
        document.getElementById('player2AI').style.color = "green"
        document.getElementById('player2EloAI').style.color = "green"
    
        document.getElementById('player1EloAI').innerHTML = "Loser"
        document.getElementById('player2EloAI').innerHTML = "Winner"
        document.getElementById('winOrLoseAI').innerHTML = "You Lost"
    } else {
        document.getElementById('player1AI').style.color = "green"
        document.getElementById('player1EloAI').style.color = "green"
        document.getElementById('player2AI').style.color = "red"
        document.getElementById('player2EloAI').style.color = "red"
    
        document.getElementById('player1EloAI').innerHTML = "Winner"
        document.getElementById('player2EloAI').innerHTML = "Loser"
        document.getElementById('winOrLoseAI').innerHTML = "You Won"
    }
    document.getElementById('newGameBoxAI').style.display = "block"
    
    equationBoxAI.style.display = "none"
}

function generateNewEquationAI() {
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
    currentAnswerAI = x; // x
    document.getElementById('mathAI').innerHTML = equationMathML
    return { equationMathML, solution: x };
}

// Cheat Mode In AI
document.getElementById('math-inputAI').addEventListener('input', () => {
    if (document.getElementById('math-inputAI').value == "qq") {document.getElementById('math-inputAI').value = currentAnswerAI.toFixed(1)}
})

document.getElementById('math-inputAI').addEventListener('change', () => {
    let saveValue = document.getElementById('math-inputAI').value
    document.getElementById('math-inputAI').value = "";
    
    if (parseFloat(saveValue).toFixed(1) == currentAnswerAI.toFixed(1)) {
        sendMessage('Correct Answer', "You can shoot at your opponent now")
        document.getElementById('ai-opponentBoard').style.opacity = "1"
        equationBoxAI.style.display = "none"
        getToShootAI = true;
    } else {
        sendMessage("Wrong answer", "Your answer to the equation was not right, so you wasted your move")
        equationBoxAI.style.display = "none"
        makeAIMove();
    }
})

function attackAI(x) {
    if (getToShootAI) {
        for (let i = 0; i < aiPlayerMoves.length; i++) {
            if (aiPlayerMoves[i] == x) {
                return;
            }
        }

        aiPlayerMoves.push(x)
        getToShootAI = false;
        let hit = false;
        for (let i = 0; i < AIShips.length; i++) {
            if (x == AIShips[i]) {hit = true; continue;}
        }
        document.getElementById('ai-opponentBoard').style.opacity = "0.3"
        if (hit == true) {
            sendMessage('Bullseye', "You have succesfully fired at an opponent ship")
            document.getElementById('AIoBlock-'+x).style.background = "rgba(245, 69,66, 0.9)"
            equationBoxAI.style.display = "block"
            playerHitsAI++
            if (playerHitsAI >= 20) {
                disconnectAI(false)
            }
            generateNewEquationAI()
            
        } else {
            document.getElementById('AIoBlock-'+x).style.background = "rgba(0,0,0,0.8)"
            sendMessage('You Missed', "You did not hit any of your opponents ships")
            equationBoxAI.style.display = "none"
            makeAIMove()
            generateNewEquationAI()
        }
    }
}

function clearBoardsAI() {
    for (let i = 0; i < 100; i++) {
        document.getElementById('AIoBlock-'+(i+1)).style.background = "rgba(255,255,255,0.15)"
        document.getElementById('AIblock-'+(i+1)).style.background = ""
    }
    for (let i = 0; i < ships.length; i++) {
        placeShipOnBoard(ships[i])
    }
}

function placeShipOnBoardAI(i) {
    document.getElementById('AIblock-'+i).style.background = "rgba(0,0,0,0.7)"
}

for (let i = 0; i < ships.length; i++) {
    placeShipOnBoardAI(ships[i])
}

function createBoardWithShipsAI() {
    const ships = [5, 4, 4, 3, 2, 2];  // Ship sizes
    const board = Array.from({ length: 10 }, () => Array(10).fill(0));

    for (const shipSize of ships) {
        let placed = false;
        while (!placed) {
            const row = Math.floor(Math.random() * 10);
            const col = Math.floor(Math.random() * 10);
            const horizontal = Math.random() < 0.5;

            if (isShipPlacementValid(board, shipSize, row, col, horizontal)) {
                placeShipAI(board, shipSize, row, col, horizontal);
                placed = true;
            }
        }
    }

    return board;
}

function placeShipAI(board, shipSize, row, col, horizontal) {
    for (let i = 0; i < shipSize; i++) {
        if (horizontal) {
            board[row][col + i] = 1;
        } else {
            board[row + i][col] = 1;
        }
    }
}

const AIShips = []
const AIBoard = createBoardWithShipsAI();
for (let i = 0; i < AIBoard.length; i++) {
    for (let e = 0; e < 10; e++) {
        if (AIBoard[i][e] == 1) {
            AIShips.push((i*10)+e + 1)
        }
    }
}



let lastHitAI 

function makeAIMove() {
    let isMoveValid = false;
    let move;

    while (!isMoveValid) {
        move = Math.floor(Math.random() * 100) + 1;
        let attackBeforeAI = false;

        for (let i = 0; i < aiMoves.length; i++) {
            if (aiMoves[i] == move) {
                attackBeforeAI = true;
            }
        }

        if (attackBeforeAI == false) {
            isMoveValid = true;
        }
    }
    aiMoves.push(move)

    let isHit = false;
    for (let i = 0; i < ships.length; i++) {
        if (move == ships[i]) {isHit = true; continue}
    }


    window.setTimeout(() => {
        if (isHit == true) {
            document.getElementById('AIblock-'+move).style.background = 'rgba(245, 69,66, 0.6)'
            aiHits++
            if (aiHits >= 20) {
                disconnectAI()
                return;
            }
            makeAIMove()
        } else {
            document.getElementById('AIblock-'+move).style.background = 'rgba(0,0,0,0.3)'
            equationBoxAI.style.display = "block"
        }

    }, Math.floor(Math.random()*3000)+1000)


}


