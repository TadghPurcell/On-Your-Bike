export async function getClosestStations(map, data) {
    // Import google library
  const { DistanceMatrixService } = await google.maps.importLibrary("routes")
  const distanceService = new DistanceMatrixService()
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          const stationDistances = await Promise.all(data.map(({name: sName, latitude: lat, longitude: lng, 
            available_bikes: availableBikes, available_bike_stands: availableBikeStands}) => {
              return new Promise((resolve, reject) => {
                distanceService.getDistanceMatrix({
                  origins: [pos],
                  destinations: [{lat, lng}],
                  travelMode: 'WALKING',
                }, (response, status) => {
                if (status == 'OK') {
                  resolve({
                    sName,
                    availableBikes,
                    pos: {lat, lng},
                    availableBikeStands,
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
              map.setCenter(station.pos)
              map.setZoom(15)
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
