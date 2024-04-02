import { getStationInfo } from "./getStationInfo.js";

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
  latestTimeUpdate
) {
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

  const aside = document.querySelector(".station_information_sidebar");
  aside.style.display = "block";
  aside.innerHTML = "";

  const topDiv = document.createElement("div");

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

  const stationDistance = document.createElement("p");
  stationDistance.classList.add("station_information_data");
  stationDistance.classList.add("station_information_distance");
  stationDistance.textContent = "...";

  const stationWalkTime = document.createElement("p");
  stationWalkTime.classList.add("station_information_data");
  stationWalkTime.classList.add("station_information_walk_time");
  stationWalkTime.textContent = "...";

  // Get the current location if available
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
  aside.appendChild(topDiv);

  const directions = document.createElement("button");
  directions.classList.add("directions-button");
  directions.textContent = "Directions";
  aside.appendChild(directions);

  const availability_title = document.createElement("h2");
  availability_title.classList.add("closest_station_head");
  availability_title.textContent = "Available Bikes";
  aside.appendChild(availability_title);

  const availability_chart = document.createElement("div");
  availability_chart.id = "availability-chart";
  aside.appendChild(availability_chart);

  const avail_station_title = document.createElement("h2");
  avail_station_title.classList.add("closest_station_head");
  avail_station_title.textContent = "Available Stations";
  aside.appendChild(avail_station_title);

  const station_chart = document.createElement("div");
  station_chart.id = "avail-station-chart";
  aside.appendChild(station_chart);

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

  var avail_station_data = [];
  for (var idx in json.hour) {
    avail_station_data.push([
      json.hour[idx].toString(),
      totalBikesStands - json.predicted_available[idx],
    ]);
  }

  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
    var data = new google.visualization.DataTable();
    data.addColumn("string", "Hour");
    data.addColumn("number", "Busyness Level");
    data.addRows(availability_data);

    var station_data = new google.visualization.DataTable();
    station_data.addColumn("string", "Hour");
    station_data.addColumn("number", "Busyness Level");
    station_data.addRows(avail_station_data);

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
    var station_chart = new google.visualization.AreaChart(
      document.getElementById("avail-station-chart")
    );

    chart.draw(data, options);
    station_chart.draw(station_data, options);
  }
}
