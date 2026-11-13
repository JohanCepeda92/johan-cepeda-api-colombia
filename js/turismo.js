// API DE ATRACTIVOS TURÍSTICOS
const API_URL = "https://api-colombia.com/api/v1/TouristicAttraction";
const DEPARTMENTS_URL = "https://api-colombia.com/api/v1/Department";

// IMAGEN DE RESPALDO
const FALLBACK_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/P%C3%B3rtico_Hacienda_N%C3%A1poles.JPG/800px-P%C3%B3rtico_Hacienda_N%C3%A1poles.JPG";

// ELEMENTOS DEL DOM
const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const attractionsContainer = document.getElementById("attractions-container");
const attractionsCount = document.getElementById("attractions-count");

// FUNCIÓN PARA CREAR TARJETAS TURÍSTICAS
function createAttractionCard(attraction, departmentMap) {

    const card = document.createElement("article");
    card.classList.add("attraction-card");

    // IMAGEN DEL ATRACTIVO
    const image = document.createElement("img");

    const imageUrl = attraction.images?.find(
        url => typeof url === "string" && /^https?:\/\//i.test(url.trim())
    );

    image.src = imageUrl || FALLBACK_IMAGE;
    image.alt = `Imagen de ${attraction.name}`;
    image.classList.add("attraction-image");
    image.loading = "lazy";

    // REEMPLAZAR IMÁGENES QUE NO FUNCIONEN
    image.addEventListener("error", function () {

        if (image.src !== FALLBACK_IMAGE) {
            image.src = FALLBACK_IMAGE;
        } else {
            image.hidden = true;
        }

    });

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