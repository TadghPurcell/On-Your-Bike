import { ClosestStations } from "./closestStations.js";
import { initJourneyPlanner } from "./journeyPlanner.js";

//This is a placeholder function that will populate the side bar with machine learning predictions in time
export async function initAside(map, data) {

  //Create sample loop to show how data will be loaded
  const aside = document.querySelector("aside");
  const stationDataPiece = document.createElement("div");
   
  const btnJourneyPlanner = document.querySelector('.btn-journey-planner')
  const btnNearestStations = document.querySelector('.btn-stations')
  const btnStationInfo = document.querySelector('.btn-station-info')
  
  initJourneyPlanner(map, data)
  
  btnJourneyPlanner.addEventListener('click', () => {
    btnNearestStations.classList.remove('btn-aside-active')
    btnStationInfo.classList.remove('btn-aside-active')
    btnJourneyPlanner.classList.add('btn-aside-active')
    initJourneyPlanner(map)
  })
  btnNearestStations.addEventListener('click', () => {
    btnJourneyPlanner.classList.remove('btn-aside-active')
    btnStationInfo.classList.remove('btn-aside-active')
    btnNearestStations.classList.add('btn-aside-active')
    ClosestStations(map, data)
  })
  btnStationInfo.addEventListener('click', () => {
    console.log('test')
  })
  
  aside.appendChild(stationDataPiece);
}

