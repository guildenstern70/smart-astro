/*

     SmartAstro
     A web template for modern websites
     Copyright (c) 2025-26 Alessio Saltarin
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
        hintDiv.classList.remove("bg-green-100", "text-green-800", "bg-red-100", "text-red-800", "bg-blue-100", "text-blue-800", "border-indigo-100");
        hintDiv.innerHTML = "";
        setTimeout(() => {
            hintDiv.classList.remove("spinner");
            if (guessed > 0 && guessed < MAX_NUMBER + 1) {
                const result = guess(guessed, guessNumber);
                hintDiv.innerHTML = result;
                if (result.includes("Correct") || result.includes("win")) {
                    hintDiv.classList.add("bg-green-100", "text-green-800");
                } else {
                    hintDiv.classList.add("bg-blue-100", "text-blue-800");
                }
            } else {
                hintDiv.innerHTML = "Please type a number between 1 and 10";
                hintDiv.classList.add("bg-red-100", "text-red-800");
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
