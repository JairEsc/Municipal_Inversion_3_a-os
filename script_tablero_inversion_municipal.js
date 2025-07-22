//Recibe la actualización del Nav Visible

//Hay que tener cuidado con la selección porque están por orden alfabético los municipios.
//fetch de los datos necesarios

let data_municipal_fetched_and_splitted = []; // Variable global para almacenar los datos procesados

let LargeCsvCargado = new Promise((resolve, reject) => {
  fetch("Datos/SIPDUS_INHIFE.tsv")
    .then((response) => {
      return response.text();
    })
    .then((data) => {
      const lines = data.split("\n").filter(line => line.trim() !== ''); // Filtra líneas vacías
      const headers = lines[0].split("\t").map(header => header.trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "")); // Obtiene los encabezados del CSV
      //console.log(headers)
      // Define los campos que te interesan y su orden
      const desiredHeaders = [
        "ID",
        "NOM_MUN",
        "Rubro",
        "Ejercicio",
        "Obra",
        "Inversión",
        "Habitantes beneficiados",
        "tiene_geo"
      ];
      // Mapea los datos a un formato de objetos con solo los campos deseados
      data_municipal_fetched_and_splitted = lines.slice(1).map((line) => {
        const values = line.split("\t");
        //console.log(values)
        let rowData = {};
        desiredHeaders.forEach((headerName) => {
          const headerIndex = headers.indexOf(headerName);
          if (headerIndex !== -1 && values[headerIndex] !== undefined) {
            // Limpia comillas dobles o simples alrededor del valor
            let value = values[headerIndex].trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "");
            //console.log(value)
            // Intenta convertir a número si es aplicable (para 'Ejercicio', 'Inversión', 'Habitantes beneficiados')
            if (headerName === "Ejercicio" || headerName === "Inversión" || headerName === "Habitantes beneficiados") {
              rowData[headerName] = parseFloat(value) || 0; // Usa parseFloat para números con decimales, 0 si no es un número válido
            } else {
              rowData[headerName==="Municipio_Original"?"NOM_MUN":headerName] = value;
            }
          } else {
            rowData[headerName] = null; // O un valor por defecto si el campo no se encuentra
          }
        });
        return rowData;
      });

      resolve(); // La promesa se resuelve cuando los datos están listos
    });
});

// Ejemplo de cómo usar la promesa para saber cuándo los datos están cargados
LargeCsvCargado.then(() => {
  console.log("Datos cargados y procesados:", data_municipal_fetched_and_splitted);
  // Aquí puedes trabajar con data_municipal_fetched_and_splitted
  // Por ejemplo, para mostrar el primer elemento:
  // console.log(data_municipal_fetched_and_splitted[0]);
});
function getUniqueRubrosForMunicipio(municipio_sel) {
  const selectedMunicipioName = municipios[municipio_sel];
  const filteredData = data_municipal_fetched_and_splitted.filter((row) => {
    return row.NOM_MUN === selectedMunicipioName;
  });
  const uniqueRubros = new Set();
  filteredData.forEach((row) => {
    if (row.Rubro) { // Aseguramos que el Rubro no sea nulo o indefinido
      uniqueRubros.add(row.Rubro);
    }
  });
  return Array.from(uniqueRubros).sort();
}
generate_values_Mun = function (municipio_sel) {
  //Codigo para generar valores al seleccionar el año en la pestaña: 'barplot_entidad'
  if (!data_municipal_fetched_and_splitted) {
    return [];
  }
  //console.log(data_municipal_fetched_and_splitted)
  return data_municipal_fetched_and_splitted
    .filter((row)=>{
      return(row.NOM_MUN==municipios[municipio_sel])
    })
};
generate_values_Reduce_Mun_num_obras_por_rubro_por_año = function (municipio_sel) {
  // Aseguramos que los datos estén cargados
  if (!data_municipal_fetched_and_splitted) {
    return {}; // Retornar un objeto vacío si no hay datos
  }

  // 1. Obtenemos los rubros únicos para el municipio seleccionado (no los necesitamos para mapear índices en este caso)
  // getUniqueRubrosForMunicipio(municipio_sel); // No es estrictamente necesario para la estructura final

  // 2. Inicializamos la estructura para almacenar los conteos por año
  // Cada año tendrá un objeto vacío que contendrá los rubros y sus conteos
  const countsByYear = {
    2022: {},
    2023: {},
    2024: {},
    2025: {}
  };

  // Filtramos los datos por el municipio seleccionado
  const selectedMunicipioName = municipios[municipio_sel];
  const filteredDataForMunicipio = data_municipal_fetched_and_splitted.filter(row => {
    return row.NOM_MUN === selectedMunicipioName;
  });

  // 3. Iteramos sobre los datos filtrados para contar los renglones por rubro y año
  filteredDataForMunicipio.forEach(item => {
    const año_curr = item.Ejercicio;
    const rubro_curr = item.Rubro;

    // Aseguramos que el año esté en nuestro rango y que el rubro exista
    if (countsByYear[año_curr] && rubro_curr) {
      if (!countsByYear[año_curr][rubro_curr]) {
        countsByYear[año_curr][rubro_curr] = 0; // Inicializar si es la primera vez que vemos este rubro para este año
      }
      countsByYear[año_curr][rubro_curr]++;
    }
  });

  // 4. Procesamos el objeto para asegurar que solo se incluyan rubros con conteo > 0
  const finalResult = {};
  for (let year = 2022; year <= 2025; year++) {
    const rubrosForYear = countsByYear[year];
    const filteredRubros = {};
    for (const rubro in rubrosForYear) {
      if (rubrosForYear[rubro] > 0) {
        filteredRubros[rubro] = rubrosForYear[rubro];
      }
    }
    finalResult[year] = filteredRubros;
  }

  return finalResult;
};

// Tu función auxiliar ya definida
function getUniqueRubrosForMunicipio(municipio_sel) {
  const selectedMunicipioName = municipios[municipio_sel];
  const filteredData = data_municipal_fetched_and_splitted.filter((row) => {
    return row.NOM_MUN === selectedMunicipioName;
  });
  const uniqueRubros = new Set();
  filteredData.forEach((row) => {
    if (row.Rubro) { // Aseguramos que el Rubro no sea nulo o indefinido
      uniqueRubros.add(row.Rubro);
    }
  });
  return Array.from(uniqueRubros).sort();
}

generate_values_Mun_Rubro = function (municipio_sel,Rubro) {
  //Codigo para generar valores al seleccionar el año en la pestaña: 'barplot_entidad'
  if (!data_municipal_fetched_and_splitted) {
    return [];
  }
  //console.log(data_municipal_fetched_and_splitted)
  // console.log("Obras: ",data_municipal_fetched_and_splitted
  //   .filter((row)=>{
  //     return(row.NOM_MUN==municipios[municipio_sel] & row.Rubro===Rubro)
  //   }))
  return data_municipal_fetched_and_splitted
    .filter((row)=>{
      return(row.NOM_MUN==municipios[municipio_sel] & (row.Rubro===Rubro|Rubro==='Todos los rubros'))
    })
};

generate_resumen_inversion_por_año = function (municipio_sel) {
  // Aseguramos que los datos estén cargados
  if (!data_municipal_fetched_and_splitted) {
    return {}; // Regresamos un objeto vacío si no hay datos
  }

  // Filtramos los datos para obtener solo los del municipio seleccionado
  const selectedMunicipioName = municipios[municipio_sel];
  const filteredData = data_municipal_fetched_and_splitted.filter((row) => {
    return row.NOM_MUN === selectedMunicipioName;
  });

  // Usamos reduce para agrupar por año y sumar obras e inversión
  const resumenPorAño = filteredData.reduce((acc, curr) => {
    const año = curr.Ejercicio;
    const inversion = parseFloat(curr.Inversión || 0); 

    if (!acc[año]) {
      acc[año] = {
        obrasTotal: 0,
        inversionTotal: 0
      };
    }

    acc[año].obrasTotal++;
    acc[año].inversionTotal += inversion;

    return acc;
  }, {}); 

  return resumenPorAño;
};

generate_values_Inversion_dado_Mun = function (municipio_sel) {
  const filteredData = data_municipal_fetched_and_splitted.filter((row) => {
    return row.NOM_MUN === municipios[municipio_sel];
  });
  const rubrosAgrupados = filteredData.reduce((acc, curr) => {
    const rubro = curr.Rubro; // Obtenemos el rubro de la fila actual

    const inversion = parseFloat(curr.Inversión) || 0;
    const habitantesBeneficiados =
      curr["Habitantes beneficiados"] && curr["Habitantes beneficiados"] !== 0
        ? parseFloat(curr["Habitantes beneficiados"])
        : 0;

    // Si el rubro ya existe en el acumulador, sumamos los valores
    if (acc[rubro]) {
      acc[rubro].totalInversion += inversion;
      acc[rubro].totalBeneficiarios += habitantesBeneficiados;
    } else {
      // Si el rubro no existe, lo inicializamos con los valores actuales
      acc[rubro] = {
        totalInversion: inversion,
        totalBeneficiarios: habitantesBeneficiados,
      };
    }
    return acc;
  }, {}); // Inicializamos el acumulador como un objeto vacío

  // 3. Convertimos el objeto resultante en un array de arrays para el formato final.
  const outputArray = Object.entries(rubrosAgrupados).map(([rubro, data]) => {
    return [rubro, data.totalInversion, data.totalBeneficiarios];
  });

  return outputArray;
};


//Vamos a hacer un primera  llamada a los datos para alimentar a las gráficas por default.

LargeCsvCargado.then(()=>{
  ///grafica de prueba
  
  console.log(generate_values_Mun(0
    //,"Infraestructura Hídrica",'2024'
  ))
  const rubrosDisponibles = getUniqueRubrosForMunicipio(municipio_actual);
console.log("Posibles rubros para el municipios seleccionado: ",rubrosDisponibles)
updateRubrosDropdown( ['Todos los rubros'].concat(rubrosDisponibles));//Opciones de segundo cuadrante
//
//console.log(generate_values_Reduce_Mun_num_obras_por_rubro_por_año(municipio_actual))
//
updateWorksSummary()//Primer cuadrante
//
updateWorksTable(document.getElementById('tipo_dropdown').value)//Se ejecuta con el primer valor disponible del nuevo dropdown
//
updateInvTable()
  //console.log(generate_values_Mun_Rubro_Año(0,"Infraestructura Hídrica",2024))

})

