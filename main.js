var timeForm = document.getElementById('timeForm');
var birthTimeInput = document.getElementById('birthTime');

var LEVEL_INTRAINING = 'intraining';
var LEVEL_ROOKIE = 'rookie';
var LEVEL_CHAMPION = 'champion';
var LEVEL_ULTIMATE = 'ultimate';
var LEVEL_MEGA = 'mega';
var LEVELS = [LEVEL_INTRAINING, LEVEL_ROOKIE, LEVEL_CHAMPION, LEVEL_ULTIMATE, LEVEL_MEGA];

var EVOLUTION_DURATIONS = {
    [LEVEL_ROOKIE]: 6,
    [LEVEL_CHAMPION]: 24,
    [LEVEL_ULTIMATE]: 36,
    [LEVEL_MEGA]: 48
};

var WAKE_UP_HOUR = 7;

var HOURS_CONSTANT = 60 * 60 * 1000;

// hook it up

birthTimeInput.addEventListener('change', formChanged);
for (var i = 0; i < LEVELS.length - 1; ++i) {
    document.getElementById('sleepTime-'+LEVELS[i]).addEventListener('change', formChanged);
}

function formChanged(event) {
    if (getBirthTime() != null) {
        var evoTimes = calculateEvolutionTimes(getBirthTime(), getSleepTimes());
        renderOutput(evoTimes);
    }
    event.preventDefault();
};

// big brain logic time

function getBirthTime() {
    return new Date((new Date()).setHours(document.getElementById('birthTime').value.split(':')[0], document.getElementById('birthTime').value.split(':')[1]));
}

function getSleepTimes() {
    var output = {};
    for (var i = 0; i < LEVELS.length - 1; ++i) {
        output[LEVELS[i]] = Number(document.getElementById('sleepTime-'+LEVELS[i]).value);
    }
    return output;
}

function calculateEvolutionTimes(birthDate, sleepTimes) {
    var birthTime = getBirthTime();
    var evolutionTimes = {
        [LEVEL_INTRAINING]: new Date(birthTime.getTime() + 10 * (HOURS_CONSTANT / 60))
    };

    for (var i = 1; i < LEVELS.length; ++i) {
        var sleepHour = sleepTimes[LEVELS[i - 1]];
        var activeHoursLeft = EVOLUTION_DURATIONS[LEVELS[i]];
        var lastEvoTime = evolutionTimes[LEVELS[i - 1]].getTime();
        var nextEvoTime = lastEvoTime;
        while (activeHoursLeft > 0) {
            if (isActiveTime(nextEvoTime, sleepHour, WAKE_UP_HOUR)) {
                --activeHoursLeft;
            }
            nextEvoTime += 1 * HOURS_CONSTANT;
        }
        evolutionTimes[LEVELS[i]] = new Date(nextEvoTime);
    }
    
    return evolutionTimes;
}

function isActiveTime(time, sleepHour, wakeHour) {
    var timeAsDate = new Date(time);
    if (sleepHour === 0) {
        sleepHour = 24;
    }

    return (timeAsDate.getHours() >= wakeHour && timeAsDate.getHours() < sleepHour);
}

function renderOutput(evoTimes) {
    function _createli(content) {
        var li = document.createElement('li');
        li.innerHTML = content;
        return li;
    }
    
    function _formatdate(d, levelForLink) {
        var str = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
        var days = Math.floor((d.getTime() - (new Date()).getTime()) / (1000 * 60 * 60 * 24));
        if (days > 0) {
            str = '+' + days + ' days at ' + str;
        }
        if (!levelForLink) {
            return str;
        }
        var d2 = new Date(d.getTime() + 1 * (HOURS_CONSTANT / 60));
        return '<a href="http://www.google.com/calendar/render?action=TEMPLATE&text=Evolve ('+levelForLink+')&dates='+d.toISOString().replace(/-|:|\.\d\d\d/g,"")+'/'+d2.toISOString().replace(/-|:|\.\d\d\d/g,"")+'&details=Your digimon will evolve&trp=false&sprop=&sprop=name:"target="_blank" rel="nofollow">'+str+'</a>';
    }
    
    var outputList = document.getElementById('output');
    outputList.innerHTML = '';
    outputList.appendChild(_createli('Born at: ' + _formatdate(getBirthTime())));
    outputList.appendChild(_createli('Baby to In-training: (10 min), ' + _formatdate(evoTimes[LEVEL_INTRAINING])));
    outputList.appendChild(_createli('In-training to Rookie: (6h), ' + _formatdate(evoTimes[LEVEL_ROOKIE])));
    outputList.appendChild(_createli('Rookie to Champion: (24h), ' + _formatdate(evoTimes[LEVEL_CHAMPION], LEVEL_CHAMPION)));
    outputList.appendChild(_createli('Champion to Ultimate: (36h), ' + _formatdate(evoTimes[LEVEL_ULTIMATE], LEVEL_ULTIMATE)));
    outputList.appendChild(_createli('Ultimate to Mega: (48h), ' + _formatdate(evoTimes[LEVEL_MEGA], LEVEL_MEGA)));
}