export async function initJourneyPlanner(map) {
    const { Place } = await google.maps.importLibrary("places");

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
            console.log(e)
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

        //create search boxes
        const startingPointSearchBox = new google.maps.places.SearchBox(startingPointInput);
        const destinationSearchBox = new google.maps.places.SearchBox(destinationInput);

        map.addEventListener("bounds_changed", () => {
            startingPointSearchBox.setBounds(map.getBounds());
            destinationSearchBox.setBounds(map.getBounds());
          });

        
  let markers = [];

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  const listener = (e) => {
    console.log(e)
  }

//   startingPointSearchBox.addListener("places_changed", listener)
  destinationSearchBox.addListener("places_changed", () => {
    const places = destinationSearchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    const bounds = new google.maps.LatLngBounds();

    places.forEach((place) => {
      if (!place.geometry || !place.geometry.location) {
        console.log("Returned place contains no geometry");
        return;
      }

      const icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25),
      };

      // Create a marker for each place.
      markers.push(
        new google.maps.Marker({
          map,
          icon,
          title: place.name,
          position: place.geometry.location,
        }),
      );
      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async position => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                }
            })
        }
    })
}