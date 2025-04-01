const canvas = document.getElementById("canvas"); // Canvas
const canvasContainer = document.getElementById('canvasContainer');
const canvasContext = canvas.getContext("2d"); // Canvas context to draw 

// Global variables
let canvasWidth, canvasHeight, blockSize;

// Canvas constraints 
const maxCanvasWidth = 600;
const maxCanvasHeight = 640;
const rows = 32;
const columns = 30;
let gameStarted = true; // Flag to control game state

// Pause button
let paused = false;  // flag to control the paused state
const pauseButton = document.getElementById('pauseButton');


let grassImage = document.getElementById('grass');
let flowerImage = document.getElementById('flower');
let gateUpImage = document.getElementById('gateUp');
let gateLeftImage = document.getElementById('gateLeft');
let gateRightImage = document.getElementById('gateRight');
let gateDownImage = document.getElementById('gateDown');

// Pause Button Event Listener
pauseButton.addEventListener('click', function() {
    paused = !paused;  // Toggle pause state
    
    if (paused) {
        pauseButton.textContent = '▷';  // Change button text to 'Resume'
    } else {
        pauseButton.textContent = '||';  // Change button text to 'Pause'
    }
     // Move focus away from the button so space bar doesn't toggle it
     pauseButton.blur();
});

window.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowUp' || event.key === 'w') Snake.moveUp();
    else if (event.key === 'ArrowDown' || event.key === 's' ) Snake.moveDown();
    else if (event.key === 'ArrowLeft' || event.key === 'a' ) Snake.moveLeft();
    else if (event.key === 'ArrowRight' || event.key === 'd') Snake.moveRight();
});

window.onload = function() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (screenWidth < maxCanvasWidth) {  
        canvasWidth = Math.floor(screenWidth / 30) * 30;
    } else {
        canvasWidth = maxCanvasWidth;
    }

    blockSize = canvasWidth / 30;
    canvasHeight = blockSize * 32; 
    
    if (canvasHeight > screenHeight) {
        canvasHeight = Math.floor(screenHeight / 32) * 32; 
        blockSize = canvasHeight / 32; 
        canvasWidth = blockSize * 30; 
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    canvasContainer.style.width = `${canvas.width}px`;
    canvasContainer.style.height = `${canvas.height}px`;

      //pause button size depending on canvas size
      if (canvas.width <= 200) {
        pauseButton.style.width = "5px"; // Button width
        pauseButton.style.height = "5px"; // Button height
        pauseButton.style.fontSize = "4px"; // Smaller font for screens up to 200px
    } else if (canvas.width <= 400) {
        pauseButton.style.width = "10px"; // Button width
        pauseButton.style.height = "10px"; // Button height
        pauseButton.style.fontSize = "6px"; // Smaller font for screens up to 400px
    } else if (canvas.width <= 600) {
        pauseButton.style.width = "17px"; // Button width
        pauseButton.style.height = "17px"; // Button height
        pauseButton.style.fontSize = "10px"; // Medium font for screens between 401px and 600px
    }

    let pauseX = 28 * blockSize;
    let pauseY = 0 * blockSize; // Row 0

    // Center the button within the block
    let buttonWidth = pauseButton.offsetWidth;
    let buttonHeight = pauseButton.offsetHeight;

    pauseButton.style.position = "absolute";
    pauseButton.style.left = `${canvas.offsetLeft + pauseX + (blockSize / 2) - (buttonWidth / 2)}px`;
    pauseButton.style.top = `${canvas.offsetTop + pauseY + (blockSize / 2) - (buttonHeight / 2)}px`;


    function animate() {
        if (!gameStarted) return; // Stop updating if game is over
        if(gameStarted && !paused){
        
        // Clear canvas
       // canvasContext.fillStyle = "#50C878"; // Background color
       canvasContext.fillRect(0, 0, canvas.width, canvas.height);

         // Draw the grass image 
         for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {

                if (r != 0 || r != rows - 1 || c != 0 || c != columns - 1) { 
                    canvasContext.drawImage(grassImage, c * blockSize, r * blockSize, blockSize, blockSize);
                }
            }
        }
    

    
       // Draw the border 
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                if (r === 0) { 
                   // canvasContext.fillStyle = "black"; // Black border
                    canvasContext.drawImage(gateUpImage, c * blockSize, r * blockSize, blockSize, blockSize);
                }
                if(r === rows - 1){
                    canvasContext.drawImage(gateDownImage, c * blockSize, r * blockSize, blockSize, blockSize);

                }
                if (c === 0 ){
                    canvasContext.drawImage(gateLeftImage, c * blockSize, r * blockSize, blockSize, blockSize);
                }
                if(c === columns - 1){
                    canvasContext.drawImage(gateRightImage, c * blockSize, r * blockSize, blockSize, blockSize);

                }
                if (r === 0 && c === 0 ||  r === 0 && c === 29 || r === 31 && c === 0 || r === 31 && c === 29) { 
                    canvasContext.drawImage(flowerImage, c * blockSize, r * blockSize, blockSize, blockSize);
                }
            }
        }
       
        Snake.update();
        Snake.draw();
        Food.draw();
    }
    }
   
    setInterval(animate, 1000 / 5); 
};


let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

canvas.addEventListener("touchstart", function (event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
});

canvas.addEventListener("touchmove", function (event) {
    touchEndX = event.touches[0].clientX;
    touchEndY = event.touches[0].clientY;
});

canvas.addEventListener("touchend", function () {
    let dx = touchEndX - touchStartX;
    let dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > 0) {
            Snake.moveRight();
        } else {
            Snake.moveLeft();
        }
    } else {
        // Vertical swipe
        if (dy > 0) {
            Snake.moveDown();
        } else {
            Snake.moveUp();
        }
    }
});

// Snake properties
const Snake = {
    position: { x: 5, y: 5 },
    velocity: { x: 1, y: 0 },
    length: 3,
    segments: [],
    score: 0,
    canChangeDirection: true,  // New flag to control movement updates so it doesn't collide with body if sudden backwards movement
    image: document.getElementById('snake'),
    spriteWidth: 383,
    sprideHeight: 383,


    draw() {
        this.segments.forEach((segment, i) => {
            this.setSpriteFrame(i);
            canvasContext.drawImage(this.image, segment.frameX * this.spriteWidth, segment.frameY * this.sprideHeight, this.spriteWidth, this.sprideHeight, segment.x * blockSize, segment.y * blockSize, blockSize, blockSize);
        });


        canvasContext.strokeStyle = "black";
        canvasContext.lineWidth = 3;
        let fontSize = canvas.width <= 200 ? "7px" : canvas.width <= 400 ? "11px" : "16px";
        canvasContext.font = `${fontSize} Courier`;
        canvasContext.strokeText("Score: " + this.score, blockSize, blockSize / 1.4);

        canvasContext.fillStyle = "white";
        canvasContext.fillText("Score: " + this.score, blockSize, blockSize / 1.4);
    },
    

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.segments.unshift({ x: this.position.x, y: this.position.y, frameX: 0, frameY: 0});

        if (this.segments.length > this.length) {
            this.segments.pop();
        }

        // Reset direction change flag after movement is applied
        this.canChangeDirection = true;

        // Check for boundary collisions
        if (this.position.x < 1 || this.position.x > columns - 2 || 
            this.position.y < 1 || this.position.y > rows - 2) {
            gameStarted = false;
            alert('Game Over');
        }

        // Check for self-collision
        this.segments.forEach((segment, i) => {
            if (i > 0 && segment.x === this.position.x && segment.y === this.position.y) {
                gameStarted = false;
                alert('Collided with body');
            }
        });

        // Eat food
        if (this.position.x === Food.x && this.position.y === Food.y) {
            Food.replace();
            this.length++;
            this.score++;
        }
    },

    moveUp() {
        if (this.canChangeDirection && this.velocity.y !== 1) {
            this.velocity.x = 0;
            this.velocity.y = -1;
            this.canChangeDirection = false;
        }
    },

    moveDown() {
        if (this.canChangeDirection && this.velocity.y !== -1) {
            this.velocity.x = 0;
            this.velocity.y = 1;
            this.canChangeDirection = false;
        }
    },

    moveLeft() {
        if (this.canChangeDirection && this.velocity.x !== 1) {
            this.velocity.x = -1;
            this.velocity.y = 0;
            this.canChangeDirection = false;
        }
    },

    moveRight() {
        if (this.canChangeDirection && this.velocity.x !== -1) {
            this.velocity.x = 1;
            this.velocity.y = 0;
            this.canChangeDirection = false;
        }
    },

    setSpriteFrame(index){
        const segment = this.segments[index];
        const nextSegment = this.segments[index + 1] || 0;
        const prevSegment = this.segments[index - 1] || 0;
        
        if(index === 0){ //head

            if(segment.y < nextSegment.y){ //up

                if(Food.y === segment.y - 1 && Food.x === segment.x){
                segment.frameX = 3;
                segment.frameY = 1;

                }else{
                segment.frameX = 2;
                segment.frameY = 1;
                }
                
            }else if(segment.y > nextSegment.y){ //down

                if(Food.y === segment.y + 1 && Food.x === segment.x){
                    segment.frameX = 1;
                    segment.frameY = 0;

                }else{
                    segment.frameX = 0;
                    segment.frameY = 0;

                }
            }else if(segment.x < nextSegment.x){ //left

                if(Food.x === segment.x - 1 && Food.y === segment.y){
                    segment.frameX = 1;
                    segment.frameY = 1;

                }else{
                    segment.frameX = 0;
                    segment.frameY = 1;

                }
            
            }else if(segment.x > nextSegment.x){ //right

                if(Food.x === segment.x + 1 && Food.y === segment.y){
                    segment.frameX = 3;
                    segment.frameY = 0;

                }else{
                    segment.frameX = 2;
                    segment.frameY = 0;

                }
            
            }

        }else if(index === this.segments.length - 1){ //tail
            if(prevSegment.y < segment.y){ //up
                segment.frameX = 1;
                segment.frameY = 3;
            } else if(prevSegment.y > segment.y){//down
                segment.frameX = 0;
                segment.frameY = 3;
            } else if(prevSegment.x < segment.x){ //left
                segment.frameX = 2;
                segment.frameY = 3;
            } else if(prevSegment.x > segment.x){//right
                segment.frameX = 3;
                segment.frameY = 3;
            }

        }else{ //body

            if(nextSegment.x < segment.x && prevSegment.x > segment.x){ //horizontal right
                segment.frameX = 3;
                segment.frameY = 2;

            }else if(nextSegment.x > segment.x && prevSegment.x < segment.x){ //horizontal left
                segment.frameX = 2;
                segment.frameY = 2;

            } else if(nextSegment.y > segment.y && prevSegment.y < segment.y){ //vertical up
                segment.frameX = 1;
                segment.frameY = 2;

            }else if(nextSegment.y < segment.y && prevSegment.y > segment.y){ //vertical down
                segment.frameX = 0;
                segment.frameY = 2;

            }

            //bend counter clockwise

            else if(prevSegment.x < segment.x && nextSegment.y > segment.y){ //up left
                segment.frameX = 2;
                segment.frameY = 5;

            }else if(prevSegment.y > segment.y && nextSegment.x > segment.x){ //left down
                segment.frameX = 0;
                segment.frameY = 5;

            }else if(prevSegment.x > segment.x && nextSegment.y < segment.y){ //down right
                segment.frameX = 1;
                segment.frameY = 5;

            }else if(prevSegment.y < segment.y && nextSegment.x < segment.x){ //right up
                segment.frameX = 3;
                segment.frameY = 5;

            }

            //bend clock wise
            else if(nextSegment.x < segment.x && prevSegment.y > segment.y){ //right down
                segment.frameX = 2;
                segment.frameY = 4;

            } else if(nextSegment.y < segment.y && prevSegment.x < segment.x){ //down left
                segment.frameX = 3;
                segment.frameY = 4;

            } else if(nextSegment.x > segment.x && prevSegment.y < segment.y){ //left up
                segment.frameX = 1;
                segment.frameY = 4;

            } else if(nextSegment.y > segment.y && prevSegment.x > segment.x){ //up right
                segment.frameX = 0;
                segment.frameY = 4;

            }
            
           

        }

    },

};

const Food = {
    x: Math.floor(Math.random() * (columns - 2) + 1),
    y: Math.floor(Math.random() * (rows - 2) + 1),

    image: document.getElementById('apple'),

    draw(){
        canvasContext.drawImage(this.image, this.x * blockSize, this.y * blockSize, blockSize, blockSize);
    },


    replace(){
        this.x = Math.floor(Math.random() * (columns - 2) + 1);
        this.y = Math.floor(Math.random() * (rows - 2) + 1);
    },
}
