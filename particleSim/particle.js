var canvas = document.querySelector('canvas');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var c = canvas.getContext('2d');

var mouse = {
    x: undefined,
    y: undefined
}

var maxRadius = 30;

window.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener('resize', function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

var circleArray = [];

for(var i = 0; i < 3000; i++){
    var radius = Math.random() * 3 + 1;
    var x = Math.random() * (innerWidth - radius * 2) + radius;
    var y = Math.random() * (innerHeight - radius * 2) + radius;
    var dx = (Math.random() - 0.5);
    var dy = (Math.random() - 0.5);

    circleArray.push(new Circle(x, y, dx, dy, radius));
}

function Circle(x, y, dx, dy, radius) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.minRadius = radius;
    var r = Math.random() * 256;
    var g = Math.random() * 256;
    var b = Math.random() * 256;

    this.draw = function() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = `rgb(${r}, ${g}, ${b})`;
        c.fill();
    } 

    this.update = function(){
        if (this.x + this.radius > innerWidth || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
    
        if (this.y + this.radius > innerHeight || this.y - this.radius < 0) {
            this.dy = -this.dy;
        }
        this.x += this.dx;
        this.y += this.dy;

        // Magnet effect
    var magnet = document.getElementById('magnetInput').value;
    var velocity = document.getElementById('velocityInput').value;
    var power = document.getElementById('powerInput').value;

        if (mouse.x - this.x < magnet 
            && mouse.x - this.x > -magnet
            && mouse.y - this.y < magnet
            && mouse.y - this.y > -magnet) {
                // Move the circle towards the mouse cursor
                var angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);
                this.dx += Math.cos(angle) * power;
                this.dy += Math.sin(angle) * power;
        } else {
            // Gradually reduce the velocity added by the magnet effect
            this.dx *= velocity;
            this.dy *= velocity;
        }

        this.draw();
    }
}

console.log(circleArray);

function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, innerWidth, innerHeight);

    for(var i = 0 ; i < circleArray.length; i++){
        circleArray[i].update();
    }
}
animate();
