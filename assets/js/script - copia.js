 
Script · JS
Copiar

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
  // Event listeners para formularios
  document.getElementById('generalSearchForm').addEventListener('submit', handleGeneralSearch);
  document.getElementById('roverSearchForm').addEventListener('submit', handleRoverSearch);
  
  // Búsqueda inicial por defecto
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
  
  const query = document.getElementById('searchQuery').value.trim();
  const mediaType = document.getElementById('mediaType').value;
  const pageSize = document.getElementById('pageSize').value;
  
  if (!query) {
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
    console.log('Searching:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Search results:', data);
    
    processSearchResults(data, query);
    
  } catch (error) {
    console.error('Error en búsqueda:', error);
    showError('Error al buscar en la NASA API. Por favor intenta de nuevo.');
  } finally {
    showLoading(false);
  }
}

// ============================================
// BÚSQUEDA POR ROVER
// ============================================
function handleRoverSearch(e) {
  e.preventDefault();
  
  const rover = document.getElementById('roverSelect').value;
  const mediaType = document.getElementById('roverMediaType').value;
  const pageSize = document.getElementById('roverPageSize').value;
  
  if (!rover) {
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
  
  // URL del contenido
  let mediaUrl = links.length > 0 ? links[0].href : '';
  let downloadUrl = mediaUrl;
  
  // Intentar obtener versión de mayor calidad
  if (nasaId) {
    try {
      const assetUrl = `${NASA_API_BASE}/asset/${nasaId}`;
      const assetResponse = await fetch(assetUrl);
      if (assetResponse.ok) {
        const assetData = await assetResponse.json();
        if (assetData.collection && assetData.collection.items && assetData.collection.items.length > 0) {
          // Obtener la URL de mayor calidad (generalmente la última)
          const items = assetData.collection.items;
          // Buscar la versión original o de mayor tamaño
          const originalItem = items.find(i => i.href.includes('~orig')) || 
                              items.find(i => i.href.includes('~large')) ||
                              items[items.length - 1];
          if (originalItem) {
            downloadUrl = originalItem.href;
            if (mediaType === 'image') {
              mediaUrl = originalItem.href;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching asset:', error);
    }
  }
  
  // Actualizar modal
  document.getElementById('modalTitle').textContent = title;
  
  let modalContent = '';
  
  if (mediaType === 'video') {
    modalContent = `
      <video controls class="modal-video">
        <source src="${mediaUrl}" type="video/mp4">
        Tu navegador no soporta el tag de video.
      </video>
    `;
  } else {
    modalContent = `
      <img src="${mediaUrl}" alt="${escapeHtml(title)}" class="modal-image"
           onerror="this.src='https://via.placeholder.com/800x600?text=Error+Loading+Image'">
    `;
  }
  
  modalContent += `
    <div class="modal-info">
      <h6><i class="fas fa-info-circle"></i> Información del Contenido</h6>
      <p><strong>Descripción:</strong> ${escapeHtml(description)}</p>
      <p><strong>NASA ID:</strong> ${nasaId}</p>
      <p><strong>Fecha de creación:</strong> ${dateCreated}</p>
      <p><strong>Centro:</strong> ${center}</p>
      ${photographer !== 'N/A' ? `<p><strong>Fotógrafo:</strong> ${photographer}</p>` : ''}
      <p><strong>Tipo de medio:</strong> ${mediaType.toUpperCase()}</p>
      ${keywords !== 'N/A' ? `<p><strong>Palabras clave:</strong> ${keywords}</p>` : ''}
    </div>
  `;
  
  document.getElementById('modalBody').innerHTML = modalContent;
  
  // Actualizar botón de descarga
  const downloadBtn = document.getElementById('downloadBtn');
  downloadBtn.href = downloadUrl;
  downloadBtn.download = `nasa_${nasaId}.${mediaType === 'video' ? 'mp4' : 'jpg'}`;
  
  // Mostrar modal
  $('#mediaModal').modal('show');
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
