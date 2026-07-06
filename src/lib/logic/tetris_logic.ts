/*
     SmartAstro - Tetris Logic Engine
     Copyright (c) 2026 Alessio Saltarin & AI Assistant
     BSD License
*/

export const ROWS = 20;
export const COLS = 10;

export const SHAPES = [
    [], // 0: Empty
    // 1: I piece (Cyan)
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    // 2: O piece (Yellow)
    [
        [2, 2],
        [2, 2]
    ],
    // 3: T piece (Purple)
    [
        [0, 3, 0],
        [3, 3, 3],
        [0, 0, 0]
    ],
    // 4: S piece (Green)
    [
        [0, 4, 4],
        [4, 4, 0],
        [0, 0, 0]
    ],
    // 5: Z piece (Red)
    [
        [5, 5, 0],
        [0, 5, 5],
        [0, 0, 0]
    ],
    // 6: J piece (Blue)
    [
        [6, 0, 0],
        [6, 6, 6],
        [0, 0, 0]
    ],
    // 7: L piece (Orange)
    [
        [0, 0, 7],
        [7, 7, 7],
        [0, 0, 0]
    ]
];

export const COLORS = [
    'transparent', // 0
    '#06b6d4',     // 1: Cyan
    '#facc15',     // 2: Yellow
    '#a855f7',     // 3: Purple
    '#10b981',     // 4: Green
    '#ef4444',     // 5: Red
    '#3b82f6',     // 6: Blue
    '#f97316'      // 7: Orange
];

export interface Piece {
    matrix: number[][];
    x: number;
    y: number;
    type: number;
}

export class TetrisGame {
    board: number[][];
    score: number;
    lines: number;
    level: number;
    gameOver: boolean;
    paused: boolean;
    currentPiece!: Piece;
    nextPiece!: Piece;

    constructor() {
        this.board = this.createBoard();
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.spawnPiece();
    }

    createBoard(): number[][] {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    getRandomPiece(): Piece {
        const type = Math.floor(Math.random() * 7) + 1;
        const matrix = JSON.parse(JSON.stringify(SHAPES[type]));
        // Center the piece horizontally. For 10 columns:
        // I piece is 4x4 matrix, O is 2x2, others are 3x3
        const width = matrix[0].length;
        const x = Math.floor((COLS - width) / 2);
        const y = type === 1 ? -1 : 0; // standard starting offset for better appearance
        return { matrix, x, y, type };
    }

    spawnPiece() {
        if (!this.nextPiece) {
            this.currentPiece = this.getRandomPiece();
            this.nextPiece = this.getRandomPiece();
        } else {
            this.currentPiece = this.nextPiece;
            this.nextPiece = this.getRandomPiece();
        }

        // Check if piece has spawned in a collision state immediately -> game over
        if (this.checkCollision(this.currentPiece.matrix, this.currentPiece.x, this.currentPiece.y)) {
            this.gameOver = true;
        }
    }

    checkCollision(matrix: number[][], offsetX: number, offsetY: number): boolean {
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] !== 0) {
                    const nextX = offsetX + c;
                    const nextY = offsetY + r;

                    // Check bounds
                    if (nextX < 0 || nextX >= COLS || nextY >= ROWS) {
                        return true;
                    }

                    // Check locked board cells (negative Y values are OK as spawning area)
                    if (nextY >= 0 && this.board[nextY][nextX] !== 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    rotateMatrix(matrix: number[][]): number[][] {
        const n = matrix.length;
        const rotated = Array.from({ length: n }, () => Array(n).fill(0));
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                rotated[c][n - 1 - r] = matrix[r][c];
            }
        }
        return rotated;
    }

    rotate() {
        if (this.gameOver || this.paused) return;

        const rotated = this.rotateMatrix(this.currentPiece.matrix);
        
        // Wall kick offsets to try: centered, shift left 1, shift right 1, shift left 2, shift right 2
        // If it's an I piece, we also try moving up 1 or 2 since it has a larger width
        const kicks = [0, -1, 1, -2, 2];
        if (this.currentPiece.type === 1) {
            // Include vertical kick options for the long piece
            kicks.push(-1, -2);
        }

        for (const dx of kicks) {
            if (!this.checkCollision(rotated, this.currentPiece.x + dx, this.currentPiece.y)) {
                this.currentPiece.matrix = rotated;
                this.currentPiece.x += dx;
                return;
            }
        }
    }

    moveLeft() {
        if (this.gameOver || this.paused) return;
        if (!this.checkCollision(this.currentPiece.matrix, this.currentPiece.x - 1, this.currentPiece.y)) {
            this.currentPiece.x--;
        }
    }

    moveRight() {
        if (this.gameOver || this.paused) return;
        if (!this.checkCollision(this.currentPiece.matrix, this.currentPiece.x + 1, this.currentPiece.y)) {
            this.currentPiece.x++;
        }
    }

    moveDown(): boolean {
        if (this.gameOver || this.paused) return false;
        if (!this.checkCollision(this.currentPiece.matrix, this.currentPiece.x, this.currentPiece.y + 1)) {
            this.currentPiece.y++;
            return true;
        } else {
            this.lockPiece();
            return false;
        }
    }

    getDropPosition(): number {
        let testY = this.currentPiece.y;
        while (!this.checkCollision(this.currentPiece.matrix, this.currentPiece.x, testY + 1)) {
            testY++;
        }
        return testY;
    }

    hardDrop() {
        if (this.gameOver || this.paused) return;
        const dropY = this.getDropPosition();
        // Add score for hard drop distance
        const dropDistance = dropY - this.currentPiece.y;
        this.score += dropDistance * 2;
        this.currentPiece.y = dropY;
        this.lockPiece();
    }

    lockPiece() {
        const matrix = this.currentPiece.matrix;
        const px = this.currentPiece.x;
        const py = this.currentPiece.y;

        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] !== 0) {
                    const boardY = py + r;
                    const boardX = px + c;
                    
                    // If piece locks above visible screen -> game over
                    if (boardY < 0) {
                        this.gameOver = true;
                    } else {
                        this.board[boardY][boardX] = this.currentPiece.type;
                    }
                }
            }
        }

        if (!this.gameOver) {
            this.clearLines();
            this.spawnPiece();
        }
    }

    clearLines() {
        let linesCleared = 0;

        for (let r = ROWS - 1; r >= 0; r--) {
            // Check if row is completely filled (no 0s)
            const isRowFull = this.board[r].every(val => val !== 0);
            if (isRowFull) {
                // Remove row and add empty row at top
                this.board.splice(r, 1);
                this.board.unshift(Array(COLS).fill(0));
                linesCleared++;
                r++; // Repeat check for same index since lines shifted down
            }
        }

        if (linesCleared > 0) {
            this.lines += linesCleared;
            
            // Standard Nintendo scoring system scaled by level
            // 1 line: 100, 2 lines: 300, 3 lines: 500, 4 lines (Tetris!): 800
            const scoreValues = [0, 100, 300, 500, 800];
            const baseScore = scoreValues[Math.min(linesCleared, 4)] || 800;
            this.score += baseScore * this.level;

            // Level up every 10 lines
            const nextLevel = Math.floor(this.lines / 10) + 1;
            if (nextLevel > this.level) {
                this.level = nextLevel;
            }
        }
    }

    // Get drop interval in milliseconds based on level
    // Speed increases as level increases
    getSpeedMs(): number {
        return Math.max(100, 1000 - (this.level - 1) * 90);
    }
}
