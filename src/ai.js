const startGameAI = document.getElementById('startGameAI')
const equationBoxAI = document.getElementById('equationBoxAI')
let currentAnswerAI = undefined;
let getToShootAI = false;
let playerHitsAI = 0;
let aiHits = 0;

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
    }
})


function playAgainAI() {
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
}

function disconnectAI() {
    document.getElementById('player1AI').style.color = "red"
    document.getElementById('player1EloAI').style.color = "red"
    document.getElementById('player2AI').style.color = "green"
    document.getElementById('player2EloAI').style.color = "green"

    document.getElementById('player1EloAI').innerHTML = "Loser"
    document.getElementById('player2EloAI').innerHTML = "Winner"
    document.getElementById('newGameBoxAI').style.display = "block"
    document.getElementById('winOrLoseAI').innerHTML = "You Lost"
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

document.getElementById('math-inputAI').addEventListener('change', () => {
    const saveValue = document.getElementById('math-inputAI').value
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
                //win game
            }
            generateNewEquationAI()
            
        } else {
            document.getElementById('AIoBlock-'+x).style.background = "rgba(0,0,0,0.8)"
            sendMessage('You Missed', "You did not hit any of your opponents ships")
            equationBoxAI.style.display = "none"
            makeAIMove()
        }
    }
}

function clearBoards() {

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





function makeAIMove() {
    const move = Math.floor(Math.random() * 100) + 1;

    let isHit = false;
    for (let i = 0; i < ships.length; i++) {
        if (move == ships[i]) {isHit = true; continue}
    }


    window.setTimeout(() => {
        if (isHit == true) {
            document.getElementById('AIblock-'+move).style.background = 'rgba(245, 69,66, 0.6)'
            aiHits++
            if (aiHits >= 20) {
                //win game
            }
            makeAIMove()
        } else {
            document.getElementById('AIblock-'+move).style.background = 'rgba(0,0,0,0.3)'
            equationBoxAI.style.display = "block"
        }

    }, Math.floor(Math.random()*3000)+1000)


}


