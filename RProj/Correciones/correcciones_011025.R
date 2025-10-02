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


##Van a pasar a Singilucan donde hay el pozo mencionado
##Pasan a Singilucan

obras_en_map_web$geometry[obras_en_map_web$ID_OBRA=='637_Nopala de Villagrán']=st_point()
obras_en_map_web$geometry[obras_en_map_web$ID_OBRA=='1283_Tula de Allende']=st_point()

obras_en_map_web$geometry[obras_en_map_web$ID_OBRA=="140_Cardonal"]=
  (st_as_sf(as.data.frame(x = list(-99.0923614, 20.6190929),col.names =  c("long","lat")) ,coords = c("long","lat")) |> st_set_crs(st_crs("EPSG:4326")))$geometry[1]



obras_en_map_web$geometry[obras_en_map_web$ID_OBRA=="140_Cardonal"] |> plot()
(st_as_sf(as.data.frame(x = list(-99.053236, 20.370624),col.names =  c("long","lat")) ,coords = c("long","lat")) |> st_set_crs(st_crs("EPSG:4326")))$geometry[1]|> plot(col='red',add=T)
##San salvador 
obras_en_map_web$geometry[obras_en_map_web$ID_OBRA=='1047_San Salvador']=
  obras_en_map_web$geometry[obras_en_map_web$ID_OBRA=='1047_San Salvador'] |> 
  st_cast("POINT") |> st_as_sf() |> 
  st_join(municipios[54#El 71 es tlahuiltepa
                     ,] |> st_transform(st_crs("EPSG:4326")),join = st_intersects) |> 
  dplyr::filter(!is.na(CVE_MUN)) |> st_union()


obras_en_map_web$geometry[obras_en_map_web$ID_OBRA=='303_Huasca de Ocampo']=st_point()



plot(municipios$geometry |> st_transform(st_crs("EPSG:4326")),add=T)
#plot(st_as_sf(as.data.frame(x = list(-99.053236, 20.370624),col.names =  c("long","lat")) ,coords = c("long","lat")) |> st_set_crs(st_crs("EPSG:4326")) ,col='red')
plot(obras_en_map_web$geometry[obras_en_map_web$ID_OBRA=='1047_San Salvador'],col=T)
plot(obras_en_map_web$geometry[obras_en_map_web$ID_OBRA=='1047_San Salvador'] |> 
       st_cast("POINT") |> st_as_sf() |> 
       st_join(municipios[54#El 71 es tlahuiltepa
                          ,] |> st_transform(st_crs("EPSG:4326")),join = st_intersects) |> 
       dplyr::filter(!is.na(CVE_MUN)) |> st_union() |> st_geometry(),col="red")
obras_en_map_web |> dplyr::filter(!st_is_empty(geometry) ) |> st_write("../Datos/SIPDUS_to_js.geojson",driver = "GeoJSON")

obras_en_map_web |> dplyr::mutate(tiene_geo=!st_is_empty(geometry)) |> st_drop_geometry() |> write.table( file = "../Datos/SIPDUS_INHIFE.tsv", row.names=FALSE, sep="\t")

obras_en_map_web$Municipio |> unique() |> lapply(\(mun){
  obras_en_map_web |> dplyr::filter(Municipio==mun) |> st_geometry() |> plot(col='red')
  municipios |> dplyr::filter(NOM_MUN==mun) |> st_geometry() |> plot(add=T)
})
