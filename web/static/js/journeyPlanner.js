import { getClosestStations } from "./getClosestStations.js";

export async function initJourneyPlanner(map, data) {
    const { Autocomplete, Place, SearchBox } = await google.maps.importLibrary("places");
    const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes")

    const directionsService = new DirectionsService()
    const directionsRenderer = new DirectionsRenderer()
    
        const asideMain = document.querySelector('.aside-main')
        asideMain.innerHTML = ""

        const journeyForm = document.createElement('form')
        journeyForm.setAttribute('method', 'post')
        journeyForm.setAttribute('action', '/routeplanning/')

        const addressDiv = document.createElement('div')
        addressDiv.classList.add('address-div')

        const startingPoint = document.createElement('div')
        startingPoint.classList.add('searchbar-div')
        const startingPointLabel = document.createElement('label')
        startingPointLabel.textContent = 'Starting Point'
        startingPointLabel.setAttribute('for', 'start')
        const startingPointInput = document.createElement('input')
        startingPointInput.setAttribute('type', 'text')
        startingPointInput.setAttribute('id', 'start')
        startingPointInput.setAttribute('name', 'start')
        startingPointInput.required = true
        startingPointInput.setAttribute('placeholder', 'Choose a starting point..')
        
        startingPoint.appendChild(startingPointLabel)
        startingPoint.appendChild(startingPointInput)
        
        const destination = document.createElement('div')
        destination.classList.add('searchbar-div')
        const destinationLabel = document.createElement('label')
        destinationLabel.textContent = 'Destination'
        destinationLabel.setAttribute('for', 'destination')
        const destinationInput = document.createElement('input')
        destinationInput.setAttribute('type', 'text')
        destinationInput.setAttribute('id', 'destination')
        destinationInput.setAttribute('name', 'destination')
        destinationInput.required = true
        destinationInput.setAttribute('placeholder', 'Choose a destination..')
        
        destination.appendChild(destinationLabel)
        destination.appendChild(destinationInput)
        
        addressDiv.appendChild(startingPoint)
        addressDiv.appendChild(destination)
        
        journeyForm.appendChild(addressDiv)

        // create search boxes
        const center = { lat: 53.344, lng: -6.2672 };
        // Create a bounding box with sides ~10km away from the center point
        const defaultBounds = {
        north: center.lat + 0.1,
        south: center.lat - 0.1,
        east: center.lng + 0.1,
        west: center.lng - 0.1,
        };

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
        dateInput.setAttribute('name', 'date')
        dateInput.setAttribute('value', `${new Date().toISOString().slice(0, 10)}`)
        dateInput.setAttribute('min', `${new Date().toISOString().slice(0, 10)}`)
        dateInput.setAttribute('max', `${new Date((new Date().getTime()) + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}`)

        const timeDiv = document.createElement('div')
        timeDiv.classList.add('time-box')
        const timeLabel = document.createElement('label')
        const timeInput = document.createElement('input')
        timeLabel.textContent = 'Time'
        timeLabel.setAttribute('for', 'time')
        timeInput.setAttribute('type', 'time')
        timeInput.setAttribute('id', 'time')
        timeInput.setAttribute('name', 'time')
        timeInput.setAttribute('type', 'time')
        timeInput.setAttribute('value', `${new Date().toLocaleTimeString().slice(0, 5)}`)

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

        journeyForm.addEventListener('keydown', (e) => {
            if (e.key == 'Enter') {
                e.preventDefault()
            }
        })
        
        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault()

            let res = {} 
            let formData = new FormData(journeyForm);

            startingPointInput.classList.remove('error')
            destinationInput.classList.remove('error')


            if (formData.get('start') == '') {
                startingPointInput.classList.add('error')
            }

            if (formData.get('destination') == '') {
                destinationInput.classList.add('error')
            }

            res.time = `${formData.get('date')} ${formData.get('time')}`

            // Get Timestamp
            let start = {}
            let destination = {}

            start.name = formData.get('start')
            destination.name = formData.get('destination')
            
            let request = {
                origin: formData.get('start'),
                destination: formData.get('destination'),
                travelMode: 'BICYCLING',
                region: 'ie'
            }
            
            await directionsService.route(request, (result, status) => {
                if (status == 'OK') {
                    directionsRenderer.setMap(map)
                    directionsRenderer.setDirections(result)
                    directionsRenderer.setPanel(asideMain);
                    start.pos = {lat: result.routes[0].bounds.Zh.lo, lng: result.routes[0].bounds.Jh.hi}
                    destination.pos = {lat: result.routes[0].bounds.Zh.hi, lng: result.routes[0].bounds.Jh.lo}
                }
            })

            // MAKE SURE IT DOESN'T SUBMIT WITH EMPTY VALUES
            const startClosestStations = await getClosestStations(data, start, 3)
            const destinationClosestStations = await getClosestStations(data, destination, 3)
            res['start_closest_stations'] = startClosestStations.map(station => station.sId)
            res['destination_closest_stations'] = destinationClosestStations.map(station => station.sId)

            try {
                const response = await fetch(journeyForm.action, {
                    method: "POST",
                    headers: { "Content-Type": "application/json"},
                    body: JSON.stringify(res)
                })

                if (!response.ok) {
                    throw new Error(`Journey Planner Form Error: ${response.status}`)
                }

                const data = await response.json()
            } catch (err) {
                console.error(`Error Journey Planner: ${err}`)
            }
        })
        
        const resetBtn = document.createElement('button')
        resetBtn.classList.add('form-btn')
        resetBtn.setAttribute('type', 'reset')
        resetBtn.textContent = 'Reset'
        
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault()
            startingPointInput.value = ''
            startingPointInput.classList.remove('error')
            destinationInput.value = ''
            destinationInput.classList.remove('error')
            directionsRenderer.setPanel(null);
            directionsRenderer.setDirections(null)
            directionsRenderer.setMap(null)
            dateInput.value = `${new Date().toISOString().slice(0, 10)}`
            timeInput.value = `${new Date().toLocaleTimeString().slice(0, 5)}`
        })

        const formButtonsDiv = document.createElement('div')
        formButtonsDiv.classList.add('form-buttons-box')
        formButtonsDiv.appendChild(submitBtn)
        formButtonsDiv.appendChild(resetBtn)
        journeyForm.appendChild(formButtonsDiv)

        asideMain.appendChild(journeyForm)
}