// dialog.js – Processamento de entrada do usuário e definição de respostas

import { showLocationOnMap } from "./map-controls.js";

/**
 * Processa a mensagem do usuário, define resposta e ação.
 * @param {string} input - Texto do usuário.
 * @param {object} context - Contexto atual da aplicação (ex: { map })
 * @returns {Promise<{ text: string, action?: Function }>}
 */
export async function processUserInput(input, context = {}) {
  const normalized = input.trim().toLowerCase();

  // Regras simples para identificar intenções
  if (normalized.includes("sim") && normalized.includes("primeira")) {
    return {
      text: "Que ótimo! Posso te mostrar os principais pontos turísticos, praias ou restaurantes. Qual prefere?",
    };
  }

  if (normalized.includes("praia")) {
    return {
      text: "Morro de São Paulo tem praias maravilhosas! Estou mostrando a Segunda Praia para você, que é uma das mais populares.",
      action: () => {
        // Exibe localização no mapa usando a instância do mapa do contexto
        showLocationOnMap("segunda praia", context.map);
      },
    };
  }

  if (normalized.includes("restaurante") || normalized.includes("comer")) {
    return {
      text: "Esses são alguns dos melhores restaurantes de Morro de São Paulo. Posso te recomendar o Restaurante Farol!",
      action: () => {
        // Simula a abertura do submenu de restaurantes
        const submenu = document.getElementById("submenu");
        const submenuTitle = document.querySelector(".submenu-title");

        if (submenuTitle) {
          submenuTitle.textContent = "Onde Comer";
        }

        if (submenu) {
          submenu.classList.remove("hidden");
        }
      },
    };
  }

  if (
    normalized.includes("roteiro") ||
    normalized.includes("passeio") ||
    normalized.includes("atrações")
  ) {
    return {
      text: "Você pode explorar trilhas, passeios de barco e mirantes incríveis. O Farol do Morro é uma visita obrigatória!",
      action: () => {
        showLocationOnMap("farol do morro", context.map);
      },
    };
  }

  if (normalized.includes("ajuda")) {
    return {
      text: "Posso te ajudar com informações sobre praias, restaurantes, hospedagem e atrações. O que você gostaria de saber?",
    };
  }

  // Resposta padrão
  return {
    text: "Desculpe, não entendi muito bem. Você pode perguntar sobre praias, restaurantes, passeios ou pousadas.",
  };
}
