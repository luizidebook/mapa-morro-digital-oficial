// osm-service.js – Consulta de pontos de interesse via Overpass API (ou mock local)

/* O que esse módulo faz:
Usa a Overpass API para buscar POIs de categorias específicas.
Está preparado para funcionar offline com dados mockados durante o desenvolvimento.
Fácil de expandir com novas categorias e novas fontes de dados no futuro.*/

export const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
export const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";

// Queries Overpass
export const queries = {
  "touristSpots-submenu":
    '[out:json];node["tourism"="attraction"](around:10000,-13.376,-38.917);out body;',
  "tours-submenu":
    '[out:json];node["tourism"="information"](around:10000,-13.376,-38.917);out body;',
  "beaches-submenu":
    '[out:json];node["natural"="beach"](around:15000,-13.376,-38.917);out body;',
  "nightlife-submenu":
    '[out:json];node["amenity"="nightclub"](around:10000,-13.376,-38.917);out body;',
  "restaurants-submenu":
    '[out:json];node["amenity"="restaurant"](around:15000,-13.376,-38.917);out body;',
  "inns-submenu":
    '[out:json];node["tourism"="hotel"](around:15000,-13.376,-38.917);out body;',
  "shops-submenu":
    '[out:json];node["shop"](around:15000,-13.376,-38.917);out body;',
  "emergencies-submenu":
    '[out:json];node["amenity"~"hospital|police"](around:10000,-13.376,-38.917);out body;',
  "tips-submenu":
    '[out:json];node["tips"](around:10000,-13.376,-38.913);out body;',
  "about-submenu":
    '[out:json];node["about"](around:10000,-13.376,-38.913);out body;',
  "education-submenu":
    '[out:json];node["education"](around:10000,-13.376,-38.913);out body;',
};

/**
 * Busca dados da API Overpass com base na query fornecida.
 * @param {string} queryKey - Chave da query (ex: 'restaurants-submenu').
 * @returns {Promise<Array>} Lista de resultados.
 */
export async function fetchOSMData(queryKey) {
  const query = queries[queryKey];
  if (!query) {
    throw new Error(`Query não encontrada para a chave: ${queryKey}`);
  }

  const url = `${OVERPASS_API_URL}?data=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro na requisição Overpass API: ${response.status}`);
    }

    const data = await response.json();
    return data.elements.map((element) => ({
      id: element.id,
      name: element.tags.name || "Local sem nome",
      lat: element.lat,
      lon: element.lon,
      tags: element.tags,
    }));
  } catch (error) {
    console.error("Erro ao buscar dados da Overpass API:", error);
    throw error;
  }
}

/**
 * Carrega os itens do submenu com base na chave da query fornecida.
 * @param {string} queryKey - Chave da query (ex: 'restaurants-submenu').
 */
export async function loadSubMenu(queryKey) {
  const container = document.getElementById("submenuContainer");
  if (!container) return console.error("Submenu container não encontrado.");

  container.innerHTML = "<p>Carregando...</p>";

  try {
    selectedFeature = queryKey;

    const results = await fetchOSMData(queryKey);
    console.log("[OSM Data]", results); // Verifique os dados retornados aqui

    submenuData[queryKey] = results;
    renderSubmenuItems(container, results);
  } catch (err) {
    container.innerHTML = "<p>Erro ao carregar dados.</p>";
    console.error("Erro no submenu:", err);
  }
}

/**
 * Valida as coordenadas fornecidas usando a API Nominatim.
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 * @returns {Promise<Object>} Coordenadas validadas ou originais.
 */
export async function validateCoordinates(lat, lon) {
  const url = `${NOMINATIM_URL}?format=json&lat=${lat}&lon=${lon}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch (error) {
    console.error("Erro ao validar coordenadas:", error);
  }
  return { lat, lon }; // Retorna as coordenadas originais se não houver correção
}
