// theme-manager.js - Gerenciamento de temas e modos claro/escuro

import { mapInstance } from "./map-controls.js";

let currentTheme = "light";

/**
 * Inicializa o gerenciador de temas
 */
export function initThemeManager() {
  // Verifica preferência do usuário
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    setTheme("dark");
  }

  // Escuta mudanças nas preferências do sistema
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      setTheme(e.matches ? "dark" : "light");
    });
}

/**
 * Define o tema do aplicativo
 */
function setTheme(theme) {
  if (!mapInstance) {
    console.error(
      "Mapa não inicializado. Certifique-se de que o mapa foi carregado antes de definir o tema."
    );
    return;
  }

  // Exemplo de como adicionar uma camada ao mapa
  const layer = window.L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  );
  if (theme === "dark") {
    layer.addTo(mapInstance); // Certifique-se de que mapInstance é válido
  } else {
    // Remova ou altere a camada conforme necessário
    mapInstance.eachLayer((existingLayer) => {
      mapInstance.removeLayer(existingLayer);
    });
    layer.addTo(mapInstance);
  }

  document.documentElement.setAttribute("data-theme", theme);
  currentTheme = theme;

  // Atualiza o ícone do botão
  const themeToggle = document.querySelector(".theme-toggle i");
  if (themeToggle) {
    themeToggle.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
  }
}
