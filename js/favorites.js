<<<<<<< HEAD
// favorites.js - Gerenciamento de locais favoritos do usuário

/**
 * Inicializa o sistema de favoritos
 */
export function initFavorites() {
  // Adiciona botão de favoritos na interface
  const favButton = document.createElement("button");
  favButton.className = "favorites-button";
  favButton.innerHTML = '<i class="fas fa-heart"></i>';
  favButton.setAttribute("aria-label", "Meus favoritos");

  document.querySelector(".quick-actions").appendChild(favButton);

  favButton.addEventListener("click", showFavoritesPanel);
}

/**
 * Adiciona um local aos favoritos
 * @param {Object} place - Dados do local a ser salvo
 */
export function addToFavorites(place) {
  const favorites = getFavorites();

  // Evita duplicatas
  if (!favorites.some((fav) => fav.name === place.name)) {
    favorites.push({
      ...place,
      addedAt: new Date().toISOString(),
    });

    localStorage.setItem("favorites", JSON.stringify(favorites));
    showToast(`${place.name} adicionado aos favoritos!`);
  }
}

/**
 * Remove um local dos favoritos
 * @param {string} placeName - Nome do local a ser removido
 */
export function removeFromFavorites(placeName) {
  let favorites = getFavorites();
  favorites = favorites.filter((place) => place.name !== placeName);
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

/**
 * Recupera a lista de favoritos do armazenamento local
 */
export function getFavorites() {
  const stored = localStorage.getItem("favorites");
  return stored ? JSON.parse(stored) : [];
}

/**
 * Exibe o painel de favoritos
 */
function showFavoritesPanel() {
  const favorites = getFavorites();

  // Cria o painel de favoritos
  const panel = document.createElement("div");
  panel.className = "favorites-panel";

  let panelContent = `
    <div class="panel-header">
      <h3>Meus Favoritos</h3>
      <button class="close-button" aria-label="Fechar painel">×</button>
    </div>
  `;

  if (favorites.length === 0) {
    panelContent += `
      <div class="empty-state">
        <i class="fas fa-heart-broken"></i>
        <p>Você ainda não tem locais favoritos.</p>
        <p>Salve-os clicando no ícone ♥ ao visitar um local.</p>
      </div>
    `;
  } else {
    panelContent += `<ul class="favorites-list">`;
    favorites.forEach((place) => {
      panelContent += `
        <li class="favorite-item" data-name="${place.name}">
          <div class="favorite-info">
            <strong>${place.name}</strong>
            <span>${place.description || ""}</span>
          </div>
          <div class="favorite-actions">
            <button class="show-button" aria-label="Mostrar no mapa"><i class="fas fa-map-marker-alt"></i></button>
            <button class="remove-button" aria-label="Remover dos favoritos"><i class="fas fa-trash"></i></button>
          </div>
        </li>
      `;
    });
    panelContent += `</ul>`;
  }

  panel.innerHTML = panelContent;
  document.body.appendChild(panel);

  // Configura eventos
  panel.querySelector(".close-button").addEventListener("click", () => {
    panel.remove();
  });

  panel.querySelectorAll(".show-button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const name = e.target.closest(".favorite-item").dataset.name;
      window.showLocationOnMap(name);
      panel.remove();
    });
  });

  panel.querySelectorAll(".remove-button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const item = e.target.closest(".favorite-item");
      const name = item.dataset.name;
      removeFromFavorites(name);
      item.remove();

      // Se a lista ficar vazia, atualiza o painel
      if (panel.querySelectorAll(".favorite-item").length === 0) {
        panel.remove();
        showFavoritesPanel();
      }
    });
  });
}

/**
 * Exibe uma notificação toast temporária
 */
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }, 100);
}
=======
// favorites.js - Gerenciamento de locais favoritos do usuário

/**
 * Inicializa o sistema de favoritos
 */
export function initFavorites() {
  // Adiciona botão de favoritos na interface
  const favButton = document.createElement("button");
  favButton.className = "favorites-button";
  favButton.innerHTML = '<i class="fas fa-heart"></i>';
  favButton.setAttribute("aria-label", "Meus favoritos");

  document.querySelector(".quick-actions").appendChild(favButton);

  favButton.addEventListener("click", showFavoritesPanel);
}

/**
 * Adiciona um local aos favoritos
 * @param {Object} place - Dados do local a ser salvo
 */
export function addToFavorites(place) {
  const favorites = getFavorites();

  // Evita duplicatas
  if (!favorites.some((fav) => fav.name === place.name)) {
    favorites.push({
      ...place,
      addedAt: new Date().toISOString(),
    });

    localStorage.setItem("favorites", JSON.stringify(favorites));
    showToast(`${place.name} adicionado aos favoritos!`);
  }
}

/**
 * Remove um local dos favoritos
 * @param {string} placeName - Nome do local a ser removido
 */
export function removeFromFavorites(placeName) {
  let favorites = getFavorites();
  favorites = favorites.filter((place) => place.name !== placeName);
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

/**
 * Recupera a lista de favoritos do armazenamento local
 */
export function getFavorites() {
  const stored = localStorage.getItem("favorites");
  return stored ? JSON.parse(stored) : [];
}

/**
 * Exibe o painel de favoritos
 */
function showFavoritesPanel() {
  const favorites = getFavorites();

  // Cria o painel de favoritos
  const panel = document.createElement("div");
  panel.className = "favorites-panel";

  let panelContent = `
    <div class="panel-header">
      <h3>Meus Favoritos</h3>
      <button class="close-button" aria-label="Fechar painel">×</button>
    </div>
  `;

  if (favorites.length === 0) {
    panelContent += `
      <div class="empty-state">
        <i class="fas fa-heart-broken"></i>
        <p>Você ainda não tem locais favoritos.</p>
        <p>Salve-os clicando no ícone ♥ ao visitar um local.</p>
      </div>
    `;
  } else {
    panelContent += `<ul class="favorites-list">`;
    favorites.forEach((place) => {
      panelContent += `
        <li class="favorite-item" data-name="${place.name}">
          <div class="favorite-info">
            <strong>${place.name}</strong>
            <span>${place.description || ""}</span>
          </div>
          <div class="favorite-actions">
            <button class="show-button" aria-label="Mostrar no mapa"><i class="fas fa-map-marker-alt"></i></button>
            <button class="remove-button" aria-label="Remover dos favoritos"><i class="fas fa-trash"></i></button>
          </div>
        </li>
      `;
    });
    panelContent += `</ul>`;
  }

  panel.innerHTML = panelContent;
  document.body.appendChild(panel);

  // Configura eventos
  panel.querySelector(".close-button").addEventListener("click", () => {
    panel.remove();
  });

  panel.querySelectorAll(".show-button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const name = e.target.closest(".favorite-item").dataset.name;
      window.showLocationOnMap(name);
      panel.remove();
    });
  });

  panel.querySelectorAll(".remove-button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const item = e.target.closest(".favorite-item");
      const name = item.dataset.name;
      removeFromFavorites(name);
      item.remove();

      // Se a lista ficar vazia, atualiza o painel
      if (panel.querySelectorAll(".favorite-item").length === 0) {
        panel.remove();
        showFavoritesPanel();
      }
    });
  });
}

/**
 * Exibe uma notificação toast temporária
 */
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }, 100);
}
>>>>>>> 3042ef7feaa3fb8bf5361238a6a3dcf175d9c2a1
