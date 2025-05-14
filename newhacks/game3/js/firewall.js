document.addEventListener('DOMContentLoaded', () => {
    const keyboardChars = 'abcdefghijklmnpqrstuvwxyz123456789';
    let initiate = true;
    let hacking = false;
    let number = '';
    let size = 0;
    let randomX = 0;
    let randomY = 0;

    let score = 0;
    let target = 25;
    let timer = 35;
    let smalltimer = 3;
    let strikes = 0;
    let remainingSeconds = 35;
    let win = false;

    const generateCharacter = () => {
        const randomIndex = Math.floor(Math.random() * keyboardChars.length);
        return keyboardChars[randomIndex];
    };

    const circleClick = (e) => {
        if (number !== '') return;
        e.stopPropagation();
        number = generateCharacter();
        const challengerNumberElem = document.getElementById('challengerNumber');
        challengerNumberElem.innerText = number;
        challengerNumberElem.classList.remove('hidden');
    };

    const missClick = () => {
        strikes++;
        if (strikes === 3) {
            showResult(false);
            return;
        }
        resetTarget();
    };

    const startHack = () => {
        initiate = false;
        resetTarget();
        remainingSeconds = timer;
        updateStatus();
        document.getElementById('initiate').classList.add('hidden');
        document.getElementById('firewall-container').classList.remove('hidden');
    };

    const resetTarget = () => {
        size = getRandomNumber(10, 80); // Ensuring a minimum size for better visibility
        const container = document.querySelector('.fw-targetGround');
        const maxWidth = container.clientWidth - size;
        const maxHeight = container.clientHeight - size;

        // Ensuring the circle stays within the container's bounds
        randomY = getRandomNumber(0, maxHeight);
        randomX = getRandomNumber(0, maxWidth);

        document.getElementById('targetCircle').style.width = `${size}px`;
        document.getElementById('targetCircle').style.height = `${size}px`;
        document.getElementById('targetCircle').style.left = `${randomX}px`;
        document.getElementById('targetCircle').style.top = `${randomY}px`;
        document.getElementById('challengerNumber').classList.add('hidden');
        number = '';
    };

    const getRandomNumber = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    const updateStatus = () => {
        document.getElementById('strikes').innerText = strikes;
        document.getElementById('score').innerText = score;
        document.getElementById('target').innerText = target;
        document.getElementById('remainingSeconds').innerText = remainingSeconds;
    };

    const showResult = (success) => {
        hacking = false;
        document.getElementById('firewall-container').classList.add('hidden');
        document.getElementById('initiate').classList.remove('hidden');
        if (success) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'You have successfully completed the game.',
            }).then(() => {
                location.reload();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Failed!',
                text: 'You have failed the game. Try again!',
            }).then(() => {
                location.reload();
            });
        }
    };

    document.getElementById('targetCircle').addEventListener('click', circleClick);
    document.getElementById('missClick').addEventListener('click', missClick);
    document.getElementById('startButton').addEventListener('click', startHack);
    document.getElementById('close').addEventListener('click', () => {
        Swal.fire({
            icon: 'info',
            title: 'Info',
            text: 'The game has been closed.',
        }).then(() => {
            location.reload();
        });
    });

    document.addEventListener('keydown', (event) => {
        if (number === '') return;
        if (event.key.toLowerCase() === number) {
            score++;
            if (score >= target) {
                win = true;
                showResult(true);
                return;
            }
            smalltimer = 3;
        } else {
            strikes++;
            if (strikes >= 3) {
                showResult(false);
                return;
            }
            smalltimer = 3;
        }
        resetTarget();
        updateStatus();
    });

    setInterval(() => {
        if (!initiate) {
            remainingSeconds--;
            smalltimer--;
            if (remainingSeconds <= 0 && !win) {
                showResult(false);
            }
            if (smalltimer <= 0) {
                missClick();
                smalltimer = 3;
            }
            updateStatus();
        }
    }, 1000);
});
