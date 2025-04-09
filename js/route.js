// route.js – Cálculo e exibição de rotas no mapa

/*  O que esse módulo faz:
Usa a API de Geolocalização do navegador para obter a posição do usuário.
Envia um request à OpenRouteService para gerar uma rota a pé.
Renderiza a rota no mapa com estilo customizado.
Remove rotas anteriores ao traçar uma nova.*/

import L from "leaflet";
import { clearMarkers } from "./map-control.js";

let currentRoute = null;
let gpsWatcher = null;

/**
 * Obtém a localização atual do usuário.
 * @returns {Promise<{ lat: number, lon: number }>}
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject("Geolocalização não suportada.");
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => reject("Erro ao obter localização: " + error.message)
    );
  });
}

/**
 * Traça e exibe uma rota entre o ponto atual e o destino.
 * @param {object} map - Instância do Leaflet
 * @param {object} destination - { name: string, lat: number, lon: number }
 */
export async function plotRouteOnMap(map, destination) {
  try {
    const origin = await getCurrentLocation();
    clearMarkers();

    const apiKey = "5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3"; // Substitua pela sua chave real
    const response = await fetch(
      "https://api.openrouteservice.org/v2/directions/foot-walking/geojson",
      {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: [
            [origin.lon, origin.lat],
            [destination.lon, destination.lat],
          ],
        }),
      }
    );

    const data = await response.json();

    if (currentRoute) {
      map.removeLayer(currentRoute);
    }

    currentRoute = L.geoJSON(data, {
      style: {
        color: "#3388ff",
        weight: 5,
        opacity: 0.8,
      },
    }).addTo(map);

    map.fitBounds(currentRoute.getBounds());
  } catch (err) {
    console.error("[ROTA] Erro ao traçar rota:", err);
  }
}
