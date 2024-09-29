// SURVIVOR \\
const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight; // Fullscreen
var gridSize = 50;
//const characterRadius = 10;
const movementSpeed = 5;
var minutesPassed = 0;
var gameObjectSpawnCountID = 0;

//Input Direction Bools
var LEFT = false; 
var RIGHT = false;
var UP = false;
var DOWN = false;

var activeGameObjects = [];


/////FUNCTIONS\\\

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    for (let x = -player.x % gridSize; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for (let y = -player.y % gridSize; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.strokeStyle = '#ddd';
    ctx.stroke();
}

function getDistanceBetweenObjects(origin, target){
    let dx = (target.x) - origin.x;
    let dy = (target.y) - origin.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    return distance;
}

//#region ///// PLAYER INPUT EventListeners \\\\\
document.onkeydown = function(e) {
	if(e.key == "ArrowLeft"  || e.key == "a") LEFT = true;
	if(e.key == "ArrowRight" || e.key == "d") RIGHT = true;
    if(e.key == "ArrowUp"    || e.key == "w") UP = true;
	if(e.key == "ArrowDown"  || e.key == "s") DOWN = true;
}
document.onkeyup = function(e) {
	if(e.key == "ArrowLeft" || e.key == "a") LEFT = false;
	if(e.key == "ArrowRight"|| e.key == "d") RIGHT = false;
    if(e.key == "ArrowUp"   || e.key == "w") UP = false;
	if(e.key == "ArrowDown" || e.key == "s") DOWN = false;
}
//#endregion

class Player{
    constructor(){
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.characterRadius=10;
        this.speed = 3;
        this.attack = 5;
        this.defence = 5;
        this.focus = null;

        //this.spawnGameObject();
    }

    /*spawnGameObject(){
        activeGameObjects.push(this);
    }*/

    drawPlayer() {
        //ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, this.characterRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.closePath();
    }

    playerMoveInput() {
        if(LEFT) { 
            player.x -= this.speed;
        }
        if(RIGHT) {
            player.x += this.speed;	
        }
        if(DOWN) { 
            player.y += this.speed;
        }
        if(UP) {
            player.y -= this.speed;	
        }
    }

    findClosestTarget(){
        let closestObj=null;
        let range=this.characterRadius*3;
        activeGameObjects.forEach(activeObj => {
            if (activeObj == this) return null;
            let currentDist = getDistanceBetweenObjects({x:this.x+(canvas.width/2), y:this.y+(canvas.height/2)}, activeObj);
            if(currentDist < range) {
                range=currentDist;
                player.focus=activeObj;
                activeGameObjects.splice(activeGameObjects.indexOf(player.focus),1);
                console.log("Target "+activeObj.id+" found and destroyed.");
            }
        });
        return closestObj;
    }
}

class GameObject{
    constructor(){
        this.id = gameObjectSpawnCountID;
        this.x = (Math.random()*canvas.width)+canvas.width/2;
        this.y = Math.random()*canvas.height+canvas.height/2;
        this.characterRadius=10;
        this.speed = 1;
        this.attack = 5;
        this.defence = 5;     
        this.spawnGameObject(); 
    }

    spawnGameObject(){
        activeGameObjects.push(this);
        gameObjectSpawnCountID+=1;
    }

    drawObject() {
        ctx.beginPath();
        ctx.arc(this.x-player.x, this.y-player.y, this.characterRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    }

    moveTowardsTarget(target) {
        let dx = (target.x + (canvas.width/2) ) - this.x;
        let dy = (target.y + (canvas.height/2) ) - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let nextStepPos = {
            x:(dx / distance) * this.speed,
            y:(dy / distance) * this.speed
        };
        if (distance > (target.characterRadius*1.8) ){   //If object is not already inside player char
            if (this.isBlockedByObj(nextStepPos) == false){ //If not colliding, move
                this.x += nextStepPos.x;
                this.y += nextStepPos.y;
            }
            else{
                //if colliding, do nothing?
            }
        }
    }

    //CHECK IF OBJECT IS IN DIRECTION OF MOVEMENT INSTEAD
    isBlockedByObj(nextStepVector){
        let isBlocked = false;
        let nextPos = {
            x:this.x + nextStepVector.x, 
            y:this.y + nextStepVector.y
        };
        activeGameObjects.forEach(activeObj => {
            if (activeObj == this) return;
            let distance = getDistanceBetweenObjects(nextPos, activeObj);
            if(distance < this.characterRadius*2) isBlocked=true;
        });
        return isBlocked;
    }

    isColliding(){
        let isColliding = false;
        activeGameObjects.forEach(activeObj => {
            if (activeObj == this) return;

            let dist = getDistanceBetweenObjects(this, activeObj);
            if (dist < this.characterRadius*2) isColliding=true;
        });
        
        return isColliding;
    }

    

}

var player = new Player();  //Create Player Object
var enemy = new GameObject();   //Init and Spawn enemy game onbject
/*var enemy2 = new GameObject();
var enemy3 = new GameObject();
var enemy4 = new GameObject();*/

function update() {
    drawGrid(); //Draw the grid
    player.drawPlayer();
    player.playerMoveInput();   //Updates Player Character 
    player.findClosestTarget();

    activeGameObjects.forEach(activeObject => {
        activeObject.drawObject();
        activeObject.moveTowardsTarget(player);
    });

    //Every Minute
    if(Math.round(document.timeline.currentTime/1000)%10 == 0){
        minutesPassed+=1;
        new GameObject();
        console.log("SPAWNING");
        //Spawn 5 enemeis
    } 


    //Draw GUI Text
    let guiText = (Math.round(document.timeline.currentTime/1000)+" Seconds\nx:"+player.x+"\ny:"+player.y);
    ctx.fillText(guiText, 10, 15);
    //LOOP
    requestAnimationFrame(update);
}

update();
