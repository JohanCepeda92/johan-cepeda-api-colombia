// API DE COLOMBIA
const API_URL = "https://api-colombia.com/api/v1/Country/Colombia";

// ELEMENTOS DEL DOM
const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const countryInfo = document.getElementById("country-info");

// FUNCIÓN PARA CREAR TARJETAS DE INFORMACIÓN
function createInfoCard(title, value) {
    const card = document.createElement("article");
    card.classList.add("info-card");

    const heading = document.createElement("h3");
    heading.textContent = title;

    const paragraph = document.createElement("p");
    paragraph.textContent = value || "Información no disponible";

    card.appendChild(heading);
    card.appendChild(paragraph);

    return card;
}

// FUNCIÓN PARA MOSTRAR LOS DATOS EN EL DOM
function displayCountry(country) {

    // ENCABEZADO DEL PAÍS
    const header = document.createElement("div");
    header.classList.add("country-header");

    const title = document.createElement("h2");
    title.textContent = country.name;

    const description = document.createElement("p");
    description.textContent = country.description || "";

    header.appendChild(title);
    header.appendChild(description);

    // BANDERA DEL PAÍS
    if (country.flags && country.flags.length > 0) {
        const flag = document.createElement("img");

        flag.src = country.flags[0];
        flag.alt = "Bandera de Colombia";
        flag.classList.add("country-flag");

        header.appendChild(flag);
    }

    countryInfo.appendChild(header);

    // TARJETAS DE INFORMACIÓN
    const cardsContainer = document.createElement("div");
    cardsContainer.classList.add("country-cards");

    const information = [
        ["Capital", country.stateCapital],
        ["Población", country.population?.toLocaleString("es-CO")],
        ["Superficie", country.surface ? `${country.surface.toLocaleString("es-CO")} km²` : null],
        ["Región", country.region],
        ["Subregión", country.subRegion],
        ["Idiomas", country.languages?.join(", ")],
        ["Moneda", country.currency],
        ["Código de moneda", country.currencyCode],
        ["Zona horaria", country.timeZone],
        ["Código telefónico", country.phonePrefix],
        ["Dominio de internet", country.internetDomain],
        ["Código ISO", country.isoCode],
        ["Prefijo de radio", country.radioPrefix],
        ["Prefijo aeronáutico", country.aircraftPrefix],
        ["Fronteras", country.borders?.join(", ")]
    ];

    information.forEach(([title, value]) => {
        const card = createInfoCard(title, value);
        cardsContainer.appendChild(card);
    });

    countryInfo.appendChild(cardsContainer);
}

// FUNCIÓN PARA CONSUMIR LA API
async function loadCountryData() {

    try {

        const response = await fetch(API_URL);

        // VERIFICAR RESPUESTA DEL SERVIDOR
        if (!response.ok) {
            throw new Error("Error al consultar la API");
        }

        const data = await response.json();

        // VALIDAR INFORMACIÓN RECIBIDA
        if (!data || typeof data !== "object") {
            throw new Error("Los datos recibidos no son válidos");
        }

        // MOSTRAR INFORMACIÓN EN EL DOM
        displayCountry(data);

        countryInfo.hidden = false;

    } catch (error) {

        console.error("Error:", error);

        errorState.hidden = false;

    } finally {

        // OCULTAR MENSAJE DE CARGA
        loadingState.hidden = true;
    }
}

// EJECUTAR LA FUNCIÓN
loadCountryData();