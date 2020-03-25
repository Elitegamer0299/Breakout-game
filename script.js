var canvas = document.getElementById('gameArea');
var context = canvas.getContext('2d');

var drawInterval = null;
var start = false;
var pause = false;
var y = canvas.height - 20;
var dx = 2;
var dy = -2;
var ballRadius = 10;
var paddleHeight = 10;
var paddleWidth = 75;
var paddleX = Math.floor(Math.random()*(canvas.width - paddleWidth));
var x = paddleX + paddleWidth/2;
var rightPressed = false;
var leftPressed = false;
var lives = 3;
var brickRows = 5;
var brickColumns = 8;
var brickWidth = 50;
var brickHeight = 15;
var brickPadding = 4;
var brickOffsetTop = 60;
var brickOffsetLeft = 26;
var totalScore = 0;
var score = 0;
var level = 1;

var bricks = [];


// Event listeners

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

// Fucntions

function initializeBricks() {
    for(var c = 0; c < brickColumns; c++) {
        bricks[c] = [];
        for(var r = 0; r < brickRows; r++) {
            bricks[c][r] = {
                x: 0,
                y: 0,
                status: 1
            }
            totalScore += 3;
        }
    }
}

function drawBricks() {
    for(var c = 0; c < brickColumns; c++) {
        for(var r = 0; r < brickRows; r++) {
            if(bricks[c][r].status < 3) {
                var bricksX = (c * (brickWidth+brickPadding)) + brickOffsetLeft;
                var bricksY = (r * (brickHeight+brickPadding)) + brickOffsetTop;
                bricks[c][r].x = bricksX;
                bricks[c][r].y = bricksY;
                context.beginPath();
                context.rect(bricksX, bricksY, brickWidth, brickHeight);
                if(bricks[c][r].status === 1) {
                    context.fillStyle = "#0095DD";
                } else if(bricks[c][r].status === 2) {
                    context.fillStyle = "#f80000";
                }
                context.fill();
                context.closePath();
            }
        }
    }
}

function keyDownHandler(e) {
    if(e.keyCode === 39) {
        rightPressed = true;
    } else if(e.keyCode === 37) {
        leftPressed = true;
    } else if(e.keyCode === 32) {
        if(!start) {
            start = true;
            keyDownHandler(e);
        }
        intervalManager();
    }
}

function intervalManager() {
    if(!pause) {
        cancelAnimationFrame(drawInterval);
        drawPause();
        pause = true;
    } else if(pause) {
        drawInterval = requestAnimationFrame(draw);
        pause = false;
    }
}

function keyUpHandler(e) {
    if(e.keyCode === 39) {
        rightPressed = false;
    } else if(e.keyCode === 37) {
        leftPressed = false;
    }
}

function drawBall() {
    context.beginPath();
    context.arc(x, y, ballRadius, 0, Math.PI*2);
    context.fillStyle = "#0095DD";
    context.fill();
    context.closePath();
}

function drawPaddle() {
    context.beginPath();
    context.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
    context.fillStyle = "#0095DD";
    context.fill();
    context.closePath();
}

function drawPause() {
    context.font = "25px sans-serif";
    context.fillStyle = "green";
    context.fillText("Paused", canvas.width/2 - 50, 180);
}

function collisionDetection() {
    for(var c = 0; c < brickColumns; c++) {
        for(var r = 0; r < brickRows; r++) {
            var b = bricks[c][r];
            if(b.status < 3) {
                var radius = (b.x-x+(brickWidth/2))*(b.x-x+(brickWidth/2)) + (b.y-y+(brickHeight/2))*(b.y-y+(brickHeight/2));
                if(Math.sqrt(radius) === ballRadius+Math.sqrt((brickHeight*brickHeight/4)+(brickWidth*brickWidth/4))) {
                    dx = -dx;
                    dy = -dy;
                    score += b.status;
                    b.status++;
                    if(score === totalScore) {
                        gameWon();
                    }
                } else if(y+ballRadius >= b.y && y-ballRadius <= b.y+brickHeight) {
                    if((x+ballRadius <= b.x && x+ballRadius+dx >= b.x) || (x-ballRadius >= b.x+brickWidth && x-ballRadius+dx <= b.x+brickWidth)) {
                        dx = -dx;
                        score += b.status;
                        b.status++;
                        if(score === totalScore) {
                            gameWon();
                        }
                    }
                } else if(x+ballRadius >= b.x && x-ballRadius <= b.x+brickWidth) {
                    if((y-ballRadius >= b.y+brickHeight && y-ballRadius+dy <= b.y+brickHeight) || (y+ballRadius <= b.y && y+ballRadius+dy >= b.y)) {
                        dy = -dy;
                        score += b.status;
                        b.status++;
                        if(score === totalScore) {
                            gameWon();
                        }
                    }
                }
            }  
        }
    }
}

function drawScore() {
    context.font = "16px sans-serif";
    context.fillStyle = "#0095DD";
    context.fillText("Score: "+score, 8, 20);
}

function drawLives() {
    context.font = "16px sans-serif";
    context.fillStyle = "#0095DD";
    context.fillText("Lives: "+lives, canvas.width-65, 20);
}

function drawLevel() {
    context.font = "16px sans-serif";
    context.fillStyle = "#0095DD";
    context.fillText("Level: "+level, canvas.width/2-30, 20)
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawScore();
    drawLevel();
    drawLives();
    drawBall();
    drawPaddle();
    drawBricks();
    collisionDetection();

    if(rightPressed && paddleX < canvas.width-paddleWidth) {
        if(!start) x += 5;
        paddleX += 5;
    } else if(leftPressed && paddleX > 0) {
        if(!start) x -= 5;
        paddleX -= 5;
    }

    if(start) {
        if((x+ballRadius+dx) > canvas.width || (x-ballRadius+dx) < 0) {
            dx = -dx;
        }
        if((y-ballRadius+dy) < 30) {
            dy = -dy;
        } else if((y+dy+ballRadius) >= canvas.height) {
            if(x+(ballRadius/2) >= paddleX && x-(ballRadius/2) <= (paddleX + paddleWidth)) {
                dy = -dy;
            } else {
                dy = -dy;
                lives--;
                if(!lives) {
                    gameOver();
                } else {
                    x = canvas.width/2;
                    y = canvas.height-20;
                    dx = 2;
                    dy = -2;
                    paddleX = (canvas.width-paddleWidth)/2;
                    start = false;
                }
            }
        }
        x += dx;
        y += dy;
    }

    drawInterval = requestAnimationFrame(draw);
}

document.addEventListener("mousemove", mouseMoveHandler);

function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > paddleWidth/2 && relativeX < (canvas.width - paddleWidth/2)) {
        paddleX = relativeX - paddleWidth/2;
        if(!start) x = relativeX;
    }
}

function startGame() {
    start = false;
    if(level === 1) {
        brickRows = 5;
    } else if(level === 2) {
        brickRows = 7;
    } else if(level === 3) {
        brickRows = 9;
    }
    initializeBricks();
    draw();
    drawInterval = requestAnimationFrame(draw);
}

function gameWon() {
    if(level < 3) {
        alert("You Cleared level: " + level + "\n Move on to next level");
        level++;
    } else {
        alert("YOU WIN!!\n Congratulations!!\n Total Score: " + score);
        document.location.reload();
    }
    cancelAnimationFrame(drawInterval);
    x = (canvas.width-paddleWidth)/2;
    y = canvas.height-20;
    dx = 2;
    dy = -2;
    startGame();
}

function gameOver() {
    alert("GAME OVER!!\n Your score was: " + score);
    cancelAnimationFrame(drawInterval);
    x = (canvas.width-paddleWidth)/2;
    y = canvas.height-20;
    dx = 2;
    dy = -2;
    document.location.reload();
}

startGame();