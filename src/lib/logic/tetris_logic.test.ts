/*
     SmartAstro - Tetris Logic Engine Tests
     Copyright (c) 2026 Alessio Saltarin & AI Assistant
     BSD License
*/

import { describe, it, expect } from 'vitest';
import { TetrisGame, ROWS, COLS } from './tetris_logic';

describe('TetrisGame Logic', () => {
    it('should initialize with correct empty board and state', () => {
        const game = new TetrisGame();
        expect(game.board.length).toBe(ROWS);
        expect(game.board[0].length).toBe(COLS);
        expect(game.score).toBe(0);
        expect(game.lines).toBe(0);
        expect(game.level).toBe(1);
        expect(game.gameOver).toBe(false);
        expect(game.paused).toBe(false);
        expect(game.currentPiece).toBeDefined();
        expect(game.nextPiece).toBeDefined();
    });

    it('should detect boundary collisions correctly', () => {
        const game = new TetrisGame();
        // A simple 2x2 block
        const block = [
            [2, 2],
            [2, 2]
        ];

        // Collision with left wall
        expect(game.checkCollision(block, -1, 0)).toBe(true);
        expect(game.checkCollision(block, 0, 0)).toBe(false);

        // Collision with right wall (COLS is 10, width of block is 2)
        expect(game.checkCollision(block, 9, 0)).toBe(true);
        expect(game.checkCollision(block, 8, 0)).toBe(false);

        // Collision with bottom boundary (ROWS is 20)
        expect(game.checkCollision(block, 0, 19)).toBe(true);
        expect(game.checkCollision(block, 0, 18)).toBe(false);
    });

    it('should detect collisions with locked board blocks', () => {
        const game = new TetrisGame();
        // Add a block to the board
        game.board[18][4] = 3;

        const simpleBlock = [[1]];

        // Collides directly on top of the block at (4, 18)
        expect(game.checkCollision(simpleBlock, 4, 18)).toBe(true);
        // Does not collide next to it
        expect(game.checkCollision(simpleBlock, 3, 18)).toBe(false);
        expect(game.checkCollision(simpleBlock, 4, 17)).toBe(false);
    });

    it('should rotate matrix clockwise correctly', () => {
        const game = new TetrisGame();
        // T-piece representation (3x3)
        const tPiece = [
            [0, 3, 0],
            [3, 3, 3],
            [0, 0, 0]
        ];
        const rotated = game.rotateMatrix(tPiece);
        // After clockwise rotation, it should look like:
        // [0, 3, 0]
        // [0, 3, 3]
        // [0, 3, 0]
        expect(rotated).toEqual([
            [0, 3, 0],
            [0, 3, 3],
            [0, 3, 0]
        ]);
    });

    it('should lock pieces and spawn new ones', () => {
        const game = new TetrisGame();
        game.currentPiece = {
            matrix: [[2, 2], [2, 2]],
            x: 4,
            y: 18,
            type: 2
        };

        const oldNextType = game.nextPiece.type;
        const result = game.moveDown();
        // Should return false because it collides with bottom (since y=18 + height=2 is 20, which is ROWS)
        // and triggers locking the piece.
        expect(result).toBe(false);
        expect(game.board[18][4]).toBe(2);
        expect(game.board[18][5]).toBe(2);
        expect(game.board[19][4]).toBe(2);
        expect(game.board[19][5]).toBe(2);
        expect(game.currentPiece.type).toBe(oldNextType);
    });

    it('should clear full lines and update score and lines counts', () => {
        const game = new TetrisGame();
        
        // Fill row 19 completely except one cell
        for (let c = 0; c < COLS; c++) {
            game.board[19][c] = 1;
        }
        
        // Let's clear row 19 by putting a piece on it
        // Check board initially has full line
        expect(game.board[19].every(cell => cell !== 0)).toBe(true);

        game.clearLines();
        
        // After clearing, lines cleared should be 1
        expect(game.lines).toBe(1);
        expect(game.score).toBe(100); // 100 * Level 1
        // Row 19 is now cleared and pushed down (filled with 0s)
        expect(game.board[19].every(cell => cell === 0)).toBe(true);
    });
});
