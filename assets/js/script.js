// ============================================
// CONFIGURACIÓN DE LA API
// ============================================
const NASA_API_BASE = "https://images-api.nasa.gov";
const NASA_API_KEY = "iZZgEX5HgpzS4bZUvMwf9yfHsbzqh4J8VtHuJxHo"; // Opcional

// Almacenamiento de datos
let currentResults = [];
let currentSearchType = 'general';

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  console.log('🚀 Inicializando Mars Explorer...');
  console.log('📅 Fecha:', new Date().toLocaleString());
  
  // Event listeners para formularios
  const generalForm = document.getElementById('generalSearchForm');
  const roverForm = document.getElementById('roverSearchForm');
  
  if (generalForm) {
    generalForm.addEventListener('submit', handleGeneralSearch);
    console.log('✅ Formulario general configurado');
  } else {
    console.error('❌ No se encontró generalSearchForm');
  }
  
  if (roverForm) {
    roverForm.addEventListener('submit', handleRoverSearch);
    console.log('✅ Formulario rover configurado');
  } else {
    console.error('❌ No se encontró roverSearchForm');
  }
  
  // Búsqueda inicial por defecto
  console.log('🔍 Ejecutando búsqueda inicial...');
  performGeneralSearch('mars', 'image', 20);
}

// ============================================
// MANEJO DE TABS
// ============================================
function switchTab(tabName) {
  // Actualizar botones
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Actualizar contenido
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tabName}-tab`).classList.add('active');
  
  currentSearchType = tabName;
}

// ============================================
// BÚSQUEDA GENERAL
// ============================================
function handleGeneralSearch(e) {
  e.preventDefault();
  console.log('🔘 Botón de búsqueda general presionado');
  
  const query = document.getElementById('searchQuery').value.trim();
  const mediaType = document.getElementById('mediaType').value;
  const pageSize = document.getElementById('pageSize').value;
  
  console.log('📝 Valores del formulario:', { query, mediaType, pageSize });
  
  if (!query) {
    console.warn('⚠️ Query vacío');
    showNotification('Por favor ingresa un término de búsqueda', 'warning');
    return;
  }
  
  performGeneralSearch(query, mediaType, pageSize);
}

async function performGeneralSearch(query, mediaType, pageSize) {
  showLoading(true);
  hideResults();
  
  try {
    const url = buildSearchURL(query, mediaType, pageSize);
    console.log('🚀 Iniciando búsqueda...');
    console.log('📡 URL:', url);
    console.log('🔍 Query:', query);
    console.log('📺 Media Type:', mediaType);
    console.log('📊 Page Size:', pageSize);
    
    const response = await fetch(url);
    
    console.log('📥 Respuesta recibida:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Datos parseados correctamente');
    console.log('📦 Total de items:', data.collection?.items?.length || 0);
    console.log('🔢 Total hits:', data.collection?.metadata?.total_hits || 0);
    
    processSearchResults(data, query);
    
  } catch (error) {
    console.error('❌ Error en búsqueda:', error);
    console.error('📋 Detalles del error:', error.message);
    console.error('🔍 Stack:', error.stack);
    showError(`Error al buscar en la NASA API: ${error.message}. Por favor intenta de nuevo o verifica tu conexión.`);
  } finally {
    showLoading(false);
  }
}

// ============================================
// BÚSQUEDA POR ROVER
// ============================================
function handleRoverSearch(e) {
  e.preventDefault();
  console.log('🤖 Botón de búsqueda por rover presionado');
  
  const rover = document.getElementById('roverSelect').value;
  const mediaType = document.getElementById('roverMediaType').value;
  const pageSize = document.getElementById('roverPageSize').value;
  
  console.log('📝 Valores del formulario rover:', { rover, mediaType, pageSize });
  
  if (!rover) {
    console.warn('⚠️ Rover no seleccionado');
    showNotification('Por favor selecciona un rover', 'warning');
    return;
  }
  
  performGeneralSearch(rover, mediaType, pageSize);
}

// ============================================
// CONSTRUCCIÓN DE URL
// ============================================
function buildSearchURL(query, mediaType, pageSize) {
  const params = new URLSearchParams({
    q: query,
    media_type: mediaType,
    page_size: pageSize || 20
  });
  
  // API key es opcional
  // if (NASA_API_KEY) {
  //   params.append('api_key', NASA_API_KEY);
  // }
  
  return `${NASA_API_BASE}/search?${params.toString()}`;
}

// ============================================
// PROCESAMIENTO DE RESULTADOS
// ============================================
function processSearchResults(data, query) {
  if (!data.collection || !data.collection.items || data.collection.items.length === 0) {
    showEmptyState(query);
    return;
  }
  
  currentResults = data.collection.items;
  const totalResults = data.collection.metadata?.total_hits || currentResults.length;
  
  displayResults(currentResults, query, totalResults);
  showStats(totalResults, currentResults);
}

function displayResults(items, query, total) {
  const galleryContainer = document.getElementById('galleryResults');
  const resultsHeader = document.getElementById('resultsHeader');
  const resultsInfo = document.getElementById('resultsInfo');
  
  // Mostrar header
  resultsHeader.style.display = 'block';
  resultsInfo.innerHTML = `
    <p>Mostrando <strong>${items.length}</strong> de <strong>${total}</strong> resultados para "<strong>${query}</strong>"</p>
  `;
  
  // Generar HTML de las tarjetas
  let html = '';
  
  items.forEach((item, index) => {
    const data = item.data[0];
    const links = item.links || [];
    
    // Obtener información del item
    const title = data.title || 'Sin título';
    const description = data.description || 'Sin descripción disponible';
    const dateCreated = data.date_created ? formatDate(data.date_created) : 'Fecha desconocida';
    const mediaType = data.media_type || 'image';
    const center = data.center || 'NASA';
    const nasaId = data.nasa_id || '';
    
    // Obtener URL de la imagen/video preview
    let thumbnailUrl = 'https://via.placeholder.com/400x300?text=No+Preview';
    if (links.length > 0) {
      thumbnailUrl = links[0].href;
    }
    
    html += `
      <div class="col-lg-4 col-md-6 col-sm-12">
        <div class="gallery-card" onclick="openMediaModal(${index})">
          <div class="card-image-container">
            <img src="${thumbnailUrl}" alt="${escapeHtml(title)}" class="card-image" 
                 onerror="this.src='https://via.placeholder.com/400x300?text=Error+Loading+Image'">
            <span class="card-type-badge ${mediaType === 'video' ? 'video-badge' : ''}">
              <i class="fas fa-${mediaType === 'video' ? 'video' : 'image'}"></i> ${mediaType.toUpperCase()}
            </span>
            ${mediaType === 'video' ? '<i class="fas fa-play-circle play-icon"></i>' : ''}
          </div>
          <div class="card-content">
            <h5 class="card-title">${escapeHtml(title)}</h5>
            <p class="card-description">${escapeHtml(truncateText(description, 150))}</p>
            <div class="card-meta">
              <span class="card-date">
                <i class="fas fa-calendar-alt"></i> ${dateCreated}
              </span>
              <span class="card-center">${center}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  galleryContainer.innerHTML = html;
}

// ============================================
// MODAL DE DETALLE
// ============================================
// ============================================
// MODAL DE DETALLE (CORREGIDO)
// ============================================
async function openMediaModal(index) {
  const item = currentResults[index];
  const data = item.data[0];
  const links = item.links || [];
  
  const title = data.title || 'Sin título';
  const description = data.description || 'Sin descripción disponible';
  const dateCreated = data.date_created ? formatDate(data.date_created) : 'Fecha desconocida';
  const mediaType = data.media_type || 'image';
  const nasaId = data.nasa_id || '';
  const center = data.center || 'NASA';
  const photographer = data.photographer || 'N/A';
  const keywords = data.keywords ? data.keywords.join(', ') : 'N/A';
  
  // 1. Mostrar modal cargando primero para dar feedback inmediato
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2">Obteniendo archivo de alta calidad...</p>
    </div>
  `;
  $('#mediaModal').modal('show');

  // URL por defecto (thumbnail)
  let mediaUrl = links.length > 0 ? links[0].href : '';
  let downloadUrl = mediaUrl;

  // 2. LÓGICA CRÍTICA: Obtener el archivo real (.mp4 o .jpg original)
  if (nasaId) {
    try {
      const assetUrl = `${NASA_API_BASE}/asset/${nasaId}`;
      const assetResponse = await fetch(assetUrl);
      
      if (assetResponse.ok) {
        const assetData = await assetResponse.json();
        const items = assetData.collection?.items || [];

        if (items.length > 0) {
          if (mediaType === 'video') {
            // === CORRECCIÓN PARA VIDEOS ===
            // Buscamos específicamente el archivo que termine en .mp4
            // Excluimos 'mobile' si queremos mejor calidad, o lo usamos si no hay otro
            const videoItem = items.find(i => i.href.endsWith('.mp4') && !i.href.includes('mobile')) || 
                              items.find(i => i.href.endsWith('.mp4'));
            
            if (videoItem) {
              // IMPORTANTE: Forzar HTTPS para evitar errores de seguridad
              mediaUrl = videoItem.href.replace('http:', 'https:');
              downloadUrl = mediaUrl;
            }
          } else {
            // === LÓGICA PARA IMÁGENES ===
            const originalItem = items.find(i => i.href.includes('~orig')) || 
                                 items.find(i => i.href.includes('~large')) ||
                                 items[items.length - 1];
            if (originalItem) {
              mediaUrl = originalItem.href.replace('http:', 'https:');
              downloadUrl = mediaUrl;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching asset details:', error);
      // Si falla, se queda con la mediaUrl por defecto
    }
  }
  
  // 3. Generar el HTML final una vez tenemos la URL correcta
  let modalContent = '';
  
  if (mediaType === 'video') {
    // Verificamos si realmente encontramos un mp4
    if (mediaUrl.includes('.mp4')) {
      modalContent = `
        <div class="embed-responsive embed-responsive-16by9">
          <video controls autoplay class="embed-responsive-item">
            <source src="${mediaUrl}" type="video/mp4">
            Tu navegador no soporta el tag de video.
          </video>
        </div>
      `;
    } else {
      modalContent = `<div class="alert alert-warning">No se pudo encontrar un formato de video compatible para reproducir.</div>`;
    }
  } else {
    modalContent = `
      <img src="${mediaUrl}" alt="${escapeHtml(title)}" class="modal-image"
           onerror="this.src='https://via.placeholder.com/800x600?text=Error+Loading+Image'">
    `;
  }
  
  // Agregar la información textual
  modalContent += `
    <div class="modal-info mt-3">
      <h6><i class="fas fa-info-circle"></i> Información del Contenido</h6>
      <div class="description-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <strong>Descripción:</strong>
          <button class="btn btn-sm btn-info" onclick="translateDescription()" id="translateBtn" style="padding: 5px 15px; font-size: 0.85rem;">
            <i class="fas fa-language"></i> Traducir
          </button>
        </div>
        <p id="descriptionText">${escapeHtml(description)}</p>
        <p id="translatedText" style="display: none; color: #00bcd4; border-left: 3px solid #00bcd4; padding-left: 15px; margin-top: 10px;"></p>
      </div>
      <div class="row mt-3">
        <div class="col-md-6"><p><strong>NASA ID:</strong> ${nasaId}</p></div>
        <div class="col-md-6"><p><strong>Fecha:</strong> ${dateCreated}</p></div>
        <div class="col-md-6"><p><strong>Centro:</strong> ${center}</p></div>
        <div class="col-md-6"><p><strong>Tipo:</strong> ${mediaType.toUpperCase()}</p></div>
      </div>
    </div>
  `;
  
  // Actualizar el DOM
  document.getElementById('modalBody').innerHTML = modalContent;
  
  // Actualizar botón de descarga
  const downloadBtn = document.getElementById('downloadBtn');
  downloadBtn.href = downloadUrl;
  downloadBtn.setAttribute('download', ''); // Ayuda a forzar descarga en algunos navegadores
  
  // Nota: El modal ya se mostró al inicio con el spinner, ahora solo se actualiza el contenido
}
// ============================================
// ESTADÍSTICAS
// ============================================
function showStats(total, items) {
  const statsSection = document.getElementById('statsSection');
  const statsContent = document.getElementById('statsContent');
  
  // Contar tipos de media
  const imageCount = items.filter(item => item.data[0].media_type === 'image').length;
  const videoCount = items.filter(item => item.data[0].media_type === 'video').length;
  const audioCount = items.filter(item => item.data[0].media_type === 'audio').length;
  
  statsContent.innerHTML = `
    <div class="col-md-3 col-sm-6">
      <div class="stat-card">
        <i class="fas fa-database stat-icon"></i>
        <span class="stat-number">${total}</span>
        <p class="stat-label">Total Encontrados</p>
      </div>
    </div>
    <div class="col-md-3 col-sm-6">
      <div class="stat-card">
        <i class="fas fa-image stat-icon"></i>
        <span class="stat-number">${imageCount}</span>
        <p class="stat-label">Imágenes</p>
      </div>
    </div>
    <div class="col-md-3 col-sm-6">
      <div class="stat-card">
        <i class="fas fa-video stat-icon"></i>
        <span class="stat-number">${videoCount}</span>
        <p class="stat-label">Videos</p>
      </div>
    </div>
    <div class="col-md-3 col-sm-6">
      <div class="stat-card">
        <i class="fas fa-headphones stat-icon"></i>
        <span class="stat-number">${audioCount}</span>
        <p class="stat-label">Audio</p>
      </div>
    </div>
  `;
  
  statsSection.style.display = 'block';
}

// ============================================
// ESTADOS DE UI
// ============================================
function showLoading(show) {
  const loadingContainer = document.getElementById('loadingContainer');
  loadingContainer.style.display = show ? 'block' : 'none';
}

function hideResults() {
  document.getElementById('resultsHeader').style.display = 'none';
  document.getElementById('statsSection').style.display = 'none';
  document.getElementById('galleryResults').innerHTML = '';
}

function showEmptyState(query) {
  const galleryContainer = document.getElementById('galleryResults');
  
  galleryContainer.innerHTML = `
    <div class="col-12">
      <div class="empty-state">
        <i class="fas fa-space-shuttle"></i>
        <h3>No se encontraron resultados</h3>
        <p>No encontramos ningún contenido para "${escapeHtml(query)}". 
        Intenta con otros términos de búsqueda o selecciona un rover específico.</p>
      </div>
    </div>
  `;
  
  document.getElementById('resultsHeader').style.display = 'block';
  document.getElementById('resultsInfo').innerHTML = `
    <p>0 resultados para "<strong>${escapeHtml(query)}</strong>"</p>
  `;
}

function showError(message) {
  const galleryContainer = document.getElementById('galleryResults');
  
  galleryContainer.innerHTML = `
    <div class="col-12">
      <div class="empty-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error de Conexión</h3>
        <p>${escapeHtml(message)}</p>
        <p style="margin-top: 20px;">
          <button class="btn btn-primary" onclick="location.reload()">
            <i class="fas fa-redo"></i> Reintentar
          </button>
        </p>
      </div>
    </div>
  `;
}

function showNotification(message, type = 'info') {
  // Simple alert por ahora, puedes mejorarlo con toast notifications
  alert(message);
}

// ============================================
// UTILIDADES
// ============================================
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// FUNCIONES GLOBALES (para onclick en HTML)
// ============================================
window.switchTab = switchTab;
window.openMediaModal = openMediaModal;

// ============================================
// TRADUCCIÓN CON GOOGLE TRANSLATE
// ============================================
async function translateDescription() {
  const descriptionText = document.getElementById('descriptionText');
  const translatedText = document.getElementById('translatedText');
  const translateBtn = document.getElementById('translateBtn');
  
  // Si ya está traducido, mostrar/ocultar
  if (translatedText.style.display === 'block') {
    translatedText.style.display = 'none';
    translateBtn.innerHTML = '<i class="fas fa-language"></i> Traducir al Español';
    return;
  }
  
  // Si ya existe la traducción, solo mostrarla
  if (translatedText.textContent) {
    translatedText.style.display = 'block';
    translateBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Traducción';
    return;
  }
  
  // Obtener texto original
  const originalText = descriptionText.textContent;
  
  // Cambiar botón a estado de carga
  translateBtn.disabled = true;
  translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traduciendo...';
  
  try {
    // Usar Google Translate API (servicio gratuito sin API key)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(originalText)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Extraer traducción
    let translation = '';
    if (data && data[0]) {
      data[0].forEach(item => {
        if (item[0]) {
          translation += item[0];
        }
      });
    }
    
    // Mostrar traducción
    translatedText.innerHTML = `<strong>Traducción:</strong> ${translation}`;
    translatedText.style.display = 'block';
    translateBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Traducción';
    translateBtn.disabled = false;
    
  } catch (error) {
    console.error('Error al traducir:', error);
    translatedText.innerHTML = '<strong style="color: #ff6b6b;">Error al traducir.</strong> Intenta de nuevo.';
    translatedText.style.display = 'block';
    translateBtn.innerHTML = '<i class="fas fa-language"></i> Reintentar Traducción';
    translateBtn.disabled = false;
  }
}

window.translateDescription = translateDescription;
