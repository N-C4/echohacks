'use strict';

// ----------------------------------------------------------------
// Utility: Replace $.post calls (for FiveM) with a simulated function.
function post(url, data) {
  console.log("Simulated POST to", url, "with data", data);
}

// ----------------------------------------------------------------
// Configuration Data – now hard-coded instead of relying on e.data
const Locales = {
  MyComputer: "My Computer",
  Power: "Power On",
  HackConnextExeTitle: "Hack Connect",
  LocalC: "Local Computer",
  GlobalNetwork: "Global Network",
  ExternalDeviceD: "External Device",
  ExternalDeviceTitle: "External Device Minigame",
  HackConnectExeMinigame: "Hack Connect Minigame",
  BruteForceConnectExeMinigame: "Brute Force Minigame",
  Compromissingglobalsecurityoneslipatatime: "Compromising global security one slip at a time",
  ipadress: "IP Address: 127.0.0.1",
  backDoorText: "Back Door"
};

const Times = {
  RandomNumbersTime: 15.0,   // seconds
  BruteForceTime: 30,         // seconds
  RandomNumbersSpeed: 1000,    // ms interval for the random numbers shift
  BruteForceSpeed: 300        // ms interval for the brute force letters update
};

const Chances = {
  RandomNumbersChance: 3,
  BruteForceChance: 3
};

// ----------------------------------------------------------------
// Global game variables & defaults
const Letters = [ 
  ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"],
  ["0","1","2","3","4","5","6","7","8","9"],
  ["Φ","Χ","Γ","Δ","Ε","Θ","Λ","Ξ","Π","Σ","Ψ","Ω"]
];

let hackmgsayac = 1;
let bruteforcesayac = 1;

let randomnumberssans = Chances.RandomNumbersChance;
let bruteforcesans = Chances.BruteForceChance;

// Set these flags true/false to enable/disable respective minigames.
let showRandomNumbers = true;    // Enable HackConnect (random numbers) minigame
let showBruteForce = true;       // Enable BruteForce minigame
let NeedToDoEverything = true;   // If true, forces sequential completion

let RandomNumberstime = Times.RandomNumbersTime;
let BruteForceTime = Times.BruteForceTime;
let bruteForceLettersTime = Times.BruteForceSpeed;
let RandomNumbersHackTime = Times.RandomNumbersSpeed;

let ilkMinigameDone = false;
let ikinciMinigameDone = false;

// Date info (for UI, if needed)
const now = new Date();
const hours = now.getHours();
const minutes = now.getMinutes();
const yearNow = now.getFullYear();
const monthNow = now.getMonth() + 1;
const dayNow = now.getDate();

// ----------------------------------------------------------------
// INITIAL UI SETUP – Replace FiveM NUI text-setting code with defaults.
$(document).ready(function() {
  $(".mainapp").css('display', 'flex');

  $("#myComputerText").html(Locales.MyComputer);
  $("#powerText").html(Locales.Power);
  $("#hackconnectyazi").html(Locales.HackConnextExeTitle);
  $("#localyazisecenek").html(Locales.LocalC);
  $("#globalnetworkyazisecenek").html(Locales.GlobalNetwork);
  $("#externaldeviceyazisecenek").html(Locales.ExternalDeviceD);
  $("#externalsecenek2minigame").html(Locales.ExternalDeviceTitle);
  $("#minigameBaslangiciHackConnect").html(Locales.HackConnectExeMinigame);
  $("#minigameBaslangiciBruteForceConnect").html(Locales.BruteForceConnectExeMinigame);
  $("#alttakiyaziRandomsayilar").html(Locales.Compromissingglobalsecurityoneslipatatime);
  $("#ipaddress").html(Locales.ipadress);
  $("#backDoorText").html(Locales.backDoorText);
  $("#hackConnectExeTitle").html(Locales.HackConnextExeTitle);

  $("#hourshoursandminutes").html(hours + ":" + minutes);
  $("#date").html(dayNow + "/" + monthNow + "/" + yearNow);
});

// ----------------------------------------------------------------
// HACKCONNECT MINIGAME SECTION
let loadingCount,
    timeRemaining,
    rndCombination = [],
    comb = [],
    curField,
    corrCombination,
    gType = 1;

// Timers for refresh and countdown
let refreshTimer, cdTimer;
let hackmgstarted = false;

const init = () => {
  loadingCount = 0;
  timeRemaining = Number(RandomNumberstime);
  curField = 0;
  corrCombination = -1;
  hackmgstarted = true;
  rndCombination.length = 0;
  comb.length = 0;
};

let bruteforcemevcutsira = 1;

const loadTablet = () => {
  loadCombination();
  startCountDownTimer();
};

const loadCombination = () => {
  let allCombinations = document.querySelector('.hackconnect_minigamearea');
  allCombinations.innerHTML = "";
  
  let calcComb = "", rndLet = "";
  
  createCombination();
  
  for (let i = 0; i < 60; ++i) {
    rndLet = rndCombination[i];
    calcComb += `<span id="S${i}">${rndLet}</span>`;
  }
  
  allCombinations.innerHTML = calcComb;
  curField = Math.floor(Math.random() * 60); // Pick a random starting field
  highlightText();
  refreshLetters();
};

const highlightText = () => {
  for (let i = 0; i <= 59; ++i) {
    $("#S" + i).removeClass('selectednumber a e');
  }
  for (let x = 0; x <= 3; ++x) {
    let numb = curField + x;
    $("#S" + numb).addClass('selectednumber');
    if (x === 0) $("#S" + numb).addClass('a');
    if (x === 3) $("#S" + numb).addClass('e');
  }
};

const refreshLetters = () => {
  refreshTimer = setInterval(() => {
    rndCombination.shift();
    if (--corrCombination < 0) endTask(false);
    for (let i = 0; i < 59; ++i)
      document.getElementById(`S${i}`).textContent = rndCombination[i];
  }, RandomNumbersHackTime);
};

const createCombination = () => {
  const combinationEl = document.querySelector('.txtCombination');
  const max = Math.random() * (80 - 78) + 78;
  const min = Math.random() * (25 - 16) + 16;
  
  for (let i = 0; i < 160; ++i)
    rndCombination.push(
      Letters[gType][Math.floor(Math.random() * Letters[gType].length)] +
      Letters[gType][Math.floor(Math.random() * Letters[gType].length)]
    );
  
  let insertComb = Math.floor(Math.random() * (max - min) + min);
  
  for (let i = 0; i < 4; ++i)
    comb.push(
      Letters[gType][Math.floor(Math.random() * Letters[gType].length)] +
      Letters[gType][Math.floor(Math.random() * Letters[gType].length)]
    );
  
  corrCombination = insertComb;
  
  for (let x = 0; x <= 3; ++x) {
    rndCombination[insertComb] = comb[x];
    ++insertComb;
  }
  combinationEl.textContent = comb.join(".");
};

const startCountDownTimer = () => {
  cdTimer = setInterval(() => {
    timeRemaining -= 0.0842;
    $('.timeLeft').html(Number(timeRemaining.toFixed(2)));
    if (timeRemaining <= 0.1)
      endTask(false);
  }, 100);
};

const endTask = (state = false) => {
  $("#connectinghost").html(state ? "Connected to host!" : "Failed!");
  clearInterval(refreshTimer);
  clearInterval(cdTimer);
  hackmgstarted = false;
  hackingmg(state);
};

$(document).ready(function(){
  document.body.addEventListener("keydown", function(event) {
    if (hackmgstarted) {
      // Ensure tablet has started (by checking timeRemaining)
      if (timeRemaining !== 15.0) {
        if (event.code === "ArrowUp" || event.code === "KeyW") {
          if (curField >= 10)
            curField -= 10;
        } else if (event.code === "ArrowDown" || event.code === "KeyS") {
          if (curField < 51)
            curField += 10;
        } else if (event.code === "ArrowLeft" || event.code === "KeyA") {
          if (curField !== 0)
            curField -= 1;
        } else if (event.code === "ArrowRight" || event.code === "KeyD") {
          if (curField !== 56)
            curField += 1;
        } else if (event.code === "Enter" || event.code === "NumpadEnter") {
          endTask(curField === corrCombination);
          return;
        }
        highlightText();
      }
    }  
  });
});

// ----------------------------------------------------------------
// BRUTEFORCE MINIGAME SECTION
$(document).ready(function(){
  let bruteforceinterval;
  let bruteforceintervals;
  
  $(".appclick[appname=mycomputer]").click(function(){
    if ($(".appinside").css('display') === 'none') {
      $(".appinside").css('display', 'block');
      $('.application').css('display', 'none');
      $('.mycomputer').css('display', 'flex');
    }
  });

  $("#extr").click(function(){
    $(".selectapp").css('display', 'block');
    $(".selectapps").css('display', 'flex');
  });

  $("#clsx").click(function(){
    $(".selectapp, .selectapps").hide();
  });

  $("#openhackconnect").click(function(){
    // If Random Numbers minigame is selected
    if (showRandomNumbers) {
      $(".selectapp, .selectapps, .mycomputer").hide();
      $(".hackconnect").show();
      $("#connectinghost").html("Connecting to the host");
      init();
      loadCombination();
      startCountDownTimer();
    } else if (showBruteForce) {
      sendNotify("Error", "It's not your minigame. You've selected brute force minigame.");
    } else if (!showRandomNumbers && !showBruteForce && NeedToDoEverything && !ilkMinigameDone) {
      $(".selectapp, .selectapps, .mycomputer").hide();
      $(".hackconnect").show();
      $("#connectinghost").html("Connecting to the host");
      init();
      loadCombination();
      startCountDownTimer();
    } else if (ilkMinigameDone) {
      sendNotify("Error", "You already did that minigame.");
    }
  });

  $("#bruteforceopen").click(function(){
    if (showBruteForce) {
      $(".selectapp, .selectapps, .mycomputer").hide();
      $('.selectedRED').removeClass('selectedRED');
      $(".brtfrc_text[num=1]").addClass('selected');
      $(".bruteforce").show();
      createbruteforcetexts();
    } else if (showRandomNumbers) {
      sendNotify("Error", "You need to complete the first minigame. (Random Numbers)");
    } else if (!showRandomNumbers && !showBruteForce && NeedToDoEverything) {
      $(".selectapp, .selectapps, .mycomputer").hide();
      $('.selectedRED').removeClass('selectedRED');
      $(".brtfrc_text[num=1]").addClass('selected');
      $(".bruteforce").show();
      createbruteforcetexts();
    }
  });

  $("#powerButton").click(function(){
    $(".appinside, .mainapp").hide();
    post("https://echo_computerhack/close", {});
  });

  let bruteforcemgactive = false;
  let bruteforcesirasi = [];
  
  function rastgeleHarf() {
    const harfler = "ADGHIJKLMNPQSVWXYZ";
    return harfler.charAt(Math.floor(Math.random() * harfler.length));
  }
  
  function harfDizisiOlustur(gerekliharf) {
    let harfler = [];
    for (let i = 0; i < 8; i++) {
        harfler.push(rastgeleHarf()); 
    }
    harfler.push(gerekliharf); 
    harfler = harfler.sort(() => Math.random() - 0.5);
    return harfler;
  }
  
  function harfleriGuncelle(num, harfler, onemli) {
      harfler.unshift(harfler.pop());
      $('.brtfrc_text[num=' + num + '] div').each(function(index) {
          $(this).text(harfler[index]);
          if (harfler[index] === onemli) {
              $(this).addClass('red');
          } else {
              $(this).removeClass('red');
          }
      });
  }
  
  let mevcutrand = 0;
  
  function createbruteforcetexts() {
    let countdown = BruteForceTime;
    let rand = Math.floor(Math.random() * 142342340);
    mevcutrand = rand;
  
    bruteforceinterval = setInterval(function() {
        countdown--;
        $(".bruteforce_timeline div").css('width', calculateReversePercentage(countdown, BruteForceTime, 0) + '%');
        if (countdown <= 0) {
            clearInterval(bruteforceinterval);
            bruteforcemgactive = false;
            $('.selected').addClass('selectedRED').removeClass('selected');
            clearInterval(bruteforceintervals);
            bruteforcebitti(false);
            bruteforcemevcutsira = 1;
        }
    }, 1000);
  
    bruteforcemgactive = true;
    bruteforcesirasi.push(bruteforcemevcutsira.toString());
    let realstrings = ['B','R','U','T','E','F','O','R','C','E'];
    let harflers = [
      harfDizisiOlustur('B'),
      harfDizisiOlustur('R'),
      harfDizisiOlustur('U'),
      harfDizisiOlustur('T'),
      harfDizisiOlustur('E'),
      harfDizisiOlustur('F'),
      harfDizisiOlustur('O'),
      harfDizisiOlustur('R'),
      harfDizisiOlustur('C'),
      harfDizisiOlustur('E'),
    ];
  
    harfleriGuncelle("1", harflers[0], 'B');
    harfleriGuncelle("2", harflers[1], 'R');
    harfleriGuncelle("3", harflers[2], 'U');
    harfleriGuncelle("4", harflers[3], 'T');
    harfleriGuncelle("5", harflers[4], 'E');
    harfleriGuncelle("6", harflers[5], 'F');
    harfleriGuncelle("7", harflers[6], 'O');
    harfleriGuncelle("8", harflers[7], 'R');
    harfleriGuncelle("9", harflers[8], 'C');
    harfleriGuncelle("10", harflers[9], 'E');
  
    bruteforceintervals = setInterval(function(){
      harfleriGuncelle(bruteforcemevcutsira.toString(), harflers[bruteforcemevcutsira-1], realstrings[bruteforcemevcutsira-1]);
    }, bruteForceLettersTime);
  
    function tryC() {
      if (rand !== mevcutrand) { return; }
      if (bruteforcemgactive) {
        let gelenharf = $('.brtfrc_text[num=' + bruteforcemevcutsira + '] div').eq(4).html();
        if (gelenharf === realstrings[bruteforcemevcutsira - 1]) {
          clearInterval(bruteforceintervals);
          $(".brtfrc_text").removeClass('selected');
          bruteforcemevcutsira = bruteforcemevcutsira + 1;
          if (bruteforcemevcutsira > 10) {
            // Minigame complete.
            bruteforcebitti(true);
            clearInterval(bruteforceintervals);
            clearInterval(bruteforceinterval);
            bruteforcemgactive = false;
            bruteforcemevcutsira = 1;
          } else {
            $(".brtfrc_text[num=" + bruteforcemevcutsira + "]").addClass('selected');
            bruteforceintervals = setInterval(function(){
              harfleriGuncelle(bruteforcemevcutsira.toString(), harflers[bruteforcemevcutsira-1], realstrings[bruteforcemevcutsira-1]);
            }, bruteForceLettersTime);
          }
        } else {
          bruteforcemgactive = false;
          $('.selected').addClass('selectedRED').removeClass('selected');
          clearInterval(bruteforceintervals);
          clearInterval(bruteforceinterval);
          bruteforcebitti(false);
          bruteforcemevcutsira = 1;
        }
      }
    }
  
    $(document).on('keydown', function(e) {
      if (e.key === "Enter") {
        if (bruteforcemgactive) {
          tryC();
        }
      }
    });
  }
  
  function calculateReversePercentage(value, min, max) {
    if (min === max) return 0;
    return ((min - value) / (min - max)) * 100;
  }
  
  function bruteforcebitti(success) {
    console.log("BruteForce minigame ended with", success);
    if (NeedToDoEverything && ilkMinigameDone && success) {
      post("https://echo_computerhack/DidEverything", { success: true });
      ilkMinigameDone = false;
    }
    if (success) {
      post("https://echo_computerhack/endTaskBruteForce", { success: true });
      hackmgsayac = 1;
      bruteforcesayac = 1;
      $(".mainapp, .appinside").hide();
      post("https://echo_computerhack/close", {});
    } else {
      if (bruteforcesayac === Number(bruteforcesans)) {
        post("https://echo_computerhack/endTaskBruteForce", { success: false });
        $(".mainapp, .appinside").hide();
        post("https://echo_computerhack/close", {});
        bruteforcesayac = 1;
      } else {
        bruteforcesayac++;
        $('.selectedRED').removeClass('selectedRED');
        $(".brtfrc_text[num=1]").addClass('selected');
        createbruteforcetexts();
      }
    }
  }
});

// ----------------------------------------------------------------
// HACK COMPLETION HANDLER
function hackingmg(success) {

}



let notifyvar = false;
function sendNotify(header, text) {
  if (!notifyvar) {
    notifyvar = true;
    $("#notifyh").html(header);
    $("#notifyt").html(text);
    $(".notify").css('display', 'flex');
    setTimeout(function(){
      $(".notify").css('right', '2vh');
      setTimeout(function(){
        $(".notify").css('right', '-100vh');
        setTimeout(function(){
          notifyvar = false;
          $(".notify").css('display', 'none');
        }, 501);
      }, 5000);
    }, 1);
  }
}
