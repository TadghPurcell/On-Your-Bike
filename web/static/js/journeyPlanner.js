export async function initJourneyPlanner(map) {
    const { Autocomplete, Place, SearchBox } = await google.maps.importLibrary("places");
    const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes")

    const directionsService = new DirectionsService()
    const directionsRenderer = new DirectionsRenderer()
    // directionsRenderer.setMap(map)

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

        aside.appendChild(asideTitle)

        const journeyForm = document.createElement('form')
        journeyForm.setAttribute('method', 'post')
        journeyForm.setAttribute('action', '#')

        const startingPoint = document.createElement('div')
        startingPoint.classList.add('searchbar-div')
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
        destination.classList.add('searchbar-div')
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
        
        // create search boxes
        const center = { lat: 53.344, lng: -6.2672 };
        // Create a bounding box with sides ~10km away from the center point
        const defaultBounds = {
        north: center.lat + 0.1,
        south: center.lat - 0.1,
        east: center.lng + 0.1,
        west: center.lng - 0.1,
        };
        console.log(map)
        const options = {
            bounds: defaultBounds,
            componentRestrictions: { country: "ie" },
            fields: ["address_components", "geometry", "icon", "name"],
            strictBounds: false,
          };
        const startingPointSearchBox = new SearchBox(startingPointInput);
        const destinationSearchBox = new SearchBox(destinationInput);
        const startingPointAutocomplete = new Autocomplete(startingPointInput, options)
        const destinationAutocomplete = new Autocomplete(destinationInput, options)

        // Create date/time
        const dateTimeDiv = document.createElement('div')
        dateTimeDiv.classList.add('date-time-box')

        const dateDiv = document.createElement('div')
        dateDiv.classList.add('date-box')
        const dateLabel = document.createElement('label')
        const dateInput = document.createElement('input')
        dateLabel.textContent = 'Date'
        dateLabel.setAttribute('for', 'date')
        dateInput.setAttribute('type', 'date')
        dateInput.setAttribute('id', 'date')
        dateInput.setAttribute('type', 'date')

        const timeDiv = document.createElement('div')
        timeDiv.classList.add('time-box')
        const timeLabel = document.createElement('label')
        const timeInput = document.createElement('input')
        timeLabel.textContent = 'Time'
        timeLabel.setAttribute('for', 'time')
        timeInput.setAttribute('type', 'time')
        timeInput.setAttribute('id', 'time')
        timeInput.setAttribute('type', 'time')

        dateDiv.appendChild(dateLabel)
        dateDiv.appendChild(dateInput)
        timeDiv.appendChild(timeLabel)
        timeDiv.appendChild(timeInput)

        dateTimeDiv.appendChild(dateDiv)
        dateTimeDiv.appendChild(timeDiv)

        journeyForm.appendChild(dateTimeDiv)

        const submitBtn = document.createElement('button')
        submitBtn.classList.add('form-btn')
        submitBtn.setAttribute('type', 'submit')
        submitBtn.textContent = 'Submit'
        
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault()
            let request = {
                origin: startingPointInput.value,
                destination: destinationInput.value,
                travelMode: 'BICYCLING',
                region: 'ie'
            }
            
            directionsService.route(request, (result, status) => {
                if (status == 'OK') {
                    console.log(result)
                    directionsRenderer.setMap(map)
                    directionsRenderer.setDirections(result)
                    directionsRenderer.setPanel(aside);
                }
            })
        })
        
        const resetBtn = document.createElement('button')
        resetBtn.classList.add('form-btn')
        resetBtn.setAttribute('type', 'reset')
        resetBtn.textContent = 'Reset'
        
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault()
            startingPointInput.value = ''
            destinationInput.value = ''
            directionsRenderer.setPanel(null);
            directionsRenderer.setDirections(null)
            directionsRenderer.setMap(null)
        })

        const formButtonsDiv = document.createElement('div')
        formButtonsDiv.classList.add('form-buttons-box')
        formButtonsDiv.appendChild(submitBtn)
        formButtonsDiv.appendChild(resetBtn)
        journeyForm.appendChild(formButtonsDiv)

        aside.appendChild(journeyForm)

    })
}