/*
     SmartAstro - Tetris Client-Side Controller
     Copyright (c) 2026 Alessio Saltarin & AI Assistant
     BSD License
*/

import { TetrisGame, ROWS, COLS } from '../lib/logic/tetris_logic';

// Curated colors for high-quality block gradients
function getColor(type: number): string {
    switch (type) {
        case 1: return '#06b6d4';     // 1: Cyan
        case 2: return '#facc15';     // 2: Yellow
        case 3: return '#a855f7';     // 3: Purple
        case 4: return '#10b981';     // 4: Green
        case 5: return '#ef4444';     // 5: Red
        case 6: return '#3b82f6';     // 6: Blue
        case 7: return '#f97316';     // 7: Orange
        default: return 'transparent';
    }
}

function getGradientLight(type: number): string {
    switch (type) {
        case 1: return '#67e8f9'; // 1: Cyan-300 (I)
        case 2: return '#fef08a'; // 2: Yellow-200 (O)
        case 3: return '#e9d5ff'; // 3: Purple-200 (T)
        case 4: return '#a7f3d0'; // 4: Emerald-200 (S)
        case 5: return '#fecdd3'; // 5: Rose-200 (Z)
        case 6: return '#bfdbfe'; // 6: Blue-200 (J)
        case 7: return '#fed7aa'; // 7: Orange-200 (L)
        default: return 'transparent';
    }
}

function getGradientDark(type: number): string {
    switch (type) {
        case 1: return '#0891b2'; // 1: Cyan-600
        case 2: return '#ca8a04'; // 2: Yellow-600
        case 3: return '#7e22ce'; // 3: Purple-700
        case 4: return '#047857'; // 4: Emerald-700
        case 5: return '#be123c'; // 5: Rose-700
        case 6: return '#1d4ed8'; // 6: Blue-700
        case 7: return '#c2410c'; // 7: Orange-700
        default: return 'transparent';
    }
}

const BLOCK_SIZE = 24; // 24px per block for 240x480 board
const BOARD_WIDTH = COLS * BLOCK_SIZE;   // 240px
const BOARD_HEIGHT = ROWS * BLOCK_SIZE; // 480px
const NEXT_BLOCK_SIZE = 20; // 20px per block for 100x100 preview

let game: TetrisGame | null = null;
let lastTime = 0;
let dropCounter = 0;
let animationFrameId: number | null = null;

// DOM Elements
const boardCanvasHtml = document.getElementById('tetris-board') as HTMLCanvasElement | null;
const nextCanvasHtml = document.getElementById('tetris-next') as HTMLCanvasElement | null;

const statScore = document.getElementById('stat-score');
const statLevel = document.getElementById('stat-level');
const statLines = document.getElementById('stat-lines');

// Screen Overlays
const screenStart = document.getElementById('screen-start');
const screenPaused = document.getElementById('screen-paused');
const screenGameover = document.getElementById('screen-gameover');
const gameoverFinalScore = document.getElementById('gameover-final-score');

// Buttons
const btnStartGame = document.getElementById('btn-start-game');
const btnResumeGame = document.getElementById('btn-resume-game');
const btnRestartGame = document.getElementById('btn-restart-game');
const btnPauseToggleHtml = document.getElementById('btn-pause-toggle') as HTMLButtonElement | null;
const btnResetGameHtml = document.getElementById('btn-reset-game') as HTMLButtonElement | null;

// Mobile controls
const ctrlLeft = document.getElementById('ctrl-left');
const ctrlRight = document.getElementById('ctrl-right');
const ctrlRotate = document.getElementById('ctrl-rotate');
const ctrlDown = document.getElementById('ctrl-down');
const ctrlDrop = document.getElementById('ctrl-drop');

if (boardCanvasHtml && nextCanvasHtml) {
    const ctx = boardCanvasHtml.getContext('2d');
    const nextCtx = nextCanvasHtml.getContext('2d');

    if (ctx && nextCtx) {
        initEvents(ctx, nextCtx);
    }
}

function initEvents(ctx: CanvasRenderingContext2D, nextCtx: CanvasRenderingContext2D) {
    // Start game button
    btnStartGame?.addEventListener('click', () => {
        startGame(ctx, nextCtx);
    });

    // Resume game button
    btnResumeGame?.addEventListener('click', () => {
        resumeGame(ctx, nextCtx);
    });

    // Restart/Play Again button
    btnRestartGame?.addEventListener('click', () => {
        restartGame(ctx, nextCtx);
    });

    // Sidebar buttons
    btnPauseToggleHtml?.addEventListener('click', () => {
        togglePause(ctx, nextCtx);
    });
    btnResetGameHtml?.addEventListener('click', () => {
        restartGame(ctx, nextCtx);
    });

    // Keyboard events
    window.addEventListener('keydown', (e) => {
        handleKeyDown(e, ctx, nextCtx);
    });

    // Mobile controls setup
    ctrlLeft?.addEventListener('click', () => {
        if (game && !game.paused && !game.gameOver) { game.moveLeft(); draw(ctx, nextCtx); }
    });
    ctrlRight?.addEventListener('click', () => {
        if (game && !game.paused && !game.gameOver) { game.moveRight(); draw(ctx, nextCtx); }
    });
    ctrlRotate?.addEventListener('click', () => {
        if (game && !game.paused && !game.gameOver) { game.rotate(); draw(ctx, nextCtx); }
    });
    ctrlDown?.addEventListener('click', () => {
        if (game && !game.paused && !game.gameOver) { game.moveDown(); dropCounter = 0; draw(ctx, nextCtx); }
    });
    ctrlDrop?.addEventListener('click', () => {
        if (game && !game.paused && !game.gameOver) { game.hardDrop(); dropCounter = 0; draw(ctx, nextCtx); }
    });
}

function handleKeyDown(e: KeyboardEvent, ctx: CanvasRenderingContext2D, nextCtx: CanvasRenderingContext2D) {
    if (!game || game.gameOver) return;

    // Block arrow keys and Space scrolling when game is focused and running
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'p', 'P', 'Escape'].includes(e.key)) {
        if (!game.paused || e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
            e.preventDefault();
        }
    }

    if (game.paused) {
        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
            resumeGame(ctx, nextCtx);
        }
        return;
    }

    handleGameControls(e.key, ctx, nextCtx);
}

function handleGameControls(key: string, ctx: CanvasRenderingContext2D, nextCtx: CanvasRenderingContext2D) {
    if (!game) return;

    switch (key) {
        case 'ArrowLeft':
            game.moveLeft();
            draw(ctx, nextCtx);
            break;
        case 'ArrowRight':
            game.moveRight();
            draw(ctx, nextCtx);
            break;
        case 'ArrowUp':
            game.rotate();
            draw(ctx, nextCtx);
            break;
        case 'ArrowDown':
            game.moveDown();
            dropCounter = 0; // Reset tick interval
            draw(ctx, nextCtx);
            break;
        case ' ':
            game.hardDrop();
            dropCounter = 0;
            draw(ctx, nextCtx);
            break;
        case 'p':
        case 'P':
        case 'Escape':
            pauseGame();
            break;
    }
}

function startGame(ctx: CanvasRenderingContext2D, nextCtx: CanvasRenderingContext2D) {
    game = new TetrisGame();
    
    // Hide screens
    screenStart?.classList.add('hidden');
    screenPaused?.classList.add('hidden');
    screenGameover?.classList.add('hidden');

    // Enable buttons
    if (btnPauseToggleHtml) btnPauseToggleHtml.disabled = false;
    if (btnResetGameHtml) btnResetGameHtml.disabled = false;

    // Reset loop variables
    lastTime = performance.now();
    dropCounter = 0;

    // Start loop
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame((time) => {
        update(time, ctx, nextCtx);
    });

    // Update button text
    if (btnPauseToggleHtml) {
        btnPauseToggleHtml.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pause
        `;
    }
}

function pauseGame() {
    if (!game || game.paused || game.gameOver) return;
    
    game.paused = true;
    screenPaused?.classList.remove('hidden');
    
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    if (btnPauseToggleHtml) {
        btnPauseToggleHtml.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
            Resume
        `;
    }
}

function resumeGame(ctx: CanvasRenderingContext2D, nextCtx: CanvasRenderingContext2D) {
    if (!game || !game.paused || game.gameOver) return;

    game.paused = false;
    screenPaused?.classList.add('hidden');

    lastTime = performance.now();
    dropCounter = 0;

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame((time) => {
        update(time, ctx, nextCtx);
    });

    if (btnPauseToggleHtml) {
        btnPauseToggleHtml.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pause
        `;
    }
}

function togglePause(ctx: CanvasRenderingContext2D, nextCtx: CanvasRenderingContext2D) {
    if (!game || game.gameOver) return;
    if (game.paused) {
        resumeGame(ctx, nextCtx);
    } else {
        pauseGame();
    }
}

function restartGame(ctx: CanvasRenderingContext2D, nextCtx: CanvasRenderingContext2D) {
    startGame(ctx, nextCtx);
}

function update(time: number, ctx: CanvasRenderingContext2D, nextCtx: CanvasRenderingContext2D) {
    if (!game) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter >= game.getSpeedMs()) {
        game.moveDown();
        dropCounter = 0;
    }

    draw(ctx, nextCtx);

    // Update Stats HUD
    if (statScore) statScore.textContent = String(game.score).padStart(5, '0');
    if (statLevel) statLevel.textContent = String(game.level);
    if (statLines) statLines.textContent = String(game.lines);

    if (game.gameOver) {
        if (gameoverFinalScore) gameoverFinalScore.textContent = `Final Score: ${game.score}`;
        screenGameover?.classList.remove('hidden');
        if (btnPauseToggleHtml) btnPauseToggleHtml.disabled = true;
        animationFrameId = null;
        return;
    }

    animationFrameId = requestAnimationFrame((t) => {
        update(t, ctx, nextCtx);
    });
}

// Draw a single Tetris block with premium gradients and borders
function drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, type: number, isGhost = false) {
    ctx.save();
    
    // Draw base shadow/glow
    ctx.shadowBlur = isGhost ? 0 : 4;
    ctx.shadowColor = getColor(type);

    // Rounded rectangle path for modern look
    ctx.beginPath();
    ctx.roundRect(x + 1.5, y + 1.5, size - 3, size - 3, 5);

    if (isGhost) {
        // Ghost piece: hollow, translucent dash outline
        ctx.strokeStyle = getColor(type);
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.45;
        ctx.stroke();
    } else {
        // Filled block with a premium linear vertical gradient
        const gradient = ctx.createLinearGradient(x, y, x, y + size);
        gradient.addColorStop(0, getGradientLight(type));
        gradient.addColorStop(0.3, getColor(type));
        gradient.addColorStop(1, getGradientDark(type));

        ctx.fillStyle = gradient;
        ctx.fill();

        // 3D Highlight top inner border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    ctx.restore();
}

function drawGrid(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)'; // slate-800
    ctx.lineWidth = 0.5;
    for (let c = 0; c <= COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * BLOCK_SIZE, 0);
        ctx.lineTo(c * BLOCK_SIZE, BOARD_HEIGHT);
        ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * BLOCK_SIZE);
        ctx.lineTo(BOARD_WIDTH, r * BLOCK_SIZE);
        ctx.stroke();
    }
}

function drawBoardBlocks(ctx: CanvasRenderingContext2D, activeGame: TetrisGame) {
    for (let r = 0; r < ROWS; r++) {
        const boardRow = activeGame.board.at(r);
        if (!boardRow) continue;
        for (let c = 0; c < COLS; c++) {
            const blockType = boardRow.at(c);
            if (blockType !== undefined && blockType !== 0) {
                drawBlock(ctx, c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, blockType);
            }
        }
    }
}

function drawGhostPiece(ctx: CanvasRenderingContext2D, activeGame: TetrisGame) {
    const ghostY = activeGame.getDropPosition();
    // Only draw ghost piece if it is not overlapping the current piece position
    if (ghostY > activeGame.currentPiece.y) {
        const matrix = activeGame.currentPiece.matrix;
        for (let r = 0; r < matrix.length; r++) {
            const row = matrix.at(r);
            if (!row) continue;
            for (let c = 0; c < row.length; c++) {
                const val = row.at(c);
                if (val !== undefined && val !== 0) {
                    const py = ghostY + r;
                    const px = activeGame.currentPiece.x + c;
                    if (py >= 0) {
                        drawBlock(ctx, px * BLOCK_SIZE, py * BLOCK_SIZE, BLOCK_SIZE, activeGame.currentPiece.type, true);
                    }
                }
            }
        }
    }
}

function drawCurrentPiece(ctx: CanvasRenderingContext2D, activeGame: TetrisGame) {
    const matrix = activeGame.currentPiece.matrix;
    for (let r = 0; r < matrix.length; r++) {
        const row = matrix.at(r);
        if (!row) continue;
        for (let c = 0; c < row.length; c++) {
            const val = row.at(c);
            if (val !== undefined && val !== 0) {
                const py = activeGame.currentPiece.y + r;
                const px = activeGame.currentPiece.x + c;
                if (py >= 0) {
                    drawBlock(ctx, px * BLOCK_SIZE, py * BLOCK_SIZE, BLOCK_SIZE, activeGame.currentPiece.type);
                }
            }
        }
    }
}

function drawNextPiecePreview(nextCtx: CanvasRenderingContext2D, activeGame: TetrisGame) {
    nextCtx.clearRect(0, 0, 100, 100);
    nextCtx.fillStyle = '#090d16'; // deep dark slate
    nextCtx.fillRect(0, 0, 100, 100);

    const nextMat = activeGame.nextPiece.matrix;
    const nextType = activeGame.nextPiece.type;

    // Centering calculation for 100x100 preview canvas
    const pieceWidth = nextMat.at(0)?.length || 0;
    const pieceHeight = nextMat.length;

    // Find actual bounding box dimensions to center properly
    let minR = pieceHeight, maxR = -1, minC = pieceWidth, maxC = -1;
    for (let r = 0; r < pieceHeight; r++) {
        const row = nextMat.at(r);
        if (!row) continue;
        for (let c = 0; c < pieceWidth; c++) {
            const val = row.at(c);
            if (val !== undefined && val !== 0) {
                if (r < minR) minR = r;
                if (r > maxR) maxR = r;
                if (c < minC) minC = c;
                if (c > maxC) maxC = c;
            }
        }
    }

    const actualWidth = maxC - minC + 1;
    const actualHeight = maxR - minR + 1;

    const offsetX = (100 - actualWidth * NEXT_BLOCK_SIZE) / 2 - minC * NEXT_BLOCK_SIZE;
    const offsetY = (100 - actualHeight * NEXT_BLOCK_SIZE) / 2 - minR * NEXT_BLOCK_SIZE;

    for (let r = 0; r < pieceHeight; r++) {
        const row = nextMat.at(r);
        if (!row) continue;
        for (let c = 0; c < pieceWidth; c++) {
            const val = row.at(c);
            if (val !== undefined && val !== 0) {
                const drawX = offsetX + c * NEXT_BLOCK_SIZE;
                const drawY = offsetY + r * NEXT_BLOCK_SIZE;
                drawBlock(nextCtx, drawX, drawY, NEXT_BLOCK_SIZE, nextType);
            }
        }
    }
}

function draw(ctx: CanvasRenderingContext2D, nextCtx: CanvasRenderingContext2D) {
    if (!game) return;

    drawGrid(ctx);
    drawBoardBlocks(ctx, game);
    drawGhostPiece(ctx, game);
    drawCurrentPiece(ctx, game);
    drawNextPiecePreview(nextCtx, game);
}
