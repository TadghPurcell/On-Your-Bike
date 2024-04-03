export async function createSearchBox(map) {
    const { Place } = await google.maps.importLibrary("places");
    //@ts-ignore
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const request = {
      textQuery: "UCD",
      fields: ["displayName", "location", "businessStatus"],
      // includedType: "restaurant",
      // isOpenNow: true,
      // language: "en-US",
      // maxResultCount: 7,
      // minRating: 3.2,
      // region: "us",
      useStrictTypeFiltering: false,
    };
    //@ts-ignore
    const { places } = await Place.searchByText(request);
  
    if (places.length) {
      console.log(places);
  
      const { LatLngBounds } = await google.maps.importLibrary("core");
      const bounds = new LatLngBounds();
      console.log(bounds)
  
      // Loop through and get all the results.
      places.forEach((place) => {
        const markerView = new AdvancedMarkerElement({
          map,
          position: place.location,
          title: place.displayName,
        });
  
        bounds.extend(place.location);
        console.log(place);
      });
      // map.setCenter(bounds.getCenter());
    } else {
      console.log("No results");
    }
     // Create the search box and link it to the UI element.
  const input = document.getElementById("pac-input");
  const searchBox = new google.maps.places.SearchBox(input);

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  // Bias the SearchBox results towards current map's viewport.
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });

  let markers = [];

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();

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
}