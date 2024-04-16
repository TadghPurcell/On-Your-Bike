export async function getDirectionsRenderer() {
    const { DirectionsRenderer } = await google.maps.importLibrary("routes");
    const directionsRenderer = new DirectionsRenderer({
        polylineOptions: {
          strokeColor: '#1E90FF',
          strokeOpacity: 0.4,
          strokeWeight: 5
        },
        suppressMarkers: true,
        preserveViewport: true,
      });
    const directionsRenderer2 = new DirectionsRenderer({
        polylineOptions: {
          strokeColor: '#1E90FF',
          strokeOpacity: 0.8,
          strokeWeight: 6
        },
        suppressMarkers: true,
        preserveViewport: true,
      });
    const directionsRenderer3 = new DirectionsRenderer({
        polylineOptions: {
          strokeColor: '#1E90FF',
          strokeOpacity: 0.4,
          strokeWeight: 5
        },
        suppressMarkers: true,
        preserveViewport: true,
      });
      const directionsRenderer4 = new DirectionsRenderer({
        polylineOptions: {
          strokeColor: '#1E90FF',
          strokeOpacity: 0,
          strokeWeight: 5
        },
        suppressMarkers: false
      });
    return [directionsRenderer, directionsRenderer2, directionsRenderer3, directionsRenderer4];
    
}
export async function getDirectionsService() {
    const { DirectionsService } = await google.maps.importLibrary("routes");
    const directionsService = new DirectionsService();
    return directionsService;
}