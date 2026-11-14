// API DE ATRACTIVOS TURÍSTICOS
const API_URL = "https://api-colombia.com/api/v1/TouristicAttraction";
const DEPARTMENTS_URL = "https://api-colombia.com/api/v1/Department";

// IMAGEN DE RESPALDO
const FALLBACK_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/P%C3%B3rtico_Hacienda_N%C3%A1poles.JPG/800px-P%C3%B3rtico_Hacienda_N%C3%A1poles.JPG";

// IMÁGENES ALTERNATIVAS PARA LOS DESTINOS TURÍSTICOS
const CUSTOM_IMAGES = {

    "hacienda napoles": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Parque_Tem%C3%A1tico_Hacienda_N%C3%A1poles_-_Puerto_Triunfo_Antioquia.jpg/960px-Parque_Tem%C3%A1tico_Hacienda_N%C3%A1poles_-_Puerto_Triunfo_Antioquia.jpg",

    "la ventana del mundo": "https://upload.wikimedia.org/wikipedia/commons/2/2f/La_ventana_al_mundo.jpg",

    "volcan del totumo": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Volc%C3%A1n_del_Totumo.jpg/1280px-Volc%C3%A1n_del_Totumo.jpg",

    "nevado del cocuy": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/59/Nevado_del_Cocuy.jpg/1280px-Nevado_del_Cocuy.jpg",

    "nevado del ruiz": "https://upload.wikimedia.org/wikipedia/commons/9/91/Nevado_del_Ruiz_en_Colombia.jpg",

    "parque nacional natural purace": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Parque_Nacional_Natural_Purac%C3%A9.jpg/1280px-Parque_Nacional_Natural_Purac%C3%A9.jpg",

    "centro historico de popayan": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Centro_Historico_Popayan.JPG/1280px-Centro_Historico_Popayan.JPG",

    "villa de leyva": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Villa_de_leyva_plaza.JPG/1280px-Villa_de_leyva_plaza.JPG",

    "parque jaime duque": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/70/Jaime_Duque_Park.jpg/960px-Jaime_Duque_Park.jpg",

    "cerro azul": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7e/Serrania_de_la_Lindosa_rock_paintings.jpg/960px-Serrania_de_la_Lindosa_rock_paintings.jpg",

    "jerico": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/88/Jerico-antioquia.jpg/1280px-Jerico-antioquia.jpg",

    "cano cristales": "https://upload.wikimedia.org/wikipedia/commons/d/de/Ca%C3%B1o_Cristales%2C_Colombia.jpg"

};

// ELEMENTOS DEL DOM
const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const attractionsContainer = document.getElementById("attractions-container");
const attractionsCount = document.getElementById("attractions-count");

// Activar la animación de entrada después del primer pintado.
const hero = document.querySelector(".hero");
if (hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    requestAnimationFrame(() => {
        hero.classList.add("is-entered");
    });
}

// FUNCIÓN PARA CREAR TARJETAS TURÍSTICAS
function createAttractionCard(attraction, departmentMap) {

    const card = document.createElement("article");
    card.classList.add("attraction-card");

   // IMAGEN DEL ATRACTIVO
const image = document.createElement("img");

// NORMALIZAR NOMBRE DEL ATRACTIVO
const attractionKey = (attraction.name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// OBTENER IMÁGENES DE LA API
const apiImages = Array.isArray(attraction.images)
    ? attraction.images
        .filter(url => typeof url === "string")
        .map(url => url.trim())
        .filter(url => /^https?:\/\//i.test(url))
    : [];

// PRIORIZAR IMAGEN PERSONALIZADA
const customImage = CUSTOM_IMAGES[attractionKey];

const imageUrls = customImage
    ? [customImage, ...apiImages.filter(url => url !== customImage)]
    : apiImages;

image.alt = `Imagen de ${attraction.name}`;
image.classList.add("attraction-image");
image.loading = "lazy";

let imageIndex = 0;
let fallbackUsed = false;

// CONTROLAR IMÁGENES QUE NO CARGAN
image.addEventListener("error", function () {

    // INTENTAR CON OTRA IMAGEN
    if (imageIndex < imageUrls.length) {

        image.src = imageUrls[imageIndex];
        imageIndex++;

    } else if (!fallbackUsed) {

        // UTILIZAR IMAGEN DE RESPALDO
        fallbackUsed = true;
        image.src = FALLBACK_IMAGE;

    } else {

        image.hidden = true;

    }

});

// CARGAR PRIMERA IMAGEN
if (imageUrls.length > 0) {

    image.src = imageUrls[imageIndex];
    imageIndex++;

} else {

    fallbackUsed = true;
    image.src = FALLBACK_IMAGE;

}

card.appendChild(image);

    // CONTENIDO DE LA TARJETA
    const content = document.createElement("div");
    content.classList.add("attraction-content");

    // NOMBRE
    const title = document.createElement("h3");
    title.textContent = attraction.name || "Destino turístico";

    // CIUDAD
    const city = attraction.city?.name || "Ciudad no disponible";

    // DEPARTAMENTO
    const departmentId = attraction.city?.departmentId;

    const department = departmentMap.get(String(departmentId))
        || "Departamento no disponible";

    const location = document.createElement("p");
    location.classList.add("attraction-location");
    location.textContent = `${city} - ${department}`;

    // DESCRIPCIÓN
    const description = document.createElement("p");
    description.classList.add("attraction-description");
    description.textContent = attraction.description
        || "No hay descripción disponible.";

    // AGREGAR ELEMENTOS
    content.appendChild(title);
    content.appendChild(location);
    content.appendChild(description);

    card.appendChild(content);

    return card;
}

// FUNCIÓN PARA CONSUMIR LAS API
async function loadAttractions() {

    try {

        // CONSULTAR ATRACTIVOS TURÍSTICOS
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Error al consultar los atractivos turísticos.");
        }

        const attractions = await response.json();

        if (!Array.isArray(attractions) || attractions.length === 0) {
            throw new Error("No se encontraron atractivos turísticos.");
        }

        // CONSULTAR DEPARTAMENTOS
        let departments = [];

        try {

            const departmentResponse = await fetch(DEPARTMENTS_URL);

            if (departmentResponse.ok) {
                departments = await departmentResponse.json();
            }

        } catch (error) {

            console.warn("No fue posible cargar los departamentos.", error);

        }

        // CREAR MAPA DE DEPARTAMENTOS
        const departmentMap = new Map(
            departments.map(department => [
                String(department.id),
                department.name
            ])
        );

        // SELECCIONAR LOS PRIMEROS 20 ATRACTIVOS
        const selectedAttractions = attractions.slice(0, 20);

        // MOSTRAR CANTIDAD DE ATRACTIVOS
        attractionsCount.textContent =
            `Mostrando ${selectedAttractions.length} atractivos turísticos de Colombia.`;

        // LIMPIAR CONTENEDOR
        attractionsContainer.replaceChildren();

        // GENERAR TARJETAS DINÁMICAMENTE
        selectedAttractions.forEach(attraction => {

            const card = createAttractionCard(attraction, departmentMap);

            attractionsContainer.appendChild(card);

        });

    } catch (error) {

        console.error("Error:", error);

        errorState.hidden = false;

    } finally {

        // OCULTAR MENSAJE DE CARGA
        loadingState.hidden = true;

    }
}

// EJECUTAR LA FUNCIÓN
loadAttractions();
