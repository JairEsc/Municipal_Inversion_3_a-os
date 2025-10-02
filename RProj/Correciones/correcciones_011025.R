##Correción. De dar click a municipios individuales, podemos notar incongruencias de geometrías. 

#Como ejemplo, Tlahuiltepa tiene obras fuera del municipio.

"../Datos/SIPDUS_INHIFE.geojson" |> st_read()->obras_en_map_web

"1224_Tlahuiltepa"
plot(municipios)

obras_en_map_web$geometry[obras_en_map_web$ID_OBRA=="1224_Tlahuiltepa"]=
  obras_en_map_web$geometry[obras_en_map_web$ID_OBRA=="1224_Tlahuiltepa"] |> 
  st_cast("LINESTRING") |> st_as_sf() |> 
  st_join(municipios[71#El 71 es tlahuiltepa
                     ,] |> st_transform(st_crs("EPSG:4326")),join = st_intersects) |> 
  dplyr::filter(!is.na(CVE_MUN)) |> st_union()

obras_en_map_web$geometry[obras_en_map_web$ID_OBRA=="1221_Tlahuiltepa"]=
  obras_en_map_web$geometry[obras_en_map_web$ID_OBRA=="1221_Tlahuiltepa"] |> 
  st_cast("POINT") |> st_as_sf() |> 
  st_join(municipios[71#El 71 es tlahuiltepa
                     ,] |> st_transform(st_crs("EPSG:4326")),join = st_intersects) |> 
  dplyr::filter(!is.na(CVE_MUN)) |> st_union()


##Van a pasar a Singilucan donde hay 
##Pasan a Singilucan
obras_en_map_web[obras_en_map_web$ID_OBRA=='637_Nopala de Villagrán',]
obras_en_map_web[obras_en_map_web$ID_OBRA=='1283_Tula de Allende',]

obras_en_map_web$geometry[obras_en_map_web$ID_OBRA=="140_Cardonal"]=
  (st_as_sf(as.data.frame(x = list(-99.053236, 20.370624),col.names =  c("long","lat")) ,coords = c("long","lat")) |> st_set_crs(st_crs("EPSG:4326")))$geometry[1]


plot(municipios$geometry[15] |> st_transform(st_crs("EPSG:4326")),add=T)
plot(st_as_sf(as.data.frame(x = list(-99.053236, 20.370624),col.names =  c("long","lat")) ,coords = c("long","lat")) |> st_set_crs(st_crs("EPSG:4326")) ,col='red')

obras_en_map_web |> st_write("../Datos/SIPDUS_to_js.geojson",driver = "GeoJSON")

