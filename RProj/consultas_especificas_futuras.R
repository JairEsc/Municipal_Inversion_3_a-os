##Código para el Jair del futuro
#Me pasó que me pedían los datos filtrados de los municipios pero con monto. Me tardé bastante porque antes me habían dicho que quitara los montos
#Aún así, parece que el Jair del pasado definió las versiones definitivas en formato .sqlite y .geojson, supongamos que sí.

##
version_preliminar=sf::st_read("../Ocultos/Obras_SIPDUS_Georeferenciacion_Manual_2025 .geojson")
version_preliminar |> dplyr::filter(Municipio_Original=='Tepeji del Río de Ocampo') |> 
  dplyr::filter(!duplicated(Obra,Inversión)) |> nrow()##Coincide con los 23 que reportamos en el mapa web
