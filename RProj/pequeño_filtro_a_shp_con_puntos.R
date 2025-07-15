sipdus_300625=sf::read_sf("SIPDUS_BDGeneral2.shp")
rows=sipdus_300625 |> sf::st_drop_geometry() |> dplyr::group_by(No.) |> dplyr::slice_head(n=1) |> dplyr::select(No.) |> unique()
varios_mun = sipdus_300625[grepl(pattern = ",", x = sipdus_300625$Municipio ),]
unique_mun = sipdus_300625[!grepl(pattern = ",", x = sipdus_300625$Municipio ),]
municipios=municipios |> st_transform(st_crs(sipdus_300625))
guardar = NULL
for (i in 1:nrow(varios_mun)) {
  #i=15
  interes = varios_mun$Municipio[i]
  interes_vector = strsplit(interes, ",") |>  unlist()
  mun_interes = municipios[which(municipios$NOM_MUN %in% interes_vector),]
  plot(mun_interes$geometry)
  fila = varios_mun[i,]
  plot(fila$geometry, add = T, col = "red")
  inter =sf::st_distance(fila,mun_interes)
  ## sf::st_intersects(x = mun_interes, y = fila)##Distancia
  if(as.numeric(min(inter))<5000){
    municipio_correcto = mun_interes$NOM_MUN[which(inter==min(inter) )]
    cat("Vamos en", i, "donde el municipio correcto es",municipio_correcto, "\n" )
    print(min(inter))
    fila = fila |>  dplyr::mutate(Municipio_inters = municipio_correcto)
    
    guardar = dplyr::bind_rows(guardar, fila)
  }
  else{
    print("Más lejos de 5 km")
  }
}

guardar=guardar |> 
  dplyr::group_by(No.,Municipio) |> 
  dplyr::slice_head(n=1)



unique_mun = sipdus_300625[!grepl(pattern = ",", x = sipdus_300625$Municipio ),]
guardar2=NULL
for (i in 1:nrow(unique_mun)) {
  #i=15
  interes = unique_mun$Municipio[i]
  interes_vector = strsplit(interes, ",") |>  unlist()
  mun_interes = municipios[which(municipios$NOM_MUN %in% interes_vector),]
  #plot(mun_interes$geometry)
  fila = unique_mun[i,]
  #plot(fila$geometry, add = T, col = "red")
  inter =sf::st_distance(fila,mun_interes)
  ## sf::st_intersects(x = mun_interes, y = fila)##Distancia
  if(as.numeric(min(inter))<5000){
    municipio_correcto = mun_interes$NOM_MUN[which(inter==min(inter) )]
    cat("Vamos en", i, "donde el municipio correcto es",municipio_correcto, "\n" )
    print(min(inter))
    fila = fila |>  dplyr::mutate(Municipio_inters = municipio_correcto)
    guardar2 = dplyr::bind_rows(guardar2, fila)
  }
  else{
    print("Más lejos de 5 km")
  }
}





sipdus_unique_muns=rbind(guardar,guardar2)
sipdus_unique_muns=sipdus_unique_muns |> 
  dplyr::group_by(No.,Municipio) |> 
  dplyr::slice_head(n=1)

sipdus_unique_muns_u=sipdus_unique_muns |> 
  dplyr::group_by(No.,Municipio) |> 
  dplyr::summarise(st_combine(geometry))
st_write(sipdus_unique_muns_u |> dplyr::mutate(No.=as.integer(No.)) |> st_transform(st_crs("EPSG:4326")),"../Datos/spidus_geojson_by_id_mun.geojson",driver = "GeoJSON")
which(sipdus_unique_muns_u$No. %in% zzz$No.[zzz$Tiene_Geo==1])
which(zzz$No.[zzz$Tiene_Geo==1] %in%sipdus_unique_muns_u$No.  )

