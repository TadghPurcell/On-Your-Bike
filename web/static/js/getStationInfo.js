export function getStationInfo(
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
