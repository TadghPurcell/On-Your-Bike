let map;

async function initMap() {
  let mapKey;
  let mapStyleId;
  
  try {
    const res = await fetch('/dbinfo.json')
    if (!res.ok) {
      throw new Error("Couldn't find API key or Map ID")
    }
    const data = await res.json()

    mapKey = data.mapsAPIKey
    mapStyleId = data.mapStyleID

  } catch (e) {
    console.error('Error loading dbinfo.json:', e)
  }

  //Google Maps Code
  (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})
        ({key: mapKey, v: "weekly"});

  //Google maps own code

  // The location of Dublin
  const position = { lat: 53.344, lng: -6.2672 };
  // Request needed libraries.
  //@ts-ignore
  const { Map, InfoWindow } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

  // The map, centered at Dublin
  map = new Map(document.getElementById("map"), {
    zoom: 13,
    center: position,
    mapId: mapStyleId,
  });

  const infoWindow = new google.maps.InfoWindow({
    content: "",
    disableAutoPan: true,
  });

  
//adding inline svg
// const parser = new DOMParser();
// A marker with a custom inline SVG.


// hard coded for now but will create function to get locations from db and populat the screen

const res = await fetch('/stations/')
const data = await res.json()

console.log(data[0])
// data.forEach(e => {
//   console.log(e.station_id)
// });


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
      
    const pinGlyph = new google.maps.marker.PinElement({
      glyph: id.toString(),
      glyphColor: "White",
    })
    const pinBackground = new google.maps.marker.PinElement({
      background: "#FBBC04",
    });
    const pinScaled = new google.maps.marker.PinElement({
      scale: 0.5,
    })
    const marker = new AdvancedMarkerElement({
      position: {lat, lng},
      map: map,
      title: `Station ${id}`,
      // content: pinBackground.element,
      content: pinScaled.element,
      content: pinGlyph.element,
      //issue with trying to use custom SVG probably in the way its parsed
      // content: pinSvg,
    });

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

    // markers can only be keyboard focusable when they have click listeners
    // open info window when marker is clicked
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

  // const markerCluster = new MarkerClusterer({ markers, map });
}

initMap();