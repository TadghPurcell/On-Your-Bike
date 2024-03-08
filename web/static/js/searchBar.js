async function findPlaces() {
    const { Place } = await google.maps.importLibrary("places");
    //@ts-ignore
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const request = {
      textQuery: "Tacos in Mountain View",
      fields: ["displayName", "location", "businessStatus"],
      includedType: "restaurant",
      isOpenNow: true,
      language: "en-US",
      maxResultCount: 7,
      minRating: 3.2,
      region: "us",
      useStrictTypeFiltering: false,
    };
    //@ts-ignore
    const { places } = await Place.searchByText(request);
  
    if (places.length) {
      console.log(places);
  
      const { LatLngBounds } = await google.maps.importLibrary("core");
      const bounds = new LatLngBounds();
  
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
      map.setCenter(bounds.getCenter());
    } else {
      console.log("No results");
    }
}