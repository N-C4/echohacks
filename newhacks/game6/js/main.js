const scriptName = "echo_minigames_1";
const startEndScreens = {
    path: {
        height: "63.5vh",
        width: "60vh",
        icon: "fa-laptop-code",
        start: "Unrecognized user, connection required...",
        failTime: "You failed to breach in time",
        failError: "An error has occurred, breach failed",
        success: "Hack was successful",
    },
    spot: {
        height: "63vh",
        width: "60vh",
        icon: "fa-file-shield",
        start: "Files encrypted, user bypass required..",
        failTime: "Decryption failed. Time Limit Reached",
        success: "Files successfully decrypted.",
    },
    math: {
        height: "60vh",
        width: "60vh",
        icon: "fa-server",
        start: "Firewall active. Attempting to bypass..",
        failTime: "Bypass failed. Time Limit Reached",
        failError: "Bypass failed. Incorrect input.",
        success: "Firewall successfully bypassed.",
    }
}

let activeGame = null;
let startTimeout = null;
let endTimeout = null;

function startGame(game, settings) {
    switch(game) {
        case "path":
            startPathGame(settings);    
            break;
        case "spot":
            startSpotGame(settings);
            break;
        case "math":
            startMathGame(settings);
            break;
        }
}

function displayScreen(game, text) {
    const screenInfo = startEndScreens[game]
    $("#screen").css({
        "height": screenInfo.height,
        "width" : screenInfo.width,
        "backdrop-filter": text === 'start' ? 'blur(0px)' : 'blur(10px)',
        "background-color": text === 'start' ? 'var(--background-1)' : 'var(--success-background)',
    })

    $(".screen-icon").html(`<i class="fa-solid ${screenInfo.icon}"></i>`);
    $(".screen-text").text(screenInfo[text]);

    $("#screen").show();
}

function hideScreen() {
    $("#screen").hide();
}

function clearTimeouts() {
    clearTimeout(startTimeout);
    clearTimeout(endTimeout);
}

$(document).keyup(function(e) {
    if (e.key == "Escape" && activeGame) {
        $.post(`https://${scriptName}/endGame`, JSON.stringify({success: false}));

        if (activeGame == "path") {
            resetPath();
        }

        if (activeGame == "spot") {
            resetSpot();
        }

        if (activeGame == "math") {
            resetMath();
        }
        clearTimeouts();
        activeGame  = null;
    }
})

    
window.addEventListener("message", function(event) {
    const item = event.data;
    if (item.action == "startGame") {
        startGame(item.game, item.settings);
    } else if (item.action == "updateMessage") {
        startEndScreens[item.game][item.label] = item.message
    }
})

$(document).ready(function(){
    startGame("spot", gridSize = 6, timeLimit = 8000, charSet = "alphabet", required = 10, targetChar = "K",);
});