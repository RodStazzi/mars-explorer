#  MARS EXPLORER - NASA Image Gallery

Una aplicación web moderna y profesional para explorar imágenes y videos de Marte usando la NASA Images API.

##  Descripción

Esta aplicación permite explorar el vasto archivo de imágenes y videos de Marte de la NASA, incluyendo contenido de las misiones:
- **Perseverance**
- **Curiosity**
- **Opportunity**
- **Spirit**
- **InSight**
- **Viking**

##  Características Principales

###  Diseño 
- **Interfaz futurista** con efectos de estrellas animadas
- **Colores tecnológicos** que transmiten confianza y profesionalismo
- **Animaciones fluidas** y transiciones suaves
- **Diseño responsive** optimizado para todos los dispositivos
- **Efectos hover** impactantes en tarjetas
- **Loading animations** con animación de planeta orbital

###  Funcionalidades
- **Búsqueda general**: Buscar cualquier término relacionado con Marte
- **Búsqueda por rover**: Filtrar contenido por misión específica
- **Filtros por tipo**: Imágenes, videos o ambos
- **Vista de detalle**: Modal con información completa y descarga
- **Estadísticas**: Contador de resultados por tipo de medio
- **Imágenes de alta calidad**: Obtención automática de versiones HD

##  Endpoints de la NASA Images API Utilizados

### 1. Búsqueda Principal
```
GET https://images-api.nasa.gov/search
```

**Parámetros:**
- `q`: Término de búsqueda (ej: "mars", "curiosity", "perseverance")
- `media_type`: Tipo de contenido ("image", "video", "audio" o combinados con comas)
- `page_size`: Cantidad de resultados (1-100)
- `page`: Número de página para paginación
- `year_start`: Año inicial para filtrar por fecha
- `year_end`: Año final para filtrar por fecha
- `api_key`: (Opcional) Tu API key de NASA

**Ejemplo:**
```
https://images-api.nasa.gov/search?q=mars&media_type=image,video&page_size=20
```

**Respuesta:**
```json
{
  "collection": {
    "version": "1.0",
    "href": "...",
    "items": [
      {
        "href": "...",
        "data": [
          {
            "center": "JSC",
            "title": "Mars Surface Image",
            "nasa_id": "PIA12345",
            "date_created": "2023-01-15T00:00:00Z",
            "keywords": ["Mars", "Rover", "Surface"],
            "media_type": "image",
            "description": "Descripción de la imagen...",
            "photographer": "NASA/JPL-Caltech"
          }
        ],
        "links": [
          {
            "href": "https://..../image.jpg",
            "rel": "preview",
            "render": "image"
          }
        ]
      }
    ],
    "metadata": {
      "total_hits": 1234
    }
  }
}
```

### 2. Obtener Assets (Archivos de Alta Calidad)
```
GET https://images-api.nasa.gov/asset/{nasa_id}
```

Este endpoint devuelve todas las versiones disponibles de un archivo (thumbnails, previews, originales).

**Ejemplo:**
```
https://images-api.nasa.gov/asset/PIA12345
```

**Respuesta:**
```json
{
  "collection": {
    "items": [
      {
        "href": "https://.../image~thumb.jpg"
      },
      {
        "href": "https://.../image~medium.jpg"
      },
      {
        "href": "https://.../image~large.jpg"
      },
      {
        "href": "https://.../image~orig.jpg"
      }
    ]
  }
}
```

**Tamaños disponibles:**
- `~thumb`: Miniatura (200px aprox)
- `~small`: Pequeño (320px aprox)
- `~medium`: Mediano (640px aprox)
- `~large`: Grande (1024px aprox)
- `~orig`: Original (resolución completa)

### 3. Obtener Metadatos Extendidos
```
GET https://images-api.nasa.gov/metadata/{nasa_id}
```

Devuelve metadatos técnicos adicionales en formato JSON.

### 4. Obtener Subtítulos (para videos)
```
GET https://images-api.nasa.gov/captions/{nasa_id}
```

Devuelve subtítulos en formato SRT si están disponibles.

## 📊 Estructura de Datos Importante

### Campos principales en `data[0]`:
- `nasa_id`: Identificador único
- `title`: Título del contenido
- `description`: Descripción detallada
- `date_created`: Fecha de creación (ISO 8601)
- `media_type`: "image", "video" o "audio"
- `keywords`: Array de palabras clave
- `center`: Centro de la NASA (JPL, JSC, etc)
- `photographer`: Autor/fotógrafo
- `location`: Ubicación de captura
- `description_508`: Descripción accesible

### Campos en `links[]`:
- `href`: URL del archivo
- `rel`: Relación ("preview", "captions")
- `render`: Tipo de renderizado ("image", "video")

##  Mejoras Implementadas

### Diseño Visual
1. **Paleta de colores tecnológica**
   - Azul principal: #0a4d8c (confianza, tecnología)
   - Cyan accent: #00bcd4 (modernidad)
   - Naranja: #ff6f00 (energía de Marte)

2. **Tipografías**
   - **Orbitron**: Para títulos y elementos tecnológicos
   - **Exo 2**: Para contenido y legibilidad

3. **Efectos especiales**
   - Fondo estrellado animado
   - Efecto glow en elementos clave
   - Animaciones de carga orbital
   - Transiciones suaves en hover

### Funcionalidad
1. **Sistema de tabs** para diferentes tipos de búsqueda
2. **Carga automática** de búsqueda inicial
3. **Obtención de imágenes HD** automática
4. **Vista modal** con información completa
5. **Descarga directa** de contenido
6. **Estadísticas en tiempo real**

## 🚀 Cómo Usar

### Instalación
1. Descarga todos los archivos
2. Crea la siguiente estructura:
```
proyecto/
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
```

### Uso
1. Abre `index.html` en tu navegador
2. La aplicación cargará automáticamente imágenes de Marte
3. Usa el **Tab "Búsqueda General"** para buscar cualquier término
4. Usa el **Tab "Por Rover"** para filtrar por misión específica
5. Haz clic en cualquier imagen para ver detalles completos
6. Descarga imágenes en alta calidad con el botón de descarga

##  API Key (Opcional)

La API de NASA Images **NO requiere** API key para funcionar, pero puedes agregar una si lo deseas:

1. Obtén tu key en: https://api.nasa.gov/
2. Agrega el parámetro en las URLs:
```javascript
const params = new URLSearchParams({
  q: query,
  media_type: mediaType,
  api_key: 'TU_API_KEY_AQUI'
});
```

##  Responsive Design

La aplicación está completamente optimizada para:
-  Móviles (320px - 767px)
-  Tablets (768px - 1023px)
-  Desktop (1024px+)
-  Large Screens (1920px+)

##  Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Animaciones y efectos avanzados
- **JavaScript ES6+**: Funcionalidad moderna
- **Bootstrap 4.6**: Grid system responsive
- **Font Awesome 6**: Iconografía
- **Google Fonts**: Tipografías Orbitron y Exo 2
- **NASA Images API**: Fuente de datos

##  Diferencias con la Versión Anterior

### API
-  Antigua: `https://api.nasa.gov/mars-photos/api/v1/rovers/` (DEPRECATED)
-  Nueva: `https://images-api.nasa.gov/`

### Ventajas de la nueva API
1. **No requiere API key** (aunque la acepta)
2. **Más contenido**: Imágenes, videos y audio
3. **Mejor metadatos**: Descripciones, palabras clave, fotógrafos
4. **Múltiples resoluciones**: Desde thumbnails hasta originales
5. **Búsqueda flexible**: Por cualquier término, no solo por sol/fecha
6. **Más misiones**: No solo rovers, todo el archivo de NASA

### Mejoras visuales
1. **Diseño completamente renovado** con estética futurista
2. **Colores profesionales** que transmiten confianza
3. **Animaciones fluidas** y efectos WOW
4. **Mejor UX** con tabs y filtros intuitivos
5. **Cards modernas** con hover effects
6. **Modal mejorado** con información completa

##  Notas Técnicas

### Manejo de Errores
La aplicación incluye manejo robusto de errores:
- Imágenes que no cargan muestran placeholder
- Errores de API muestran mensaje amigable
- Opción de reintentar en caso de fallo

### Performance
- Lazy loading de imágenes
- Límite de resultados configurable
- Búsqueda asíncrona sin bloquear UI

### Accesibilidad
- Alt text en todas las imágenes
- Contraste adecuado de colores
- Navegación por teclado
- ARIA labels donde corresponde

## 🐛 Troubleshooting

**Problema**: Las imágenes no cargan
- Verifica conexión a internet
- Revisa la consola del navegador (F12)
- Intenta con otro término de búsqueda

**Problema**: No aparecen resultados
- Verifica que el término de búsqueda sea válido
- Algunos rovers tienen menos contenido
- Intenta ampliar el rango de búsqueda

##  Licencia

Este proyecto utiliza datos públicos de la NASA.
Código libre para uso educativo y personal.

##  Autor

Desarrollado por **RO-STA**
- Website: https://rosta.netlify.app/

##  Créditos

- **NASA**: Por proveer la Images API y el contenido
- **JPL/Caltech**: Operadores de las misiones rover
- **Bootstrap**: Framework CSS
- **Font Awesome**: Iconos
- **Google Fonts**: Tipografías

---

**¡Disfruta explorando Marte! **
