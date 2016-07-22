"use strict";

var database_obj;
var filepaths = [
    "bulbasaur.json",
    "charmander.json",
    "doduo.json",
    "ekans.json",
    "goldeen.json",
    "koffing.json",
    "krabby.json",
    "meowth.json",
    "paras.json",
    "pidgey.json",
    "pinsir.json",
    "poliwag.json",
    "rattata.json",
    "spearow.json",
    "squirtle.json",
    "weedle.json",
    "zubat.json"
];

//HD-ify the canvas
paper.install(window);

function setup(filepath) {
    drawBaseImage(); //prepare canvas
    //JSON
    var client = new XMLHttpRequest();
    client.open("GET", filepath, true);
    client.onreadystatechange = function () { //callback
        if (client.readyState === 4) {
            if (client.status === 200 || client.status === 0) {
                database_obj = JSON.parse(client.responseText);
                document.getElementById("maindiv").innerHTML = parse();
            }
        }
    };

    client.send();
}

function drawBaseImage(optionalcallback, optionalcallback2) {
    var canvas = document.getElementById('myCanvas');
    paper.setup(canvas);
    var ctx = canvas.getContext('2d');
    var baseimg = new Image();
    baseimg.src = "Master.png";
    baseimg.onload = function() {
        ctx.drawImage(baseimg, 0, 0, 960, 720);
        if (typeof optionalcallback === "function") {
            optionalcallback();
        }
        if (typeof optionalcallback2 === "function") {
            optionalcallback2();
        }
    };
}

function parse() {
    var outputstring = ""; //concatenate the entire HTML block here
    var encounters = database_obj.encounters;

    outputstring += '<table class="table table-condensed table-bordered">';
    outputstring += '<tr><th>Pokémon</th><th>Date</th><th>Time</th><th>Location</th></tr>';
    var i;
    for (i = 0; i < encounters.length; i++) {
        outputstring += '<tr>';
        outputstring += '<td><img src="./img/' + encounters[i].image + '"></img></td>';
        outputstring += '<td>' + encounters[i].date + '</td>';
        outputstring += '<td>' + encounters[i].time + '</td>';
        outputstring += '<td>' + encounters[i].location + '</td>';
        outputstring += '</tr>';
        drawEncounter(encounters[i].image, encounters[i].location);
    }
    outputstring += '</table>';

    return outputstring;
}

//Draws on canvas
function drawEncounter(image, location) {
    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');
    var baseimg = new Image();
    baseimg.src = 'img/' + image;
    baseimg.onload = function() {
        ctx.drawImage(baseimg, location[0] - 20, location[1] - 20);
    };
}

function drawMarker(number, location) {
    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(location[0], location[1], 4, 0, Math.PI*2); //center point
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = "2";
    ctx.stroke();
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.fillStyle = "#00AAFF";
    ctx.font = "6px Andale Mono";
    ctx.textBaseline = "middle"; 
    ctx.textAlign = "center"; 
    ctx.fillText("" + number, location[0], location[1]);
}

function drawPokestop(location) {
    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(location[0], location[1], 2, 0, Math.PI*2); //center point
    ctx.strokeStyle = "#00AAFF";
    ctx.lineWidth = "2";
    ctx.stroke();
    ctx.fillStyle = "#00FFFF";
    ctx.fill();
}

function drawGym(location) {
    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');
    var baseimg = new Image();
    baseimg.src = 'img/_gym.png';
    baseimg.onload = function() {
        ctx.drawImage(baseimg, location[0] - 10, location[1] - 10, 20, 20);
    };
}

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

/* For all.html. A super shitty way to do stuff but hey, it... works...? */
//does not handle table
function parseAlt(json_obj) {
    var outputstring = ""; //concatenate the entire HTML block here
    var encounters = json_obj.encounters;
    var i;
    for (i = 0; i < encounters.length; i++) {
        outputstring += '<tr>';
        outputstring += '<td><img src="./img/' + encounters[i].image + '"></img></td>';
        outputstring += '<td>' + encounters[i].date + '</td>';
        outputstring += '<td>' + encounters[i].time + '</td>';
        outputstring += '<td>' + encounters[i].location + '</td>';
        outputstring += '</tr>';
        drawEncounter(encounters[i].image, encounters[i].location);
    }

    return outputstring;
}

function setupAll() {
    drawBaseImage(); //prepare canvas

    //JSON
    var outputstring = '<table class="table table-condensed table-bordered">';
    outputstring += '<tr><th>Pokémon</th><th>Date</th><th>Time</th><th>Location</th></tr>';
    setupAll_helper(0, 0, outputstring)
}

//Done this way because trying to fire all the requests one after another in a for loop fails spectacularly
function setupAll_helper(i, completion, outputstring) {
    var client = new XMLHttpRequest();
    client.open("GET", filepaths[i], true);
    console.log("setupAll_helper: Sending XMLHttpRequest for " + filepaths[i]);
    client.onreadystatechange = function () { //callback
        if (client.readyState === 4) {
            if (client.status === 200 || client.status === 0) {
                var json_obj = JSON.parse(client.responseText);
                outputstring += parseAlt(json_obj);
                completion++;
                if (completion === filepaths.length) {
                    outputstring += '</table>';
                    document.getElementById("maindiv").innerHTML = outputstring;
                } else {
                    setupAll_helper(i + 1, completion, outputstring)
                }
            }
        }
    };

    client.send();
}

/* For allloc.html */
function setupAllLocation() {
    drawBaseImage(); //prepare canvas
    var alldatabases = [];
    setupAllLocation_helper(0, 0, alldatabases);
}

function setupAllLocation_helper(i, completion, alldatabases) {
    var client = new XMLHttpRequest();
    client.open("GET", filepaths[i], true);
    console.log("setupAllLocation_helper: Sending XMLHttpRequest for " + filepaths[i]);
    client.onreadystatechange = function () { //callback
        if (client.readyState === 4) {
            if (client.status === 200 || client.status === 0) {
                var json_obj = JSON.parse(client.responseText);
                alldatabases.push(json_obj);
                completion++;
                if (completion !== filepaths.length) {
                    setupAllLocation_helper(i + 1, completion, alldatabases);
                } else {
                    setupAllLocation_Table(alldatabases);
                }
            }
        }
    };

    client.send();
}

function setupAllLocation_Table(alldatabases) {
    console.log("setupAllLocation_Table: Running");
    var locations = [];
    var i;
    var j;
    var k;
    for (i = 0; i < alldatabases.length; i++) { //for every file
        for (j = 0; j < alldatabases[i].encounters.length; j++) { //for every encounter
            var containsloc = false;
            for (k = 0; k < locations.length; k++) { //see if locations already contains the coordinate
                if (locations[k][0] === alldatabases[i].encounters[j].location[0] && locations[k][1] === alldatabases[i].encounters[j].location[1]) {
                    containsloc = true;
                }
            }
            if (containsloc === false) {
                locations.push(alldatabases[i].encounters[j].location);
            }
        }
    }
    //Now that all location points have been determined, let's label them on the map
    var outputstring = "";
    for (k = 0; k < locations.length; k++) {
        outputstring += '<h3>Location ' + locations[k] + ' (' + k + ')</h3>';
        outputstring += '<table class="table table-condensed table-bordered">';
        outputstring += '<tr><th>Pokémon</th><th>Date</th><th>Time</th></tr>';
        for (i = 0; i < alldatabases.length; i++) { //for every file
            for (j = 0; j < alldatabases[i].encounters.length; j++) { //for every encounter
                if (locations[k][0] === alldatabases[i].encounters[j].location[0] && locations[k][1] === alldatabases[i].encounters[j].location[1]) {
                    outputstring += '<tr>';
                    outputstring += '<td><img src="./img/' + alldatabases[i].encounters[j].image + '"></img></td>';
                    outputstring += '<td>' + alldatabases[i].encounters[j].date + '</td>';
                    outputstring += '<td>' + alldatabases[i].encounters[j].time + '</td>';
                    outputstring += '</tr>';
                }
            }
        }
        outputstring += '</table>';
        //Now handle the marker on the map
        drawMarker(k, locations[k]);
    }
    document.getElementById("maindiv").innerHTML = outputstring;
}

/* For _pokestops.html */
function setupAllPokestop() {
    //prepare canvas, but make sure that its been loaded before rudely dumping shit onto it
    drawBaseImage(setupAllLocation_Pokestops, setupAllLocation_Gyms); 
}

function setupAllLocation_Pokestops() {
    var client = new XMLHttpRequest();
    client.open("GET", "_pokestops.json", true);
    console.log("setupAllLocation_Pokestops: Sending XMLHttpRequest for _pokestops.json");
    client.onreadystatechange = function () { //callback
        if (client.readyState === 4) {
            if (client.status === 200 || client.status === 0) {
                var json_obj = JSON.parse(client.responseText);
                var i;
                for (i = 0; i < json_obj.pokestops.length; i++) {
                    drawPokestop(json_obj.pokestops[i].location);
                }
            }
        }
    };

    client.send();
}

function setupAllLocation_Gyms() {
    var client = new XMLHttpRequest();
    client.open("GET", "_gyms.json", true);
    console.log("setupAllLocation_Pokestops: Sending XMLHttpRequest for _gyms.json");
    client.onreadystatechange = function () { //callback
        if (client.readyState === 4) {
            if (client.status === 200 || client.status === 0) {
                var json_obj = JSON.parse(client.responseText);
                var i;
                for (i = 0; i < json_obj.gyms.length; i++) {
                    drawGym(json_obj.gyms[i].location);
                }
            }
        }
    };

    client.send();
}