$('.btn').click(function() {
  
  $('.text').text('loading . . .');
  
  $.ajax({
    type:"GET",
    url:"https://launchlibrary.net/1.2/launch/",
    success: function(data) {
      //$('.text').text(JSON.stringify(data));
      console.log(data);
    },
    dataType: 'json',
  });
  
});



// WebGL
$(document).ready(function(){initialize2()});

// function initialize() {
//         var earth = new WE.map('earth_div');
//         WE.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(earth);

//         var marker = WE.marker([51.5, -0.09]).addTo(earth);
//         marker.bindPopup("<b>Hello world!</b><br>I am a popup.<br /><span style='font-size:10px;color:#999'>Tip: Another popup is hidden in Cairo..</span>", {maxWidth: 150, closeButton: true}).openPopup();

//         var marker2 = WE.marker([30.058056, 31.228889]).addTo(earth);
//         marker2.bindPopup("<b>Cairo</b><br>Yay, you found me!", {maxWidth: 120, closeButton: false});

//         var markerCustom = WE.marker([50, -9], '/img/logo-webglearth-white-100.png', 100, 24).addTo(earth);

//         earth.setView([51.505, 0], 6);
//       }


      function initialize2() {
      	//var location = data.launches.location.pads[0].latitude;

        var options = {atmosphere: true, center: [0, 0], zoom: 0};
        var earth = new WE.map('earth_div', options);

		var marker = WE.marker([51.5, -0.09]).addTo(earth);
        marker.bindPopup("<b>Hello world!</b><br>I am a popup.<br /><span style='font-size:10px;color:#999'>Tip: Another popup is hidden in Cairo..</span>", {maxWidth: 150, closeButton: true}).openPopup();

        var marker2 = WE.marker([30.058056, 31.228889]).addTo(earth);
        marker2.bindPopup("<b>Cairo</b><br>Yay, you found me!", {maxWidth: 120, closeButton: false});

        var markerCustom = WE.marker([50, -9], '/img/logo-webglearth-white-100.png', 100, 24).addTo(earth);

        WE.tileLayer('http://tileserver.maptiler.com/nasa/{z}/{x}/{y}.jpg', {
           minZoom: 0,
           maxZoom: 5,
           attribution: 'NASA'
        }).addTo(earth);
      }