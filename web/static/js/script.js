import { getClosestStations } from "./closestStations.js";
import { initJourneyPlanner } from "./journeyPlanner.js";
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
      function getStationInfo(
        name,
        totalBikesStands,
        availableBikes,
        availableBikeStands,
        paymentTerminal,
        latestTimeUpdate
      ) {
        const stationInfoWindow = document.createElement("div");
        stationInfoWindow.classList.add("station-window");

        //total, bikes, stands, pay, update

        const stationName = document.createElement("h1");
        stationName.textContent = name;

        const stationTotalBikeStands = document.createElement("p");
        stationTotalBikeStands.textContent = `Total Bike Stands: ${totalBikesStands}`;

        const stationAvailableBikes = document.createElement("p");
        stationAvailableBikes.textContent = `Available Bikes: ${availableBikes}`;

        const stationAvailableBikeStands = document.createElement("p");
        stationAvailableBikeStands.textContent = `Available Bike Stands: ${availableBikeStands}`;

        const stationPaymentTerminal = document.createElement("p");
        stationPaymentTerminal.textContent = `Payment Terminal: ${
          paymentTerminal ? "Yes" : "No"
        }`;

        const stationLastUpdate = document.createElement("p");
        stationLastUpdate.textContent = `Latest Update Time: ${latestTimeUpdate.slice(
          17,
          26
        )}`;

        stationInfoWindow.appendChild(stationName);
        stationInfoWindow.appendChild(stationTotalBikeStands);
        stationInfoWindow.appendChild(stationAvailableBikes);
        stationInfoWindow.appendChild(stationAvailableBikeStands);
        stationInfoWindow.appendChild(stationPaymentTerminal);
        stationInfoWindow.appendChild(stationLastUpdate);

        return stationInfoWindow;
      }

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
        const stationInfo = getStationInfo(
          modifiedName,
          totalBikesStands,
          availableBikes,
          availableBikeStands,
          paymentTerminal,
          latestTimeUpdate
        );

        // Close the info window, this allows the user to know that the marker was clicked
        infoWindow.close(map, marker);

        const aside = document.querySelector(".station_information_sidebar");
        aside.style.display = "flex";
        aside.innerHTML = "";

        const asideTitle = document.createElement("h2");
        asideTitle.classList.add("closest_station_head");
        asideTitle.textContent = `${modifiedName}`;
        aside.appendChild(asideTitle);

        const stationBikes = document.createElement("p");
        stationBikes.classList.add("station_information_bikes");
        stationBikes.textContent = availableBikes;
        aside.appendChild(stationBikes);

        const stationDistance = document.createElement("p");
        stationDistance.classList.add("closest_station_distance");
        stationDistance.textContent = "10km";
        aside.appendChild(stationDistance);

        const stationWalkTime = document.createElement("p");
        stationWalkTime.classList.add("closest_station_walk_time");
        stationWalkTime.textContent = "20min";
        aside.appendChild(stationWalkTime);

        const availability_title = document.createElement("h2");
        availability_title.classList.add("closest_station_head");
        availability_title.textContent = "Available Stations";
        aside.appendChild(availability_title);

        const availability_chart = document.createElement("div");
        availability_chart.id = "availability-chart";
        aside.appendChild(availability_chart);

        // Create predicted availability chart
        // Get the predicted availability for the station
        let json;
        try {
          const res = await fetch(`/available/${id}`);
          if (!res.ok) {
            throw new Error("Couldn't find station ID");
          }
          json = await res.json();
        } catch (e) {
          console.error("Error connecting to DB: ", e);
        }

        // Iterate over the hours and add to data
        var availability_data = [];
        for (var idx in json.hour) {
          availability_data.push([
            json.hour[idx].toString(),
            json.predicted_available[idx],
          ]);
        }
        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {
          var data = new google.visualization.DataTable();
          data.addColumn("string", "Hour");
          data.addColumn("number", "Busyness Level");
          data.addRows(availability_data);

          var options = {
            legend: "none",
            colors: ["#4286f4"],
            opacity: 0.3,
            vAxis: {
              minValue: 0,
              maxValue: totalBikesStands,
              viewWindow: { min: 0, max: totalBikesStands },
            },
            curveType: "function",
          };
          var chart = new google.visualization.AreaChart(
            document.getElementById("availability-chart")
          );
          chart.draw(data, options);
        }
      });

      return marker;
    }
  );

  getClosestStations(data);
  initJourneyPlanner(map);
  const markerCluster = new markerClusterer.MarkerClusterer({ markers, map });
}

initMap();
