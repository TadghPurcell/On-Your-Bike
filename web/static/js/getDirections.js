export async function getDirectionsRenderer() {
    const { DirectionsRenderer } = await google.maps.importLibrary("routes");
    const directionsRenderer = new DirectionsRenderer();
    return directionsRenderer;
    
}
export async function getDirectionsService() {
    const { DirectionsService } = await google.maps.importLibrary("routes");
    const directionsService = new DirectionsService();
    return directionsService;
}