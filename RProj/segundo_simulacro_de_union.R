##Código para el segundo simulacro.

##Leemos el drive y kmls:
docs_sheets_sv=readxl::read_excel("../Ocultos/Georeferenciados_a_mano/Segunda vuelta/OBRAS SIPDUS ZONA METRO.xlsx")

#kmls
unzip(zipfile ="../Ocultos/Georeferenciados_a_mano/Segunda vuelta/Itzel_OBRAS.kmz" ,exdir = "../Ocultos/Georeferenciados_a_mano/Segunda vuelta/para_kmls/itz.kml")
unzip(zipfile ="../Ocultos/Georeferenciados_a_mano/Segunda vuelta/Itzel2.kmz" ,exdir = "../Ocultos/Georeferenciados_a_mano/Segunda vuelta/para_kmls/itz2.kml")
unzip(zipfile ="../Ocultos/Georeferenciados_a_mano/Segunda vuelta/LINEAS_OBRAS VIALES.kmz" ,exdir = "../Ocultos/Georeferenciados_a_mano/Segunda vuelta/para_kmls/eve_linea.kml")
unzip(zipfile ="../Ocultos/Georeferenciados_a_mano/Segunda vuelta/OBRAS SIPDUS ZONA METRO(Emma).kmz" ,exdir = "../Ocultos/Georeferenciados_a_mano/Segunda vuelta/para_kmls/emma.kml")
unzip(zipfile ="../Ocultos/Georeferenciados_a_mano/Segunda vuelta/OBRAS SIPDUS ZONA METRO (Emma2).kmz" ,exdir = "../Ocultos/Georeferenciados_a_mano/Segunda vuelta/para_kmls/emma2.kml")
unzip(zipfile ="../Ocultos/Georeferenciados_a_mano/Segunda vuelta/Obras Spidus jair1525.kmz" ,exdir = "../Ocultos/Georeferenciados_a_mano/Segunda vuelta/para_kmls/kml_jair.kml")
unzip(zipfile ="../Ocultos/Georeferenciados_a_mano/Segunda vuelta/PUNTOS_OBRAS.kmz" ,exdir = "../Ocultos/Georeferenciados_a_mano/Segunda vuelta/para_kmls/eve_punto.kml")
unzip(zipfile ="../Ocultos/Georeferenciados_a_mano/Segunda vuelta/Obras_SIPDUS_Metro_Kenneth.kmz" ,exdir = "../Ocultos/Georeferenciados_a_mano/Segunda vuelta/para_kmls/kenet.kml")
unzip(zipfile ="../Ocultos/Georeferenciados_a_mano/Segunda vuelta/obras_sipduuus_faltantes.kmz" ,exdir = "../Ocultos/Georeferenciados_a_mano/Segunda vuelta/para_kmls/kenet2.kml")
#
#unzip(zipfile ="../Ocultos/Georeferenciados_a_mano/Segunda vuelta/Obras_Enrique_2.kml" ,exdir = "../Ocultos/Georeferenciados_a_mano/Segunda vuelta/para_kmls/quique.kml")
#unzip(zipfile ="../Ocultos/Georeferenciados_a_mano/Segunda vuelta/Obras_Lalo2.kml" ,exdir = "../Ocultos/Georeferenciados_a_mano/Segunda vuelta/para_kmls/lalo.kml")
unzip(zipfile ="../Ocultos/Georeferenciados_a_mano/Segunda vuelta/PUNTOS_OBRAS 2.kmz" ,exdir = "../Ocultos/Georeferenciados_a_mano/Segunda vuelta/para_kmls/alfred2.kml")

z=st_read("../Ocultos/Georeferenciados_a_mano/Segunda vuelta/para_kmls/itz2.kml/doc.kml")

kmls_sv=list.files(path = "../Ocultos/Georeferenciados_a_mano/Segunda vuelta/",pattern = ".kml$",full.names = T,recursive = T) |> 
  lapply(st_read)

kmls_sv=do.call(plyr::rbind.fill,kmls_sv)
kmls_sv$Name[kmls_sv$Name=='Alfred']=(regmatches(kmls_sv$Description[kmls_sv$Name=='Alfred'], regexec("<td>ID_OBRA</td>\\s*<td>(.*?)</td>", kmls_sv$Description[kmls_sv$Name=='Alfred'])) |> unlist())[1:14*2]

kmls_sv=kmls_sv |> 
  dplyr::select(-Description) |> 
  dplyr::filter(Name!='Alfred')

kmls_sv=merge(kmls_sv,docs_sheets_sv,by.x ='Name',by.y='ID_OBRA',all.x=T) ##En este merge se pueden duplicar por los que agregarmos en


#localidad_encontrada (un mismo renglón se divide en varios porque la obra tenía más información)
##Como preliminar, dejamos los duplicados y luego tomamos la primera con el mismo ID
##Para el mapa web sirve. Para la base de obras no tanto. Pero eso está pendiente.
kmls_sv=kmls_sv[which(!duplicated(kmls_sv[,c("Name","geometry")])),]
kmls_sv=kmls_sv |> st_as_sf() |> st_zm()
kmls_sv=kmls_sv |> 
  dplyr::group_by(Name) |> 
  dplyr::summarise(geometry=st_combine(geometry)) 
###
kmls_sv=merge(kmls_sv,docs_sheets_sv,by.x='Name',by.y='ID_OBRA',all.x=T)
#kmls=plyr::rbind.fill(kmls,kml_alfred,kml_emma,kml_eve,kml_keneth)
###

kmls_para_merge_sv=kmls_sv

excel_separados_por_mun_para_merge=excel_separados_por_mun |> 
  dplyr::mutate(ID=paste0(No.,"_",Municipio))

###Primero identificamos los que no se pudieron unir. 
kmls_para_merge_sv$Name[which(kmls_para_merge_sv$Name |> lapply(\(x){!x%in%excel_separados_por_mun_para_merge$ID}) |> unlist())]

simulacro_union_sv=kmls_para_merge_sv
simulacro_union_sv=simulacro_union_sv |> st_as_sf() |> 
  dplyr::group_by(Name,geometry) |> 
  dplyr::slice_head(n=1) |> st_zm()


simulacro_union_sv$geometry |> lapply(st_geometry_type) |> unlist() |> unique()
simulacro_union |> dplyr::select(Name:Trabajos) |> st_write("../Datos/simulacro_union",driver = "GeoJSON")


#kmls_itz=kmls_sv[[1]]
##Unimos por no_municipio_encontrado

##Buscamos coincidencias con el formato que me sirve: 

##append a columna tiene_geo y append a geojson de geometrias (esta vez también hay líneas)
#Son disjuntos entonces es un rbind trivial.

#