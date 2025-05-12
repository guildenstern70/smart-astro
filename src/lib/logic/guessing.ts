/*

     SmartAstro
     A web template for modern websites
     Copyright (c) 2025 Alessio Saltarin
     BSD License

 */

export const guess = (guess: number, numberToGuess: number): string => {
    let message = "";
    if (numberToGuess > guess) {
        message = "The number I thought is greater than " + guess;
    } else if (numberToGuess < guess) {
        message = "The number I thought is lower than " + guess;
    } else if (numberToGuess === guess) {
        message = "You guessed!";
    }
    console.log(message);
    return message;
};