// submenu.js – Gerenciamento de submenus por categoria

/* O que ele faz:
Usa fetchOSMData() (a ser implementado) para buscar dados da categoria.
Renderiza dinamicamente os itens de submenu.
Adiciona eventos de clique que mostram o local no mapa via showLocationOnMap().*/

import { fetchOSMData } from "./osm-service.js";
import { showLocationOnMap, showAllLocationsOnMap } from "./map-controls.js";
import { queries } from "./osm-service.js";
import { startCarousel } from "./carousel.js";

let submenuData = {};
let selectedFeature = null;

/**
 * Cria botões dinâmicos para cada query no submenu.
 */
export function createSubmenuButtons() {
  const container = document.getElementById("submenuContainer"); // Certifique-se de que o elemento existe
  if (!container) {
    console.error("Elemento 'submenuContainer' não encontrado.");
    return;
  }

  // Cria um botão para cada query
  Object.keys(queries).forEach((key) => {
    const button = document.createElement("button");
    button.className = "control-button";
    button.textContent = formatButtonLabel(key);
    button.addEventListener("click", () => loadSubMenu(key));
    container.appendChild(button);
  });

  container.classList.remove("hidden");
}

/**
 * Associa os botões de ação rápida às queries do OSM.
 */
export function setupQuickActionButtons() {
  const buttonMappings = {
    "btn-attractions": "touristSpots-submenu",
    "btn-tours": "tours-submenu",
    "btn-nightlife": "nightlife-submenu",
    "btn-beaches": "beaches-submenu",
    "btn-restaurants": "restaurants-submenu",
    "btn-inns": "inns-submenu",
    "btn-shops": "shops-submenu",
    "btn-emergencies": "emergencies-submenu",
  };

  Object.entries(buttonMappings).forEach(([buttonId, queryKey]) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener("click", () => loadSubMenu(queryKey));
    } else {
      console.warn(`Botão com ID "${buttonId}" não encontrado.`);
    }
  });
}

/**
 * Carrega os itens de submenu com base na query escolhida.
 * @param {string} queryKey - Chave da query (ex: 'beaches-submenu').
 */
export async function loadSubMenu(queryKey) {
  const container = document.getElementById("submenuContainer");
  if (!container) return console.error("Submenu container não encontrado.");

  container.innerHTML = "<p>Carregando...</p>";

  try {
    // Atualiza a feature selecionada
    selectedFeature = queryKey;

    // Busca dados da OSM
    const results = await fetchOSMData(queryKey);

    submenuData[queryKey] = results;
    renderSubmenuItems(container, results);

    // Exibe todos os marcadores no mapa
    showAllLocationsOnMap(results);
  } catch (err) {
    container.innerHTML = "<p>Erro ao carregar dados.</p>";
    console.error("Erro no submenu:", err);
  }
}

/**
 * Renderiza os itens da lista de submenu na interface.
 * @param {HTMLElement} container - Elemento que conterá os itens.
 * @param {Array} items - Lista de locais.
 */
function renderSubmenuItems(container, items) {
  container.innerHTML = "";
  const ul = document.createElement("ul");
  ul.className = "submenu-list";

  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = item.name;
    li.dataset.index = index;
    li.classList.add("submenu-item");
    ul.appendChild(li);
  });

  container.appendChild(ul);

  // Remove a classe 'hidden' para exibir o submenu
  container.parentElement.classList.remove("hidden");

  setupSubmenuClickListeners(ul);
}

/**
 * Ativa os eventos de clique nos itens do submenu.
 * @param {HTMLElement} ul - Lista UL contendo os itens.
 */
function setupSubmenuClickListeners(ul) {
  ul.querySelectorAll(".submenu-item").forEach((item) => {
    item.addEventListener("click", () => {
      const index = item.dataset.index;
      handleSubmenuItemClick(index);
    });
  });
}

/**
 * Trata o clique em um item do submenu e exibe no mapa.
 * Fecha o submenu após o clique.
 * @param {number} index - Índice do item clicado.
 */
export function handleSubmenuItemClick(index) {
  const item = submenuData[selectedFeature]?.[index];
  if (!item) return;

  // Mostra a localização no mapa
  showLocationOnMap(item.name, item.lat, item.lon);

  console.log("[Submenu] Local selecionado:", item.name);

  // Fecha o submenu
  const submenu = document.getElementById("submenu");
  if (submenu) {
    submenu.classList.add("hidden");
  }
}

/**
 * Formata o rótulo do botão com base na chave da query.
 * @param {string} key - Chave da query.
 * @returns {string} Rótulo formatado.
 */
function formatButtonLabel(key) {
  return key.replace("-submenu", "").replace(/-/g, " ").toUpperCase();
}
