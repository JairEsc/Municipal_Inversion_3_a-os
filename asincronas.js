// Función para actualizar el contenido de la tabla basado en municipio_actual

var greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
function generar_marker_dado_color(color_en_hex) {
  return L.divIcon({
    //iconSize: "auto",
    iconSize: [12, 12],
    iconAnchor: [9, 12],
    style: "",
    html: `<svg style="margin-left: -6px;margin-top: -6px;" width="28" height="41" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><linearGradient id="b"><stop stop-color="#2e6c97" offset="0"/><stop stop-color="#3883b7" offset="1"/></linearGradient><linearGradient id="a"><stop stop-color="#126fc6" offset="0"/><stop stop-color="#4c9cd1" offset="1"/></linearGradient><linearGradient y2="-0.004651" x2="0.498125" y1="0.971494" x1="0.498125" id="c" xlink:href="#a"/><linearGradient y2="-0.004651" x2="0.415917" y1="0.490437" x1="0.415917" id="d" xlink:href="#b"/></defs><g><title>Layer 1</title><rect id="svg_1" fill="#fff" width="12.625" height="14.5" x="411.279" y="508.575"/><path stroke=${color_en_hex} id="svg_2" stroke-linecap="round" stroke-width="1.1" fill=${color_en_hex} d="m14.095833,1.55c-6.846875,0 -12.545833,5.691 -12.545833,11.866c0,2.778 1.629167,6.308 2.80625,8.746l9.69375,17.872l9.647916,-17.872c1.177083,-2.438 2.852083,-5.791 2.852083,-8.746c0,-6.175 -5.607291,-11.866 -12.454166,-11.866zm0,7.155c2.691667,0.017 4.873958,2.122 4.873958,4.71s-2.182292,4.663 -4.873958,4.679c-2.691667,-0.017 -4.873958,-2.09 -4.873958,-4.679c0,-2.588 2.182292,-4.693 4.873958,-4.71z"/><path id="svg_3" fill="none" stroke-opacity="0.122" stroke-linecap="round" stroke-width="1.1" stroke="#fff" d="m347.488007,453.719c-5.944,0 -10.938,5.219 -10.938,10.75c0,2.359 1.443,5.832 2.563,8.25l0.031,0.031l8.313,15.969l8.25,-15.969l0.031,-0.031c1.135,-2.448 2.625,-5.706 2.625,-8.25c0,-5.538 -4.931,-10.75 -10.875,-10.75zm0,4.969c3.168,0.021 5.781,2.601 5.781,5.781c0,3.18 -2.613,5.761 -5.781,5.781c-3.168,-0.02 -5.75,-2.61 -5.75,-5.781c0,-3.172 2.582,-5.761 5.75,-5.781z"/></g></svg>`,
  });
}
// --- Helper Functions (Define these outside updateWorksTable if they are reused) ---

// Function to generate random numbers with normal distribution
function normalRandom(mean = 0, stdDev = 0.0001) {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); // Exclude 0 to avoid log(0)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stdDev + mean;
}

// Global or accessible variable for unique geometry counts (assuming it's filled elsewhere or within this function)
// It's better to build this inside updateWorksTable if it depends on the filtered data.
let conteo_geometrias_unicas = {}; // Initialize here if it's meant to be persistent, otherwise inside updateWorksTable

// Function to find a marker by its popup content and open it, then center map
function buscarYAbrirPopup(feat, textoBuscado) {
  grupo_de_poligonos.clearLayers();
  let encontrado = false;

  // Buscar en el grupo de marcadores
  grupo_de_markers.eachLayer(function (marker) {
    if (encontrado) return;
    if (marker.getPopup()) {
      const contenidoPopup = marker.getPopup().getContent();
      if (
        typeof contenidoPopup === "string" &&
        contenidoPopup.toLowerCase().includes(textoBuscado.toLowerCase())
      ) {
        marker.openPopup();
        map_h.setView(marker.getLatLng(), 13);
        encontrado = true;
      }
    }
  });

  // Buscar en el grupo de líneas
  if (!encontrado) {
    grupo_de_lineas.eachLayer(function (line) {
      if (encontrado) return;
      if (line.getPopup()) {
        const contenidoPopup = line.getPopup().getContent();
        if (
          typeof contenidoPopup === "string" &&
          contenidoPopup.toLowerCase().includes(textoBuscado.toLowerCase())
        ) {
          line.openPopup();
          let center;
          if (typeof line.getBounds === "function") {
            center = line.getBounds().getCenter();
          } else if (line._layers) {
            let bounds = null;
            for (let key in line._layers) {
              if (line._layers[key].getBounds) {
                bounds = line._layers[key].getBounds();
                break;
              }
            }
            center = bounds ? bounds.getCenter() : map_h.getCenter();
          } else {
            center = map_h.getCenter();
          }
          map_h.setView(center, 14);
          encontrado = true;
        }
      }
    });
  }

  // Si no se encontró, crear el polígono y ponerlo al frente
  if (
    !encontrado &&
    feat &&
    feat.geometry &&
    (feat.geometry.type === "Polygon" || feat.geometry.type === "MultiPolygon")
  ) {
    // Eliminar polígonos previos resaltados si es necesario (opcional)
    // grupo_de_poligonos.clearLayers();

    // Para Polygon y MultiPolygon
    const coordsArray =
      feat.geometry.type === "Polygon"
        ? [feat.geometry.coordinates]
        : feat.geometry.coordinates;

    coordsArray.forEach((pol) => {
      const polygonCoords = pol[0].map((coord) => L.latLng(coord[1], coord[0]));
      const poly = L.polygon(polygonCoords, {
        color: "blue",
        weight: 3,
        fillOpacity: 0.2,
        zIndex: 1000,
      }).bindPopup(textoBuscado);
      grupo_de_poligonos.addLayer(poly);
      poly.openPopup();
      map_h.fitBounds(poly.getBounds(), { maxZoom: 15 });
      poly.bringToFront();
    });
  }
}
function resaltarEnTabla(){
  console.log("Se está resaltando")
  const obras_texts = document.getElementsByClassName('obra-text');
  let matchedRow = null;
  for (let i = 0; i < obras_texts.length; i++) {
    if (obras_texts[i].textContent === this._popup._content) {
      matchedRow = obras_texts[i].closest('tr');
      break;
    }
  }
  if (matchedRow) {
    
    matchedRow.classList.add('highlighted-row');
    console.log("Matched table row:", matchedRow);
    matchedRow.scrollIntoView(
      {block: "center", behavior: "smooth"}
    );
    setTimeout(() => {matchedRow.classList.remove('highlighted-row')},3000)

  }  
}
const geometryHandlers = {
  Point: function (feat, color_custom) {
    const originalLat = feat.geometry.coordinates[1];
    const originalLng = feat.geometry.coordinates[0];
    const key = `${originalLat},${originalLng}`;

    let finalLat = originalLat;
    let finalLng = originalLng;

    // Apply noise if geometry repeats
    if (conteo_geometrias_unicas[key] > 1) {
      // Removed `conteo_geometrias_unicas &&` as it's an object initialized
      let stdDev;
      if (feat.properties.Rubro === "Espacios Educativos") {
        //Los de escuelas está bien que estén más juntos
        stdDev = 0.0001;
      } else {
        stdDev = 0.001;
      }
      // stdDev is defined here because normalRandom is outside.
      finalLat += normalRandom(0, stdDev);
      finalLng += normalRandom(0, stdDev);
    }
    const markerSingle=L.marker(L.latLng(finalLat, finalLng), {
        icon: generar_marker_dado_color(color_custom),
      }).bindPopup(feat.properties["Obra"])
      markerSingle.addEventListener("click", resaltarEnTabla)
      grupo_de_markers.addLayer(
        markerSingle
      );
  },
  MultiPoint: function (feat, color_custom) {
    feat.geometry.coordinates.forEach((feat_c) => {
      const originalLat = feat_c[1];
      const originalLng = feat_c[0];
      const key = `${originalLat},${originalLng}`;

      let finalLat = originalLat;
      let finalLng = originalLng;

      if (conteo_geometrias_unicas[key] > 1) {
        const stdDev = 0.001;
        finalLat += normalRandom(0, stdDev);
        finalLng += normalRandom(0, stdDev);
      }

      grupo_de_markers.addLayer(
        L.marker(L.latLng(finalLat, finalLng), {
          icon: generar_marker_dado_color(color_custom),
        }).bindPopup(feat.properties["Obra"]).on("click", resaltarEnTabla)
      );
    });
  },
  LineString: function (feat, color_custom) {
    const polyline = L.polyline(
      feat.geometry.coordinates.map((coord) => L.latLng(coord[1], coord[0])),
      {
        color: color_custom,
        weight: 7,
        opacity: 1,
      }
    );

    polyline.bindPopup(feat.properties["Obra"]);

    polyline.feature = feat;

    grupo_de_lineas.addLayer(polyline);

    polyline.on("click", resaltarEnTabla());
  },
  // Función para manejar geometrías de tipo MultiLineString
  MultiLineString: function (feat, color_custom) {
    feat.geometry.coordinates.forEach((lineCoords) => {
      const polyline = L.polyline(
        lineCoords.map((coord) => L.latLng(coord[1], coord[0])),
        {
          color: color_custom,
          weight: 12,
          opacity: 1,
        }
      );
      polyline.on("click", resaltarEnTabla);
      const decorated_polyline = L.polylineDecorator(polyline, {
        patterns: [
          // defines a pattern of 10px-wide dashes, repeated every 20px on the line
          {
            offset: 0,
            color: color_custom,
            weight: 7,
            opacity: 1,
            repeat: 15,
            symbol: L.Symbol.dash({
              pixelSize: 3,
              pathOptions: { color: color_custom, weight: 10 },
            }),
          },
        ],
      });
      decorated_polyline.bindPopup(feat.properties["Obra"]); // Asociar el popup
      //console.log("Decorated polyline:", decorated_polyline);
      grupo_de_lineas.addLayer(decorated_polyline); // Agregar al grupo de capas

      // Traer la línea al frente y abrir popup al hacer clic
      decorated_polyline.on("hover", function (e) {
        this.openPopup(); // Abrir el popup al hacer clic
        this.bringToFront(); // Traer la línea al frente al hacer clic
      });
      decorated_polyline.on("click", resaltarEnTabla);
    });
  },
  Polygon: function (feat) {
    console.log("Habia poligonos");
    // Assuming simple polygons (no holes) or just the first ring
    // grupo_de_poligonos.addLayer(L.polygon(feat.geometry.coordinates[0].map(coord => L.latLng(coord[1], coord[0])), {
    //     color: 'blue',
    //     weight: 3,
    //     fillOpacity: 0.2
    // }).bindPopup(feat.properties['Obra']));
  },
  MultiPolygon: function (feat) {
    console.log("Habia poligonos");
    // feat.geometry.coordinates.forEach((polygonCoords) => {
    //     // MultiPolygon has an extra level of nesting compared to Polygon
    //     grupo_de_poligonos.addLayer(L.polygon(polygonCoords[0].map(coord => L.latLng(coord[1], coord[0])), {
    //         color: 'blue',
    //         weight: 3,
    //         fillOpacity: 0.2
    //     }).bindPopup(feat.properties['Obra']));
    // });
  },
};

// --- Main Function ---
function updateWorksTable(rubro_sel) {
  // Esta función lee tanto el listado de obras como el geojson con obras para alimentar la tabla de obras y los markers
  grupo_de_markers.clearLayers(); // Limpiamos el grupo de marcadores
  grupo_de_lineas.clearLayers(); // Clear line layers too
  grupo_de_poligonos.clearLayers(); // Clear polygon layers too

  const tableBody = document.querySelector("#tabla_obras_municipal tbody"); // Este es el contenedor de la tabla de obras
  const noDataMessage = document.getElementById("noDataMessage");
  const worksData = generate_values_Mun_Rubro(municipio_actual, rubro_sel);

  tableBody.innerHTML = ""; // Limpiar filas existentes

  if (worksData.length === 0) {
    noDataMessage.style.display = "block"; // Mostrar mensaje de no datos
    document.getElementById("tabla_obras_municipal").style.display = "none"; // Ocultar tabla
  } else {
    noDataMessage.style.display = "none"; // Ocultar mensaje de no datos
    document.getElementById("tabla_obras_municipal").style.display = "table"; // Mostrar tabla

    // Ordenar los datos por año de forma descendente y luego por inversión
    const sortedWorks = worksData.sort((a, b) => {
      // 1. Comparar por Ejercicio (Año) de forma descendente
      if (b.Ejercicio !== a.Ejercicio) {
        return b.Ejercicio - a.Ejercicio;
      }
      // 2. Si los Ejercicios son iguales, entonces comparar por Inversión de forma descendente
      const inversionA = parseFloat(a.Inversión || 0);
      const inversionB = parseFloat(b.Inversión || 0);
      return inversionB - inversionA;
    });

    // Initialize or clear the count for unique geometries for this update cycle
    conteo_geometrias_unicas = {};

    // --- Paso 1: Identificar y Contar Geometrías Únicas (solo para Point/MultiPoint) ---
    // Iterate only through features that are points or multipoints to count them.
    obras_from_js.features.forEach((obra) => {
      if (
        obra.properties.Municipio === municipios[municipio_actual] &&
        (obra.properties.Rubro === rubro_sel ||
          rubro_sel === "Todos los rubros")
      ) {
        if (obra.geometry.type === "Point") {
          const key = `${obra.geometry.coordinates[1]},${obra.geometry.coordinates[0]}`;
          conteo_geometrias_unicas[key] =
            (conteo_geometrias_unicas[key] || 0) + 1;
        } else if (obra.geometry.type === "MultiPoint") {
          obra.geometry.coordinates.forEach((pointCoord) => {
            const key = `${pointCoord[1]},${pointCoord[0]}`;
            conteo_geometrias_unicas[key] =
              (conteo_geometrias_unicas[key] || 0) + 1;
          });
        }
      }
    });

    // --- Paso 2: Filtrar obras relevantes y Añadir Geometrías al Mapa ---
    const obras_de_tal_municipio = obras_from_js.features.filter((feat) => {
      // Corrected logical AND (&&)
      return (
        feat.properties.Municipio === municipios[municipio_actual] &&
        (feat.properties.Rubro === rubro_sel ||
          rubro_sel === "Todos los rubros")
      );
    });

    console.log("Obras filtradas para mapa:", obras_de_tal_municipio);

    obras_de_tal_municipio.forEach((feat) => {
      let color_custom;
      switch (feat.properties.Rubro) {
        case "Vialidades Urbanas":
          color_custom = "#98989A";
          break;
        case "Espacios Públicos":
          color_custom = "#235B4E";
          break;
        case "Infraestructura Carretera":
          color_custom = "#6F7271";
          break;
        case "Infraestructura Hídrica":
          color_custom = "#6c9abb";
          break;
        case "Vivienda Asequible":
          color_custom = "#d4c19c";
          break;
        case "Espacios Educativos":
          color_custom = "#9d2449";
          break;
        default:
          color_custom = "url(#c)"; // Assuming this refers to an SVG pattern or similar
          break;
      }

      // Use the geometryHandlers map to process each feature based on its geometry type
      const geometryType = feat.geometry.type; // Correctly get geometry type from feat.geometry
      if (geometryHandlers[geometryType]) {
        // Pass color_custom only to handlers that need it (Point/MultiPoint for markers)
        if (geometryType === "Point" || geometryType === "MultiPoint") {
          geometryHandlers[geometryType](feat, color_custom);
        } else {
          geometryHandlers[geometryType](feat, color_custom);
        }
      } else {
        console.warn(`Tipo de geometría no soportado: ${geometryType}`);
      }
    });

    // --- Paso 3: Rellenar la Tabla HTML ---
    var boolean_icon = false;
    sortedWorks.forEach((work) => {
      const row = tableBody.insertRow();
      row.insertCell().textContent = work.Ejercicio;

      const formattedInvestment = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(parseFloat(work.Inversión) || 0); // Ensure Inversión is a number

      row.insertCell().textContent = formattedInvestment;
      row.insertCell().textContent =
        work["NOM_MUN"] === "Cobertura Estatal"
          ? "Cobertura Estatal"
          : work["Habitantes beneficiados"] === 0
          ? "Sin dato"
          : work["Habitantes beneficiados"];

      const obraCell = row.insertCell();
      obraCell.classList.add("obra-column");

      if (work["tiene_geo"] === "TRUE") {
        // Compare as string 'TRUE'
        boolean_icon = true;
        const icon = document.createElement("i");
        icon.classList.add("bi", "bi-geo-alt");
        icon.classList.add("obra-icon");
        icon.dataset.workId = work.ID; // Store work.ID, not work.ID_OBRA directly as you're using it later

        icon.addEventListener("mouseover", () => {
          icon.classList.remove("bi-geo-alt");
          icon.classList.add("bi-geo-alt-fill");
        });
        icon.addEventListener("mouseout", () => {
          icon.classList.remove("bi-geo-alt-fill");
          icon.classList.add("bi-geo-alt");
        });

        icon.addEventListener("click", () => {
          const workIdToRetrieve = icon.dataset.workId;
          console.log("ID de obra a buscar:", workIdToRetrieve);
          // Find the feature by its ID_OBRA and then open its popup
          // This assumes 'work.ID' corresponds to the numeric part of 'ID_OBRA' in GeoJSON
          const matchedFeature = obras_from_js.features.find((feat) => {
            // Ensure this comparison logic is correct based on your data structure
            // It seems 'work.ID' is a number, and you're combining it with 'work.NOM_MUN'
            // to form 'ID_OBRA' in the GeoJSON. Double-check this.
            return (
              feat.properties["ID_OBRA"] ===
              `${parseInt(workIdToRetrieve)}_${work.NOM_MUN}`
            );
          });

          if (matchedFeature) {
            console.log("Feature encontrada:", matchedFeature);
            buscarYAbrirPopup(
              matchedFeature,
              matchedFeature.properties["Obra"]
            );
          } else {
            console.warn(
              `No se encontró la obra con ID: ${workIdToRetrieve} para abrir el popup.`
            );
          }
        });

        const obraText = document.createElement("span");
        obraText.textContent = work.Obra;
        obraText.classList.add("obra-text");

        obraCell.appendChild(icon);
        obraCell.appendChild(obraText);
      } else {
        const obraText = document.createElement("span");
        obraText.textContent = work.Obra;
        obraText.classList.add("obra-text");
        obraCell.appendChild(obraText);
      }
    });
    if (boolean_icon === true) {
      const obraColumn = document.getElementById("obra_column_id");
      if (!obraColumn.querySelector(".geo-icon-helper")) {
        obraColumn.insertAdjacentHTML(
          "beforeend",
          '<span class="geo-icon-helper" style="font-size:0.85em;font-weight:normal;color:#555;"><br>(click en el ícono <i class="bi bi-geo-alt"></i> para ver en el mapa)</span>'
        );
      }
    } else {
      const obraColumn = document.getElementById("obra_column_id");
      const helper = obraColumn.querySelector(".geo-icon-helper");
      if (helper) {
        obraColumn.removeChild(helper);
      }
    }
  }
}

// --- Global variables that need to be defined somewhere before this function is called ---
// Example:
// var map_h; // Your Leaflet map instance
// var grupo_de_markers; // L.layerGroup()
// var grupo_de_lineas;  // L.layerGroup()
// var grupo_de_poligonos; // L.layerGroup()
// var municipios; // An object/array mapping indices to municipality names
// var municipio_actual; // Current selected municipality index/name
// var obras_from_js; // Your GeoJSON data loaded via fetch
// var generar_marker_dado_color; // Your function to generate markers based on color

function updateInvTable() {
  const tableBody = document.querySelector("#tabla_inversion_municipal tbody");
  const noDataMessage = document.getElementById("noDataMessage2");
  // Assuming generate_resumen_inversion_por_año returns an object like { 2022: { obrasTotal: ..., inversionTotal: ... }, ... }
  const worksData = generate_resumen_inversion_por_año(municipio_actual);
  console.log(worksData);

  tableBody.innerHTML = "";

  const years = Object.keys(worksData).sort((a, b) => b - a);

  if (years.length === 0) {
    noDataMessage.style.display = "block"; // Show no data message
    document.getElementById("tabla_inversion_municipal").style.display = "none"; // Hide table
  } else {
    noDataMessage.style.display = "none"; // Hide no data message
    document.getElementById("tabla_inversion_municipal").style.display =
      "table"; // Show table

    let totalObrasHistorico = 0;
    let totalInversionHistorico = 0;

    years.forEach((year) => {
      const yearSummary = worksData[year];
      totalObrasHistorico += yearSummary.obrasTotal;
      totalInversionHistorico += yearSummary.inversionTotal;

      const row = tableBody.insertRow();
      row.insertCell().textContent = year;
      row.insertCell().textContent = yearSummary.obrasTotal;

      const formattedInvestment = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(yearSummary.inversionTotal);
      row.insertCell().textContent = formattedInvestment;
    });

    const totalRow = tableBody.insertRow();
    totalRow.classList.add("total-row");

    totalRow.insertCell().textContent = "Histórico Total"; // Etiqueta para el total
    totalRow.insertCell().textContent = totalObrasHistorico; // Suma total de obras
    const formattedTotalInvestment = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(totalInversionHistorico);
    totalRow.insertCell().textContent = formattedTotalInvestment; // Suma total de inversión
    // --- Fin del renglón del total histórico ---
  }
}
let myHistoricRubrosChart;

function updateWorksSummary() {
  const worksData =
    generate_values_Reduce_Mun_num_obras_por_rubro_por_año(municipio_actual);
  const worksSummaryElement = document.getElementById("worksSummary");
  let htmlContent = "";

  const years = Object.keys(worksData).sort((a, b) => b - a); // Ordenar años de mayor a menor

  if (years.length === 0) {
    htmlContent =
      '<p class="no-data">No hay obras registradas para este municipio.</p>';
  } else {
    years.forEach((year) => {
      const yearWorks = worksData[year];
      const rubros = Object.keys(yearWorks);

      if (rubros.length > 0) {
        // Solo mostrar el año si tiene rubros con obras
        htmlContent += `
                                            <div class="year-section">
                                                <div class="year-title">${year}</div>
                                                <div class="divider"></div>
                                        `;
        rubros.forEach((rubro) => {
          const numWorks = yearWorks[rubro];
          htmlContent += `<div class="work-item">${
            numWorks === 1 ? "1 obra " : numWorks + " obras "
          } de ${rubro}</div>`;
        });
        htmlContent += `</div>`;
      }
    });
    const historicRubroTotalsByYear = {}; // To store counts for each rubro, per year
    years.forEach((year) => {
      const yearWorks = worksData[year];
      for (const rubro in yearWorks) {
        if (yearWorks.hasOwnProperty(rubro)) {
          if (!historicRubroTotalsByYear[rubro]) {
            historicRubroTotalsByYear[rubro] = {};
          }
          historicRubroTotalsByYear[rubro][year] = yearWorks[rubro];
        }
      }
    });
    const allUniqueRubros = Object.keys(historicRubroTotalsByYear).sort();
    const colorPalette = [
      "rgb(98,17,50)", // Dark Red/Maroon
      "rgb(212,193,156)", // Light Beige/Tan
      "rgb(179,142,93)", // Muted Orange/Brown
      "rgb(157,36,73)", // Deep Rose/Magenta
      "rgb(112,114,114)", // Medium Grey
      "rgb(29,29,27)", // Near Black
    ];

    const datasets = years.reverse().map((year, index) => {
      // Added 'index' to the map callback
      const dataForThisYear = allUniqueRubros.map((rubro) => {
        return historicRubroTotalsByYear[rubro] &&
          historicRubroTotalsByYear[rubro][year]
          ? historicRubroTotalsByYear[rubro][year]
          : 0;
      });

      const backgroundColor = colorPalette[index % colorPalette.length];

      const borderColor = backgroundColor;

      return {
        label: `Año ${year}`,
        data: dataForThisYear,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      };
    });

    const ctx = document
      .getElementById("lineplot_año_por_tipo_estatal")
      .getContext("2d");

    if (myHistoricRubrosChart) {
      myHistoricRubrosChart.destroy();
    }

    myHistoricRubrosChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: allUniqueRubros,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Obras por Rubro y Año (Histórico)",
            font: {
              size: 18,
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: "Rubro",
            },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            title: {
              display: true,
              text: "Número de Obras",
            },
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    });
  }
  worksSummaryElement.innerHTML = htmlContent;
}
