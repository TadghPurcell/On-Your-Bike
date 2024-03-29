export async function getClosestStations(data) {
    // Import google library
  const { DistanceMatrixService } = await google.maps.importLibrary("routes")

    // Select HTML button
    const nearestStationsBtn = document.querySelector('.btn-stations');

    nearestStationsBtn.addEventListener("click", async () => {
    const distanceService = new DistanceMatrixService()
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          const stationDistances = await Promise.all(data.map(({name: sName, latitude: lat, longitude: lng, 
            available_bikes: availableBikes}) => {
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
                    distanceVal: response.rows[0].elements[0].distance.value,
                    distanceText: response.rows[0].elements[0].distance.text,
                    walkTime: response.rows[0].elements[0].duration.text
                  });
                } else {
                  reject(status);
                }
              });
            });
          }));
          
          const aside = document.querySelector('.nearest_stations_sidebar')
          aside.style.display = 'flex'
          // remove original aside html
          aside.innerHTML = ""
          aside.classList.add('drop-down')

          const asideTitle = document.createElement('h2')
          asideTitle.classList.add('closest_station_head')
          asideTitle.textContent = "Nearest Stations"
          aside.appendChild(asideTitle)
          const closestStations = stationDistances.sort((a, b) => a.distanceVal - b.distanceVal).slice(0, 5)
          console.log(closestStations[0])
          closestStations.forEach( station => {
            const stationDiv = document.createElement('div')
            stationDiv.classList.add('closest_station')

            const stationTitle = document.createElement('h3')
            stationTitle.classList.add('closest_station_title')
            stationTitle.textContent = station.sName

            const stationBikes = document.createElement('p')
            stationBikes.classList.add('closest_station_bikes')
            stationBikes.textContent = station.availableBikes
            
            const stationDistance = document.createElement('p')
            stationDistance.classList.add('closest_station_distance')
            stationDistance.textContent = station.distanceText
            
            const stationWalkTime = document.createElement('p')
            stationWalkTime.classList.add('closest_station_walk_time')
            stationWalkTime.textContent = station.walkTime

            stationDiv.appendChild(stationTitle)
            stationDiv.appendChild(stationBikes)
            stationDiv.appendChild(stationDistance)
            stationDiv.appendChild(stationWalkTime)

            aside.appendChild(stationDiv)
          })
          
        }, (error) => {
          console.error("Geolocation error:", error);
        });
      }
      else {
        handleLocationError(false, infoWindow, map.getCenter());
      }
});
}