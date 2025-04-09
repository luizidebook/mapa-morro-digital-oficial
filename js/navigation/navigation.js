/**
 * Módulo: navigation.js
 * Descrição: Este módulo gerencia o fluxo de navegação, incluindo validação de destino, obtenção de rotas, monitoramento contínuo da posição do usuário e atualização da interface.
 *
 * Dependências:
 * 1. **Funções Externas**:
 *    - `validateDestination(destination)`: Valida se o destino selecionado é válido.
 *    - `getCurrentLocation()`: Obtém a localização atual do usuário.
 *    - `fetchMultipleRouteOptions(startLat, startLon, destLat, destLon)`: Obtém múltiplas opções de rota.
 *    - `promptUserToChooseRoute(routeOptions)`: Permite que o usuário escolha uma rota.
 *    - `enrichInstructionsWithOSM(instructions, lang)`: Enriquece as instruções de rota com dados adicionais.
 *    - `plotRouteOnMap(startLat, startLon, destLat, destLon)`: Plota a rota no mapa.
 *    - `finalizeRouteMarkers(startLat, startLon, destination)`: Adiciona marcadores de origem e destino no mapa.
 *    - `updateInstructionBanner(instruction, lang)`: Atualiza o banner de instruções.
 *    - `updateRouteFooter(routeData, lang)`: Atualiza o rodapé com informações da rota.
 *    - `updateRealTimeNavigation(lat, lon, instructions, destLat, destLon, lang, heading)`: Atualiza a navegação em tempo real.
 *    - `adjustMapZoomBasedOnSpeed(speed)`: Ajusta o zoom do mapa com base na velocidade do usuário.
 *    - `setMapRotation(heading)`: Rotaciona o mapa com base no heading do usuário.
 *    - `showNotification(message, type)`: Exibe notificações para o usuário.
 *    - `hideRouteLoadingIndicator()`: Oculta o indicador de carregamento da rota.
 *    - `showRouteLoadingIndicator()`: Exibe o indicador de carregamento da rota.
 *
 * 2. **Variáveis Globais**:
 *    - `selectedDestination`: Objeto contendo as coordenadas do destino selecionado.
 *    - `userLocation`: Objeto contendo a localização atual do usuário.
 *    - `navigationState`: Objeto que armazena o estado atual da navegação.
 *    - `window.positionWatcher`: ID retornado pelo `navigator.geolocation.watchPosition`.
 *
 * 3. **Constantes**:
 *    - `selectedLanguage`: Idioma selecionado pelo usuário (ex.: "pt", "en").
 *
 * Observação:
 * Certifique-se de que todas as dependências estão disponíveis no escopo global ou importadas corretamente.
 */

/////////////////////////////
// 1. FLUXO PRINCIPAL
/////////////////////////////

/**
 * 1.1. startNavigation
 * Inicia a navegação para o destino selecionado, configurando o fluxo completo:
 *  - Validação do destino e disponibilidade de localização;
 *  - Obtenção de múltiplas opções de rota e escolha pelo usuário;
 *  - Enriquecimento das instruções de rota (por exemplo, com dados do OSM);
 *  - Animação e plotagem da rota no mapa;
 *  - Configuração do monitoramento contínuo da posição do usuário.
 */
export async function startNavigation() {
  try {
    console.log('[startNavigation] Iniciando navegação...');

    // 1️⃣ Exibe o indicador de carregamento da rota.
    showRouteLoadingIndicator();

    // 2️⃣ Valida o destino selecionado.
    if (!validateDestination(selectedDestination)) {
      console.error('Destino inválido. Selecione um destino válido.');
      hideRouteLoadingIndicator();
      return;
    }

    // 3️⃣ Verifica se a localização do usuário está disponível.
    if (!userLocation) {
      showNotification(
        'Localização não disponível. Permita o acesso à localização primeiro.',
        'error'
      );
      hideRouteLoadingIndicator();
      return;
    }

    // 4️⃣ Inicializa o estado da navegação.
    initNavigationState();

    // 5️⃣ Obtém múltiplas opções de rota.
    const routeOptions = await fetchMultipleRouteOptions(
      userLocation.latitude,
      userLocation.longitude,
      selectedDestination.lat,
      selectedDestination.lon
    );
    if (!routeOptions || routeOptions.length === 0) {
      showNotification('Nenhuma rota disponível.', 'error');
      hideRouteLoadingIndicator();
      return;
    }

    // 6️⃣ Permite que o usuário escolha a rota desejada.
    const selectedRoute = await promptUserToChooseRoute(routeOptions);
    if (!selectedRoute) {
      hideRouteLoadingIndicator();
      return;
    }

    // 7️⃣ Enriquece as instruções da rota com dados adicionais.
    const routeInstructions = await enrichInstructionsWithOSM(
      selectedRoute.routeData,
      selectedLanguage
    );
    navigationState.instructions = routeInstructions;

    // 8️⃣ Centraliza o mapa na localização atual do usuário.
    animateMapToLocalizationUser(userLocation.latitude, userLocation.longitude);

    // 9️⃣ Plota a rota escolhida no mapa e adiciona os marcadores.
    const routeData = await plotRouteOnMap(
      userLocation.latitude,
      userLocation.longitude,
      selectedDestination.lat,
      selectedDestination.lon
    );
    finalizeRouteMarkers(
      userLocation.latitude,
      userLocation.longitude,
      selectedDestination
    );

    // 🔟 Atualiza a interface com as informações da rota.
    hideRouteSummary();
    updateInstructionBanner(routeInstructions[0], selectedLanguage);
    updateRouteFooter(routeData, selectedLanguage);
    hideRouteLoadingIndicator();

    // 🔟.1 Fornece feedback por voz para indicar que a navegação começou.
    giveVoiceFeedback('Navegação iniciada.');

    // 🔟.2 Inicia o monitoramento contínuo da posição do usuário.
    startPositionWatcher();

    // Adicionar evento para notificar o assistente
    const event = new CustomEvent('navigationStarted', {
      detail: { destination: selectedDestination },
    });
    window.dispatchEvent(event);

    console.log('[startNavigation] Navegação iniciada com sucesso.');
  } catch (error) {
    console.error('[startNavigation] Erro:', error);
    showNotification('Erro ao iniciar navegação.', 'error');
    hideRouteLoadingIndicator();
  }
}

/////////////////////////////
// 2. FUNÇÕES AUXILIARES
/////////////////////////////

/**
 * 2.1. initNavigationState
 * Inicializa o estado da navegação.
 */
function initNavigationState() {
  navigationState.isActive = true;
  navigationState.isPaused = false;
  navigationState.currentStepIndex = 0;
  navigationState.instructions = [];
  console.log('[initNavigationState] Estado de navegação inicializado.');
}

/**
 * 2.2. startPositionWatcher
 * Inicia o monitoramento contínuo da posição do usuário.
 */
function startPositionWatcher() {
  window.positionWatcher = navigator.geolocation.watchPosition(
    (pos) => {
      if (navigationState.isPaused) return;

      const { latitude, longitude, heading, speed } = pos.coords;
      userLocation = {
        latitude,
        longitude,
        accuracy: pos.coords.accuracy,
        heading,
      };

      updateUserMarker(latitude, longitude, heading);
      adjustMapZoomBasedOnSpeed(speed);
      if (heading !== null) setMapRotation(heading);

      updateRealTimeNavigation(
        latitude,
        longitude,
        navigationState.instructions,
        selectedDestination.lat,
        selectedDestination.lon,
        selectedLanguage,
        heading
      );

      if (
        shouldRecalculateRoute(
          latitude,
          longitude,
          navigationState.instructions
        )
      ) {
        notifyDeviation();
      }
    },
    (error) => {
      console.error('[startPositionWatcher] Erro:', error);
      showNotification('Erro ao monitorar posição.', 'error');
    },
    { enableHighAccuracy: true }
  );
}

/**
 * 2.3. notifyDeviation
 * Notifica o usuário sobre um desvio do trajeto e dispara o recálculo da rota.
 */
function notifyDeviation() {
  showNotification('Você se desviou da rota. Recalculando...', 'warning');
  recalculateRoute(
    userLocation.latitude,
    userLocation.longitude,
    selectedDestination.lat,
    selectedDestination.lon
  );
}

/////////////////////////////
// 3. FUNÇÕES COMPLEMENTARES
/////////////////////////////

/**
 * 3.1. stopNavigation
 * Finaliza a navegação, limpando estados e parando o monitoramento.
 */
export function endNavigation() {
  if (window.positionWatcher) {
    navigator.geolocation.clearWatch(window.positionWatcher);
    window.positionWatcher = null;
  }
  navigationState.isActive = false;
  navigationState.isPaused = false;
  console.log('[stopNavigation] Navegação finalizada.');

  // Adicionar evento para notificar o assistente
  const event = new CustomEvent('navigationEnded');
  window.dispatchEvent(event);
}

/**
 * 3.2. pauseNavigation
 * Pausa a navegação.
 */
export function pauseNavigation() {
  if (!navigationState.isActive) {
    console.warn('[pauseNavigation] Navegação não está ativa.');
    return;
  }
  navigationState.isPaused = true;
  console.log('[pauseNavigation] Navegação pausada.');
}

/**
 * 3.3. resumeNavigation
 * Retoma a navegação pausada.
 */
export function resumeNavigation() {
  if (!navigationState.isPaused) {
    console.warn('[resumeNavigation] Navegação não está pausada.');
    return;
  }
  navigationState.isPaused = false;
  console.log('[resumeNavigation] Navegação retomada.');
}
