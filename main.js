var timeForm = document.getElementById('timeForm');
var birthTimeInput = document.getElementById('birthTime');
var birthDateInput = document.getElementById('birthDate');
var startingStageInput = document.getElementById('startingStage');

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
birthDateInput.addEventListener('change', formChanged);
startingStageInput.addEventListener('change', formChanged);
for (var i = 0; i < LEVELS.length - 1; ++i) {
    document.getElementById('sleepTime-'+LEVELS[i]).addEventListener('change', formChanged);
}

function formChanged(event) {
    if (getBirthTime() != null) {
        var evoTimes = calculateEvolutionTimes(getBirthTime(), getSleepTimes(), getStartingStageIndex());
        renderOutput(evoTimes);
    }
    event.preventDefault();
};

// big brain logic time

function getBirthTime() {
    if (!document.getElementById('birthTime').value) {
        return null;
    }
    var baseDate = birthDateInput.valueAsDate;
    baseDate = baseDate || new Date();
    return new Date(new Date(baseDate).setHours(document.getElementById('birthTime').value.split(':')[0], document.getElementById('birthTime').value.split(':')[1]));
}

function getSleepTimes() {
    var output = {};
    for (var i = 0; i < LEVELS.length - 1; ++i) {
        output[LEVELS[i]] = Number(document.getElementById('sleepTime-'+LEVELS[i]).value);
    }
    return output;
}

function getStartingStageIndex() {
    return startingStageInput.value ? Number(startingStageInput.value) : 0;
}

function calculateEvolutionTimes(birthDate, sleepTimes, startingStageIndex) {
    var birthTime = getBirthTime();
    var evolutionTimes = {
        [LEVELS[startingStageIndex]]: new Date(birthTime.getTime() + (startingStageIndex === 0 ? 10 * (HOURS_CONSTANT / 60) : 0))
    };

    for (var i = startingStageIndex + 1; i < LEVELS.length; ++i) {
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
        var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var str = d.getDate() + ' ' + monthNames[d.getMonth()] + ' ' + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
        if (!levelForLink) {
            return str;
        }
        var d2 = new Date(d.getTime() + 1 * (HOURS_CONSTANT / 60));
        return '<a href="http://www.google.com/calendar/render?action=TEMPLATE&text=Evolve ('+levelForLink+')&dates='+d.toISOString().replace(/-|:|\.\d\d\d/g,"")+'/'+d2.toISOString().replace(/-|:|\.\d\d\d/g,"")+'&details=Your digimon will evolve&trp=false&sprop=&sprop=name:"target="_blank" rel="nofollow">'+str+'</a>';
    }
    
    function title(s) {
        return s.charAt(0).toUpperCase() + s.substr(1);
    }
    
    var outputList = document.getElementById('output');
    outputList.innerHTML = '';
    var startingStageIndex = getStartingStageIndex();
    if (startingStageIndex === 0) {
        outputList.appendChild(_createli('Born at: ' + _formatdate(getBirthTime())));
        outputList.appendChild(_createli('to In-training: (10 min), ' + _formatdate(evoTimes[LEVEL_INTRAINING])));
        outputList.appendChild(_createli('to Rookie: (6h), ' + _formatdate(evoTimes[LEVEL_ROOKIE], LEVEL_ROOKIE)));
        startingStageIndex = 1;
    } else {
        outputList.appendChild(_createli('Reached ' + title(LEVELS[startingStageIndex]) + ' at: ' + _formatdate(getBirthTime())));
    }
    for (var i = startingStageIndex + 1; i < LEVELS.length; ++i) {
        outputList.appendChild(_createli('to ' + title(LEVELS[i]) + ': (' + EVOLUTION_DURATIONS[LEVELS[i]] + 'h), ' + _formatdate(evoTimes[LEVELS[i]], LEVELS[i])));
    }
}