/*
  This JS file is used for the random walk herd immunity simulation.
  It uses a factory to create x# (balls) -> ballCap to represent a population
  and then once a virus is added to the system it slowly spreads whenever a ball
  with covid comes in contact with a ball that has covid.
  
  To spead to a ball said ball has to collide with another ball, after a collision a balls immunity 
  is increased but there is also a probability they could get sick or die. Once immunity reaches a
  threshold you can nolonger get sick but you can still spread the virus
*/

// Ballpit is a const that holds the dim of the area
// The area is calcuated based off the screen size
const ballpit = {
  width: document.documentElement.clientWidth,
  height: document.documentElement.clientHeight - document.getElementById("navbar").offsetHeight,
  left: document.getElementById("ballpit").offsetLeft,
  top: document.getElementById("navbar").offsetHeight
};

// Array of Balls - holds all the balls after they are created
let balls = [];
// ballCap is the population or number of balls the program will create
let ballCap = 1000;
// totalSick is a runnning total of the number of balls that got sick from the virus
let totalSick = 0;

// randomPOS returns a object that has two random coords, based off the the screen size
function randomPOS(){
  return {
    x: Math.floor(Math.random() * ballpit.width),
    y: Math.floor(Math.random() * (ballpit.height - 70) + 70)
  }
}
/* Ball Objects
    id: unique identifier - (Number)
    x: x coord of the ball - (Number)
    y: y coord of the ball - (Number)
    color: color of the ball - (String)
    size: size of the ball in px - (Number)
    alive: is the ball interacting with the rest of the sim - (Boolean)
    hasCovid: is the ball carrying the virus - (Boolean)
    isSick: is the ball actively sick - (Boolean)
    immunity: the immunity lvl to the virus - (Float)
    velocity - Object for x (Number) & y (Number) velocity 
*/
function createBall(color){
  let startXY = randomPOS();
  balls.push({
    id: balls.length + 1,
    x: startXY.x,
    y: startXY.y,
    color: color,
    size: 15,
    alive: true,
    hasCovid: false,
    isSick: false,
    immunity: 0,
    velocity: {
      x: Math.floor(Math.random() * 5) + 1,
      y: Math.floor(Math.random() * 5) + 1
    }
  });
  return balls[balls.length - 1];
}

/* getTotal: takes a ball key and returns the number of times
   that key's element is true for all balls

   Input - key: (String)
   Returns - (Number)
*/
function getTotal(key){
  let count = 0;
  balls.forEach((ball) => {
    if(ball[key]) count++;
  });
  return count;
}

// getImmunity: returns the total of immune balls
function getImmunity(){
  let count = 0;
  balls.forEach((ball) => {
    if(ball.immunity > 100) count++;
  });
  return count;
}
// updateBallStats - updates all the stat text spans
function updateBallStats(){
  let alive = getTotal("alive");
  document.getElementById("ballTotal").textContent = alive;
  document.getElementById("covidTotal").textContent = getTotal("hasCovid");
  document.getElementById("sickTotal").textContent = totalSick;
  document.getElementById("deathTotal").textContent = ballCap - alive;
  document.getElementById("immuneTotal").textContent = getImmunity();
}
/* Collided - checks to see if a ball collided with any other balls
    Input - ball (Object)
*/
function collided(ball){
  balls.forEach((b) => {
    let bsize = b.size/2 + ball.size/2;
    
    if(b.id !== ball.id && Math.abs(b.x - ball.x) <= bsize && Math.abs(b.y - ball.y) <= bsize && b.hasCovid && b.alive && ball.immunity < 100){
      ball.hasCovid = true;
      ball.immunity += Math.random() * 10;;
      ball.color = "yellow";
      if(Math.random() < .01 && ball.immunity < 80){
        totalSick++;
        if(Math.random() < .07){
          ball.alive = false,
          ball.color = "black"
        }else {
          ball.isSick = true;
          ball.color = "red";
        }
      }
    }
  });
}

// getRandom: Input - step (Number) | Returns Random Step
function getRandom(step) {
  return Math.random() * 2 * step - step;
}

/* updatePosition
    Takes in a ball, sees if the ball collides with another ball,
    then check to see if the ball collides with an edge

    Calls updateBall to redraw the ball's location.
*/
function updatePosition(ball){
  collided(ball);
  if(ball.immunity >= 100){
    ball.color = "green";
    ball.isSick = false;
  }
  if (ball.x + ball.velocity.x > ballpit.width) {
    ball.x = ballpit.width - 50;
  } else if(ball.x + ball.velocity.x < ballpit.left ){
    ball.x = 50;
  } else {
    ball.x += getRandom(ball.velocity.x);
  }
  if (ball.y + ball.velocity.y > ballpit.height){
    ball.y = ballpit.height - 50;
  } else if (ball.y + ball.velocity.y < ballpit.top){
    ball.y = 80;
  } else {
    ball.y += getRandom(ball.velocity.y);
  }
  updateBall(ball);
}

// updateAllPOS - updates the position for every ball in balls
function updateAllPOS(){
  balls.forEach((ball) => {
    if(ball.alive) updatePosition(ball);
  });
}
/* addBall
    takes a color and creates a new ball and ball div
    Input - color (String)
*/
function addBall (color) {
  if (balls.length < ballCap){
    let ball = createBall(color);
    let newBall = document.createElement("div");
    newBall.id = "ball_"+ ball.id;
    newBall.style.zIndex = 5;
    newBall.style.position = "absolute";
    newBall.style.left = ball.x + "px";
    newBall.style.top = ball.y + "px";
    newBall.style.width = ball.size + "px";
    newBall.style.height = ball.size + "px";
    newBall.style.borderRadius = "50%";
    newBall.style.background = color;
    document.getElementById("ballpit").append(newBall);
  }
}
/* updateBall
    takes a ball and updates its style (position and color)
*/
function updateBall(ball){
  let ballDiv = document.getElementById("ball_" + ball.id);
  ballDiv.style.left = ball.x + "px";
  ballDiv.style.top = ball.y + "px";
  ballDiv.style.width = ball.size + "px";
  ballDiv.style.height = ball.size + "px";
  ballDiv.style.background = ball.color;
}
// reset - empties balls, ballpit, and renables covidButton
function reset(){
  balls = [];
  document.getElementById("ballpit").innerHTML = '';
  ballFactory();
  document.getElementById("covidButton").disabled = false;
}
// releaseCovid - give the last ball in balls covid, and
// disables the covidButton
function releaseCovid(){
  balls[balls.length - 1].hasCovid = true;
  document.getElementById("covidButton").disabled = true;
}

// ballFactory - creates balls = to the ballCap and addes them 
// to the balls array
function ballFactory(){
  for(let i = 0; i <= ballCap; i++){
    addBall("blue");
  }
}
ballFactory();
setInterval(updateAllPOS, 30)
setInterval(updateBallStats, 30)