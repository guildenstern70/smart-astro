/*

     SmartAstro
     A web template for modern websites
     Copyright (c) 2025 Alessio Saltarin
     BSD License

 */

import { describe, it, expect } from 'vitest';
import { guess } from './guessing';

describe('guess', () => {
    it('should return a message that the number is greater when the guess is too low', () => {
        const guessNumber = 5;
        const guessed = 3;
        const result = guess(guessed, guessNumber);
        expect(result).toBe('The number I thought is greater than 3');
    });

    it('should return a message that the number is lower when the guess is too high', () => {
        const guessNumber = 5;
        const guessed = 7;
        const result = guess(guessed, guessNumber);
        expect(result).toBe('The number I thought is lower than 7');
    });

    it('should return a success message when the guess is correct', () => {
        const guessNumber = 5;
        const guessed = 5;
        const result = guess(guessed, guessNumber);
        expect(result).toBe('You guessed!');
    });
});
