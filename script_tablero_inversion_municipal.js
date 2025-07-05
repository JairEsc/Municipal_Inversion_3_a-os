//Recibe la actualización del Nav Visible

//Hay que tener cuidado con la selección porque están por orden alfabético los municipios.
//fetch de los datos necesarios

let data_municipal_fetched_and_splitted = []; // Variable global para almacenar los datos procesados

let LargeCsvCargado = new Promise((resolve, reject) => {
  fetch("Datos/SIPDUS_INVERSIÓN GLOBAL_Mun_Homologados.csv")
    .then((response) => {
      return response.text();
    })
    .then((data) => {
      const lines = data.split("\n").filter(line => line.trim() !== ''); // Filtra líneas vacías
      const headers = lines[0].split(",").map(header => header.trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "")); // Obtiene los encabezados del CSV
      //console.log(headers)
      // Define los campos que te interesan y su orden
      const desiredHeaders = [
        "Municipio_Original",
        "Rubro",
        "Ejercicio",
        "Obra",
        "Inversión",
        "Habitantes beneficiados",
      ];
      // Mapea los datos a un formato de objetos con solo los campos deseados
      data_municipal_fetched_and_splitted = lines.slice(1).map((line) => {
        const values = line.split(",");
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
generate_values_Mun_Rubro = function (municipio_sel,Rubro) {
  //Codigo para generar valores al seleccionar el año en la pestaña: 'barplot_entidad'
  if (!data_municipal_fetched_and_splitted) {
    return [];
  }
  //console.log(data_municipal_fetched_and_splitted)
  return data_municipal_fetched_and_splitted
    .filter((row)=>{
      return(row.NOM_MUN==municipios[municipio_sel] & row.Rubro===Rubro)
    })
};
generate_values_Ejercicios_dado_Año = function (municipio_sel, año_sel) {

  const filteredData = data_municipal_fetched_and_splitted.filter((row) => {

    return row.NOM_MUN === municipios[municipio_sel] && row.Ejercicio === año_sel;
  });

  // Usamos reduce para contar el número de obras por cada Rubro
  const rubrosContados = filteredData.reduce((acc, curr) => {
    const rubro = curr.Rubro; // Accedemos al valor del Rubro en la fila actual

    // Si el rubro ya existe en el acumulador, incrementamos su contador
    if (acc[rubro]) {
      acc[rubro]++;
    } else {
      // Si el rubro no existe, lo inicializamos con 1
      acc[rubro] = 1;
    }
    return acc;
  }, {}); // Inicializamos el acumulador como un objeto vacío

  const outputArray = Object.entries(rubrosContados);

  return outputArray;
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
  data_mun = {
    labels:["A","B","C"],
    datasets: [
      {
        axis: "y",
        label: "Tasa de delito por cada mil habitantes",
        data: [1,2,3],
        fill: false,
        backgroundColor: [
          "rgba(98,17,50,0.1)",
          "rgba(157,36,73,0.1)",
          "rgba(112,144,144,0.1)",
          "rgba(212,193,156,0.1)",
          "rgba(179,142,93,0.1)",
          "rgba(29,29,27,0.1)",
          "rgba(9, 86, 70,0.1)",
        ],
        borderColor: [
          "rgb(98,17,50)",
          "rgb(157,36,73)",
          "rgb(112,144,144)",
          "rgb(212,193,156)",
          "rgb(179,142,93)",
          "rgb(29,29,27)",
          "rgb(9, 86, 70)",
        ],
        borderWidth: 1,
      },
    ],
  };
  const ctx_mun = document
    .getElementById("barplot_tipo_por_año_municipal")
    .getContext("2d"); //inicio a crear la gráfica

  chart_barplot_mun_tipos_por_año = new Chart(ctx_mun, {
    type: "bar",
    data: data_mun,
    
    responsive: true,
    options: {interaction:{intersect: false,
      mode:'y'
    },
      indexAxis: "y",
      maintainAspectRatio: false,
      scales: {
        y: {
          
          ticks: {
            precision:0,
            mirror: true,
            color: "black",
            font: { size: 15 },
          },
        },
        x: { position: "top",
         },
      },
      locale: "en-EN",
      plugins: {
        tooltip: {
          // callbacks: {
          //   title: (tooltipItems) => {
          //     // Obtener el label original
          //     let originalLabel = tooltipItems[0].label;
          //     if(sub_labels_clasificacion[originalLabel.substring(0,originalLabel.length-3)]){
          //       return(sub_labels_clasificacion[originalLabel.substring(0,originalLabel.length-3)])
          //     }
          //     else{
          //       return originalLabel
          //     }
              
          //   }
          // }
        }
      }
    },
    //plugins:plugin_actualizar_eleccion_cruzada
  });
  console.log(generate_values_Mun(0
    //,"Infraestructura Hídrica",'2024'
  ))
  //console.log(generate_values_Mun_Rubro_Año(0,"Infraestructura Hídrica",2024))
})

