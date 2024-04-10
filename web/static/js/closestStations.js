import { stationInformationSidebar } from "./stationInformationSidebar.js"

export async function ClosestStations(map, data) {
    // Import google library
  const { DistanceMatrixService } = await google.maps.importLibrary("routes")
  const distanceService = new DistanceMatrixService()

  const btnJourneyPlanner = document.querySelector('.btn-journey-planner')
  const btnNearestStations = document.querySelector('.btn-stations')
  const btnStationInfo = document.querySelector('.btn-station-info')
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          console.log(data[0])
          const stationDistances = await Promise.all(data.map(({name: sName, station_id: sId, latitude: lat, longitude: lng, 
            available_bikes: availableBikes, available_bike_stands: availableBikeStands, 
            total_bike_stands: totalBikesStands, payment_terminal: paymentTerminal, time_updated: latestTimeUpdate}) => {
              return new Promise((resolve, reject) => {
                distanceService.getDistanceMatrix({
                  origins: [pos],
                  destinations: [{lat, lng}],
                  travelMode: 'WALKING',
                }, (response, status) => {
                if (status == 'OK') {
                  resolve({
                    sName,
                    sId,
                    totalBikesStands,
                    availableBikes,
                    pos: {lat, lng},
                    availableBikeStands,
                    paymentTerminal,
                    latestTimeUpdate,
                    distanceVal: response.rows[0].elements[0].distance.value,
                    distanceText: response.rows[0].elements[0].distance.text,
                    walkTime: response.rows[0].elements[0].duration.text
                  });
                } else {
                  reject(status);
                }
              });
            });
          }))
          
          const asideMain = document.querySelector('.aside-main')
          asideMain.classList.remove('drop-down')
          asideMain.innerHTML = ''

          const closestStations = stationDistances.sort((a, b) => a.distanceVal - b.distanceVal).slice(0, 5)
          closestStations.forEach( station => {
            const stationDiv = document.createElement('div')
            stationDiv.classList.add('closest_station')

            const stationTitle = document.createElement('h3')
            stationTitle.classList.add('closest_station_title')
            stationTitle.textContent = station.sName

            const stationBikes = document.createElement('p')
            stationBikes.classList.add('closest_station_bikes')
            stationBikes.textContent = station.availableBikes

            const stationParking = document.createElement('p')
            stationParking.classList.add('closest-station-parking')
            stationParking.textContent = station.availableBikeStands
            
            const stationDistance = document.createElement('p')
            stationDistance.classList.add('closest_station_distance')
            stationDistance.textContent = station.distanceText
            
            const stationWalkTime = document.createElement('p')
            stationWalkTime.classList.add('closest_station_walk_time')
            stationWalkTime.textContent = station.walkTime

            stationDiv.appendChild(stationTitle)
            stationDiv.appendChild(stationBikes)
            stationDiv.appendChild(stationParking)
            stationDiv.appendChild(stationDistance)
            stationDiv.appendChild(stationWalkTime)

            stationDiv.addEventListener('click', () => {
              let modifiedName = station.sName
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

              map.setCenter(station.pos)
              map.setZoom(15)
              btnJourneyPlanner.classList.remove('btn-aside-active')
              btnNearestStations.classList.remove('btn-aside-active')
              btnStationInfo.classList.add('btn-aside-active')
              console.log(station)
              stationInformationSidebar(
                station.sId,
                station.pos.lat,
                station.pos.lng,
                modifiedName,
                station.totalBikesStands,
                station.availableBikes,
                station.availableBikeStands,
                station.paymentTerminal,
                station.latestTimeUpdate
              );
            })
            asideMain.appendChild(stationDiv)
          })
          
        }, (error) => {
          console.error("Geolocation error:", error);
        });
      }
      else {
        handleLocationError(false, infoWindow, map.getCenter());
      }
}
