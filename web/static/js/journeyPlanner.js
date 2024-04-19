import { getClosestStations } from "./getClosestStations.js";

export async function initJourneyPlanner(map, 
  data, 
  directionsRenderer,
  directionsService,
  pos, 
  selectedStation, 
  lat, 
  lng
  ) {
    const { Autocomplete, Place, SearchBox } = await google.maps.importLibrary("places");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary(
      "marker"
    );

    let currentPos;

    const geocoder = new google.maps.Geocoder();
    function geocodeAddress(address) {
      return new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (result, status) => {
          if (status === google.maps.GeocoderStatus.OK) {
            const lat = result[0].geometry.location.lat()
            const lng = result[0].geometry.location.lng()
            resolve({ lat, lng })
          } else {
            reject(new Error("Geocoding failed:", status))
          }
        })
      })
    }
    
    async function renderRoute(request, num) {
      return new Promise((resolve, reject) => {
      directionsService.route(request, (result, status) => {
          const renderer = directionsRenderer[num]
          if (status == "OK") {
            renderer.setMap(map);
            renderer.setDirections(result);
            start.pos = {
              lat: result.routes[0].legs[0].start_location.lat(),
              lng: result.routes[0].legs[0].start_location.lng(),
            };
            destination.pos = {
              lat: result.routes[0].legs[0].end_location.lat(),
              lng: result.routes[0].legs[0].end_location.lng(),
            };
            console.log(result.routes[0].legs[0].duration.text)
            resolve(result.routes[0].legs[0].duration.text)
          } else {
            reject(new Error("Directions Renderer Failed: ", status))
          }
        })
        });
      }
      
        const asideMain = document.querySelector('.aside-main')
        asideMain.innerHTML = ""

        const journeyForm = document.createElement('form')
        journeyForm.setAttribute('method', 'post')
        journeyForm.setAttribute('action', '/routeplanning/')

        const addressDiv = document.createElement('div')
        addressDiv.classList.add('address-div')

        const startingPoint = document.createElement('div')
        startingPoint.classList.add('searchbar-div')
        const startingPointLabelDiv = document.createElement('div')
        startingPointLabelDiv.classList.add('starting-div')
        const startingPointLabel = document.createElement('label')
        startingPointLabel.textContent = 'Starting Point'
        startingPointLabel.setAttribute('for', 'start')
        const currentLocationBtn = document.createElement('button')
        currentLocationBtn.classList.add('current-location-btn')

        
        startingPointLabelDiv.appendChild(startingPointLabel)
        startingPointLabelDiv.appendChild(currentLocationBtn)
        
        const startingPointInput = document.createElement('input')
        startingPointInput.setAttribute('type', 'text')
        startingPointInput.setAttribute('id', 'start')
        startingPointInput.setAttribute('name', 'start')
        startingPointInput.required = true
        if (currentPos) {
          startingPointInput.setAttribute('value', 'Current Location')
        }
        startingPointInput.setAttribute('placeholder', 'Choose a starting point..')
  
        if (selectedStation || lat || lng) {
          currentLocationBtn.classList.add('location-active')
          startingPointInput.value = 'Current Location'
          currentPos = pos
        }

        currentLocationBtn.addEventListener('click', (e) => {
          e.preventDefault()
          currentLocationBtn.classList.toggle('location-active')
          if (currentLocationBtn.classList.contains('location-active')) {
            startingPointInput.classList.remove("error");
            startingPointInput.value = 'Current Location'
            currentPos = pos
          }
          if (!currentLocationBtn.classList.contains('location-active')) {
            startingPointInput.value = ''
            currentPos = ''
          }
        })

        startingPointInput.addEventListener('input', () => {
          if (startingPointInput.value != 'Current Location') {
            currentLocationBtn.classList.remove('location-active')
          }
          startingPointInput.classList.remove('error')
        })

        startingPoint.appendChild(startingPointLabelDiv)
        startingPoint.appendChild(startingPointInput)
        
        const destination = document.createElement('div')
        destination.classList.add('searchbar-div')
        const destinationLabel = document.createElement('label')
        destinationLabel.textContent = 'Destination'
        destinationLabel.setAttribute('for', 'destination')
        const destinationInput = document.createElement('input')
        destinationInput.setAttribute('type', 'text')
        destinationInput.setAttribute('id', 'destination')
        destinationInput.setAttribute('name', 'destination')
        destinationInput.required = true
        destinationInput.setAttribute('placeholder', 'Choose a destination..')
        if (selectedStation) {
            destinationInput.setAttribute('value', selectedStation)
        }
        
        destinationInput.addEventListener('input', () => {
          destinationInput.classList.remove('error')
        })

        destination.appendChild(destinationLabel)
        destination.appendChild(destinationInput)
        
        addressDiv.appendChild(startingPoint)
        addressDiv.appendChild(destination)
        
        journeyForm.appendChild(addressDiv)

        const resultDiv = document.createElement("div");
        resultDiv.classList.add("directions");

  // create search boxes
  const center = { lat: 53.344, lng: -6.2672 };
  // Create a bounding box with sides ~10km away from the center point
  const defaultBounds = {
    north: center.lat + 0.1,
    south: center.lat - 0.1,
    east: center.lng + 0.1,
    west: center.lng - 0.1,
  };

  const options = {
    bounds: defaultBounds,
    componentRestrictions: { country: "ie" },
    fields: ["address_components", "geometry", "icon", "name"],
    strictBounds: false,
  };
  const startingPointSearchBox = new SearchBox(startingPointInput);
  const destinationSearchBox = new SearchBox(destinationInput);
  const startingPointAutocomplete = new Autocomplete(
    startingPointInput,
    options
  );
  const destinationAutocomplete = new Autocomplete(destinationInput, options);

  // Create date/time
  const dateTimeDiv = document.createElement("div");
  dateTimeDiv.classList.add("date-time-box");

  const dateDiv = document.createElement("div");
  dateDiv.classList.add("date-box");
  const dateLabel = document.createElement("label");
  const dateInput = document.createElement("input");
  dateLabel.textContent = "Date";
  dateLabel.setAttribute("for", "date");
  dateInput.setAttribute("type", "date");
  dateInput.setAttribute("id", "date");
  dateInput.setAttribute("type", "date");
  dateInput.setAttribute("name", "date");
  dateInput.setAttribute("value", `${new Date().toISOString().slice(0, 10)}`);
  dateInput.setAttribute("min", `${new Date().toISOString().slice(0, 10)}`);
  dateInput.setAttribute(
    "max",
    `${new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)}`
  );

  const timeDiv = document.createElement("div");
  timeDiv.classList.add("time-box");
  const timeLabel = document.createElement("label");
  const timeInput = document.createElement("input");
  timeLabel.textContent = "Time";
  timeLabel.setAttribute("for", "time");
  timeInput.setAttribute("type", "time");
  timeInput.setAttribute("id", "time");
  timeInput.setAttribute("name", "time");
  timeInput.setAttribute("type", "time");
  timeInput.setAttribute(
    "value",
    `${new Date().toLocaleTimeString().slice(0, 5)}`
  );

  dateDiv.appendChild(dateLabel);
  dateDiv.appendChild(dateInput);
  timeDiv.appendChild(timeLabel);
  timeDiv.appendChild(timeInput);

  dateTimeDiv.appendChild(dateDiv);
  dateTimeDiv.appendChild(timeDiv);

  journeyForm.appendChild(dateTimeDiv);

  const submitBtn = document.createElement("button");
  submitBtn.classList.add("form-btn");
  submitBtn.setAttribute("type", "submit");
  submitBtn.textContent = "Submit";

  journeyForm.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
    }
  });

  submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    let res = {};
    let formData = new FormData(journeyForm);

    startingPointInput.classList.remove("error");
    destinationInput.classList.remove("error");

    if (formData.get("start") == "") {
      startingPointInput.classList.add("error");
    }

            if (formData.get('destination') == '') {
                destinationInput.classList.add('error')
            }
            
            res.time = `${formData.get('date')} ${formData.get('time')}`

    // Get Timestamp
    let start = {};
    let destination = {};

    start.name = formData.get("start");
    destination.name = formData.get("destination");
    start.pos = startingPointInput. value == 'Current Location' ? currentPos : await geocodeAddress(formData.get("start"))
    destination.pos = destinationInput == selectedStation ? { lat, lng } : await geocodeAddress(formData.get("destination"))

    let closestStartStation;
    let closestDestStation;
    const startClosestStations = await getClosestStations(data, start, 30);
    const destinationClosestStations = await getClosestStations(
      data,
      destination,
    );
    res["available_ids"] = startClosestStations.map((station) => station.sId);
    res["station_ids"] = destinationClosestStations.map(
      (station) => station.sId
    );

    try {
      const response = await fetch(journeyForm.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(res),
      });

      if (!response.ok) {
        throw new Error(`Journey Planner Form Error: ${response.status}`);
      }

      const data = await response.json();

      //   Get the closest stations to start and end that have bikes.

      for (let station of startClosestStations) {
        if (data["available_bikes"][station.sId]) {
          closestStartStation = station;
          closestStartStation.modifiedName = closestStartStation.sName
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
        }
      }

      for (let station of destinationClosestStations) {
        if (data["available_stations"][station.sId]) {
          console.log(station);
          closestDestStation = station;
          closestDestStation.modifiedName = closestDestStation.sName
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
        }
      }

      if (!closestDestStation || closestStartStation) {
        console.log(closestStartStation);
        console.log(closestDestStation);
      }
      let startClosestStationWalkRequest = {
        origin: start.pos,
        destination: closestStartStation.pos,
        travelMode: "WALKING",
        region: "ie",
      };
      let cycleBetweenStationsRequest = {
        origin: closestStartStation.pos,
        destination: closestDestStation.pos,
        travelMode: "BICYCLING",
        region: "ie",
      };
      let destinationClosestStationWalkRequest = {
        origin: closestDestStation.pos,
        destination: destination.pos,
        travelMode: "WALKING",
        region: "ie",
      };
      
      let overallRequest = {
        origin: start.pos,
        destination: destination.pos,
        travelMode: "WALKING",
        region: "ie",
      };

      const startTime = await renderRoute(startClosestStationWalkRequest, 0);
      const cycleTime = await renderRoute(cycleBetweenStationsRequest, 1);
      const destinationTime = await renderRoute(destinationClosestStationWalkRequest, 2);
      const overallTime = await renderRoute(overallRequest, 3);

      //   Clear previous directions
      resultDiv.innerHTML = "";
      //   Add divs for charts
      const leg1Title = document.createElement("h3");
      leg1Title.classList.add("journey-instruction");
      leg1Title.innerText = `Walk to ${closestStartStation.modifiedName} (${startTime})`;

      const leg1GraphTitle = document.createElement("h4");
      leg1GraphTitle.classList.add("journey-instruction");
      leg1GraphTitle.innerText = "Available Bikes:";

      const availChart = document.createElement("div");
      availChart.id = "availability-chart";

      const leg2Title = document.createElement("h3");
      leg2Title.classList.add("journey-instruction");
      leg2Title.innerText = `Then, cycle to ${closestDestStation.modifiedName} (${cycleTime})`;

      const leg2GraphTitle = document.createElement("h4");
      leg2GraphTitle.classList.add("journey-instruction");
      leg2GraphTitle.innerText = "Available Stations";

      const stationChart = document.createElement("div");
      stationChart.id = "avail-station-chart";

      const leg3Title = document.createElement("h3");
      leg3Title.classList.add("journey-instruction");
      leg3Title.innerText = `Finally, walk to ${destination.name} (${destinationTime})`;

      resultDiv.appendChild(leg1Title);
      resultDiv.appendChild(leg1GraphTitle);
      resultDiv.appendChild(availChart);
      resultDiv.appendChild(leg2Title);
      resultDiv.appendChild(leg2GraphTitle);
      resultDiv.appendChild(stationChart);
      resultDiv.appendChild(leg3Title);

      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
        var availability_table = new google.visualization.DataTable();
        availability_table.addColumn("string", "Hour");
        availability_table.addColumn("number", "Available Bikes");
        availability_table.addColumn("number", "Predicted Bikes");

        availability_table.addRows(
          data["availability_data"][closestStartStation.sId]
        );

        var station_table = new google.visualization.DataTable();
        station_table.addColumn("string", "Hour");
        station_table.addColumn("number", "Available Stations");
        station_table.addColumn("number", "Predicted Stations");
        station_table.addRows(
          data["available_station_data"][closestDestStation.sId]
        );

        var options = {
          legend: "none",
          colors: ["#4286f4", "#03a981"],
          opacity: 0.3,
          vAxis: {
            minValue: 0,
            maxValue: closestStartStation.total_bike_stands,
            viewWindow: { min: 0, max: closestStartStation.total_bike_stands },
          },
          curveType: "function",
        };

        var station_options = {
          legend: "none",
          colors: ["#4286f4", "#03a981"],
          opacity: 0.3,
          vAxis: {
            minValue: 0,
            maxValue: closestDestStation.total_bike_stands,
            viewWindow: { min: 0, max: closestDestStation.total_bike_stands },
          },
          curveType: "function",
        };
        var chart = new google.visualization.AreaChart(
          document.getElementById("availability-chart")
        );
        var station_chart = new google.visualization.AreaChart(
          document.getElementById("avail-station-chart")
        );

        chart.draw(availability_table, options);
        station_chart.draw(station_table, options);
      }
    } catch (err) {
      console.error(`Error Journey Planner: ${err}`);
    }
  });

  const resetBtn = document.createElement("button");
  resetBtn.classList.add("form-btn");
  resetBtn.setAttribute("type", "reset");
  resetBtn.textContent = "Reset";

  
  const formButtonsDiv = document.createElement("div");
  formButtonsDiv.classList.add("form-buttons-box");
  formButtonsDiv.appendChild(submitBtn);
  formButtonsDiv.appendChild(resetBtn);
  journeyForm.appendChild(formButtonsDiv);

  asideMain.appendChild(journeyForm);
  asideMain.appendChild(resultDiv);
  resetBtn.addEventListener("click", (e) => {
    e.preventDefault();
    resultDiv.innerHTML = "";
    startingPointInput.value = "";
    startingPointInput.classList.remove("error");
    destinationInput.classList.remove("error");
    currentLocationBtn.classList.remove("location-active")
    destinationInput.value = "";
    console.log(directionsRenderer)
    directionsRenderer.forEach(renderer => {
      renderer.setDirections(null);
      renderer.setMap(null);
    })
    dateInput.value = `${new Date().toISOString().slice(0, 10)}`;
    timeInput.value = `${new Date().toLocaleTimeString().slice(0, 5)}`;
    map.setCenter({ lat: 53.346, lng: -6.25 });
    map.setZoom(14);
  });
}