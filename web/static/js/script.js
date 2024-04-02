import { getStationInfo } from "./getStationInfo.js";
import { getClosestStations } from "./closestStations.js";
import { initJourneyPlanner } from "./journeyPlanner.js";
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
  const position = { lat: 53.344, lng: -6.2672 };

  // Request needed libraries.
  const { Map, InfoWindow } = await google.maps.importLibrary("maps");
  const { Place } = await google.maps.importLibrary("places");
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary(
    "marker"
  );
  const { DistanceMatrixService } = await google.maps.importLibrary("routes");

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
      glyphImg.src = "/img/bike.svg";
      glyphImg.alt = "marker logo";
      const pinElement = new google.maps.marker.PinElement({
        background: "#03a981",
        borderColor: "#266052",
        glyph: glyphImg,
        scale: 1,
      });

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
        stationInformationSidebar(
          id,
          modifiedName,
          totalBikesStands,
          availableBikes,
          availableBikeStands,
          paymentTerminal,
          latestTimeUpdate
        );
      });

      return marker;
    }
  );

  getClosestStations(data);
  initJourneyPlanner(map);
  const markerCluster = new markerClusterer.MarkerClusterer({ markers, map });
}

initMap();
