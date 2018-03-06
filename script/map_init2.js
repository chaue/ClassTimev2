var map;
var infowindow;

var markers = [];
var infowin = [];

var startLoc = null;
var startLocName;
var endLoc = null;
var endLocName;

var d;

var flip = false;

var content = "hello";

function initMap(dName) 
{
	var ucla = {lat: 34.0689, lng: -118.4452};

	map = new google.maps.Map(document.getElementById('map'), 
	{
		center: ucla,
		zoom: 15
	});
	
	// Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
        });

        var markers = [];
		var infowin = [];
		
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
          var places = searchBox.getPlaces();

          if (places.length == 0) {
            return;
          }

          // Clear out the old markers.
          markers.forEach(function(marker) {
            marker.setMap(null);
          });
          markers = [];

          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();
          places.forEach(function(place) {
            if (!place.geometry) {
              console.log("Returned place contains no geometry");
              return;
            }
		// this works ////////////////////////	
		  var infowindow = new google.maps.InfoWindow({
			  content: place.name 
		  });
            
			var marker = new google.maps.Marker({
              map: map,
              title: place.name,
              position: place.geometry.location
            })
			marker.addListener('mouseover', function(){
				infowindow.open(map, marker);
			});
			marker.addListener('mouseout', function() {
				infowindow.close();
			});
			
			markers.push(marker);
		////////////////////////////////////////////////

			google.maps.event.addListener(marker, 'click', function() 
			{
				if(startLoc !== null && endLoc !== null)
				{
					if(startLoc !== marker){
						startLoc.setAnimation(null);
					}
					endLoc.setAnimation(null);
					startLoc = null;
					endLoc = null;
					marker.setAnimation(google.maps.Animation.BOUNCE);
					document.getElementById("dest").innerHTML = " ";
				}
				if(!flip)
				{
					document.getElementById("startloc").innerHTML = place.name;
					startLocName = place.name;
					startLoc = marker;
					flip = !flip;
					marker.setAnimation(google.maps.Animation.BOUNCE);
				}
				else
				{
					document.getElementById("dest").innerHTML = place.name;
					endLocName = place.name;
					endLoc = marker;
					flip = !flip;
					marker.setAnimation(google.maps.Animation.BOUNCE);
				}
			});
	
            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          map.fitBounds(bounds);
        });
      }
	
	//infowindow = new google.maps.InfoWindow();
	var service = new google.maps.places.PlacesService(map);
	service.nearbySearch({
		location: ucla,
		radius: 1000,
		name: dName
	}, callback);
	if(startLoc !== null)
	{
		startLoc.setMap(map);
		startLoc.setAnimation(google.maps.Animation.BOUNCE);
	}
	if(endLoc !== null)
	{
		endLoc.setMap(map);
		endLoc.setAnimation(google.maps.Animation.BOUNCE);
	}
}


function callback(results, status) 
{
	if (status === google.maps.places.PlacesServiceStatus.OK) 
	{
		for (var i = 0; i < results.length; i++) 
		{
			createMarker(results[i]);
		}	
	}
}

//google.maps.event.addDomListener(window, 'load', init_map(););



function createMarker(place) 
{	

	// make marker
	var infowindow = new google.maps.InfoWindow({
		content: place.name
	});
	infowin.push(infowindow);
	
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location
	});
	marker.addListener('mouseover', function(){
		infowindow.open(map, marker);
	});
	marker.addListener('mouseout', function() {
		infowindow.close();
	});
	
	markers.push(marker);
	
	// add click functionality 
	google.maps.event.addListener(marker, 'click', function() 
	{
		if(startLoc !== null && endLoc !== null)
		{
			if(startLoc !== marker){
				startLoc.setAnimation(null);
			}
			endLoc.setAnimation(null);
			startLoc = null;
			endLoc = null;
			marker.setAnimation(google.maps.Animation.BOUNCE);
			document.getElementById("dest").innerHTML = " ";
		}
		if(!flip)
		{
			document.getElementById("startloc").innerHTML = place.name;
			startLocName = place.name;
			startLoc = marker;
			flip = !flip;
			marker.setAnimation(google.maps.Animation.BOUNCE);
		}
		else
		{
			document.getElementById("dest").innerHTML = place.name;
			endLocName = place.name;
			endLoc = marker;
			flip = !flip;
			marker.setAnimation(google.maps.Animation.BOUNCE);
		}
	});
	
	

}
function calculateDistance()
{
	if(startLoc === null || endLoc === null)
	{
		alert("Start and end positions cannot be nothing!!!");
	}
	else
	{
		var ddl = document.getElementById("speedselect");
		var speed = ddl.options[ddl.selectedIndex].value;
		
		var toRad = Math.PI / 180;
		var r = 6378137;
		var lat1 = startLoc.position.lat() * toRad;
		var long1 = startLoc.position.lng();
		var lat2 = endLoc.position.lat() * toRad;
		var long2 = endLoc.position.lng();
		
		var dlat = (lat2 - lat1);
		var dlong = (long2 - long1) * toRad;
		
		var a = Math.sin(dlat/2) * Math.sin(dlat/2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(dlong/2) * Math.sin(dlong/2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));


		d = r * c / speed / 60;
		var googDist = -1;
		var directionsService = new google.maps.DirectionsService();

		var request =
		{
			origin: startLoc.getPosition(),
			destination: endLoc.getPosition(),
			travelMode: google.maps.DirectionsTravelMode.WALKING
		};

		directionsService.route(request, function(request, status) 
		{
			if ( status === google.maps.DirectionsStatus.OK ) 
			{
				googDist = request.routes[0].legs[0].distance.value/speed/60;
				d = (d + googDist) / 2;
				//d = Math.round(d);
				
				updateTable();
			}
			else 
			{
				alert("A kitten died");
			}
		});		
	}	
}

function updateMap()
{
	var newInfo = document.getElementById('wheretogo').value;
	initMap(newInfo);
}	

function updateTable() {

	var toa1 = document.getElementById('toa1').value;
	var toa2 = document.getElementById('toa2').value;
	var numtoa1;
	var numtoa2;
	var leaveby;
	var leavebyhr;
	var leavebymin;
	var leavebystr;
	var leavebyminstr;
	var leavebyhrstr;
	
	numtoa1 = parseInt(toa1, 10);
	numtoa2 = parseInt(toa2, 10);

	if ((toa1 < 24 && toa1 >= 0) && (toa2 >= 0 && toa2 < 60)) {
		
		numtoa = numtoa1 * 60 + numtoa2 // hour and min to just min
				
		leaveby = numtoa - d;
		leavebyhr = leaveby / 60;
		leavebymin = leaveby % 60;
		
		leavebyhrstr = Math.trunc(leavebyhr).toString();
		leavebyminstr = Math.trunc(leavebymin).toString();
		if(leavebymin < 10)
		{
			leavebyminstr = "0" + Math.trunc(leavebymin).toString();
		}
		leavebystr = leavebyhrstr + ":" + leavebyminstr;
	}
	
	document.getElementById("traveltime").innerHTML = d;
	document.getElementById("leaveby").innerHTML = leavebystr;
	document.getElementById("traveltime").innerHTML = d.toPrecision(3);
}