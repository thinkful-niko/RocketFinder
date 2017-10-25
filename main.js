// Global variables
var options = {
    atmosphere: true,
    center: [0, 0],
    zoom: 0
};
var earth = new WE.map('earth_div', options);
var markers = [];
let stop = false;
let allData;

// Media Query
const mq = window.matchMedia( "(max-width: 720px)" );

// Document Preparation
$("#note").html("");

$('input#navigation+label').css("visibility", "hidden");

function showValue(newValue) {
    document.getElementById("range").innerHTML = newValue;
}

//Get Request for LaunchLibrary JSON of launches
function getData(num) {
    $('.text').text('loading . . .');

    $.ajax({
        type: "GET",
        url: `https://launchlibrary.net/1.2/launch/next/${num}`, 
        success: function(data) {
            console.log(data);
            displayMarkers(data, true);
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

//Create Markers, Left List Items, "first" parameter blocks or enables .append method with a boolean
function displayMarkers(data, first) { 
    data.launches.forEach((item, i) => { 

        //Finds location and marks it on Earth
        let longitude = item.location.pads[0].longitude; 
        let latitude = item.location.pads[0].latitude;

        var marker = WE.marker([latitude, longitude]).addTo(earth); 
        markers.push(marker); 
        marker.bindPopup("<div class='blob'><p><b>Rocket name | Payload: </b><br>" + item.name + "</p></div>", {
            maxWidth: 150,
            closeButton: true
        }); 
    
        if (data.launches.length == 1){
          marker.openPopup();
        }

        //Populates Left List With Lauch Info
        if (first) { 
            $("#launchList").append(
                "<li class='jsLaunch" + " " + "sideBarItem'" + "><a href='#'><b>"
                +
                "<p>" + item.rocket.name + "</b>" + "</p>" +
                "<p>" +item.net + "</p>" +
                "<p>" +item.location.name + "</p>" +
                "</a></li>"
            );
        };
    });


}

// Handles Globe Animation
function animation(vel){
    var before = null;
    requestAnimationFrame(function animate(now) {
                var c = earth.getPosition();
                var elapsed = before ? now - before : 0;
                before = now;
                earth.setCenter([c[0], c[1] + vel * (elapsed / 30)]);
                if (stop) {
                    return
                };
                requestAnimationFrame(animate);
    });
}

//Initializes WebGL Earth with NASA Sattelite Tile + Starts Globe Animation On Startup
function initialize2() {
    WE.tileLayer('https://tileserver.maptiler.com/nasa/{z}/{x}/{y}.jpg', { 
        minZoom: 0,
        maxZoom: 5,
        attribution: 'NASA'
    }).addTo(earth);

    animation(0.4);
}


//EVENT ACTIVATED FUNCTIONS-------------------------------------------------------------------------------------------------------------------------



//-------------Stops Animation once user interacts with Earth and waits before restarting
$("#earth_div").click(function() {

     stop = true;
     setTimeout(function(){
            stop = false; //Allow animation after closing "focus"/infoWindow
                    
            animation(0.2);
        
        }, 3500);
})



//-------------Clears or Adds "active" class on li element.
$("#launchList").on("click", "li", function(e){
  if($("#launchList>li").hasClass("active") && $("#launchList>li>a>p").hasClass("activeCol")){
    $("#launchList>li").removeClass("active");
    $("#launchList>li>a>p").removeClass("activeCol");
    $(this).addClass("active");
    $(this).children("a").children("p").addClass("activeCol");
  }else{
    $(this).addClass("active");
    $(this).children("a").children("p").addClass("activeCol");
  }
});



//-------------Range Input Functionality
$("input.sliderControl").on("change", (e) => { 
    for (var i = 0; i < markers.length; i++) {

        markers[i].removeFrom(earth);
        $(".jsLaunch").remove();
    }
    
    //Animates Opening and Left List
    $('input#navigation+label').css("visibility", "initial");
    $("#startScreen").addClass("fadeOut");
    $(".controller p").addClass("fontSize");

    //MEDIA QUERY
    if (mq.matches) {
        setTimeout(function(){
            $(".controller h2").addClass("displayNone");
            $("footer").addClass("moveDown");
        }, 200);
    }


    // Clears Invisible startScreen
    setTimeout(function(){
      $("#startScreen").addClass("displayNone");
    }, 2200);


    //Animates Range Input To The Top
    $(".controller").addClass("moveUp");
    $("input[type=range]").addClass("shrink");

    
    markers = [];

    getData(e.target.value); 

    // Opens Left List If There Are Searches
    if(document.getElementById("range").innerHTML != 0){
        setTimeout(function(){
            $('#navigation').prop('checked', true); 
        }, 700);
    }

    // Closes Left List If There Are 0 Searches
    if(document.getElementById("range").innerHTML == 0){
       
            $('#navigation').prop('checked', false)
        
    };
});



//-------------User Selects List Item
$("#launchList").on("click", "li", function(e) {
    for (var i = 0; i < markers.length; i++) { //loops through array of markers and removes them from earth element;

        markers[i].removeFrom(earth);

    }

    //MEDIA QUERY
    if (mq.matches) { // closes nav when clicked (MOBILE ONLY)
        $('input#navigation').attr('checked', false);
    }

    if (mq.matches) { // Remove label after clicking on li item (and restore after 3 seconds), so user cant open list together with infoWindow on mobile.
        $('input#navigation+label').addClass('displayNone');

        setTimeout(function(){
            if ($('input#navigation+label').hasClass('displayNone'))
            {
                $('input#navigation+label').removeClass('displayNone');
            }
        },3000);

    }
    
    markers = [];

    //Isolates selected marker
    let singleLaunch = allData.launches[$(this).index()]; 

    //Displays ONLY selected marker
    displayMarkers({
        'launches': [singleLaunch]
    }, false); 

    var before = null;
    let lat = singleLaunch.location.pads[0].latitude;
    let long = singleLaunch.location.pads[0].longitude;


    // Calculates The Distance Between Current Center and Marker To Animate The Center of Earth To That Marker When It Is Selected
    function calcChange(future, past, times) { 
        return (future - past) / times; 
    }

    //The greate "times" is, the slower the animation will be
    let times = 50;
    var c = earth.getPosition();

    let val1 = calcChange(lat, c[0], times); // Diff of future and past latitude
    let val2 = calcChange(long, c[1], times); // Diff of future and past longitude

    var before = null;
    var n = 0;

    // Animates in a "times" increment
    requestAnimationFrame(function animate(now) { 
        var c = earth.getPosition();
        earth.setCenter([c[0] + val1, c[1] + val2]); 
        n++;
        if (n > times) {
            return
        }; 
        requestAnimationFrame(animate);
    });

    //Allows user to move earth with its mouse by unlocking position
    stop = true; 

    //Checks for content, if there is no content add a place holder on Right side infoWindow
    let streamURL; 
    if (singleLaunch.vidURLs.length == 0) {
        streamURL = "No Stream/ Stream TBA"
    } else {
        streamURL = "<a href='" + singleLaunch.vidURLs[0] + "' target='_blank'>" + "Stream Information" + "</a>"
    };

    let mission;
    if (singleLaunch.missions.length == 0) {
        mission = "<p><b>Mission:</b> Unknown";
    } else {
        mission = "<p><b>Mission Name: </b>" + singleLaunch.missions[0].name + "</p><p><b>Mission Type: </b>" +  singleLaunch.missions[0].typeName;
    };

    let agency;
    if (singleLaunch.rocket.agencies == 0) {
        agency = "<p><b>Agency:</b> Unknown";
    } else {
        agency = "<p><b>Agency: </b><a href='" + singleLaunch.rocket.agencies[0].infoURL + "' target='_blank'>" + singleLaunch.rocket.agencies[0].name + "</a>";
    };

    //Right Side infoWindow Population
    $("#note").html( 
        "<div class='infoContent'> <h2>Rocket: " + singleLaunch.rocket.name + "</h2>" +
        "<p><b>Launch Date and Time: </b>" + singleLaunch.net  + "</p>" +
        "<p><b>Launch Location: </b>" + singleLaunch.location.name + "</p>" +
        agency  + "</p>" +
        mission  + "</p>" +
        "<p><b>Live Stream: </b>"+ streamURL + "</p>" +
        "<p><a href='" + singleLaunch.rocket.wikiURL + "' target='_blank'>" + "Learn More About This Rocket" + "</a></p>" +
        "<p><a href='" + singleLaunch.location.pads[0].mapURL + "' target='_blank'>" + "Map Location" + "</a></p>" +
        "</p></div> <span id='closeWindow'>X</span>");

    // INFO WINDOW SLIDING ANIMATION WITH CSS KEYFRAMES CLASSES
    $("#note div").addClass("infoWindow");

    //This will populate the popup once the list item is selected.
    $("#note").addClass("close");
    $("#note").addClass("open");

    $("#note").toggleClass("close");
    $("#note").removeClass("displayNone");

    //X closes right side window
    $("#closeWindow").on("click", function() { 
        $("#note").toggleClass("close");
        $("#note").toggleClass("open");
        $("#launchList>li").removeClass("active");
        $("#launchList>li>a>p").removeClass("activeCol");


        stop = false; //Allow animation after closing "focus"/infoWindow
        
        //Enable Animation Again       
        animation(0.4);

        //Display Markers Again
        displayMarkers(allData, false);
    });
});