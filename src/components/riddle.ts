/*

     SmartAstro
     A web template for modern websites
     Copyright (c) 2025 Alessio Saltarin
     BSD License

 */

import { guess } from '../lib/logic/guessing';

const MAX_NUMBER = 10;
const THINKING_TIME = 2000; // 2 seconds

let guessNumber = Math.floor(Math.random() * MAX_NUMBER);
console.log("The number I thought is: " + guessNumber);

const formEl: HTMLFormElement | null = document.getElementById("guessform") as HTMLFormElement;
const guessedNumberEl: HTMLInputElement | null = document.getElementById("guessnumber") as HTMLInputElement;
const hintDiv: HTMLDivElement | null = document.getElementById("hint") as HTMLDivElement;

if (formEl && guessedNumberEl) {
    guessedNumberEl.addEventListener('input', () => {
        hintDiv.innerHTML = "";
        guessNumberEvent(guessedNumberEl);
    });
    formEl.addEventListener('submit', (event) =>
    {
        event.preventDefault();
        hintDiv.innerHTML = "";
        guessNumberEvent(guessedNumberEl);
    });
}

const game = (guessed: number)=> {
    if (hintDiv) {
        hintDiv.classList.add("spinner");
        setTimeout(() => {
            hintDiv.classList.remove("spinner");
            if (guessed > 0 && guessed < MAX_NUMBER + 1) {
                hintDiv.innerHTML = guess(guessed, guessNumber);
            } else {
                hintDiv.innerHTML = "Please type a number between 1 and 10";
            }
        }, THINKING_TIME);
    }
}

const guessNumberEvent = (numberInput: HTMLInputElement) => {
    const numberString = numberInput.value;
    if (numberString.length < 1) return;
    game(parseInt(numberString));
    numberInput.disabled = false;
    numberInput.focus();
}
