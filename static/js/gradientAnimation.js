let centerValue = 255,
    rightValue = 128;
let centerDirection = -2,
    rightDirection = -1;

function animateGradient() {
    if (centerValue <= 0 || centerValue >= 255) {
        centerDirection *= -1;
    }

    if (rightValue <= 128 || rightValue >= 255) {
        rightDirection *= -1;
    }

    centerValue += centerDirection;
    rightValue += rightDirection;

    document.body.style.backgroundImage = `
        linear-gradient(45deg, rgb(0, ${centerValue}, 255) 10%, rgb(128, 0, ${rightValue}) 90%)
    `;
}

setInterval(animateGradient, 15);