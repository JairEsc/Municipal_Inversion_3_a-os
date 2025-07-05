//---------------------------------------------------
$("#año_dropdown").change(function () {
  console.log("Año actualizado a " + this.value);
  let datosDeAñoCambiado=generate_values_Ejercicios_dado_Año(municipio_actual,parseInt(this.value))
  console.log(datosDeAñoCambiado)
});

$("#tipo_dropdown").change(function () {
  //Cambia el valor del tipo. //O sea que solo actualizamos las gráficas inferiores
  //generamos los nuevos valores para lineplot de tipo
  //actualizamos el objeto data que guarda los valores para el lineplot de tipo
  //destruimos la gráica anterior
  //Creamos una con los datos actualizados
  console.log("rubro actualizado a " + this.value);
  //El valor actual del año se jala del select
  const año_sel=document.getElementById('año_dropdown').value
  console.log(año_sel)
  let datosDeTipoCambiado=generate_values_Mun_Rubro_Año(municipio_actual,this.value)
  console.log(datosDeTipoCambiado)
});

//creamos una promesa de ordenar los municipios según la seleccion. Año y Tipo. 

//cuando se crean las default se crea la primer promesa. 
//se filtra y se obtiene una lista de tamaño 84.
//se "empareja" con los nombres/cves de los municipios
//se ordena de manera que se pueda asignar el rank a cada municipio.
//el orden: Puede ser el número de valores únicos (>2)
//pendiente-. 


//una vez modificado el poligonos_h (campo área), se llama a resetStyle() dentro de la promesa y se cumple. 

