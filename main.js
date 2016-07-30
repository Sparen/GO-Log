"use strict";

var database_obj;
var baseimg;

//HD-ify the canvas
paper.install(window);

var myCanvas = {
    start: function () {
        this.canvas = document.getElementById('myCanvas');
        this.context = this.canvas.getContext("2d");
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

//MUST be called by all html files
function drawBaseImage(optionalcallback, optionalcallback2) {
    var canvas = document.getElementById('myCanvas');
    paper.setup(canvas);
    myCanvas.start();
    var ctx = canvas.getContext('2d');
    baseimg = new Image();
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

function parse() { //handles filters and Pokémon
    var outputstring = ""; //concatenate the entire HTML block here
    var encounters = database_obj.encounters;

    outputstring += '<table class="table table-condensed table-bordered">';
    outputstring += '<tr><th>Pokémon</th><th>Date</th><th>Time</th><th>Location</th></tr>';
    var i;
    for (i = 0; i < encounters.length; i++) {
        //If the checkbox does not exist yet, it renders. If the checkbox exists and is selected, it renders.
        if (document.getElementById(encounters[i].image) === null || document.getElementById(encounters[i].image).checked) {
            outputstring += '<tr>';
            outputstring += '<td><img src="./img/' + encounters[i].image + '"></img> ' + database_obj.encounters[i].name + '</td>';
            outputstring += '<td>' + encounters[i].date + '</td>';
            outputstring += '<td>' + encounters[i].time + '</td>';
            outputstring += '<td>' + encounters[i].location + '</td>';
            outputstring += '</tr>';
            drawEncounter(encounters[i].image, encounters[i].location);
        }
    }
    outputstring += '</table>';

    return outputstring;
}

function setupAll() {
    drawBaseImage(); //prepare canvas
    var client = new XMLHttpRequest();
    client.open("GET", "encounters.json", true);
    console.log("setupAll: Sending XMLHttpRequest for encounters.json");
    client.onreadystatechange = function () { //callback
        if (client.readyState === 4) {
            if (client.status === 200 || client.status === 0) {
                database_obj = JSON.parse(client.responseText);
                refresh();
            }
        }
    };

    client.send();
}

//resets canvas and table. Only used in all.html
function refresh() {
    myCanvas.clear();
    if (baseimg !== null && baseimg !== undefined) { //IE it's been loaded already
        var ctx = document.getElementById('myCanvas').getContext('2d');
        ctx.drawImage(baseimg, 0, 0, 960, 720);
    }
    document.getElementById("maindiv").innerHTML = parse();
}

//resets canvas and table. Only used in all_loc.html
function refresh() {
    myCanvas.clear();
    if (baseimg !== null && baseimg !== undefined) { //IE it's been loaded already
        var ctx = document.getElementById('myCanvas').getContext('2d');
        ctx.drawImage(baseimg, 0, 0, 960, 720);
    }
    document.getElementById("maindiv").innerHTML = parse();
}

/* For all_loc.html */
function setupAllLocation() {
    var client = new XMLHttpRequest();
    client.open("GET", "encounters.json", true);
    console.log("setupAllLocation: Sending XMLHttpRequest for encounters.json");
    client.onreadystatechange = function () { //callback
        if (client.readyState === 4) {
            if (client.status === 200 || client.status === 0) {
                database_obj = JSON.parse(client.responseText);
                drawBaseImage(setupAllLocation_Table); //prepare canvas
            }
        }
    };

    client.send();
}

function setupAllLocation_Table() {
    console.log("setupAllLocation_Table: Running");
    var locations = [];
    var j;
    var k;
    for (j = 0; j < database_obj.encounters.length; j++) { //for every encounter
        var containsloc = false;
        for (k = 0; k < locations.length; k++) { //see if locations already contains the coordinate
            if (locations[k][0] === database_obj.encounters[j].location[0] && locations[k][1] === database_obj.encounters[j].location[1]) {
                containsloc = true;
            }
        }
        if (containsloc === false) {
            locations.push(database_obj.encounters[j].location);
        }
    }
    //Now that all location points have been determined, let's label them on the map
    var outputstring = "";
    for (k = 0; k < locations.length; k++) {
        outputstring += '<h3>Location ' + locations[k] + ' (' + k + ')</h3>';
        outputstring += '<table class="table table-condensed table-bordered">';
        outputstring += '<tr><th>Pokémon</th><th>Date</th><th>Time</th></tr>';
        for (j = 0; j < database_obj.encounters.length; j++) { //for every encounter
            if (locations[k][0] === database_obj.encounters[j].location[0] && locations[k][1] === database_obj.encounters[j].location[1]) {
                outputstring += '<tr>';
                outputstring += '<td><img src="./img/' + database_obj.encounters[j].image + '"></img> ' + database_obj.encounters[j].name + '</td>';
                outputstring += '<td>' + database_obj.encounters[j].date + '</td>';
                outputstring += '<td>' + database_obj.encounters[j].time + '</td>';
                outputstring += '</tr>';
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

function checkAll(checked) {
    var x = document.getElementsByClassName("opeleinput");
    var i;
    for (i = 0; i < x.length; i++) {
        x[i].checked = checked;
    }
}