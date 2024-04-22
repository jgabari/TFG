// Get the canvas context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const display = document.getElementById("money");

// Variables
let user = "";
let password = "";
let squares = [];
let squares_encoded = "";
let squareSize = 100;
let x = 0;
let y = 0;
let brightness = 128;
let money = 1000;

function getCookie(name) {
    let name_eq = name + "=";
    let cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.startsWith(name_eq)) {
            return cookie.substring(name_eq.length);
        }
        
    }
    return null;
}

function reDraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    squares.forEach(square => {
        ctx.fillStyle = `rgb(0, ${square.brightness}, 0)`;
        ctx.fillRect(square.x, square.y, squareSize, squareSize);
        //squares.push({ x, y, brightness });
    });
}

function noMoney(money) {
    if (money <= 0) {
        alert("You're out of money! Game Over");
        return;
    }
}

// Initial situation
user = getCookie("user");
password = getCookie("password");
money = getCookie("money");
console.log("user: " + user);
console.log("password: " + password);
console.log("money: " + money);
squares_encoded = getCookie("progress");
if (squares_encoded) {
    squares = JSON.parse(squares_encoded);
    x = squares[squares.length - 1].x;
    y = squares[squares.length - 1].y;
}
if (squares.length == 0) {
    squares.push({x, y, brightness});
}
reDraw();
display.innerHTML = money;

// New square button
document.getElementById("new_btn").addEventListener("click", function() {
    // Check if a square is too dark to continue and display an alert in that case
    let improvementRequired = false;
    squares.forEach(square => {
        if (square.brightness <= 30) {
            improvementRequired = true;
        }
    });
    if (improvementRequired) {
        alert("A square is too dark to continue! Improve your project.");
        improvementRequired = false;
        // The rest of the function does not execute
        return;
    }
    // If no improvement is needed
    squares.forEach(square => {
            square.brightness -= 30;
    });
    x += squareSize;
    // Check if there is enough space for the new square
    if (x + squareSize > canvas.width) {
        if (y + squareSize >= canvas.height) {
            alert("Congrats! Your project is complete.");
            return;
        }
        x = 0;
        y += squareSize;
    }
    // Aply the price
    money -= 10;
    display.innerHTML = money;
    // Add the new square and redraw the canvas
    squares.push({x, y, brightness});
    reDraw();
    noMoney(money);
});

// Improvement button
document.getElementById("improve_btn").addEventListener("click", function() {
    // Increase brightness of all the squares
    squares.forEach(square => {
        if (square.brightness < 235) {
            square.brightness += 30;
        }
        money -= 5;
    });
    display.innerHTML = money;
    reDraw();

});

// Save & exit button
document.getElementById("save_btn").addEventListener("click", function() {
    fetch('/saveexit?money='+money, {
        method: "POST",
        body: JSON.stringify(squares),
        headers: {"Content-Type": "application/json"}
    })
    .catch(error => {
        console.log("ERROR: " + error);
    });
})