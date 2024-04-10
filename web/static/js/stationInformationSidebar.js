import { getStationInfo } from "./getStationInfo.js";
import { initJourneyPlanner } from "./journeyPlanner.js";
import { activateSideBar } from "./script.js";
 // Make the station information sidebar
export async function stationInformationSidebar(
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
) {
  const stationInfo = getStationInfo(
    modifiedName,
    totalBikesStands,
    availableBikes,
    availableBikeStands,
    paymentTerminal,
    latestTimeUpdate
  );

  // For getting distance/time to station
  const { DistanceMatrixService } = await google.maps.importLibrary("routes");
  const distanceService = new DistanceMatrixService();

  const btnJourneyPlanner = document.querySelector(".btn-journey-planner");
  const btnNearestStations = document.querySelector(".btn-stations");
  const btnStationInfo = document.querySelector(".btn-station-info");

  btnStationInfo.classList.add("btn-aside-active");
  btnJourneyPlanner.classList.remove("btn-aside-active");
  btnNearestStations.classList.remove("btn-aside-active");

  const asideMain = document.querySelector(".aside-main");
  asideMain.innerHTML = "";

  const topDiv = document.createElement("div");
  topDiv.classList.add('station_info_div')

  const asideTitle = document.createElement("h2");
  asideTitle.classList.add("closest_station_head");
  asideTitle.textContent = `${modifiedName}`;
  topDiv.appendChild(asideTitle);

  const quickInfo = document.createElement("div");
  quickInfo.classList.add("station_information");

  const stationBikes = document.createElement("p");
  stationBikes.classList.add("station_information_data");
  stationBikes.classList.add("station_information_bikes");
  stationBikes.textContent = availableBikes;
  quickInfo.appendChild(stationBikes);

  const stationParking = document.createElement("p");
  stationParking.classList.add("station_information_data");
  stationParking.classList.add("station_information_parking");
  stationParking.textContent = availableBikeStands;
  quickInfo.appendChild(stationParking);

  const stationPayment = document.createElement("p");
  stationPayment.classList.add("station_information_data");
  stationPayment.classList.add("station_information_payment");
  stationPayment.textContent = paymentTerminal ? 'Yes' : 'No';
  quickInfo.appendChild(stationPayment)

  const stationDistance = document.createElement("p");
  stationDistance.classList.add("station_information_data");
  stationDistance.classList.add("station_information_distance");
  stationDistance.textContent = "..."; // Leave as 3 dots while distance loads


  const stationWalkTime = document.createElement("p");
  stationWalkTime.classList.add("station_information_data");
  stationWalkTime.classList.add("station_information_walk_time");
  stationWalkTime.textContent = "..."; // Leave as 3 dots while walk time loads

  // Get the current location if available and add distance and walk times to sidebar
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      const stationDistInfo = await new Promise((resolve, reject) => {
        distanceService.getDistanceMatrix(
          {
            origins: [pos],
            destinations: [{ lat, lng }],
            travelMode: "WALKING",
          },
          (response, status) => {
            if (status == "OK") {
              resolve({
                modifiedName,
                availableBikes,
                distanceVal: response.rows[0].elements[0].distance.value,
                distanceText: response.rows[0].elements[0].distance.text,
                walkTime: response.rows[0].elements[0].duration.text,
              });
            } else {
              reject(status);
            }
          }
        );
      });
      stationDistance.innerText = stationDistInfo.distanceText;
      stationWalkTime.innerText = stationDistInfo.walkTime;
    });
  }

  quickInfo.appendChild(stationDistance);
  quickInfo.appendChild(stationWalkTime);
  topDiv.appendChild(quickInfo);
  asideMain.appendChild(topDiv);

  const directions = document.createElement("button");
  directions.classList.add("directions-button");
  directions.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="120 -840 720 720" width="20"><path fill="#ffffff" d="M480-840q74 0 139.5 28.5T734-734q49 49 77.5 114.5T840-480q0 74-28.5 139.5T734-226q-49 49-114.5 77.5T480-120q-41 0-79-9t-76-26l61-61q23 8 46.5 12t47.5 4q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 24 4 47.5t12 46.5l-60 60q-18-36-27-74.5t-9-79.5q0-74 28.5-139.5T226-734q49-49 114.5-77.5T480-840Zm40 520v-144L176-120l-56-56 344-344H320v-80h280v280h-80Z"/></svg>';
  topDiv.appendChild(directions);

  directions.addEventListener('click', () => {
    activateSideBar('journey')
    initJourneyPlanner(map, data, modifiedName)
  })

  const availability_title = document.createElement("h2");
  availability_title.classList.add("closest_station_head");
  availability_title.textContent = "Bike Availability";
  asideMain.appendChild(availability_title);

  const availability_chart = document.createElement("div");
  availability_chart.id = "availability-chart";
  asideMain.appendChild(availability_chart);

  const avail_station_title = document.createElement("h2");
  avail_station_title.classList.add("closest_station_head");

  avail_station_title.textContent = "Station Availability";
  asideMain.appendChild(avail_station_title);

  const station_chart = document.createElement("div");
  station_chart.id = "avail-station-chart";
  asideMain.appendChild(station_chart);

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
  var availability_data = json.data;
  var avail_station_data = [];
  for (var row of availability_data) {
    let new_row = [row[0]];
    if (row[1] !== null) {
      new_row.push(totalBikesStands - row[1]);
    } else {
      new_row.push(null);
    }

    if (row[2] !== null) {
      new_row.push(totalBikesStands - row[2]);
    } else {
      new_row.push(null);
    }
    avail_station_data.push(new_row);
  }

  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
    var data = new google.visualization.DataTable();
    data.addColumn("string", "Hour");
    data.addColumn("number", "Available Bikes");
    data.addColumn("number", "Predicted Bikes");
    data.addRows(availability_data);

    var station_data = new google.visualization.DataTable();
    station_data.addColumn("string", "Hour");
    station_data.addColumn("number", "Available Stations");
    station_data.addColumn("number", "Predicted Stations");
    station_data.addRows(avail_station_data);

    var options = {
      legend: "none",
      colors: ["#4286f4", "#03a981"],
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
    var station_chart = new google.visualization.AreaChart(
      document.getElementById("avail-station-chart")
    );

    chart.draw(data, options);
    station_chart.draw(station_data, options);
  }
}
