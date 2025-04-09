// map-control.js - Controle e interação com o mapa Leaflet

/* O que esse módulo cobre:
Inicializa o mapa OpenStreetMap com Leaflet.
Centraliza o mapa em Morro de São Paulo.
Permite ao assistente exibir localizações com base no nome.
Remove marcadores e rotas anteriores para manter o mapa limpo.
Adiciona controle de geolocalização para o usuário encontrar sua localização no mapa.
*/

// Variáveis de controle de mapa e marcadores
export let mapInstance;
let markers = [];
let routeLayer;
let routingControl = null;

/**
 * Inicializa o mapa Leaflet e configura as camadas.
 * @param {string} containerId - ID do elemento HTML que conterá o mapa.
 * @returns {Object} Instância do mapa Leaflet.
 */
export function initializeMap(containerId) {
  if (mapInstance) {
    console.warn("Mapa já inicializado.");
    return mapInstance;
  }

  const mapElement = document.getElementById(containerId);
  if (!mapElement) {
    console.error(`Elemento com ID "${containerId}" não encontrado no DOM.`);
    return null;
  }

  if (typeof window.L === "undefined") {
    console.error(
      "Leaflet (L) não está definido. Certifique-se de incluir a biblioteca Leaflet no HTML."
    );
    return null;
  }

  mapInstance = window.L.map(containerId).setView(
    [-13.3815787, -38.9159057],
    15
  ); // Zoom inicial 15
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mapInstance);

  console.log("Mapa inicializado com sucesso.");
  return mapInstance;
}

/**
 * Limpa todos os marcadores e rotas existentes no mapa.
 */
export function clearMarkers() {
  markers.forEach((marker) => mapInstance.removeLayer(marker));
  markers = [];

  if (routeLayer) {
    mapInstance.removeLayer(routeLayer);
    routeLayer = null;
  }

  if (routingControl) {
    mapInstance.removeControl(routingControl);
    routingControl = null;
  }
}

/**
 * Mostra uma localização no mapa com base no nome do local e coordenadas.
 * @param {string} locationName - Nome descritivo (ex: 'Praia do Encanto')
 * @param {number} lat - Latitude da localização
 * @param {number} lon - Longitude da localização
 */
export function showLocationOnMap(locationName, lat, lon) {
  clearMarkers();

  if (!lat || !lon) {
    console.warn("Coordenadas inválidas para a localização:", locationName);
    return;
  }

  const icon = getMarkerIconForLocation(locationName.toLowerCase());

  const marker = window.L.marker([lat, lon], { icon }).addTo(mapInstance);
  marker.bindPopup(createPopupContent(locationName)).openPopup();
  markers.push(marker);

  // Animação suave ao centralizar o mapa
  mapInstance.flyTo([lat, lon], 16, {
    animate: true,
    duration: 1.5, // Duração da animação em segundos
  });
}

/**
 * Exibe todos os marcadores de uma categoria no mapa.
 * @param {Array} locations - Lista de locais com nome, latitude e longitude.
 */
export function showAllLocationsOnMap(locations) {
  clearMarkers();

  if (!locations || locations.length === 0) {
    console.warn("Nenhuma localização encontrada para exibir.");
    return;
  }

  const bounds = window.L.latLngBounds();

  locations.forEach((location) => {
    const { name, lat, lon } = location;
    if (!lat || !lon) return;

    const icon = getMarkerIconForLocation(name.toLowerCase());
    const marker = window.L.marker([lat, lon], { icon }).addTo(mapInstance);
    marker.bindPopup(createPopupContent(name));
    markers.push(marker);

    bounds.extend([lat, lon]);
  });

  // Centraliza o mapa em Morro de São Paulo com zoom 15
  mapInstance.setView([-13.3815787, -38.9159057], 15);
}

/**
 * Seleciona o ícone apropriado com base no tipo de localização usando Font Awesome.
 * @param {string} name - Nome do local.
 * @returns {Object} Configuração do ícone.
 */
function getMarkerIconForLocation(name) {
  let iconClass = "fa-map-marker-alt"; // Ícone padrão

  if (name.includes("praia")) {
    iconClass = "fa-umbrella-beach";
  } else if (name.includes("restaurante") || name.includes("sabores")) {
    iconClass = "fa-utensils";
  } else if (
    name.includes("pousada") ||
    name.includes("hotel") ||
    name.includes("vila")
  ) {
    iconClass = "fa-bed";
  } else if (name.includes("atração") || name.includes("farol")) {
    iconClass = "fa-mountain";
  } else if (name.includes("loja") || name.includes("mercado")) {
    iconClass = "fa-shopping-bag";
  } else if (name.includes("hospital") || name.includes("polícia")) {
    iconClass = "fa-ambulance";
  }

  // Retorna um ícone do Leaflet com Font Awesome
  return window.L.divIcon({
    html: `<i class="fas ${iconClass}" style="font-size: 24px; color: #3b82f6;"></i>`,
    className: "custom-marker-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
}

/**
 * Cria conteúdo HTML personalizado para os popups
 */
function createPopupContent(name) {
  return `<div class="custom-popup">
    <h3>${name}</h3>
    <p>${getLocationDescription(name.toLowerCase())}</p>
    <div class="popup-buttons">
      <button class="popup-button" onclick="window.navigateTo('${name.toLowerCase()}')">Mais detalhes</button>
      <button class="popup-button" onclick="startCarousel('${name}')">Fotos</button>
      <button class="popup-button" onclick="showRoute('${name}')">Como Chegar</button>
    </div>
  </div>`;
}

/**
 * Retorna uma descrição curta para a localização
 */
function getLocationDescription(key) {
  const descriptions = {
    "segunda praia": "A mais movimentada e cheia de quiosques.",
    "terceira praia": "Mais tranquila, com águas calmas.",
    "quarta praia": "Extensa e com menos estrutura, perfeita para caminhadas.",
    "praia do encanto": "Paraíso isolado com águas cristalinas.",
    // Adicione mais descrições conforme necessário
  };

  return (
    descriptions[key] ||
    "Um local incrível para conhecer em Morro de São Paulo."
  );
}

/**
 * Adicionar controle de geolocalização para o usuário encontrar sua localização no mapa
 */
export function setupGeolocation(map = mapInstance) {
  let userLocationMarker = null;
  let accuracyCircle = null;

  const geolocateControl = document.createElement("div");
  geolocateControl.className = "geolocate-control";
  geolocateControl.innerHTML = '<i class="fas fa-location-arrow"></i>';
  document.getElementById("map-section").appendChild(geolocateControl);

  geolocateControl.addEventListener("click", () => {
    if (navigator.geolocation) {
      geolocateControl.classList.add("loading");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLatLng = [
            position.coords.latitude,
            position.coords.longitude,
          ];

          if (userLocationMarker) {
            map.removeLayer(userLocationMarker);
          }
          if (accuracyCircle) {
            map.removeLayer(accuracyCircle);
          }

          userLocationMarker = window.L.circleMarker(userLatLng, {
            radius: 8,
            color: "#3b82f6",
            fillColor: "#60a5fa",
            fillOpacity: 0.7,
            weight: 2,
          }).addTo(map);

          accuracyCircle = window.L.circle(userLatLng, {
            radius: position.coords.accuracy,
            color: "rgba(59, 130, 246, 0.3)",
            fillColor: "rgba(59, 130, 246, 0.1)",
            fillOpacity: 0.4,
            weight: 1,
          }).addTo(map);

          markers.push(userLocationMarker, accuracyCircle);

          map.setView(userLatLng, 16);
          geolocateControl.classList.remove("loading");
          geolocateControl.classList.add("active");
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          geolocateControl.classList.remove("loading");
          alert(
            "Não foi possível obter sua localização. Verifique as permissões do navegador."
          );
        }
      );
    } else {
      alert("Seu navegador não suporta geolocalização.");
    }
  });
}

/**
 * Exibe a rota entre a localização atual do usuário e o destino.
 * @param {string} locationName - Nome do destino.
 */
export function showRoute(locationName) {
  // Encontra o marcador correspondente ao local selecionado
  const location = markers.find((marker) =>
    marker.getPopup().getContent().includes(locationName)
  );
  if (!location) {
    alert("Localização não encontrada no mapa.");
    return;
  }

  const { lat, lng } = location.getLatLng();

  if (!navigator.geolocation) {
    alert("Seu navegador não suporta geolocalização.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLatLng = [position.coords.latitude, position.coords.longitude];

      // Remove rota anterior, se existir
      if (routingControl) {
        mapInstance.removeControl(routingControl);
      }

      // Adiciona a rota no mapa
      routingControl = window.L.Routing.control({
        waypoints: [
          window.L.latLng(userLatLng), // Localização atual do usuário
          window.L.latLng(lat, lng), // Localização do destino
        ],
        routeWhileDragging: true,
        show: false,
        createMarker: () => null, // Remove os marcadores padrão
        router: new window.L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
        }),
      })
        .on("routesfound", (e) => {
          const route = e.routes[0];
          const summary = route.summary;
          showRouteSummary(
            locationName,
            summary.totalDistance,
            summary.totalTime
          );
        })
        .addTo(mapInstance);
    },
    (error) => {
      console.error("Erro ao obter localização:", error);
      alert(
        "Não foi possível acessar sua localização. Verifique as permissões."
      );
    }
  );
}

/**
 * Exibe o resumo da rota com os botões "Iniciar Navegação" e "Cancelar Navegação".
 */
function showRouteSummary(locationName, totalDistance, totalTime) {
  const routeSummary = document.createElement("div");
  routeSummary.id = "route-summary";
  routeSummary.className = "route-summary";
  routeSummary.innerHTML = `
    <h3>Rota para ${locationName}</h3>
    <p>Distância total: ${(totalDistance / 1000).toFixed(2)} km</p>
    <p>Tempo estimado: ${(totalTime / 60).toFixed(2)} minutos</p>
    <div class="route-buttons">
      <button id="start-navigation" class="route-button">Iniciar Navegação</button>
      <button id="cancel-navigation" class="route-button">Cancelar Navegação</button>
    </div>
  `;

  document.body.appendChild(routeSummary);

  // Adiciona eventos aos botões
  document.getElementById("start-navigation").addEventListener("click", () => {
    alert("Navegação iniciada!");
    // Aqui você pode implementar a lógica de navegação em tempo real
  });

  document.getElementById("cancel-navigation").addEventListener("click", () => {
    if (routingControl) {
      mapInstance.removeControl(routingControl);
      routingControl = null;
    }
    document.body.removeChild(routeSummary);
  });
}
