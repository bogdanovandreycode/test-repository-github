// Игровые переменные
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let scores = {
    X: 0,
    O: 0,
    draws: 0
};

// Возможные выигрышные комбинации
const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Элементы DOM
const statusDisplay = document.querySelector('.status');
const cells = document.querySelectorAll('.cell');
const xWinsDisplay = document.getElementById('xWins');
const oWinsDisplay = document.getElementById('oWins');
const drawsDisplay = document.getElementById('draws');

// Загрузка счета из localStorage
function loadScores() {
    const savedScores = localStorage.getItem('ticTacToeScores');
    if (savedScores) {
        scores = JSON.parse(savedScores);
        updateScoreDisplay();
    }
}

// Сохранение счета в localStorage
function saveScores() {
    localStorage.setItem('ticTacToeScores', JSON.stringify(scores));
}

// Обновление отображения счета
function updateScoreDisplay() {
    xWinsDisplay.textContent = scores.X;
    oWinsDisplay.textContent = scores.O;
    drawsDisplay.textContent = scores.draws;
}

// Сообщения для статуса игры
function currentPlayerDisplay() {
    return `Ход игрока: ${currentPlayer}`;
}

function winningMessage() {
    return `Игрок ${currentPlayer} победил!`;
}

function drawMessage() {
    return `Ничья!`;
}

// Обновление статуса игры
function updateGameStatus(message) {
    statusDisplay.innerHTML = message;
}

// Инициализация игры
function initializeGame() {
    updateGameStatus(currentPlayerDisplay());
    loadScores();
}

// Выполнение хода
function makeMove(cellIndex) {
    if (board[cellIndex] !== '' || !gameActive) {
        return;
    }

    board[cellIndex] = currentPlayer;
    cells[cellIndex].innerHTML = currentPlayer;
    cells[cellIndex].classList.add(currentPlayer.toLowerCase());
    
    // Добавляем небольшую анимацию при ходе
    cells[cellIndex].style.animation = 'celebration 0.3s ease-in-out';
    setTimeout(() => {
        cells[cellIndex].style.animation = '';
    }, 300);

    checkResult();
}

// Проверка результата игры
function checkResult() {
    let roundWon = false;
    let winningCombination = null;

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            winningCombination = [a, b, c];
            break;
        }
    }

    if (roundWon) {
        updateGameStatus(winningMessage());
        gameActive = false;
        
        // Подсветка выигрышной комбинации
        if (winningCombination) {
            winningCombination.forEach(index => {
                cells[index].classList.add('winning-line');
            });
        }
        
        // Обновление счета
        scores[currentPlayer]++;
        saveScores();
        updateScoreDisplay();
        
        // Анимация победы
        statusDisplay.classList.add('winner-announcement');
        setTimeout(() => {
            statusDisplay.classList.remove('winner-announcement');
        }, 600);
        
        // Отключение кликов по ячейкам
        cells.forEach(cell => cell.classList.add('disabled'));
        return;
    }

    // Проверка на ничью
    if (!board.includes('')) {
        updateGameStatus(drawMessage());
        gameActive = false;
        scores.draws++;
        saveScores();
        updateScoreDisplay();
        cells.forEach(cell => cell.classList.add('disabled'));
        return;
    }

    // Смена игрока
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateGameStatus(currentPlayerDisplay());
}

// Перезапуск игры
function restartGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    
    updateGameStatus(currentPlayerDisplay());
    
    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.className = 'cell'; // Сброс всех классов
    });
}

// Сброс всего счета
function resetAllScores() {
    scores = { X: 0, O: 0, draws: 0 };
    saveScores();
    updateScoreDisplay();
}

// Добавление звуковых эффектов (опционально)
function playSound(type) {
    // Можно добавить звуковые эффекты для ходов и побед
    // const audio = new Audio(`sounds/${type}.mp3`);
    // audio.play().catch(e => console.log('Звук не может быть воспроизведен'));
}

// Клавиатурное управление
document.addEventListener('keydown', function(event) {
    if (!gameActive) return;
    
    const keyMap = {
        'Numpad7': 0, 'Numpad8': 1, 'Numpad9': 2,
        'Numpad4': 3, 'Numpad5': 4, 'Numpad6': 5,
        'Numpad1': 6, 'Numpad2': 7, 'Numpad3': 8,
        'Digit7': 0, 'Digit8': 1, 'Digit9': 2,
        'Digit4': 3, 'Digit5': 4, 'Digit6': 5,
        'Digit1': 6, 'Digit2': 7, 'Digit3': 8
    };
    
    if (keyMap.hasOwnProperty(event.code)) {
        makeMove(keyMap[event.code]);
    }
    
    // Перезапуск игры по нажатию на пробел
    if (event.code === 'Space') {
        event.preventDefault();
        restartGame();
    }
});

// Добавление подсказки о клавиатурном управлении
function showKeyboardHint() {
    const hint = document.createElement('div');
    hint.innerHTML = `
        <small style="color: #718096; margin-top: 10px; display: block;">
            💡 Подсказка: используйте цифры 1-9 для ходов, пробел для новой игры
        </small>
    `;
    document.querySelector('.container').appendChild(hint);
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    showKeyboardHint();
    
    // Добавляем возможность сброса счета двойным кликом по области счета
    document.querySelector('.score').addEventListener('dblclick', function() {
        if (confirm('Сбросить весь счет?')) {
            resetAllScores();
        }
    });
});

// Экспорт функций для возможного тестирования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        makeMove,
        restartGame,
        checkResult,
        board,
        currentPlayer,
        gameActive
    };
}
