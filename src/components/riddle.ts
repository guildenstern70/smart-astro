/*

     SmartAstro
     A web template for modern websites
     Copyright (c) 2025 Alessio Saltarin
     BSD License

 */

let guessNumber = Math.floor(Math.random() * 10);
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

function riddle(guess: number): string {
    let message = "";
    if (guessNumber > guess) {
        message = "The number I thought is greater than " + guess;
    } else if (guessNumber < guess) {
        message = "The number I thought is lower than " + guess;
    } else if (guessNumber === guess) {
        message = "You guessed!";
    }
    console.log(message);
    return message;
}

function game(guess: number) {
    if (hintDiv) {
        hintDiv.classList.add("spinner");
        setTimeout(() => {
            hintDiv.classList.remove("spinner");
            if (guess > 0 && guess < 11) {
                hintDiv.innerHTML = riddle(guess);
            } else {
                hintDiv.innerHTML = "Please type a number between 1 and 10";
            }
        }, 2200);
    }
}

function guessNumberEvent(numberInput: HTMLInputElement) {
    const numberString = numberInput.value;
    if (numberString.length < 1) return;
    game(parseInt(numberString));
    numberInput.disabled = false;
    numberInput.focus();
}
