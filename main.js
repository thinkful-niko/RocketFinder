let allData;

const mq = window.matchMedia( "(max-width: 720px)" );

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

    if (mq.matches) { // media query
        setTimeout(function(){
            $(".controller h2").addClass("displayNone");
            $("footer").addClass("moveDown");
        }, 200);
    }



    setTimeout(function(){
      $("#startScreen").addClass("displayNone");
    }, 2200); //Clears invisible startscreen


    
    $(".controller").addClass("moveUp"); // Animates range input
    $("input[type=range]").addClass("shrink");

    
    markers = [];

    getData(e.target.value); //gets value from (e) and send it to getData as the num parameter

    if(document.getElementById("range").innerHTML != 0){
        setTimeout(function(){
            $('#navigation').prop('checked', true); //slide menu in automatically
        }, 700);
    }

    if(document.getElementById("range").innerHTML == 0){
       
            $('#navigation').prop('checked', false)
        
    };//close side menu if slider value is 0
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

    if (mq.matches) { // closes nav when clicked (MOBILE ONLY)
        $('input#navigation').attr('checked', false);
    }

    if (mq.matches) {
        $('input#navigation+label').addClass('displayNone');

        setTimeout(function(){

            if ($('input#navigation+label').hasClass('displayNone'))
            {
                $('input#navigation+label').removeClass('displayNone');
            }
        },3000);

    }
    
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

   /* IMAGE SEARCH API
    let searchName = singleLaunch.rocket.name;
    let imgSearchAPIURL = "https://api.qwant.com/api/search/images?count=5&offset=1&q=" + searchName;
    let thisImage;


    $.ajax({
        type: "GET",
        url: imgSearchAPIURL, // `${num} gets the num parameter which is the value from the slider input, (e) on line 27`
        success: function(dataIMG) {
            console.log(dataIMG);
            //thisImage = dataIMG.data.results.items[0].media;
        },
        dataType: 'json',
    }); 

    "No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'null' is therefore not allowed access."
    */ 


    stop = true; //Allows user to move earth with its mouse by unlocking position

    let streamURL; //Check to see if the launch will have a live stream, if true populate variable with a link, if false populate variable with a <p> instead.
    if (singleLaunch.vidURLs.length == 0) {
        streamURL = "No Stream/ Stream TBA"
    } else {
        streamURL = "<a href='" + singleLaunch.vidURLs[0] + "' target='_blank'>" + "Stream Information" + "</a>"
    };

    let mission;
    if (singleLaunch.missions.length == 0) {
        mission = "<b>Mission:</b> Unknown";
    } else {
        mission = "<b>Mission Name: </b>" + singleLaunch.missions[0].name + "<br><b>Mission Type: </b>" +  singleLaunch.missions[0].typeName;
    };

    let agency;
    if (singleLaunch.rocket.agencies == 0) {
        agency = "<b>Agency:</b> Unknown";
    } else {
        agency = "<b>Agency: </b><a href='" + singleLaunch.rocket.agencies[0].infoURL + "' target='_blank'>" + singleLaunch.rocket.agencies[0].name + "</a>";
    };

    $("#note").html( //Info Window
        "<div class='infoContent'> <h2>Rocket: " + singleLaunch.rocket.name + "</h2><p>" +
        "<b>Launch Date and Time: </b>" + singleLaunch.net + "<br>" +
        "<b>Launch Location: </b>" + singleLaunch.location.name + "<br>" +
        agency + "<br>" +
        mission + "<br>" +
        "<b>Live Stream: </b>"+ streamURL + "<br><br>" +
        "<a href='" + singleLaunch.rocket.wikiURL + "' target='_blank'>" + "Learn More About This Rocket" + "</a>" +"<br>" +
        "<a href='" + singleLaunch.location.pads[0].mapURL + "' target='_blank'>" + "Map Location" + "</a>" + "<br>" +
        "</p></div> <span id='closeWindow'>X</span>");

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
        $("#launchList>li").removeClass("active");
        $("#launchList>li>a").removeClass("activeCol");


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


// Clears or Adds "active" class on li element.
$("#launchList").on("click", "li", function(e){
  if($("#launchList>li").hasClass("active") && $("#launchList>li>a").hasClass("activeCol")){
    $("#launchList>li").removeClass("active");
    $("#launchList>li>a").removeClass("activeCol");
    $(this).addClass("active");
    $(this).children("a").addClass("activeCol");
  }else{
    $(this).addClass("active");
    $(this).children("a").addClass("activeCol");
  }
});

// When you click the earth it stops animating for a setTimout ammount of times BUG: opening and closing note during the timout causes acceleration;
$("#earth_div").click(function() {
     var before = null;
     stop = true;
     setTimeout(function(){
            stop = false; //Allow animation after closing "focus"/infoWindow
                    
            requestAnimationFrame(function animate(now) { //return to animation
                var c = earth.getPosition();
                var elapsed = before ? now - before : 0;
                before = now;
                earth.setCenter([c[0], c[1] + 0.2 * (elapsed / 30)]);
                if (stop) {
                    return
                };
            requestAnimationFrame(animate);
        });
        

        }, 3500);

})



// Close button, top popup
// close = document.getElementById("close");
// close.addEventListener('click', function() {
//    note = document.getElementById("note");
//    note.style.display = 'none';
//  }, false);



/*TODO:

3- Add google search image API
4- Add wiki API
5- Make everything responsive

7- Mobile functionality for tailored UX



Bonus:
1- Countdown per launch on popUp window;
*/



// Marker Style markers[0].element.style.backgroundColor


