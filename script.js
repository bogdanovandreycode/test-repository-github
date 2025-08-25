// Игровые переменные
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'pvp'; // 'pvp' для игрок против игрока, 'ai' для игрок против AI
let aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
let isAITurn = false;
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
    if (gameMode === 'ai' && currentPlayer === 'O') {
        return 'Ход AI (O)...';
    }
    return `Ход игрока: ${currentPlayer}`;
}

function winningMessage() {
    if (gameMode === 'ai' && currentPlayer === 'O') {
        return 'AI победил!';
    }
    return `Игрок ${currentPlayer} победил!`;
}

function drawMessage() {
    return `Ничья!`;
}

// Установка режима игры
function setGameMode(mode) {
    gameMode = mode;
    
    // Обновление кнопок режима
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (mode === 'pvp') {
        document.querySelectorAll('.mode-btn')[0].classList.add('active');
        document.getElementById('difficultySelector').style.display = 'none';
    } else {
        document.querySelectorAll('.mode-btn')[1].classList.add('active');
        document.getElementById('difficultySelector').style.display = 'block';
    }
    
    restartGame();
}

// Установка сложности AI
function setAIDifficulty() {
    aiDifficulty = document.getElementById('aiDifficulty').value;
}

// AI логика
class TicTacToeAI {
    // Оценка позиции для минимакса
    static evaluate(board) {
        // Проверка на победу
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a] === 'O' ? 10 : -10;
            }
        }
        return 0;
    }
    
    // Алгоритм минимакс
    static minimax(board, depth, isMaximizing, alpha = -Infinity, beta = Infinity) {
        const score = this.evaluate(board);
        
        // Если игра закончена
        if (score === 10) return score - depth;
        if (score === -10) return score + depth;
        if (!board.includes('')) return 0;
        
        // Ограничение глубины для производительности
        if (depth > 6) return 0;
        
        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    const evaluation = this.minimax(board, depth + 1, false, alpha, beta);
                    board[i] = '';
                    maxEval = Math.max(maxEval, evaluation);
                    alpha = Math.max(alpha, evaluation);
                    if (beta <= alpha) break;
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    const evaluation = this.minimax(board, depth + 1, true, alpha, beta);
                    board[i] = '';
                    minEval = Math.min(minEval, evaluation);
                    beta = Math.min(beta, evaluation);
                    if (beta <= alpha) break;
                }
            }
            return minEval;
        }
    }
    
    // Получение лучшего хода
    static getBestMove(board, difficulty) {
        const availableMoves = [];
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                availableMoves.push(i);
            }
        }
        
        if (availableMoves.length === 0) return -1;
        
        switch (difficulty) {
            case 'easy':
                // Легкий: случайный ход с небольшой вероятностью хорошего хода
                if (Math.random() < 0.3) {
                    return this.getOptimalMove(board);
                }
                return availableMoves[Math.floor(Math.random() * availableMoves.length)];
                
            case 'medium':
                // Средний: блокирует победы игрока, иногда делает оптимальные ходы
                const blockingMove = this.getBlockingMove(board);
                if (blockingMove !== -1) return blockingMove;
                
                const winningMove = this.getWinningMove(board);
                if (winningMove !== -1) return winningMove;
                
                if (Math.random() < 0.7) {
                    return this.getOptimalMove(board);
                }
                return availableMoves[Math.floor(Math.random() * availableMoves.length)];
                
            case 'hard':
                // Сложный: всегда оптимальный ход
                return this.getOptimalMove(board);
                
            default:
                return this.getOptimalMove(board);
        }
    }
    
    // Получение оптимального хода через минимакс
    static getOptimalMove(board) {
        let bestMove = -1;
        let bestValue = -Infinity;
        
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                const moveValue = this.minimax(board, 0, false);
                board[i] = '';
                
                if (moveValue > bestValue) {
                    bestMove = i;
                    bestValue = moveValue;
                }
            }
        }
        
        return bestMove;
    }
    
    // Поиск выигрышного хода
    static getWinningMove(board) {
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                if (this.evaluate(board) === 10) {
                    board[i] = '';
                    return i;
                }
                board[i] = '';
            }
        }
        return -1;
    }
    
    // Поиск блокирующего хода
    static getBlockingMove(board) {
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                if (this.evaluate(board) === -10) {
                    board[i] = '';
                    return i;
                }
                board[i] = '';
            }
        }
        return -1;
    }
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
    if (board[cellIndex] !== '' || !gameActive || isAITurn) {
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

// Ход AI
function makeAIMove() {
    if (!gameActive || gameMode !== 'ai' || currentPlayer !== 'O') {
        return;
    }
    
    isAITurn = true;
    updateGameStatus('AI думает...');
    
    // Небольшая задержка для реалистичности
    setTimeout(() => {
        const aiMove = TicTacToeAI.getBestMove([...board], aiDifficulty);
        
        if (aiMove !== -1 && board[aiMove] === '') {
            board[aiMove] = 'O';
            cells[aiMove].innerHTML = 'O';
            cells[aiMove].classList.add('o');
            
            // Анимация хода AI
            cells[aiMove].style.animation = 'celebration 0.3s ease-in-out';
            setTimeout(() => {
                cells[aiMove].style.animation = '';
            }, 300);
        }
        
        isAITurn = false;
        checkResult();
    }, Math.random() * 500 + 300); // Случайная задержка от 300 до 800мс
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
    
    // Если сейчас ход AI, запускаем его
    if (gameMode === 'ai' && currentPlayer === 'O' && gameActive) {
        setTimeout(() => makeAIMove(), 100);
    }
}

// Перезапуск игры
function restartGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    isAITurn = false;
    
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
    if (!gameActive || isAITurn) return;
    
    const keyMap = {
        'Numpad7': 0, 'Numpad8': 1, 'Numpad9': 2,
        'Numpad4': 3, 'Numpad5': 4, 'Numpad6': 5,
        'Numpad1': 6, 'Numpad2': 7, 'Numpad3': 8,
        'Digit7': 0, 'Digit8': 1, 'Digit9': 2,
        'Digit4': 3, 'Digit5': 4, 'Digit6': 5,
        'Digit1': 6, 'Digit2': 7, 'Digit3': 8
    };
    
    if (keyMap.hasOwnProperty(event.code)) {
        // В режиме AI разрешаем ходы только игроку X
        if (gameMode === 'ai' && currentPlayer === 'O') return;
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
            💡 Подсказка: используйте цифры 1-9 для ходов, пробел для новой игры<br>
            🤖 Выберите режим "Игрок vs AI" для игры против компьютера
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
