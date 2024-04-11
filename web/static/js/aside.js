import { ClosestStations } from "./closestStations.js";
import { initJourneyPlanner } from "./journeyPlanner.js";
import { activateSideBar } from "./script.js";

//This is a placeholder function that will populate the side bar with machine learning predictions in time
export async function initAside(map, data, directionsRenderer, directionsService) {

  //Create sample loop to show how data will be loaded
  const aside = document.querySelector("aside");
  const stationDataPiece = document.createElement("div");
   
  const btnJourneyPlanner = document.querySelector('.btn-journey-planner')
  const btnNearestStations = document.querySelector('.btn-stations')
  
  initJourneyPlanner(map, data, directionsRenderer, directionsService)
  
  btnJourneyPlanner.addEventListener('click', () => {
    activateSideBar('journey')
    initJourneyPlanner(map, data, directionsRenderer, directionsService)
  })
  btnNearestStations.addEventListener('click', () => {
    activateSideBar('nearest')
    ClosestStations(map, data, directionsRenderer, directionsService)
  })

  aside.appendChild(stationDataPiece);
}

