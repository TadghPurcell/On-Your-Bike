let map;

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
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

  // The map, centered at Dublin
  map = new Map(document.getElementById("map"), {
    zoom: 13,
    center: position,
    fullscreenControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    mapId: mapStyleId,
  });

  const infoWindow = new google.maps.InfoWindow({
    content: "",
    disableAutoPan: true,
  });

  
//adding inline svg
// const parser = new DOMParser();
// A marker with a custom inline SVG.

const res = await fetch('/stations/')
const data = await res.json()

  // The markers for each station
const markers = data.map(({name: sName, latitude: lat, longitude: lng, station_id: id,
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

  const markerCluster = new markerClusterer.MarkerClusterer({ markers, map });
}

initMap();