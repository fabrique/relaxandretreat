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
    let blurLevel = constrain(
      floor(this.vel.mag() * 2),
      0,
      blurLevels.length - 1
    );
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.arc(this.pos.x, this.pos.y, this.r, 0, TWO_PI);
    drawingContext.clip();
    image(blurLevels[blurLevel], 0, 0, width, height); // ✅ Use precomputed blur
    drawingContext.restore();
  }

  drawRadialGradient() {
    if (!isFinite(this.pos.x) || !isFinite(this.pos.y) || !isFinite(this.r)) {
      console.warn(
        "Invalid values in drawRadialGradient:",
        this.pos.x,
        this.pos.y,
        this.r
      );
      return;
    }

    let offsetX = this.r * 0.2;
    let offsetY = this.r * -0.2;

    let gradient = drawingContext.createRadialGradient(
      this.pos.x + offsetX,
      this.pos.y + offsetY,
      this.r * 0.3,
      this.pos.x,
      this.pos.y,
      this.r * 1.5
    );

    let c1 = this.col;
    let c2 = color(red(c1), green(c1), blue(c1), 30);

    gradient.addColorStop(
      0,
      `rgba(${red(c1)}, ${green(c1)}, ${blue(c1)}, 0.5)`
    );
    gradient.addColorStop(
      0.5,
      `rgba(${red(c1)}, ${green(c1)}, ${blue(c1)}, 0.1)`
    );
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
