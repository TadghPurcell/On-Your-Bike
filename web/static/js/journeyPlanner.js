export async function initJourneyPlanner(map) {
    const { Place } = await google.maps.importLibrary("places");
    const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes")

    const directionsService = new DirectionsService()
    const directionsRenderer = new DirectionsRenderer()
    directionsRenderer.setMap(map)

    const journeyPlannerBtn = document.querySelector('.btn-journey-planner')

    journeyPlannerBtn.addEventListener("click", async () => {
        const otherAside = document.querySelector('.nearest_stations_sidebar')
        otherAside.style.display = 'none'
        otherAside.classList.remove('drop-down')
        
        const aside = document.querySelector('.journey_planner_sidebar')
        aside.style.display = 'flex'
        // remove original aside html
        aside.innerHTML = ""
        aside.classList.add('drop-down')

        const asideTitle = document.createElement('h2')
        asideTitle.classList.add('journey_planner_head')
        asideTitle.textContent = "Plan Your Journey"

        const journeyForm = document.createElement('form')
        journeyForm.setAttribute('method', 'post')
        journeyForm.setAttribute('action', '#')

        const startingPoint = document.createElement('div')
        const startingPointLabel = document.createElement('label')
        startingPointLabel.textContent = 'Choose a starting point'
        startingPointLabel.setAttribute('for', 'start')
        const startingPointInput = document.createElement('input')
        startingPointInput.setAttribute('type', 'text')
        startingPointInput.setAttribute('id', 'start')
        startingPointInput.setAttribute('class', 'controls')
        startingPointInput.setAttribute('placeholder', 'Choose a starting point..')
        
        startingPoint.appendChild(startingPointLabel)
        startingPoint.appendChild(startingPointInput)
        
        journeyForm.appendChild(startingPoint)
        
        const destination = document.createElement('div')
        const destinationLabel = document.createElement('label')
        destinationLabel.textContent = 'Choose a destination'
        destinationLabel.setAttribute('for', 'destination')
        const destinationInput = document.createElement('input')
        destinationInput.setAttribute('type', 'text')
        destinationInput.setAttribute('id', 'destination')
        destinationInput.setAttribute('class', 'controls')
        destinationInput.setAttribute('placeholder', 'Choose a destination..')

        destination.appendChild(destinationLabel)
        destination.appendChild(destinationInput)

        journeyForm.appendChild(destination)

        const submitBtn = document.createElement('button')
        submitBtn.setAttribute('type', 'submit')
        submitBtn.textContent = 'Submit'

        submitBtn.addEventListener('click', (e) => {
            e.preventDefault()
            let request = {
                origin: startingPointInput.value,
                destination: destinationInput.value,
                travelMode: 'WALKING'
            }

            directionsService.route(request, (result, status) => {
                if (status == 'OK') {
                    console.log(result)
                    directionsRenderer.setDirections(result)
                }
            })
        })

        const resetBtn = document.createElement('button')
        resetBtn.setAttribute('type', 'reset')
        resetBtn.textContent = 'Reset'

        resetBtn.addEventListener('click', (e) => {
            e.preventDefault()
            startingPointInput.value = ''
            destinationInput.value = ''
        
        })

        journeyForm.appendChild(submitBtn)
        journeyForm.appendChild(resetBtn)

        aside.appendChild(journeyForm)

        // create search boxes
        const startingPointSearchBox = new google.maps.places.SearchBox(startingPointInput);
        const destinationSearchBox = new google.maps.places.SearchBox(destinationInput);
    })
}