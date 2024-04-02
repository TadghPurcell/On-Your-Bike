//This is a placeholder function that will populate the side bar with machine learning predictions in time
async function initAside() {
//Create sample loop to show how data will be loaded
const aside = document.querySelector('.journey_planner_sidebar')
aside.style.display = 'none'
for (let i = 1; i < 4; i++) {
    const stationDataPiece = document.createElement('div')
    stationDataPiece.classList.add(`station-data-piece`)

    const stationDataPieceTitle = document.createElement('h2')
    stationDataPieceTitle.textContent = `Example of analysis data ${i}`

    const stationDataPieceImg = document.createElement('img')
    stationDataPieceImg.classList.add('example-barchart')
    stationDataPieceImg.src = '/img/example-barchart.jpg'
    stationDataPieceImg.alt = 'example barchart'

    stationDataPiece.appendChild(stationDataPieceTitle)
    stationDataPiece.appendChild(stationDataPieceImg)

    aside.appendChild(stationDataPiece)
}
}

initAside()