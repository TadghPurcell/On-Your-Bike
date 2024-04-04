import { getClosestStations } from "./closestStations.js";
import { initJourneyPlanner } from "./journeyPlanner.js";

//This is a placeholder function that will populate the side bar with machine learning predictions in time
export async function initAside(map, data) {

  //Create sample loop to show how data will be loaded
  const aside = document.querySelector("aside");
  const stationDataPiece = document.createElement("div");
  stationDataPiece.classList.add(`station-data-piece`);

  const busynessChart = document.createElement("div");
  busynessChart.id = "availability-chart";

  const stationDataPieceTitle = document.createElement("h2");
  stationDataPieceTitle.textContent = `Predicted Station Availability`;

  const btnsAside = document.querySelectorAll('.btn-aside')
  const btnJourneyPlanner = document.querySelector('.btn-journey-planner')
  const btnNearestStations = document.querySelector('.btn-stations')
  
  btnsAside.forEach(btn => {
    btn.addEventListener('click', (e) => {
      btnsAside.forEach(btn => {
        btn.classList.remove('btn-aside-active')
      })
      e.target.classList.add('btn-aside-active')
      if (e.target.textContent == 'Nearest Stations') {
      }
    })
  })
  
  btnNearestStations.addEventListener('click', () => {
    getClosestStations(map, data)
  })
  btnJourneyPlanner.addEventListener('click', () => {
      initJourneyPlanner(map)
  })
  
  stationDataPiece;
  stationDataPiece.appendChild(stationDataPieceTitle);
  stationDataPiece.appendChild(busynessChart);

  aside.appendChild(stationDataPiece);
}

