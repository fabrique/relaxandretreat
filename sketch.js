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

let colors = ["#5AC2F6", "#FFAEEB", "#FFFD75", "#695AF6", "#FFFFFF", "#6ABE6C"];
let titleImg;

function preload() {
  weather = loadJSON(apiUrl, updateWind);
  bgImg = loadImage("assets/chateau.jpg");
  titleImg = loadImage("assets/title.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(2);

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
    let r = random(20, 60);
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
  drawingContext.save();
  drawingContext.filter = "blur(1.5px)";

  if (weather) {
    let temp = constrain(weather.main.temp, 5, 40);

    let r = 255;
    let g = lerp(200, 0, temp / 40);
    let b = 0;

    fill(r, g, b);
    textSize(40);
    textFont("JTPercy");
    text(
      `« Maastricht is ${weather.main.temp} degrees now, wind blowing: ${
        weather.wind.speed
      } m/s in direction of ${getWindDirection(weather.wind.deg)} »`,
      20,
      30
    );
  }

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
}

function updateWind(data) {
  let windAngle = radians(data.wind.deg + 180);
  windForce = p5.Vector.fromAngle(windAngle).mult(data.wind.speed * 0.1);
}

function drawFullBackground(gfx) {
  gfx.image(bgImg, 0, 0, width, height);
  drawGradientOverlay(gfx);
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
  drawTextOnBuffer(gfx);
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
  gfx.textFont("JTPercy");

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

setInterval(() => {
  // Redraw one random bubble
  let randomIndex = Math.floor(random(bubbles.length));
  console.log(bubbles);
  bubbles[randomIndex].redefine(
    random(width),
    random(height),
    random(20, 60),
    color(random(colors))
  );
}, 300);
