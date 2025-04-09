// main.js - Arquivo principal de inicialização do site Morro Digital

// Importações de módulos
import { initializeMap, setupGeolocation } from "./map-controls.js";
import { initializeAssistant, showAssistant } from "./assistant.js";
import { translatePageContent } from "./translatePageContent.js";
import { initVoice } from "./voiceSystem.js";
import { initAnalytics } from "./analytics.js";
import { initPerformanceOptimizations } from "./performance.js";
import { setupAssistantInteractions } from "./interface.js";
import { processUserInput } from "./dialog.js";
import { createSubmenuButtons, setupQuickActionButtons } from "./submenu.js";
import { startCarousel } from "./carousel.js"; // Importe a função startCarousel
import { showRoute } from "./map-controls.js";

let map;
let userLocationMarker = null;
let userPopup = null;

// Configura os botões de ação rápida
document.addEventListener("DOMContentLoaded", () => {
  setupQuickActionButtons();
});

// Variáveis globais
let language;

// Função para detectar o idioma do navegador e definir o idioma da página
function setLanguage() {
  const userLang = navigator.language || navigator.userLanguage;
  language = userLang.split("-")[0];
  document.documentElement.lang = language;
  translatePageContent(language);
}

// Inicialização de elementos da interface
function setupUIElements() {
  // Configurar ação para o botão de assistente
  const assistantButton = document.querySelector(".action-button.primary");
  if (assistantButton) {
    assistantButton.addEventListener("click", showAssistant);
  }

  // Configurar botão de fechamento do submenu
  const closeButton = document.querySelector(".close-button");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      document.getElementById("submenu").classList.add("hidden");
    });
  }
}

// Manipula a seleção de categoria a partir dos botões rápidos
function handleCategorySelection(category) {
  const submenu = document.getElementById("submenu");
  const submenuTitle = document.querySelector(".submenu-title");
  const submenuContainer = document.getElementById("submenuContainer");

  // Define o título com base na categoria
  const titles = {
    praias: "Melhores Praias",
    comer: "Onde Comer",
    atrações: "Principais Atrações",
    dormir: "Onde se Hospedar",
  };

  if (submenuTitle) {
    submenuTitle.textContent = titles[category] || "Explorar Locais";
  }

  // Conteúdo de exemplo para cada categoria
  const mockData = {
    praias: [
      {
        name: "Segunda Praia",
        description: "A mais movimentada e cheia de quiosques.",
      },
      {
        name: "Terceira Praia",
        description: "Mais tranquila, com águas calmas.",
      },
      {
        name: "Praia do Encanto",
        description: "Paraíso isolado com águas cristalinas.",
      },
    ],
    comer: [
      {
        name: "Restaurante Farol",
        description: "Especializado em frutos do mar.",
      },
      { name: "Sabores da Ilha", description: "Comida baiana tradicional." },
    ],
    atrações: [
      { name: "Farol do Morro", description: "Vista panorâmica incrível." },
      { name: "Tirolesa", description: "Adrenalina com vista para o mar." },
    ],
    dormir: [
      { name: "Pousada Mar Azul", description: "Confortável e central." },
      { name: "Vila dos Coqueiros", description: "Bangalôs à beira-mar." },
    ],
  };

  // Renderiza os itens do submenu
  if (submenuContainer) {
    submenuContainer.innerHTML = "";
    const ul = document.createElement("ul");

    (mockData[category] || []).forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "submenu-item";
      li.innerHTML = `
        <div class="submenu-item-icon">
          <i class="fas fa-map-marker-alt"></i>
        </div>
        <div class="submenu-item-content">
          <div class="submenu-item-title">${item.name}</div>
          <div class="submenu-item-description">${item.description}</div>
        </div>
      `;

      // Adiciona evento para mostrar localização no mapa
      li.addEventListener("click", () => {
        showLocationOnMap(item.name, map);
        submenu.classList.add("hidden");
      });

      ul.appendChild(li);
    });

    submenuContainer.appendChild(ul);
  }

  // Exibe o submenu
  if (submenu) {
    submenu.classList.remove("hidden");
  }
}

/**
 * Solicita permissão de GPS e rastreia a posição do usuário em tempo real.
 */
function requestAndTrackUserLocation() {
  if (!navigator.geolocation) {
    alert("Seu navegador não suporta geolocalização.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      // Inicializa o mapa focado na localização do usuário
      map = initializeMap("map");
      map.setView([latitude, longitude], 15); // Zoom 15

      // Adiciona o marcador de localização do usuário
      userLocationMarker = window.L.marker([latitude, longitude], {
        icon: window.L.divIcon({
          html: `<i class="fas fa-location-arrow" style="font-size: 24px; color: red; transform: rotate(45deg);"></i>`,
          className: "custom-user-marker",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      }).addTo(map);

      // Adiciona o popup "Você está aqui!"
      userPopup = userLocationMarker.bindPopup("Você está aqui!").openPopup();

      // Rastreia a posição do usuário em tempo real
      trackUserLocation();
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
 * Rastreia a posição do usuário em tempo real.
 */
function trackUserLocation() {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      // Atualiza o marcador e o popup para a nova posição
      if (userLocationMarker) {
        userLocationMarker.setLatLng([latitude, longitude]);
        userPopup.setLatLng([latitude, longitude]);
      }

      // Centraliza o mapa na nova posição do usuário
      map.setView([latitude, longitude], 16); // Zoom 15
    },
    (error) => {
      console.error("Erro ao rastrear localização:", error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
    }
  );
}

// Função principal de inicialização da aplicação
function initApp() {
  // Define o idioma
  setLanguage();

  // Inicializa o mapa no elemento com id="map"
  map = initializeMap("map");

  // Solicita permissão de GPS e rastreia a posição do usuário
  requestAndTrackUserLocation();

  // Adiciona recursos avançados ao mapa
  if (map) {
    setupGeolocation(map);
  }

  // Inicializa o sistema de voz
  initVoice(language);

  // Configura os eventos do assistente
  setupAssistantInteractions(async (message) => {
    const response = await processUserInput(message);
    if (response.text) {
      appendMessage("assistant", response.text);
    }
    if (response.action) {
      response.action();
    }
  });

  // Inicializa o assistente
  initializeAssistant({
    map,
    lang: language,
    onReady: () => {
      console.log("[Assistente] Pronto para interação.");
    },
  });

  // Configura elementos da interface
  setupUIElements();

  // Inicializa recursos avançados

  initAnalytics();
  initPerformanceOptimizations();
}

// Aguarda o carregamento completo do DOM
window.addEventListener("DOMContentLoaded", () => {
  console.log("[Morro Digital] Sistema iniciando...");
  initApp();

  // Expõe funções necessárias globalmente para uso nos popups do mapa
  window.navigateTo = function (locationName) {
    showLocationOnMap(locationName, map);
  };

  createSubmenuButtons(); // Cria os botões dinâmicos
  setupQuickActionButtons(); // Configura os botões de ação rápida

  // Exponha a função globalmente
  window.showRoute = showRoute;
  window.startCarousel = startCarousel;
});
