// Gets the closest stations
// data - station data
// loc - location to get the closest stations to
// closest - closest station to get, if set to 0 will start at the closest station, if set to 3 will start at the 3rd closest station
export async function getClosestStations(data, loc, closest, amount) {
  // Import google library
  const { DistanceMatrixService } = await google.maps.importLibrary("routes");
  const distanceService = new DistanceMatrixService();
  const stationDistances = await Promise.all(
    data.map(
      ({
        name: sName,
        station_id: sId,
        latitude: lat,
        longitude: lng,
        available_bikes: availableBikes,
        available_bike_stands: availableBikeStands,
      }) => {
        return new Promise((resolve, reject) => {
          distanceService.getDistanceMatrix(
            {
              origins: [loc.pos],
              destinations: [{ lat, lng }],
              travelMode: "BICYCLING",
            },
            (response, status) => {
              if (status == "OK") {
                resolve({
                  sName,
                  sId,
                  availableBikes,
                  pos: { lat, lng },
                  availableBikeStands,
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
      }
    )
  );
  return stationDistances
    .sort((a, b) => a.distanceVal - b.distanceVal)
    .slice(closest, closest + amount);
}
