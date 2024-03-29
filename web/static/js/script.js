import { getClosestStations } from "./closestStations.js";
async function initMap() {
  let mapStyleId;
  
  try {
    const res = await fetch('/dbinfo.json')
    if (!res.ok) {
      throw new Error("Couldn't find Map ID")
    }
    const data = await res.json()
    mapStyleId = data.mapStyleID

  } catch (e) {
    console.error('Error loading dbinfo.json:', e)
  }

  // The location of Dublin
  const position = { lat: 53.344, lng: -6.2672 };
  
  // Request needed libraries.
  const { Map, InfoWindow } = await google.maps.importLibrary("maps");
  const { Place } = await google.maps.importLibrary("places");
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
  const { DistanceMatrixService } = await google.maps.importLibrary("routes")

  // The map, centered at Dublin
  let map = new Map(document.getElementById("map"), {
    zoom: 13,
    center: position,
    fullscreenControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_CENTER,
    },
    mapId: mapStyleId,
  });

  const infoWindow = new google.maps.InfoWindow({
    content: "",
    disableAutoPan: true,
  });

  
  const res = await fetch('/stations/')
  const data = await res.json()

  // The markers for each station
  const stationMarkers = data.map(({name: sName, latitude: lat, longitude: lng, station_id: id,
  total_bike_stands: totalBikesStands, available_bikes: availableBikes,
  available_bike_stands: availableBikeStands, payment_terminal: paymentTerminal,
  time_updated: latestTimeUpdate}) => {
    // const pinSvg = parser.parseFromString(
      //   pinSvgString,
      //   "image/svg+xml",
      //   ).documentElement;

      // fixes issues with names
      let modifiedName = sName.split(' ').map(e => {
        let newName = e.toLowerCase()
        if (newName == "(o'connell's)") {
          return "(O'Connell's)"
        }
        if (newName == "o'connell") {
          return "O'Connell"
        }
        if (newName[0] == '(') {
          return newName[0] + newName[1].toUpperCase() + newName.slice(2)
        } 
        return newName[0].toUpperCase() + newName.slice(1)
      }).join(' ')
      
    const glyphImg = document.createElement('img')
    glyphImg.classList.add('bike-logo')
    glyphImg.src = '/img/bike.svg'
    glyphImg.alt = 'marker logo'
    const pinElement= new google.maps.marker.PinElement({
      background: "#03a981",
      borderColor: "#266052",
      glyph: glyphImg,
      scale: 1,
    });

    const marker = new AdvancedMarkerElement({
      position: {lat, lng},
      map: map,
      title: `Station ${id}`,
      content: pinElement.element,
    });

    //Create Pop up Window
    function getStationInfo(name, totalBikesStands, 
      availableBikes,
      availableBikeStands, paymentTerminal,
      latestTimeUpdate) {
      const stationInfoWindow = document.createElement('div');
      stationInfoWindow.classList.add('station-window')

      //total, bikes, stands, pay, update

      const stationName = document.createElement('h1');
      stationName.textContent = name

      const stationTotalBikeStands = document.createElement('p')
      stationTotalBikeStands.textContent = `Total Bike Stands: ${totalBikesStands}`

      const stationAvailableBikes = document.createElement('p')
      stationAvailableBikes.textContent = `Available Bikes: ${availableBikes}`

      const stationAvailableBikeStands = document.createElement('p')
      stationAvailableBikeStands.textContent = `Available Bike Stands: ${availableBikeStands}`

      const stationPaymentTerminal = document.createElement('p')
      stationPaymentTerminal.textContent = `Payment Terminal: ${paymentTerminal ? 'Yes' : 'No'}`

      const stationLastUpdate = document.createElement('p')
      stationLastUpdate.textContent = `Latest Update Time: ${latestTimeUpdate.slice(17, 26)}`

      stationInfoWindow.appendChild(stationName)
      stationInfoWindow.appendChild(stationTotalBikeStands)
      stationInfoWindow.appendChild(stationAvailableBikes)
      stationInfoWindow.appendChild(stationAvailableBikeStands)
      stationInfoWindow.appendChild(stationPaymentTerminal)
      stationInfoWindow.appendChild(stationLastUpdate)

      return stationInfoWindow
    }

    marker.addListener("click", () => {
      const stationInfo = getStationInfo(modifiedName, totalBikesStands, 
        availableBikes,
        availableBikeStands, paymentTerminal,
        latestTimeUpdate)
      infoWindow.setContent(stationInfo.innerHTML);
      infoWindow.open(map, marker);
    });

    return marker;
  })


  //Testing places
  const request = {
    query: "Dublin Castle",
    fields: ["name", "geometry"],
  };

  const service = new google.maps.places.PlacesService(map);

  service.findPlaceFromQuery(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
      for (let i = 0; i < results.length; i++) {
        createMarker(results[i]);
      }

      map.setCenter(results[0].geometry.location);
    }
  });
  
  function createMarker(place) {
    if (!place.geometry || !place.geometry.location) return;
    
    const marker = new AdvancedMarkerElement({
      map,
      position: place.geometry.location,
    });
    
    marker.addListener("click", () => {
      infowindow.setContent(place.name || "");
      infowindow.open(map);
    })
}

// Add nearest stations even listener
getClosestStations(data)

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
    ? "Error: The Geolocation service failed."
    : "Error: Your browser doesn't support geolocation.",
    );
    
  }
  const markerCluster = new markerClusterer.MarkerClusterer({ stationMarkers, map });

  //SEARCH
       // Create the search box and link it to the UI element.
       const input = document.getElementById("pac-input");
       const searchBox = new google.maps.places.SearchBox(input);
     
       map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
       // Bias the SearchBox results towards current map's viewport.
       map.addListener("bounds_changed", () => {
         searchBox.setBounds(map.getBounds());
       });
     
       let searchMarkers = [];
     
       // Listen for the event fired when the user selects a prediction and retrieve
       // more details for that place.
       searchBox.addListener("places_changed", () => {
         const places = searchBox.getPlaces();
     
         if (places.length == 0) {
           return;
         }
     
         // Clear out the old markers.
         searchMarkers.forEach((marker) => {
           marker.setMap(null);
         });
         searchMarkers = [];
     
         // For each place, get the icon, name and location.
         const bounds = new google.maps.LatLngBounds();
     
         places.forEach((place) => {
           if (!place.geometry || !place.geometry.location) {
             console.log("Returned place contains no geometry");
             return;
           }
     
           const icon = {
             url: place.icon,
             size: new google.maps.Size(71, 71),
             origin: new google.maps.Point(0, 0),
             anchor: new google.maps.Point(17, 34),
             scaledSize: new google.maps.Size(25, 25),
           };
     
           // Create a marker for each place.
           searchMarkers.push(
             new google.maps.Marker({
               map,
               icon,
               title: place.name,
               position: place.geometry.location,
             }),
           );
           if (place.geometry.viewport) {
             // Only geocodes have viewport.
             bounds.union(place.geometry.viewport);
           } else {
             bounds.extend(place.geometry.location);
           }
         });
         map.fitBounds(bounds);
       });
       const main = document.querySelector('main')
}

initMap();