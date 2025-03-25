let bubbles = [];
let weather;
let apiKey = "33ce41172974df39fe3e630c84c82abb";
let city = "Maastricht,nl";
let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
let windForce;
let bgImg,
  preRenderedBg,
  blurLevels = [];
let bgLoaded = false,
  titleLoaded = false;
let percy = "JTPercy";

let colors = ["#5AC2F6", "#FFAEEB", "#FFFD75", "#695AF6", "#FFFFFF", "#6ABE6C"];
let titleImg;

function preload() {
  weather = loadJSON(apiUrl, updateWind);
  bgImg = loadImage("assets/chateau.jpg");
  titleImg = loadImage("assets/title.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  preRenderedBg = createGraphics(width, height);
  drawFullBackground(preRenderedBg);

  for (let i = 0; i <= 5; i++) {
    let blurCanvas = createGraphics(width, height);
    blurCanvas.image(preRenderedBg, 0, 0, width, height);
    blurCanvas.filter(BLUR, i * 2);
    blurLevels.push(blurCanvas);
  }

  // Initialize bubbles
  for (let i = 0; i < 10; i++) {
    let x = random(width);
    let y = random(height);
    let r = random(20, 300);
    let col = color(random(colors));
    col.setAlpha(150);
    bubbles.push(new Bubble(x, y, r, col));
  }
}

function getWindDirection(degrees) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  let adjustedDegrees = (degrees - 90 + 360) % 360; // ✅ Adjust to match p5.js physics
  let index = Math.round(adjustedDegrees / 45) % 8;
  return directions[index];
}

function draw() {
  image(preRenderedBg, 0, 0, width, height);

  // Draw the link text
  text('Agenda', textX, textY);
  
  // Draw underline
  let textWidthValue = textWidth('Agenda');
  stroke(255);
  line(textX, textY + 5, textX + textWidthValue, textY + 5);

  drawingContext.save();
  drawingContext.filter = "blur(1.5px)";
  for (let b of bubbles) {
    if (windForce && frameCount % 2 === 0) {
      b.applyForce(windForce);
    }
    b.move();
    b.blurBackground();
    b.display();
  }
  drawingContext.filter = "none";
  drawingContext.restore();

  if (imgVisible) {
    drawImageOnTop();
  }
}

function drawBubbles() {
  // Example function to draw bubbles
  fill(100, 150, 255, 150);
  noStroke();
  for (let i = 0; i < 10; i++) {
    ellipse(random(width), random(height), 20, 20);
  }
}

function drawImageOnTop() {
  // Use the stored position and dimensions to draw the image
  image(agendaImg, imgX, imgY, imgWidth, imgHeight);
}

function mousePressed() {
  // Check if the mouse is over the text
  let textWidthValue = textWidth('Agenda');
  let textHeight = textSize(); // Use textSize to get the height of the text
  if (mouseX > textX && mouseX < textX + textWidthValue && mouseY > textY - textHeight && mouseY < textY) {
    imgVisible = !imgVisible;
  }

  // Check if the image is visible and if the mouse is over the image
  if (imgVisible) {
    if (mouseX > imgX && mouseX < imgX + imgWidth && mouseY > imgY && mouseY < imgY + imgHeight) {
      imgVisible = false;
    }
  }
}

function updateWind(data) {
  let windAngle = radians(data.wind.deg + 180);
  windForce = p5.Vector.fromAngle(windAngle).mult(data.wind.speed * 0.1);
}

function drawFullBackground(gfx) {
  gfx.image(bgImg, 0, 0, width, height);
  drawGradientOverlay(gfx);
  drawTextOnBuffer(gfx);
  if (titleImg && titleImg.width) {
    let maxWidth = width * 0.9;
    let scaleFactor = maxWidth / titleImg.width;
    let newHeight = titleImg.height * scaleFactor;

    gfx.image(
      titleImg,
      (width - maxWidth) / 2,
      height / 2 - newHeight / 2,
      maxWidth,
      newHeight
    );
  } else {
    console.warn("⚠️ titleImg is not loaded yet, skipping draw.");
  }
}

function drawGradientOverlay(gfx) {
  let gradient = gfx.drawingContext.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(1, "rgba(247, 163, 18, 0.4)");
  gradient.addColorStop(0, "rgba(45, 137, 212, 0.4)");

  gfx.drawingContext.fillStyle = gradient;
  gfx.noStroke();
  gfx.rect(0, 0, width, height);
}

function drawTextOnBuffer(gfx) {
  gfx.fill(255);
  gfx.textFont(percy);

  gfx.textAlign(LEFT);
  gfx.textSize(28);
  gfx.text("Château-St-Gerlach", 40, height - 70);

  gfx.textFont("FKGrotesk");
  gfx.textSize(16);
  gfx.text("Joseph Corneli Allee 1, 6301 KK Valkenburg", 40, height - 40);

  gfx.textAlign(CENTER);
  gfx.text("Fabrique trip 2025", width / 2, height - 40);

  gfx.textAlign(RIGHT);
  gfx.text("04.04.2025 — 06.04.2025", width - 40, height - 40);

  if (weather) {
    let temp = constrain(weather.main.temp, 5, 40);

    let r = 255;
    let g = lerp(200, 0, temp / 40);
    let b = 0;

    gfx.textAlign(LEFT);
    gfx.fill(r, g, b);
    gfx.textSize(28);
    gfx.textFont("JTPercy");
    gfx.text(
      `« Maastricht is ${weather.main.temp} degrees now, wind blowing: ${
        weather.wind.speed
      } m/s in direction of ${getWindDirection(weather.wind.deg)} »`,
      30,
      50
    );
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Recreate the background graphics at new size
  preRenderedBg = createGraphics(width, height);
  drawFullBackground(preRenderedBg);
}

setInterval(() => {
  // Redraw one random bubble
  let randomIndex = Math.floor(random(bubbles.length));
  console.log(bubbles);
  bubbles[randomIndex].redefine(
    random(width),
    random(height),
    random(20, 350),
    color(random(colors))
  );
}, 300);
