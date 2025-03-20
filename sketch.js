// ✅ Global Variables
let bubbles = [];
let weather;
let apiKey = '33ce41172974df39fe3e630c84c82abb';
let city = 'Maastricht,nl';
let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
let windForce; // ✅ Store wind vector force
let bgImg, preRenderedBg, blurLevels = [];
let bgLoaded = false, titleLoaded = false; // ✅ Track loading status

let colors = ["#5AC2F6", "#FFAEEB", "#FFFD75", "#695AF6", "#FFFFFF", "#6ABE6C"];

// ✅ Fetch weather data
function preload() {
  weather = loadJSON(apiUrl, updateWind);

  bgImg = loadImage("assets/chateau.jpg", () => {
    console.log("✅ Background image loaded.");
    bgLoaded = true;
    checkIfImagesReady(); // ✅ Check if both images are ready
  }, () => console.error("❌ Failed to load background image."));
  
  titleImg = loadImage("assets/title.png", () => {
    console.log("✅ Title image loaded.");
    titleLoaded = true;
    checkIfImagesReady(); // ✅ Check if both images are ready
  }, () => console.error("❌ Failed to load title image."));
}

let titleImg;

function checkIfImagesReady() {
  if (bgLoaded && titleLoaded) {
    console.log("✅ All images loaded, running setup.");
    setup(); // ✅ Only start `setup()` when both images are ready
  }
}

function setup() {
  if (!bgLoaded || !titleLoaded) {
    console.warn("⚠️ Images not fully loaded, skipping setup.");
    return; // ✅ Exit if images are not ready
  }

  createCanvas(windowWidth, windowHeight);
  preRenderedBg = createGraphics(width, height);
  drawFullBackground(preRenderedBg);

  // ✅ Precompute Multiple Blur Levels Once
  for (let i = 0; i <= 5; i++) {
    let blurCanvas = createGraphics(width, height);
    blurCanvas.image(preRenderedBg, 0, 0, width, height);
    blurCanvas.filter(BLUR, i * 2);
    blurLevels.push(blurCanvas);
  }
}

function getWindDirection(degrees) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

  let adjustedDegrees = (degrees - 90 + 360) % 360; // ✅ Adjust to match p5.js physics
  let index = Math.round(adjustedDegrees / 45) % 8;

  console.log(`🌍 API Wind Degree: ${degrees}° → Adjusted: ${adjustedDegrees}° → Direction: ${directions[index]}`);
  
  return directions[index];
}




function draw() {
  image(preRenderedBg, 0, 0, width, height);
  // ✅ Apply a single blur pass over all bubbles
  drawingContext.save();
  drawingContext.filter = "blur(1.5px)"; // ✅ Reduced blur intensity
  
  for (let b of bubbles) {
    if (windForce && frameCount % 2 === 0) { // ✅ Apply wind every x frames
        b.applyForce(windForce);
    }
    b.move();
    b.blurBackground();
    b.display();
}


  drawingContext.filter = "none"; // ✅ Reset blur after drawing
  drawingContext.restore();

  // ✅ Display Weather Info
  if (weather) {
    let temp = constrain(weather.main.temp, 5, 40); // ✅ Keep temperature between 0°C and 30°C

    // ✅ Define color transition: Yellow (255, 200, 0) → Red (255, 0, 0)
    let r = 255;
    let g = lerp(200, 0, temp / 40); // ✅ Green decreases as temp rises
    let b = 0;

    fill(r, g, b); // ✅ Apply dynamic color
    textSize(24);
    textFont('JTPercy');
    text(`« Maastricht is ${weather.main.temp} degrees now, wind blowing: ${weather.wind.speed} m/s in direction of ${getWindDirection(weather.wind.deg)} »`, 20, 30);

    console.log(`🌡️ Temp: ${temp}°C → Text Color: rgb(${r}, ${g.toFixed(0)}, ${b})`);
}

}


// ✅ Convert Wind Direction & Speed to a Force Vector
function updateWind(data) {
  let windAngle = radians(data.wind.deg + 180); // ✅ Flip to match p5.js physics
  windForce = p5.Vector.fromAngle(windAngle).mult(data.wind.speed * 0.1); // ✅ Reduce wind effect
}


// ✅ Draw Full Background (Fix missing function)
function drawFullBackground(gfx) {
  gfx.image(bgImg, 0, 0, width, height);
  drawGradientOverlay(gfx);
  if (titleImg && titleImg.width) {
    let maxWidth = (width * 0.9); // ✅ Limit max width to screen width
    let scaleFactor = maxWidth / titleImg.width; // ✅ Calculate scaling factor
    let newHeight = titleImg.height * scaleFactor; // ✅ Keep aspect ratio

    gfx.image(titleImg, (width - maxWidth) / 2, height / 2 - newHeight / 2, maxWidth, newHeight);
  } else {
    console.warn("⚠️ titleImg is not loaded yet, skipping draw.");
  }
  drawTextOnBuffer(gfx);

}

// ✅ Linear Gradient Overlay
function drawGradientOverlay(gfx) {
  let gradient = gfx.drawingContext.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(1, "rgba(247, 163, 18, 0.4)");
  gradient.addColorStop(0, "rgba(45, 137, 212, 0.4)");

  gfx.drawingContext.fillStyle = gradient;
  gfx.noStroke();
  gfx.rect(0, 0, width, height);
}

// ✅ Draw Text So It Gets Blurred Inside Bubbles
function drawTextOnBuffer(gfx) {
  
  gfx.fill(255);
  gfx.textFont('JTPercy');

  gfx.textAlign(LEFT);
  gfx.textSize(28);
  gfx.text("Château-St-Gerlach", 40, height - 70);

  gfx.textFont("FKGrotesk");
  gfx.textSize(16);
  gfx.text("Joseph Corneli Allee 1, 6301 KK Valkenburg", 40, height - 40);

  gfx.textAlign(CENTER);
  gfx.text("Fabrique Trip", width / 2, height - 40);

  gfx.textAlign(RIGHT);
  gfx.text("04.04.2025 — 06.04.2025", width - 40, height - 40);
  
}

// ✅ Bubble Class with Optimized Blur Effect
class Bubble {
  constructor(x, y, r, col) {
    this.pos = createVector(x, y);
    this.r = r || random(10, 50);
    this.vel = createVector(0, 0); // ✅ Bubbles start at rest

    this.acc = createVector(0, 0); // ✅ Initialize acceleration
    this.col = col || color(255, 150);
  }

  applyForce(force) {
    if (!force || force.mag() < 0.05) return;
    this.vel.add(force); // ✅ Apply wind to velocity
}


  move() {
    this.vel.add(this.acc);
    this.vel.limit(3);
    this.pos.add(this.vel);
    // this.acc.mult(0);    
    // this.edges();
  }

  edges() {
    if (this.pos.x + this.r > width) {
        this.pos.x = width - this.r;
        this.vel.x *= -1;
    } 
    if (this.pos.x - this.r < 0) {
        this.pos.x = this.r;
        this.vel.x *= -1;
    } 
    if (this.pos.y + this.r > height) {
        this.pos.y = height - this.r;
        this.vel.y *= -1;
    } 
    if (this.pos.y - this.r < 0) {
        this.pos.y = this.r;
        this.vel.y *= -1;
    }
}


  blurBackground() {
    let blurLevel = constrain(floor(this.vel.mag() * 2), 0, blurLevels.length - 1);
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.arc(this.pos.x, this.pos.y, this.r, 0, TWO_PI);
    drawingContext.clip();
    image(blurLevels[blurLevel], 0, 0, width, height); // ✅ Use precomputed blur
    drawingContext.restore();
  }

  drawRadialGradient() {
    if (!isFinite(this.pos.x) || !isFinite(this.pos.y) || !isFinite(this.r)) {
      console.warn("Invalid values in drawRadialGradient:", this.pos.x, this.pos.y, this.r);
      return;
    }

    let offsetX = this.r * 0.2;
    let offsetY = this.r * -0.2;

    let gradient = drawingContext.createRadialGradient(
      this.pos.x + offsetX, this.pos.y + offsetY, this.r * 0.3,
      this.pos.x, this.pos.y, this.r * 1.5
    );

    let c1 = this.col;
    let c2 = color(red(c1), green(c1), blue(c1), 30);

    gradient.addColorStop(0, `rgba(${red(c1)}, ${green(c1)}, ${blue(c1)}, 0.5)`);
    gradient.addColorStop(0.5, `rgba(${red(c1)}, ${green(c1)}, ${blue(c1)}, 0.1)`);
    gradient.addColorStop(1, `rgba(${red(c2)}, ${green(c2)}, ${blue(c2)}, 0)`);

    drawingContext.fillStyle = gradient;
    ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
  }

  display() {
    noStroke();
    drawingContext.save();
    drawingContext.filter = "blur(3px)";
    fill(this.col);
    this.drawRadialGradient();
    drawingContext.filter = "none";
    drawingContext.restore();
  }
}

setInterval(() => {
  if (bubbles.length >= 10) {
    console.log("💥 Resetting bubbles!"); // ✅ Debug message
    bubbles = []; // ✅ Clears all bubbles
  }

  let col = color(random(colors));
  col.setAlpha(150);
  bubbles.push(new Bubble(random(width), random(height), random(10, 300), col)); // ✅ Bubble size
}, 300); // ✅ Bubble appears every x seconds


// function mousePressed() {
//   let col = color(random(colors));
//   col.setAlpha(150);
//   bubbles.push(new Bubble(mouseX, mouseY, random(10, 300), col)); // ✅ Spawn at mouse click position
// }

function mouseMoved() {
  for (let i = bubbles.length - 1; i >= 0; i--) {
      let b = bubbles[i];
      let d = dist(mouseX, mouseY, b.pos.x, b.pos.y);
      
      if (d < b.r) {
          console.log(`💥 Popped bubble at x=${b.pos.x}, y=${b.pos.y}`);
          bubbles.splice(i, 1); // ✅ Remove only one bubble
          break; // ✅ Stop the loop after removing one
      }
  }
}
