import { initAside } from "./aside.js";
import { getStationInfo } from "./getStationInfo.js";
import { stationInformationSidebar } from "./stationInformationSidebar.js";
async function initMap() {
  let mapStyleId;

  google.charts.load("current", { packages: ["corechart"] });

  try {
    const res = await fetch("/dbinfo.json");
    if (!res.ok) {
      throw new Error("Couldn't find Map ID");
    }
    const data = await res.json();
    mapStyleId = data.mapStyleID;
  } catch (e) {
    console.error("Error loading dbinfo.json:", e);
  }

  // The location of Dublin
  const position = { lat: 53.346, lng: -6.25 };
  // 53.34611327830516, -6.264972599005677

  // Request needed libraries.
  const { Map, InfoWindow } = await google.maps.importLibrary("maps");
  const { Place } = await google.maps.importLibrary("places");
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary(
    "marker"
  );
  const { DistanceMatrixService } = await google.maps.importLibrary("routes");

  // The map, centered at Dublin
  let map = new Map(document.getElementById("map"), {
    zoom: 14,
    center: position,
    fullscreenControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_BOTTOM,
    },
    mapId: mapStyleId,
  });

  const infoWindow = new google.maps.InfoWindow({
    content: "",
    disableAutoPan: true,
  });

  //adding inline svg
  // const parser = new DOMParser();
  // A marker with a custom inline SVG.

  const res = await fetch("/stations/");
  const data = await res.json();

  // The markers for each station
  const markers = data.map(
    ({
      name: sName,
      latitude: lat,
      longitude: lng,
      station_id: id,
      total_bike_stands: totalBikesStands,
      available_bikes: availableBikes,
      available_bike_stands: availableBikeStands,
      payment_terminal: paymentTerminal,
      time_updated: latestTimeUpdate,
    }) => {
      let modifiedName = sName
        .split(" ")
        .map((e) => {
          let newName = e.toLowerCase();
          if (newName == "(o'connell's)") {
            return "(O'Connell's)";
          }
          if (newName == "o'connell") {
            return "O'Connell";
          }
          if (newName[0] == "(") {
            return newName[0] + newName[1].toUpperCase() + newName.slice(2);
          }
          return newName[0].toUpperCase() + newName.slice(1);
        })
        .join(" ");
      
      const glyphImg = document.createElement("img");
      glyphImg.classList.add("bike-logo");
      glyphImg.alt = "marker logo";
      glyphImg.classList.add("bike-logo");
      let pinElement
      if (availableBikes != 0) {
        glyphImg.src = "/img/bike.svg"
        pinElement = new google.maps.marker.PinElement({
          background: "#03a981",
          borderColor: "#266052",
          glyph: glyphImg,
          scale: 1,
        })
      }
      else {
        glyphImg.src = "/img/bike_unavailable.svg";
        pinElement = new google.maps.marker.PinElement({
          background: "#f21800",
          borderColor: "#603126",
          glyph: glyphImg,
          scale: 1,
        });
      }

      const marker = new AdvancedMarkerElement({
        position: { lat, lng },
        map: map,
        title: `Station ${id}`,
        content: pinElement.element,
      });

      //Create Pop up Window

      marker.content.addEventListener("mouseover", () => {
        const stationInfo = getStationInfo(
          modifiedName,
          totalBikesStands,
          availableBikes,
          availableBikeStands,
          paymentTerminal,
          latestTimeUpdate
        );
        infoWindow.setContent(stationInfo.innerHTML);
        infoWindow.open(map, marker);
      });

      marker.content.addEventListener("mouseleave", () => {
        infoWindow.close(map, marker);
      });

      marker.content.addEventListener("click", async () => {
        infoWindow.close(map, marker);
        console.log({
          id,
          lat,
          lng,
          modifiedName,
          totalBikesStands,
          availableBikes,
          availableBikeStands,
          paymentTerminal,
          latestTimeUpdate,
        });
        stationInformationSidebar(
          id,
          lat,
          lng,
          modifiedName,
          totalBikesStands,
          availableBikes,
          availableBikeStands,
          paymentTerminal,
          latestTimeUpdate,
          data,
          map
        );
      });

      return marker;
    }
  );

initAside(map, data)
const markerCluster = new markerClusterer.MarkerClusterer({ markers, map})
}

export const activateSideBar = (sidebar) => {
  const btnJourneyPlanner = document.querySelector('.btn-journey-planner')
  const btnNearestStations = document.querySelector('.btn-stations')
  const btnStationInfo = document.querySelector('.btn-station-info')
  if (sidebar == 'journey') {    
    btnJourneyPlanner.classList.add('btn-aside-active')
    btnNearestStations.classList.remove('btn-aside-active')
    btnStationInfo.classList.remove('btn-aside-active')
  }
  if (sidebar == 'nearest') {
    btnJourneyPlanner.classList.remove('btn-aside-active')
    btnNearestStations.classList.add('btn-aside-active')
    btnStationInfo.classList.remove('btn-aside-active')
  }
  if (sidebar == 'info') {
    btnJourneyPlanner.classList.remove('btn-aside-active')
    btnNearestStations.classList.remove('btn-aside-active')
    btnStationInfo.classList.add('btn-aside-active')
  }

}
initMap();
