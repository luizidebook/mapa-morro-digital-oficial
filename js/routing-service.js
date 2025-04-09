import L from "leaflet";
import "leaflet-routing-machine";

const API_KEY = "5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3"; // Substitua pela sua chave OpenRouteService

export function createWalkingRoute(map, start, end) {
  const control = L.Routing.control({
    waypoints: [L.latLng(start.lat, start.lon), L.latLng(end.lat, end.lon)],
    router: L.Routing.openrouteservice(API_KEY, {
      profile: "foot-walking", // Prioriza rotas a pé
    }),
    routeWhileDragging: false,
    showAlternatives: true, // Mostra rotas alternativas
    fitSelectedRoutes: true, // Ajusta o zoom para a rota
  }).addTo(map);

  return control;
}
