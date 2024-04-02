//This is a placeholder function that will populate the side bar with machine learning predictions in time
async function initAside() {
  //Create sample loop to show how data will be loaded
  const aside = document.querySelector("aside");
  const stationDataPiece = document.createElement("div");
  stationDataPiece.classList.add(`station-data-piece`);

  const stationDataPieceTitle = document.createElement("h2");
  stationDataPieceTitle.textContent = `Predicted Station Availability`;

  stationDataPiece;
  stationDataPiece.appendChild(stationDataPieceTitle);

  aside.appendChild(stationDataPiece);
}

initAside();
