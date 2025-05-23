flakey = {};

let CurrentNumberData = [];
let MinigameActive = false;
let CurrentNumber = 1;
let timer = 23
let timeLeft = 0;
let error = false;

window.addEventListener('message', (event) => {
    let e = event.data;

    switch (e.action) {
        case 'show':
            timer = e.time;
            flakey.StartMinigame();
            break;
        case 'reset':
            flakey.ResetMinigame();
            break;
    }
});

$(document).ready(function(){
    timer = 60;
    flakey.StartMinigame();
});

flakey.ResetMinigame = function () {
    CurrentNumberData = [];
    CurrentNumber = 1;
    MinigameActive = false;
    $('.inner-bar').css('background-color', '#69ea00ab');
    $('.inner-bar').css('width', '100%');
}

flakey.StartMinigame = function () {
    CurrentNumberData = [];
    CurrentNumber = 1;

    $('.ui-container').fadeIn(1000, () => {
        for (let i = 0; i < 20; i++) {
            let data = { number: i + 1, complete: false }
            CurrentNumberData.push(data);
        }

        MinigameActive = true;

        flakey.ShuffleNumbers(CurrentNumberData);

        setTimeout(() => {
            flakey.ProgressBar(timer, timer, $('.progress-bar'));
        }, 500);
    });
}

flakey.DisplayNumbers = function () {
    let sound = new Audio('sounds/change.ogg');
    sound.volume = 0.3;
    sound.play();

    $.each(CurrentNumberData, function (i, num) {
        let number = num.number;
        if (num.number < CurrentNumber) {
            $('#' + (i + 1)).css('opacity', '0.4');
        } else {
            $('#' + (i + 1)).css('opacity', '1.0');
        }

        $('#' + (i + 1)).html(number);
        $('#' + (i + 1)).data('Number', num);
    });

    flakey.BeginShuffleTimer();
}

flakey.ShuffleNumbers = function (arr) {

    for (let i = 0; i < 20; i++) {
        let r = Math.ceil(Math.random() * i);
        let temp = arr[i];
        arr[i] = arr[r];
        arr[r] = temp;
    }

    flakey.DisplayNumbers();
}

flakey.BeginShuffleTimer = function () {
    let time = 1800;
    let random = Math.floor(Math.random() * 100)

    if (random > 60) {
        time = 1400;
    } else if (random > 70) {
        time = 900;
    } else if (random > 90) {
        time = 500;
    }

    setTimeout(() => {
        if (MinigameActive) {
            flakey.ShuffleNumbers(CurrentNumberData);
        }
    }, time);
}

flakey.FinishGame = function (status) {
    setTimeout(() => {
        $('.ui-container').fadeOut(750, () => {
            $.post('http://flakey-numbers/GameFinished', JSON.stringify({
                status: status
            }));
        });
    }, 1000);
}

flakey.ProgressBar = function (remaining, total, $element) {
    let progressWidth = remaining * $element.width() / total;
    timeLeft = remaining
    let decrease = 0.00001;

    $element.find('div').css('width', progressWidth + 'px');

    if (remaining > 0) {
        if (!MinigameActive) return;
        setTimeout(() => {
            if (error) decrease = decrease * 12;
            let percent = flakey.Percent((timeLeft - decrease), total)
            flakey.ProgressBar(timeLeft - decrease, total, $element);
            if (percent <= 35) {
                $('.inner-bar').css('background-color', '#c90202d2');
            } else if (percent <= 70) {
                $('.inner-bar').css('background-color', '#dde000d5');
            }
            error = false
        }, 50);
    } else {
        flakey.FinishGame(false);
        MinigameActive = false;
    }
}

flakey.Percent = function (num, amount) {
    return (num / amount) * 100;
}

$('.col').on('click', function (e) {
    e.preventDefault();

    if (MinigameActive) {
        let CurrentClick = $('#' + $(this).attr('id')).data('Number');
        let sound;

        if (CurrentNumber == parseInt(CurrentClick.number)) {
            sound = new Audio('sounds/press.ogg');
            let id = $('#' + $(this).attr('id'));
            id.css('opacity', '0.2');
            if (CurrentNumber == 20) {
                flakey.FinishGame(true);
                MinigameActive = false;
            } else {
                CurrentNumber++;
            }
        } else {
            sound = new Audio('sounds/error.ogg');
            error = true;
        }

        sound.volume = 0.4;
        sound.play();
    }
});