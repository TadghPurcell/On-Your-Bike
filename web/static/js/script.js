import { initAside } from "./aside.js";
import { initJourneyPlanner } from "./journeyPlanner.js";
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
      let pinElement;
      if (availableBikes != 0) {
        glyphImg.src = "/img/bike.svg";
        pinElement = new google.maps.marker.PinElement({
          background: "#03a981",
          borderColor: "#266052",
          glyph: glyphImg,
          scale: 1,
        });
      } else {
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
        // Define the new position
        let newPosition = new google.maps.LatLng(lat, lng + 0.002); // add 0.002 to offset sidebar
        // Set the new position
        map.setCenter(newPosition);
        map.setZoom(16);

        stationInformationSidebar(
          id,
          lat,
          lng,
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

  // Add user location marker
  if (navigator.geolocation) {
    // Get the current location
    navigator.geolocation.getCurrentPosition(
      function (position) {
        // Retrieve latitude and longitude
        let userLatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // User location marker
        let userMarker = new google.maps.Marker({
          position: userLatLng,
          map: map, // Assuming 'map' is your map instance
          title: "Your Current Location",
          icon: {
            url: "./img/circle.svg",
            scaledSize: new google.maps.Size(40, 40),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(20, 20),
          },
        });
        // // Center the map on the user's current location
        // map.setCenter(userLatLng);
      },
      function () {
        // Handle errors if Geolocation fails
        alert("Geolocation service failed.");
      }
    );
  } else {
    // Browser doesn't support Geolocation
    alert("Geolocation not supported by your browser.");
  }

  initAside(map, data);
  const markerCluster = new markerClusterer.MarkerClusterer({ markers, map });
}

initMap();
