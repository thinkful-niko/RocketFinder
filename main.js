
function getData(num){
	 $('.text').text('loading . . .');
  
  $.ajax({
    type:"GET",
    url:`https://launchlibrary.net/1.2/launch/next/${num}`, // `${num} gets the num parameter which is the value from the slider input, (e) on line 27`
    success: function(data) {
      //$('.text').text(JSON.stringify(data));
      console.log(data);
      displayMarkers(data); //run marker display function, which fetches latitude and longitude from JSON and creates a marker from that;
      return data;
    },
    dataType: 'json',
  });
};



// WebGL
$(document).ready(function(){

	initialize2();
});

//Get value for # of launches
function showValue(newValue) { document.getElementById("range").innerHTML=newValue; }

$("input").on("change", (e) => { //once the slider (input) changes, it fetches "e" value and sends it to getData on line 39
	
	for (var i = 0; i < markers.length; i++) { //loops through array of markers and removes them from earth element;
        	
        	markers[i].removeFrom(earth);
          $(".jsLaunch").remove();//Currently this removes all list items and resets the list to fit the "e" value. Should I implement live update through a loop?
        }

    markers = [];

 	getData(e.target.value); //gets value from (e) and send it to getData as the num parameter
 });

// Global variables
var options = {atmosphere: true, center: [0, 0], zoom: 0};
var earth = new WE.map('earth_div', options);
var markers = [];

function initialize2() { // webGL initialize, will eventually get removed with the exeption of tilelayer and other lines.
		
        WE.tileLayer('http://tileserver.maptiler.com/nasa/{z}/{x}/{y}.jpg', {
           minZoom: 0,
           maxZoom: 5,
           attribution: 'NASA'
        }).addTo(earth);
      }

function displayMarkers(data){ //gets data (JSON) from getData function and creates map markers & left sidebar list items

        data.launches.forEach((item, i) => { // loops through JSON, items are the elements in the array, i is the # of the item inside the array
        	console.log(item);

        	let longitude = item.location.pads[0].longitude; //fetches longitutde and latitude from JSON, pads are always [0];
			    let latitude = item.location.pads[0].latitude;

			    var marker = WE.marker([latitude, longitude]).addTo(earth); // creates marker variable for earthGL
			    markers.push(marker); //pushes marker inside an array of markers[] so it can be removed with a change of the slider;
          marker.bindPopup("<p><b>Rocket name: </b><br>" + item.name+ "<br><hr><b>Launch date: <br></b>" + item.net , {maxWidth: 150, closeButton: true}).openPopup();// Popup description inside the marker, at the moment set to name only.

          
          $("#launchList").append("<li class='jsLaunch" + " " + "sideBarItem'" + ">" + item.location.name + "<br>" + item.net + "<br>" + item.name + "<br>" + "<a href='" + item.rocket.wikiURL + "' target='_blank'>" + "About Rocket" + "</a>" +"<br>" + "<a href='" + item.location.pads[0].mapURL + "' target='_blank'>" + "Directions" + "</a>" + "<br><hr>" + "</li>"); //This will eventually be the sidebar populated w/ more info
          // I'm adding two classes in case I want to do live update of the list, "sideBarItem" is reserved for styling.

          console.log(markers);
        });

        window.markers = markers;
}

/*TODO:
1- Create pop-up (closeable overlay to the right of the globe) once list item is clicked, that popud will have more information including: Wiki, Gmaps link, Image of the rocket, Countdown for launch?
2- Create Globe marker highlight/focus upon list "selection"
3- Get particle.js background working;
4- Styling:
  4.1- Header bar with logo + slider + aboutProject link that opens a popup(overlay);
  4.2- List items to left sidebar (Limited height, needs scroller);
  4.3- Pop-up overlay style;
  4.4- Footer with contact info;
  4.5- Figure out the mobile UI/BG
*/

