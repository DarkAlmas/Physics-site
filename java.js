const input = document.getElementById("input");
const text = document.getElementById("text");
const background = document.getElementById("background");
const checkbox = document.getElementById("checkbox");

checkbox.addEventListener("change", switchMove);

let moved = true;

var example = 0;

function switchMove() {
  moved = !moved;
}

function Circle(direction) {
    this.direction = direction;
}

Circle.prototype.direction = { x: 0, y: 0 };

const toRad = Math.PI / 180;
const toDeg = 180 / Math.PI;

const minSize = 50;
const maxSize = 190;
const circles = new Map();
const squares = [];
const numCircles = 10;

var speed = 5;
var globalSpeed = 5;

var rotate = 45;

start();

function start() {
    var square = document.createElement("div");
    square.className = "square";
    
    square.style.transform = `translate(-50%, -50%) rotate(${rotate}deg)`;
    
    document.body.appendChild(square);
    
    squares.push(square);
    
    for (let i = 0; i < numCircles; i++) {
        const circle = createCircle();
        var { square: squareElement, points } = checkOverlapSquare(rotate, circle);
        while (checkOverlapCircle(circle, 10) != null || checkOverlapSquare(rotate, circle).square != null) {
            const rect = circle.getBoundingClientRect();
            const size = rect.width;
            const maxLeft = window.innerWidth - size - size / 2 - 40;
            const maxTop = window.innerHeight - size - size / 2 - 40;
            circle.style.left = `${getRandomPosition(maxLeft)}px`;
            circle.style.top = `${getRandomPosition(maxTop)}px`;
          }
          
          const circleSmall = createCircle(circle, false);
          const radius = parseInt(circle.style.width) / 2;
          circleSmall.style.width = `${radius}px`;
          circleSmall.style.height = `${radius}px`;
    
          circleSmall.style.left = `${getRandomValue(-radius / 2 + 20, radius / 2 - 20)}px`;
          circleSmall.style.top = `${getRandomValue(-radius / 2 + 20, radius / 2 - 20)}px`;
          circleSmall.style.backgroundColor = "rgb(65, 65, 65)";
          circleSmall.style.zIndex = "-1";
          circleSmall.style.filter = "blur(12px)";
          const direction = getRandomDirection();
          circleInfo = new Circle(direction);
          circles.set(circle, circleInfo);
    }
}

function getRandomDirection() {
  const x = Math.random() * 2 - 1;
  const y = Math.random() * 2 - 1;
  const length = Math.sqrt(x * x + y * y);
  const direction = { x: x / length, y: y / length};
  return direction;
}

function createCircle(parent = document.body, randomPosition = true) {
  const circle = document.createElement("div");
  const size = getRandomSize(minSize, maxSize);
  circle.className = "circle";
  circle.style.width = `${size}px`;
  circle.style.height = `${size}px`;
  circle.style.position = "absolute";
  parent.appendChild(circle);
  if (randomPosition) {
    const maxLeft = window.innerWidth - size - size / 2 - 40;
    const maxTop = window.innerHeight - size - size / 2 - 40;
    circle.style.left = `${getRandomPosition(maxLeft)}px`;
    circle.style.top = `${getRandomPosition(maxTop)}px`;
  }
  return circle;
}

function checkOverlapCircle(circle, circleMargin = 0) {
  const rect1 = circle.getBoundingClientRect();
  const radius1 = rect1.width / 2;
  const center1 = {
    x: rect1.left + radius1,
    y: rect1.top + radius1
  };

  for (const key of circles.keys()) {
    if (circle === key) {
      continue;
    }
    const rect2 = key.getBoundingClientRect();
    const radius2 = rect2.width / 2;
    const center2 = {
      x: rect2.left + radius2,
      y: rect2.top + radius2
    };

    const distance = Math.pow(center2.x - center1.x, 2) + Math.pow(center2.y - center1.y, 2);
    const radiusSum = radius1 + radius2 + circleMargin;

    if (distance <= radiusSum * radiusSum) {
      return key;
    }
  }

  return null;
}


function checkBorders(circle, borderMarginLeft = 0, borderMarginTop = 0, borderMarginRight = 0, borderMarginBottom = 0) {
  const { l1, t1, r1, b1, l2, t2, r2, b2 } = getBorders(circle, borderMarginLeft, borderMarginTop, borderMarginRight, borderMarginBottom);
  return b1 > b2 || l1 < l2 || t1 < t2 || r1 > r2;
}

function isVectorIntersectingCircle(point1, point2, circle) {
  const { x: x1, y: y1 } = point1;
  const { x: x2, y: y2 } = point2;
  
  const circleRect = circle.getBoundingClientRect();
  const circleX = circleRect.left + circleRect.width / 2;
  const circleY = circleRect.top + circleRect.height / 2;
  const radius = circleRect.width / 2;

  const cx = circleX;
  const cy = circleY;
  const r = radius;
  
  const dx = x2 - x1;
  const dy = y2 - y1;
  const px = x1 - cx;
  const py = y1 - cy;

  const a = dx * dx + dy * dy;
  const b = 2 * (dx * px + dy * py);
  const c = px * px + py * py - r * r;

  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    return false;
  }
  
  const sqrtDiscriminant = Math.sqrt(discriminant);

  const t1 = (-b + sqrtDiscriminant) / (2 * a);
  const t2 = (-b - sqrtDiscriminant) / (2 * a);

  return t1 >= 0 && t1 <= 1 || t2 >= 0 && t2 <= 1;
}

function checkOverlapSquare(rotationAngle, circle) {
    for (var square of squares) {
        square.style.transform = square.style.transform.replace(`${rotationAngle}deg`, "0deg");
        const squareRect = square.getBoundingClientRect();
        const squareX = squareRect.left + squareRect.width / 2;
        const squareY = squareRect.top + squareRect.height / 2;
        const halfSideLengthX = squareRect.width / 2;
        const halfSideLengthY = squareRect.height / 2;
  
        square.style.transform = square.style.transform.replace("0deg", `${rotationAngle}deg`);
        
        const circleRect = circle.getBoundingClientRect();
        const radius = circleRect.width / 2;
        const circleX = circleRect.left + radius;
        const circleY = circleRect.top + radius;
        const vertices = [
            { x: squareX - halfSideLengthX, y: squareY - halfSideLengthY },
            { x: squareX + halfSideLengthX, y: squareY - halfSideLengthY },
            { x: squareX + halfSideLengthX, y: squareY + halfSideLengthY },
            { x: squareX - halfSideLengthX, y: squareY + halfSideLengthY }
        ];

        const rotatedVertices = vertices.map(vertex => {
            const dx = vertex.x - squareX;
            const dy = vertex.y - squareY;
            const rotatedX = dx * Math.cos(rotationAngle * toRad) - dy * Math.sin(rotationAngle * toRad);
            const rotatedY = dx * Math.sin(rotationAngle * toRad) + dy * Math.cos(rotationAngle * toRad);
            return { x: rotatedX + squareX, y: rotatedY + squareY };
        });
    
        var collidedVectors = [];

        for (let i = 0; i < rotatedVertices.length; i++) {
            const point1 = rotatedVertices[i];
            const point2 = rotatedVertices[(i + 1) % rotatedVertices.length];
            if (isVectorIntersectingCircle(point1, point2, circle)) {
                collidedVectors.push( { point1, point2 } );
            }
        }
        
        if (collidedVectors.length > 0) {
            return { square, points: collidedVectors };
        }
    }

    return { square: null, points: null };
}

function getNormalBorder(circle, borderMarginLeft = 0, borderMarginTop = 0, borderMarginRight = 0, borderMarginBottom = 0) {
  const { l1, t1, r1, b1, l2, t2, r2, b2 } = getBorders(circle, borderMarginLeft, borderMarginTop, borderMarginRight, borderMarginBottom);
  
  if (b1 > b2 || t1 < t2)
      return { x: 1, y: 0 };
  if (l1 < l2 || r1 > r2)
      return { x: 0, y: 1 };
  
  return { x: 0, y: 0 };
}

function getBorders(circle, borderMarginLeft = 0, borderMarginTop = 0, borderMarginRight = 0, borderMarginBottom = 0) {
    const rect = circle.getBoundingClientRect();
  const { left, top, width, height } = rect;
  const left1 = left + borderMarginLeft;
  const top1 = top + borderMarginTop;
  const right1 = left + width + borderMarginRight;
  const bottom1 = top + height + borderMarginBottom;
  const left2 = 0;
  const top2 = 0;
  const right2 = window.innerWidth;
  const bottom2 = window.innerHeight;
  
  return { l1: left1, t1: top1, r1: right1, b1: bottom1, l2: left2, t2: top2, r2: right2, b2: bottom2,
  }
}

function getRandomSize(minSize, maxSize) {
  const width = getRandomValue(minSize, maxSize);
  const height = getRandomValue(minSize, maxSize);
  return Math.max(width, height);
}

function getRandomValue(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomPosition(max) {
  return Math.floor(Math.random() * max);
}

function reflectVector(directionVector, normalVector) {
  const direction = normalizeVector(directionVector);
  const normal = normalizeVector(normalVector);
  
  var directionAngle = Math.atan2(direction.y, direction.x) * toDeg;
  var normalAngle = Math.atan2(normal.y, normal.x) * toDeg;
  
  var adjacentAngle = 180 - directionAngle;
  var incidenceAngle = 180 - adjacentAngle - normalAngle;
  
  var reflectionAngle = normalAngle - incidenceAngle;
  var reflectionVector = { x: Math.cos(reflectionAngle * toRad), y: Math.sin(reflectionAngle * toRad) };
  
  return reflectionVector;
}

function normalizeVector(vector) {
  var magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  var normalizedVector = { x: vector.x / magnitude, y: vector.y / magnitude };
  return normalizedVector;
}

function getCircleReflectionVector(circle1, circle2, direction) {
    const rect1 = circle1.getBoundingClientRect();
    const rect2 = circle2.getBoundingClientRect();
    
    const radius1 = rect1.width / 2;
    const radius2 = rect2.width / 2;
                
    const x1 = rect1.left + radius1;
    const y1 = rect1.top + radius1;
                
    const x2 = rect2.left + radius2;
    const y2 = rect2.top + radius2;
                
    const directionAngle = Math.atan2(direction.y, direction.x) * toDeg;
                
    const directionCircles = normalizeVector({ x: x2 - x1, y: y2 - y1 });
                
    const circlesAngle = Math.atan2(directionCircles.y, directionCircles.x) * toDeg;
                
    const incidenceAngle = Math.abs(directionAngle - circlesAngle);
                
    const rawReflectionAngle = 180 + incidenceAngle;
                
    const reflectionAngle1 = -(rawReflectionAngle - directionAngle);
                
    const reflectionVector = { x: Math.cos(reflectionAngle1 * toRad), y: Math.sin(reflectionAngle1 * toRad) };
    
    return reflectionVector;
}

function fixedUpdate() {
    if (moved) {
        const overallSpeed = globalSpeed * (speed / 5);
        
        for (const [circle, circleInfo] of circles.entries()) {
            var { direction } = circleInfo;
            const { x, y } = direction;
            
            circle.style.left = `${parseFloat(circle.style.left) + x * overallSpeed}px`;
            circle.style.top = `${parseFloat(circle.style.top) + y * overallSpeed}px`;
            
            const circleElement = checkOverlapCircle(circle, 0);
            if (circleElement) {
                const reflectionVector = getCircleReflectionVector(circle, circleElement, direction);
                circleInfo.direction = { x: reflectionVector.x, y: reflectionVector.y  };
            }
            
            const { square: squareElement, points } = checkOverlapSquare(rotate, circle);
            
            if (squareElement) {
                let reflectionVector = direction;
                
                if (points.length === 1) {
                    const { point1, point2 } = points[0];
                    const normal = normalizeVector({ x: point2.x - point1.x, y: point2.y - point1.y });
                    reflectionVector = reflectVector(direction, normal);
                }
                
                if (points.length > 1) {
                    reflectionVector = getCircleReflectionVector(circle, squareElement, direction);
                }
                
                circleInfo.direction = { x: reflectionVector.x, y: reflectionVector.y};
            }
            
            if (checkBorders(circle, 0, 0, 20, 20)) {
                const normalVector = getNormalBorder(circle, 0, 0, 20, 20);
                const reflectionVector = reflectVector(direction, normalVector);
                circleInfo.direction = { x: reflectionVector.x, y: reflectionVector.y };
            }
        }
    }
}

function clamp(value, minValue, maxValue) {
    return Math.min(Math.max(value, minValue), maxValue);
}

var fpsCounter = document.getElementById('fps-counter');
var frameCount = 0;
var startTime = performance.now();

function updateFPS() {
    frameCount++;
    var currentTime = performance.now();
    var elapsedTime = currentTime - startTime;

    if (elapsedTime >= 1000) {
        var fps = Math.round((frameCount * 1000) / elapsedTime);
        fpsCounter.innerHTML = 'FPS: ' + fps;

        frameCount = 0;
        startTime = currentTime;
    }

    requestAnimationFrame(updateFPS);
}

updateFPS();

setInterval(fixedUpdate, globalSpeed * 2);
