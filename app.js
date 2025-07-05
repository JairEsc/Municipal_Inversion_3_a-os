//Calcular la inversión per cápita histórica y inversión per cápita directa
//Necesito el campo "inversion_total"
//Necesito el campo "poblacion total"
//Necesito el campo "poblacion beneficiada total"

//Que sean dos capas de base.
//  Inversión per cápita directa
//  Inversión per cápita indirecta

municipio_actual=45
let capa_actual='Inversión per cápita indirecta'
var map_h = L.map('map_tablero_inversion_hidalgo',{
    maxBoundsViscosity: 0.8
});
map_h.createPane('municipios'); // Pane normal
map_h.createPane('municipioActual'); // Pane para el municipio seleccionado

// Asignar prioridad: municipioActual estará arriba de municipios
map_h.getPane('municipios').style.zIndex = 400;
map_h.getPane('municipioActual').style.zIndex = 500;




municipios=["Acatlán","Acaxochitlán","Actopan","Agua Blanca de Iturbide","Ajacuba","Alfajayucan","Almoloya","Apan","Atitalaquia","Atlapexco","Atotonilco de Tula","Atotonilco el Grande","Calnali","Cardonal","Chapantongo","Chapulhuacán","Chilcuautla","Cuautepec de Hinojosa","El Arenal","Eloxochitlán","Emiliano Zapata","Epazoyucan","Francisco I. Madero","Huasca de Ocampo","Huautla","Huazalingo","Huehuetla","Huejutla de Reyes","Huichapan","Ixmiquilpan","Jacala de Ledezma","Jaltocán","Juárez Hidalgo","La Misión","Lolotla","Metepec","Metztitlán","Mineral de la Reforma","Mineral del Chico","Mineral del Monte","Mixquiahuala de Juárez","Molango de Escamilla","Nicolás Flores","Nopala de Villagrán","Omitlán de Juárez","Pachuca de Soto","Pacula","Pisaflores","Progreso de Obregón","San Agustín Metzquititlán","San Agustín Tlaxiaca","San Bartolo Tutotepec","San Felipe Orizatlán","San Salvador","Santiago de Anaya","Santiago Tulantepec de Lugo Guerrero","Singuilucan","Tasquillo","Tecozautla","Tenango de Doria","Tepeapulco","Tepehuacán de Guerrero","Tepeji del Río de Ocampo","Tepetitlán","Tetepango","Tezontepec de Aldama","Tianguistengo","Tizayuca","Tlahuelilpan","Tlahuiltepa","Tlanalapa","Tlanchinol","Tlaxcoapan","Tolcayuca","Tula de Allende","Tulancingo de Bravo","Villa de Tezontepec","Xochiatipan","Xochicoatlán","Yahualica","Zacualtipán de Ángeles","Zapotlán de Juárez","Zempoala","Zimapán"]
municipios = municipios.map(m => m.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "));

getGradientColor = function(startColor, endColor, percent){
    // strip the leading # if it's there
    startColor = startColor.replace(/^\s*#|\s*$/g, '');
    endColor = endColor.replace(/^\s*#|\s*$/g, '');

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if (startColor.length === 3) {
      startColor = startColor.replace(/(.)/g, '$1$1');
    }

    if (endColor.length === 3) {
      endColor = endColor.replace(/(.)/g, '$1$1');
    }

    // get colors
    const startRed = parseInt(startColor.substr(0, 2), 16),
      startGreen = parseInt(startColor.substr(2, 2), 16),
      startBlue = parseInt(startColor.substr(4, 2), 16);

    const endRed = parseInt(endColor.substr(0, 2), 16),
      endGreen = parseInt(endColor.substr(2, 2), 16),
      endBlue = parseInt(endColor.substr(4, 2), 16);

    // calculate new color
    let diffRed = endRed - startRed;
    let diffGreen = endGreen - startGreen;
    let diffBlue = endBlue - startBlue;

    diffRed = ((diffRed * percent) + startRed);
    diffGreen = ((diffGreen * percent) + startGreen);
    diffBlue = ((diffBlue * percent) + startBlue);

    let diffRedStr = diffRed.toString(16).split('.')[0];
    let diffGreenStr = diffGreen.toString(16).split('.')[0];
    let diffBlueStr = diffBlue.toString(16).split('.')[0];

    // ensure 2 digits by color
    if (diffRedStr.length === 1) diffRedStr = '0' + diffRedStr;
    if (diffGreenStr.length === 1) diffGreenStr = '0' + diffGreenStr;
    if (diffBlueStr.length === 1) diffBlueStr = '0' + diffBlueStr;

    return '#' + diffRedStr + diffGreenStr + diffBlueStr;
}

//console.log(getGradientColor('#FF0000', '#00FF00', 48/84))
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	minZoom: 4,
	maxZoom: 15,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
}).addTo(map_h);

function getColor_h(d) {
    return getGradientColor('#ead57c','#9b071c', d)
}//color basado en gradiente

layer_seleccionado_color_borde=function(feature){
    if(feature.properties.NOM_MUN==municipios[municipio_actual]){
        return('#666')
    }
    else{
        return("white")
    }
}
function style_ent_h(feature) {
    // Obtener todos los valores de inv_per_cap_indir para calcular el ranking
    const values = hidalgo.features.map(f => parseFloat(f.properties.inv_per_cap_indir));
    const currentValue = parseFloat(feature.properties.inv_per_cap_indir);

    // Ordenar los valores de menor a mayor y obtener el ranking (posición)
    const sorted = [...values].sort((a, b) => a - b);
    const rank = sorted.indexOf(currentValue);
    const percent = sorted.length > 1 ? rank / (sorted.length - 1) : 0;

    return {
        fillColor: getColor_h(percent),
        opacity: 1,
        color: feature.properties.NOM_MUN == municipios[municipio_actual] ? "#667" : 'white',
        dashArray: feature.properties.NOM_MUN == municipios[municipio_actual] ? '0' : '5',
        fillOpacity: 0.4,
        pane: feature.properties.NOM_MUN == municipios[municipio_actual] ? 'municipioActual' : 'municipios'
    };
}
function style_ent_h2(feature) {
    // Obtener todos los valores de inv_per_cap_indir para calcular el ranking
    const values = hidalgo.features.map(f => parseFloat(f.properties.inv_per_cap_dir));
    const currentValue = parseFloat(feature.properties.inv_per_cap_dir);

    // Ordenar los valores de menor a mayor y obtener el ranking (posición)
    const sorted = [...values].sort((a, b) => a - b);
    const rank = sorted.indexOf(currentValue);
    const percent = sorted.length > 1 ? rank / (sorted.length - 1) : 0;

    return {
        fillColor: getColor_h(percent),
        opacity: 1,
        color: feature.properties.NOM_MUN == municipios[municipio_actual] ? "#667" : 'white',
        dashArray: feature.properties.NOM_MUN == municipios[municipio_actual] ? '0' : '5',
        fillOpacity: 0.4,
        pane: feature.properties.NOM_MUN == municipios[municipio_actual] ? 'municipioActual' : 'municipios'
    };
}
// Crear los dos grupos de capas
var grupo_dir = L.layerGroup();
var grupo_indir = L.layerGroup();

// Capa de Inversión per Cápita Directa
poligonos_map_h2 = L.geoJson(hidalgo, {
    style: style_ent_h2,
    onEachFeature: onEachFeature_h,
}).addTo(grupo_dir);

// Capa de Inversión per Cápita Indirecta
poligonos_map_h = L.geoJson(hidalgo, {
    style: style_ent_h,
    onEachFeature: onEachFeature_h,
}).addTo(grupo_indir);

// Añadir ambos grupos al mapa, pero solo mostrar uno por defecto
grupo_indir.addTo(map_h);

// Crear el control de capas
var baseLayers = {
    "Inversión per Cápita Directa": grupo_dir,
    "Inversión per cápita indirecta": grupo_indir
};
let firstBaseLayerChange = true;
map_h.on('baselayerchange', function(e) {
    if (firstBaseLayerChange) {
        firstBaseLayerChange = false;
        return;
    }
    capa_actual = e.name;
    console.log(capa_actual);
    document.getElementsByClassName('info_tablero_seg legend legend_seguridad')[0].children[0].innerText=e.name;
});
L.control.layers(baseLayers, null, {collapsed: false}).addTo(map_h);

map_h.fitBounds(poligonos_map_h.getBounds());
var ultimo_seleccionado='Hidalgo'

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        fillOpacity: 0.7
    });
    layer.bringToFront();
}
function updateRubrosDropdown(rubros) {
  const tipoDropdown = document.getElementById('tipo_dropdown');
    $("#tipo_dropdown").empty();


  rubros.forEach((rubro) => {
    let option = document.createElement('option');
    option.value = rubro;
    option.textContent = rubro;
    tipoDropdown.appendChild(option);
  });
}
function click_on_feature(e) {
    var layer = e.target;
    console.log(e.target.feature.properties.NOM_MUN)
    layer.bringToFront();
    municipio_actual=municipios.indexOf(e.target.feature.properties.NOM_MUN)
    //Forzar el cambio en cada grafica
    // var canvas_año_municipal = document.getElementById('año_dropdown');
    // var canvas_tipo_municipal = document.getElementById('tipo_dropdown');
    // var evento_forzado = new Event('change');
    // canvas_año_municipal.dispatchEvent(evento_forzado);
    // canvas_tipo_municipal.dispatchEvent(evento_forzado);
    //
    const rubrosDisponibles = getUniqueRubrosForMunicipio(municipio_actual);
    console.log("Posibles rubros para el municipios seleccionado: ",rubrosDisponibles)
    updateRubrosDropdown(rubrosDisponibles);
    //
    poligonos_map_h.resetStyle();
    poligonos_map_h2.resetStyle();

    info.update(layer.feature.properties);
}

function resetHighlight_h(e) {
    poligonos_map_h.resetStyle();
    poligonos_map_h2.resetStyle();
}
function onEachFeature_h(feature, layer) {
    if (feature.properties.NOM_MUN == municipios[municipio_actual]) {
        layer.bringToFront();
    }
    layer.bindTooltip('Municipio: '+feature.properties.NOM_MUN+'<br>'+
        'Inv1: '+feature.properties.inv_per_cap_dir+'<br>'+
        'Inv2: '+feature.properties.inv_per_cap_indir+'<br>'
    );

    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight_h,
        click: click_on_feature
    });
    
}

var info = L.control();

info.onAdd = function (map_h) {
    this._div = L.DomUtil.create('div', 'info_tablero_seg'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h1 style="font-size:large">'+(props? props.NOM_MUN: 'Pachuca de Soto')+'</h1>'+'<h4>'+'Municipio Seleccionado'+'</h4>' 
};

info.addTo(map_h);



var controlSearch_h = new L.Control.Search({
    position:'topleft',		
    layer: poligonos_map_h,
    initial: false,
    zoom: 12,
    marker: false,
    propertyName: 'NOM_MUN',
});

map_h.addControl(controlSearch_h);

var legend_h = L.control({position: 'bottomright'});

legend_h.onAdd = function (map) {

    var div = L.DomUtil.create("div", "info_tablero_seg legend legend_seguridad"),
      colors = ["#ead57c", "#daac69", "#c98356", "#bb5942", "#ab302f", "#9b071c"]; // Verde → Rojo

    // Crear el gradiente
    var gradient = "linear-gradient(to right, " + colors.join(", ") + ")";

    // Agregar el título y el gradiente
    div.innerHTML =
    '<strong>' + capa_actual + '</strong><br>'+
    '<div style="height: 10px; background: ' + gradient + ';"></div>';

    // Agregar los valores de referencia debajo del gradiente
    
    return div;
};

legend_h.addTo(map_h);


//Marca de Agua
L.Control.Watermark = L.Control.extend({
    onAdd: function(map_h) {
        var img = L.DomUtil.create('img');

        img.src = 'Datos/logo lab.png';
        img.style.width = '20vw';
        img.style.marginBottom = '4vh';

        return img;
    },

    onRemove: function(map) {
        // Nothing to do here
    }
});

L.control.watermark = function(opts) {
    return new L.Control.Watermark(opts);
}

L.control.watermark({ position: 'bottomleft' }).addTo(map_h);