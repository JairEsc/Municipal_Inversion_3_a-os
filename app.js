// let obras_from_js;

// function fetchObrasGeoJSON() {
//     return fetch("Datos/SIPDUS_INHIFE.geojson")
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             obras_from_js = data;
//             return data;
//         })
//         .catch(error => {
//             console.error("Error fetching sipdus_geometrias.geojson:", error);
//             throw error;
//         });
// }

// // Usage example:
// fetchObrasGeoJSON().then(data => { });

let municipio_actual = 84; // Default municipality index

// Initialize the map
const map_h = L.map('map_tablero_inversion_hidalgo', {
    maxBoundsViscosity: 0.8,
    maxZoom:18
});


// Create panes for map layers
map_h.createPane('municipios'); // Normal pane
//map_h.createPane('municipioActual'); // Pane for the selected municipality

// Set pane priorities
map_h.getPane('municipios').style.zIndex = 200;
//map_h.getPane('municipioActual').style.zIndex = 500;

// Initialize layer groups for different geometry types
const grupo_de_markers = L.layerGroup([]).addTo(map_h);
const grupo_de_lineas = L.layerGroup([]).addTo(map_h);
const grupo_de_poligonos = L.layerGroup([]).addTo(map_h);


// Handle map click outside of features
map_h.on('click', (e) => {
    // This click event is guaranteed to fire only if the click was outside of any feature
    municipio_actual = 84; // Reset to default municipality
    console.log("Clicked outside of features, resetting municipio_actual to default:", municipio_actual);
    //console.log("Clicked Latitude, Longitude:", e.latlng.lat, e.latlng.lng);

    const rubrosDisponibles = getUniqueRubrosForMunicipio(municipio_actual);
    updateRubrosDropdown(['Todos los rubros'].concat(rubrosDisponibles));

    updateWorksSummary();
    updateWorksTable(document.getElementById('tipo_dropdown').value);
    updateInvTable();
    //info.update(''); // Clear info panel
    poligonos_map_h.resetStyle();
});

// Array of municipality names
const municipios = ["Acatlán", "Acaxochitlán", "Actopan", "Agua Blanca de Iturbide", "Ajacuba", "Alfajayucan", "Almoloya", "Apan", "Atitalaquia", "Atlapexco", "Atotonilco de Tula", "Atotonilco el Grande", "Calnali", "Cardonal", "Chapantongo", "Chapulhuacán", "Chilcuautla", "Cuautepec de Hinojosa", "El Arenal", "Eloxochitlán", "Emiliano Zapata", "Epazoyucan", "Francisco I. Madero", "Huasca de Ocampo", "Huautla", "Huazalingo", "Huehuetla", "Huejutla de Reyes", "Huichapan", "Ixmiquilpan", "Jacala de Ledezma", "Jaltocán", "Juárez Hidalgo", "La Misión", "Lolotla", "Metepec", "Metztitlán", "Mineral de la Reforma", "Mineral del Chico", "Mineral del Monte", "Mixquiahuala de Juárez", "Molango de Escamilla", "Nicolás Flores", "Nopala de Villagrán", "Omitlán de Juárez", "Pachuca de Soto", "Pacula", "Pisaflores", "Progreso de Obregón", "San Agustín Metzquititlán", "San Agustín Tlaxiaca", "San Bartolo Tutotepec", "San Felipe Orizatlán", "San Salvador", "Santiago de Anaya", "Santiago Tulantepec de Lugo Guerrero", "Singuilucan", "Tasquillo", "Tecozautla", "Tenango de Doria", "Tepeapulco", "Tepehuacán de Guerrero", "Tepeji del Río de Ocampo", "Tepetitlán", "Tetepango", "Tezontepec de Aldama", "Tianguistengo", "Tizayuca", "Tlahuelilpan", "Tlahuiltepa", "Tlanalapa", "Tlanchinol", "Tlaxcoapan", "Tolcayuca", "Tula de Allende", "Tulancingo de Bravo", "Villa de Tezontepec", "Xochiatipan", "Xochicoatlán", "Yahualica", "Zacualtipán de Ángeles", "Zapotlán de Juárez", "Zempoala", "Zimapán", "Cobertura Estatal"];

/**
 * Calculates a gradient color between two given colors based on a percentage.
 * @param {string} startColor - The starting hex color (e.g., '#FF0000').
 * @param {string} endColor - The ending hex color (e.g., '#00FF00').
 * @param {number} percent - The percentage (0 to 1) to interpolate between the colors.
 * @returns {string} The interpolated hex color.
 */
function getGradientColor(startColor, endColor, percent) {
    // Strip the leading # if it's there
    startColor = startColor.replace(/^\s*#|\s*$/g, '');
    endColor = endColor.replace(/^\s*#|\s*$/g, '');

    // Convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if (startColor.length === 3) {
        startColor = startColor.replace(/(.)/g, '$1$1');
    }
    if (endColor.length === 3) {
        endColor = endColor.replace(/(.)/g, '$1$1');
    }

    // Get colors
    const startRed = parseInt(startColor.substring(0, 2), 16);
    const startGreen = parseInt(startColor.substring(2, 4), 16);
    const startBlue = parseInt(startColor.substring(4, 6), 16);

    const endRed = parseInt(endColor.substring(0, 2), 16);
    const endGreen = parseInt(endColor.substring(2, 4), 16);
    const endBlue = parseInt(endColor.substring(4, 6), 16);

    // Calculate new color components
    let diffRed = endRed - startRed;
    let diffGreen = endGreen - startGreen;
    let diffBlue = endBlue - startBlue;

    diffRed = Math.round((diffRed * percent) + startRed);
    diffGreen = Math.round((diffGreen * percent) + startGreen);
    diffBlue = Math.round((diffBlue * percent) + startBlue);

    let diffRedStr = diffRed.toString(16);
    let diffGreenStr = diffGreen.toString(16);
    let diffBlueStr = diffBlue.toString(16);

    // Ensure 2 digits per color component
    if (diffRedStr.length === 1) diffRedStr = '0' + diffRedStr;
    if (diffGreenStr.length === 1) diffGreenStr = '0' + diffGreenStr;
    if (diffBlueStr.length === 1) diffBlueStr = '0' + diffBlueStr;

    return '#' + diffRedStr + diffGreenStr + diffBlueStr;
}

// Add OpenStreetMap tile layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 4,
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: 'png'
}).addTo(map_h);

/**
 * Gets the color for a municipality based on its rank in indirect per capita investment.
 * @param {number} d - The normalized rank (0 to 1).
 * @returns {string} The hex color.
 */
function getColor_h(d) {
    return getGradientColor('#ead57c', '#9b071c', d);
}

/**
 * Defines the style for municipality polygons.
 * @param {object} feature - The GeoJSON feature.
 * @returns {object} The style object.
 */
function style_ent_h(feature) {
    // Get all indirect per capita investment values for ranking
    const values = hidalgo.features.map(f => parseFloat(f.properties.inv_per_cap_indir || 0)); // Ensure numerical value
    const currentValue = parseFloat(feature.properties.inv_per_cap_indir || 0);

    // Sort values and get the rank (position)
    const sorted = [...new Set(values)].sort((a, b) => a - b); // Use Set to get unique values before sorting
    const rank = sorted.indexOf(currentValue);
    const percent = sorted.length > 1 ? rank / (sorted.length - 1) : 0;

    const isSelected = feature.properties.NOM_MUN === municipios[municipio_actual];

    return {
        fillColor: getColor_h(percent),
        opacity: 1,
        color: isSelected ? "#E8E6E6" : 'white',
        dashArray: isSelected ? '0' : '5',
        fillOpacity: 0.4,
        pane: isSelected ? 'municipioActual' : 'municipios'
    };
}

// GeoJSON layer for municipalities
const poligonos_map_h = L.geoJson(hidalgo, {
    style: style_ent_h,
    onEachFeature: onEachFeature_h,
}).addTo(map_h);

// Fit map bounds to the municipality layer
map_h.fitBounds(poligonos_map_h.getBounds());

/**
 * Highlights a feature on mouseover.
 * @param {object} e - The event object.
 */
function highlightFeature(e) {
    const layer = e.target;
    layer.setStyle({
        weight: 8,
        color: '#ffffffff',
        fillOpacity: 0.5
    });
}

/**
 * Updates the dropdown with available 'rubros' (categories) for the selected municipality.
 * @param {string[]} rubros - An array of rubro names.
 */
function updateRubrosDropdown(rubros) {
    const tipoDropdown = document.getElementById('tipo_dropdown');
    // Clear existing options using a more performant method
    while (tipoDropdown.firstChild) {
        tipoDropdown.removeChild(tipoDropdown.firstChild);
    }
    rubros.forEach((rubro) => {
        let option = document.createElement('option');
        option.value = rubro;
        option.textContent = rubro;
        tipoDropdown.appendChild(option);
    });
}

/**
 * Handles click events on municipality features.
 * @param {object} e - The event object.
 */
function click_on_feature(e) {
    const layer = e.target;
    L.DomEvent.stopPropagation(e); // Stop propagation to prevent map click event
    if(municipio_actual === municipios.indexOf(e.target.feature.properties.NOM_MUN)){
        return
    }
    municipio_actual = municipios.indexOf(e.target.feature.properties.NOM_MUN);

    const rubrosDisponibles = getUniqueRubrosForMunicipio(municipio_actual);
    updateRubrosDropdown(['Todos los rubros'].concat(rubrosDisponibles));

    updateWorksSummary();
    updateWorksTable(document.getElementById('tipo_dropdown').value);
    updateInvTable();
    poligonos_map_h.resetStyle(); // Reset style for all polygons
    //console.log(layer.feature.properties)
    info.update(layer.feature.properties); // Update info panel with selected municipality's data
}

/**
 * Resets the highlight style on mouseout.
 * @param {object} e - The event object.
 */
function resetHighlight_h(e) {
    poligonos_map_h.resetStyle(e.target); // Reset style for the specific layer
    //info.update(); // Reset info panel to default
}

/**
 * Binds popups and event listeners to each GeoJSON feature.
 * @param {object} feature - The GeoJSON feature.
 * @param {object} layer - The Leaflet layer for the feature.
 */
function onEachFeature_h(feature, layer) {
    // If the feature is the currently selected municipality, bring it to front
    if (feature.properties.NOM_MUN === municipios[municipio_actual]) {
        //layer.bringToFront();
    }

    // Get and format the investment value
    const rawInvestment = parseFloat(feature.properties.inv_per_cap_indir || 0);
    const formattedInvestment = new Intl.NumberFormat('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(rawInvestment);

    layer.bindTooltip(
        'Municipio: ' + feature.properties.NOM_MUN + '<br>' +
        'Inversión per cápita municipal: $ ' + formattedInvestment
    );

    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight_h,
        click: click_on_feature
    });
}

// Info control for displaying municipality data
const info = L.control({ position: 'topright' }); // Changed position for better visibility

info.onAdd = function (map_h) {
    this._div = L.DomUtil.create('div', 'info_tablero_seg');
    this.update();
    return this._div;
};

info.update = function (props) {
    //console.log(props.NOM_MUN)
    this._div.innerHTML = `<h1 style="font-size:large;display:flex;justify-content:center">${props ? (props.NOM_MUN + '<h4>' + 'Municipio Seleccionado' + '</h4>') : ('Selecciona un Municipio' + '<h4>' + 'Se muestra información de Obras de Cobertura Estatal' + '</h4>')}</h1>`;
};

info.addTo(map_h);

// Search control
const controlSearch_h = new L.Control.Search({
    position: 'topleft',
    layer: poligonos_map_h,
    initial: false,
    zoom: 12,
    marker: false,
    propertyName: 'NOM_MUN',
    firstTipSubmit:true,
    moveToLocation: function(latlng, title, map) {
        map.setView(latlng, 12);
        
        poligonos_map_h.eachLayer(function(layer) {//Lamentablemente es un ciclo de 84 
            if (layer.feature && layer.feature.properties.NOM_MUN === title) {
                layer.fireEvent('click'); 
            }
        });
    }
});

map_h.addControl(controlSearch_h);

// Legend control
const legend_h = L.control({ position: 'bottomright' });

legend_h.onAdd = function (map) {
    const div = L.DomUtil.create("div", "info_tablero_seg legend legend_seguridad");
    const colors = ["#ead57c", "#daac69", "#c98356", "#bb5942", "#ab302f", "#9b071c"]; // Green → Red

    // Create the gradient background
    const gradient = "linear-gradient(to right, " + colors.join(", ") + ")";

    // Add title and gradient
    div.innerHTML =
        '<strong>' + 'Inversión per cápita municipal' + '</strong><br>' +
        '<div style="height: 10px; background: ' + gradient + ';"></div>';

    // Values can be added dynamically here if needed
    // Example: div.innerHTML += '<div><span style="float: left;">Min</span><span style="float: right;">Max</span></div>';

    return div;
};

legend_h.addTo(map_h);

// Watermark control
L.Control.Watermark = L.Control.extend({
    onAdd: function (map_h) {
        const img = L.DomUtil.create('img');
        img.src = 'Datos/fondo_transp_negritas.png';
        img.style.width = '20vw';
        img.style.marginBottom = '0vh';
        return img;
    },
    onRemove: function (map) {
        // Nothing to do here
    }
});

L.control.watermark = function (opts) {
    return new L.Control.Watermark(opts);
};

L.control.watermark({ position: 'bottomleft' }).addTo(map_h);