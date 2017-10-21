let allData;

$("#note").html("");

function getData(num) {
    $('.text').text('loading . . .');

    $.ajax({
        type: "GET",
        url: `https://launchlibrary.net/1.2/launch/next/${num}`, // `${num} gets the num parameter which is the value from the slider input, (e) on line 27`
        success: function(data) {
            //$('.text').text(JSON.stringify(data));
            console.log(data);
            displayMarkers(data, true); //run marker display function, which fetches latitude and longitude from JSON and creates a marker from that; The "true" parameter allows line 86 to run.
            allData = data;
            return data;
        },
        dataType: 'json',
    });
};

// WebGL initialize
$(document).ready(function() {

    initialize2();
});

function displayMarkers(data, first) { //gets data (JSON) from getData function and creates map markers & left sidebar list items. "first" parameter is a boolean that will either allow or stop #launchlist event from appending more li to html


    //console.log(data);
    
    data.launches.forEach((item, i) => { // loops through JSON, items are the elements in the array, i is the # of the item inside the array


        let longitude = item.location.pads[0].longitude; //fetches longitutde and latitude from JSON, pads are always [0];
        let latitude = item.location.pads[0].latitude;

        var marker = WE.marker([latitude, longitude]).addTo(earth); // creates marker variable for earthGL
        markers.push(marker); //pushes marker inside an array of markers[] so it can be removed with a change of the slider;
        marker.bindPopup("<div class='blob'><p><b>Rocket name | Payload: </b><br>" + item.name + "</p></div>", {
            maxWidth: 150,
            closeButton: true
        }); // Popup description inside the marker, at the moment set to name only.

        if (data.launches.length == 1){
          marker.openPopup();
        }


        if (first) { // if statement stops this part of function from running on the #launchlist li click function bellow
            $("#launchList").append(
                "<li class='jsLaunch" + " " + "sideBarItem'" + "><a href='#'><b>" // I'm adding two classes in case I want to do live update of the list, "sideBarItem" is reserved for styling.
                +
                item.name + "</b><br>" +
                item.net + "<br>" +
                item.location.name + "<br>"
                // + "<a href='" + item.rocket.wikiURL + "' target='_blank'>" + "About Rocket" + "</a>" +"<br>" 
                // + "<a href='" + item.location.pads[0].mapURL + "' target='_blank'>" + "Map" + "</a>" + "<br>" 
                +
                "</a></li>" //End



            ); //This will eventually be the sidebar populated w/ more info
        };
    });

    window.markers = markers; //probably unecessary at this point, but I'll leave it here.
}

//Show value for # of launches
function showValue(newValue) {
    document.getElementById("range").innerHTML = newValue;
}

$('input#navigation+label').css("visibility", "hidden"); //Hide Slide Menu Button


// Slider Functionality and Value
$("input.sliderControl").on("change", (e) => { //once the slider (input) changes, it fetches "e" value and sends it to getData

    for (var i = 0; i < markers.length; i++) { //loops through array of markers and removes them from earth element;

        markers[i].removeFrom(earth);
        $(".jsLaunch").remove(); //Currently this removes all list items and resets the list to fit the "e" value. Should I implement live update through a loop?
    }
  
    $('input#navigation+label').css("visibility", "initial");// Show Button after moving slider
    $("#startScreen").addClass("fadeOut"); //Fades start screen
    $(".controller p").addClass("fontSize");
    
    setTimeout(function(){
      $("#startScreen").addClass("displayNone");
    }, 2200); //Clears invisible startscreen


    
    $(".controller").addClass("moveUp"); // Animates range input
    $("input[type=range]").addClass("shrink");
    
    markers = [];

    getData(e.target.value); //gets value from (e) and send it to getData as the num parameter

    $('#navigation').prop('checked', true); //slide menu in automatically

    if(document.getElementById("range").innerHTML == 0){$('#navigation').prop('checked', false)};//close side menu if slider value is 0
});

// Global variables
var options = {
    atmosphere: true,
    center: [0, 0],
    zoom: 0
};
var earth = new WE.map('earth_div', options);
var markers = [];
let stop = false;

function initialize2() { // webGL Adds Satellite Tile + Animation 
    WE.tileLayer('https://tileserver.maptiler.com/nasa/{z}/{x}/{y}.jpg', { //fetching texture
        minZoom: 0,
        maxZoom: 5,
        attribution: 'NASA'
    }).addTo(earth);

    var before = null;
    requestAnimationFrame(function animate(now) {
        var c = earth.getPosition();
        var elapsed = before ? now - before : 0; 
        before = now;
        earth.setCenter([c[0], c[1] + 0.4 * (elapsed / 30)]); // Setting center to be current lat and long 0.5 is the velocity
        if (stop) {
            return
        };
        requestAnimationFrame(animate); // recursion for "endless" rotation
    });
}






$("#launchList").on("click", "li", function(e) {
    for (var i = 0; i < markers.length; i++) { //loops through array of markers and removes them from earth element;

        markers[i].removeFrom(earth);

    }
    // $('input#navigation').attr('checked', false); //This closes navigation when a li element is clicked
    

    markers = []; // set markers array to empty


    let singleLaunch = allData.launches[$(this).index()]; // isolates single selected launch from li element. $(this).index() transforms li into array and fetches its array position to be used as the data.launches[] position 

    displayMarkers({
        'launches': [singleLaunch]
    }, false); //runs display marker function for the single selected li element. The "false" parameter stops displayMarkers to run the ("#launchList").append code.

    //console.log(singleLaunch);

    //earth.setCenter([[singleLaunch.location.pads[0].latitude], [singleLaunch.location.pads[0].longitude]]);

    var before = null; // not sure if this is necessary, but I'll keep it here.
    let lat = singleLaunch.location.pads[0].latitude; //Fetches the latitude of the selected li element
    let long = singleLaunch.location.pads[0].longitude; //Fetches the longitude of the selected li element



    function calcChange(future, past, times) { //New "smooth" 3d earth focus animation
        return (future - past) / times; // The difference of the future position (lat or long) divided by "times" which will then be incrementally compensated in the animation recursive loop, this function is called twice (154 and 155) to define variables for lat and long separately.
    }

    let times = 50; // Regulates velocity (50 frames for the animation loop) 
    var c = earth.getPosition();

    let val1 = calcChange(lat, c[0], times); // Diff of future and past latitude
    let val2 = calcChange(long, c[1], times); // Diff of future and past longitude

    var before = null;
    var n = 0;

    requestAnimationFrame(function animate(now) { // animates the "focus" of the list into the earth. ??WHAT IS THE "NOW" PARAMETER DOING??
        var c = earth.getPosition();
        earth.setCenter([c[0] + val1, c[1] + val2]); // Uses the difference between future and past positions, to add to current position and increment it by 50 on n++ recursive loop
        n++;
        if (n > times) {
            return
        }; // Recursive loop stop condition 
        requestAnimationFrame(animate); // calls itself only until the "times" incrementation is met, giving us the full value of (future-past)/times, so it doesn't snap in position.


    });

    stop = true; //Allows user to move earth with its mouse by unlocking position

    let streamURL; //Check to see if the launch will have a live stream, if true populate variable with a link, if false populate variable with a <p> instead.
    if (singleLaunch.vidURLs.length == 0) {
        streamURL = "No Stream/ Stream TBA"
    } else {
        streamURL = "<a href='" + singleLaunch.vidURLs[0] + "' target='_blank'>" + "Live Stream Schedule" + "</a>" + "<br>"
    };

    $("#note").html( //Info Window
        "<div class='infoContent'> <h2>" + singleLaunch.name + "</h2><p>" +
        singleLaunch.net + "<br>" +
        singleLaunch.location.name + "<br>" +
        "<a href='" + singleLaunch.rocket.wikiURL + "' target='_blank'>" + "About Rocket" + "</a>" + "<br>" +
        "<a href='" + singleLaunch.location.pads[0].mapURL + "' target='_blank'>" + "Map" + "</a>" + "<br>" +
        streamURL +
        "</p> <span id='closeWindow'>X</span></div>");

    // INFO WINDOW SLIDING ANIMATION WITH CSS KEYFRAMES CLASSES
    $("#note div").addClass("infoWindow");
    //This will populate the popup once the list item is selected.
    $("#note").addClass("close");//Close has to come first here so it doesnt impedes open class, it is toggled later to allow the code to run again.
    $("#note").addClass("open");

    $("#note").toggleClass("close");// !NOT REDUNDANT close is removed from the default class so it can be toggled later. It seems redundant but it allows the code to run a second time.
    $("#note").removeClass("displayNone");

    $("#closeWindow").on("click", function() { //X closes window and earth goes back to spinning
        console.log("clicked");
        // $("#note").html("");
        $("#note").toggleClass("close");//this time close is added to the class.
        $("#note").toggleClass("open");//it has to be removed (toggled) otherwise it wont run a second time

        stop = false; //Allow animation after closing "focus"/infoWindow
        requestAnimationFrame(function animate(now) { //return to animation
            var c = earth.getPosition();
            var elapsed = before ? now - before : 0;
            before = now;
            earth.setCenter([c[0], c[1] + 0.4 * (elapsed / 30)]);
            if (stop) {
                return
            };
            requestAnimationFrame(animate);
        });

        displayMarkers(allData, false); //display markers again

    });
});



// Close button, top popup
// close = document.getElementById("close");
// close.addEventListener('click', function() {
//    note = document.getElementById("note");
//    note.style.display = 'none';
//  }, false);



/*TODO:
1- Make markers clickable (to info window);
2- Add a search with auto complete;
3- Add google search image API
4- Add wiki API
5- Make everything responsive
6- Active li item style and functionality
7- Mobile functionality for tailored UX



Bonus:
1- Countdown per launch on popUp window;
*/



// Marker Style markers[0].element.style.backgroundColor


