##Simulacro de unir las georeferenciaciones manuales
library(sf)


##Leemos el docs con el municipio encontrado
docs_sheets=readxl::read_excel("../Ocultos/Georeferenciacion_SIPDUS.xlsx")
puntos_alfred=docs_sheets |> 
  dplyr::filter(RESPONSABLE=='Alfred'&!is.na(X))

kml_alfred=puntos_alfred |> 
  dplyr::mutate(X=as.numeric(gsub("\\,","",X)))|>
  dplyr::mutate(Y=as.numeric(gsub("\\,","",Y)))|>
  st_as_sf(coords = c("X","Y")) |> st_set_crs(st_crs("EPSG:4326")) #EPSG:32614

#kml_alfred = kml_alfred |> 
#  st_transform(st_crs("EPSG:4326"))

##Y Emma
puntos_emma=docs_sheets |> 
  dplyr::filter(RESPONSABLE=='Emma'&!is.na(X))

kml_emma=puntos_emma |> 
  dplyr::mutate(X=as.numeric(gsub("\\,","",X)))|>
  dplyr::mutate(Y=as.numeric(gsub("\\,","",Y)))|>
  st_as_sf(coords = c("X","Y")) |> st_set_crs(st_crs("EPSG:4326"))

#kml_emma=kml_emma |> 
#  st_transform(st_crs("EPSG:4326"))

##Y Eve
puntos_eve=docs_sheets |> 
  dplyr::filter(RESPONSABLE=='evelin'&!is.na(X))

kml_eve=puntos_eve |> 
  dplyr::mutate(X=as.numeric(gsub("\\,","",X)))|>
  dplyr::mutate(Y=as.numeric(gsub("\\,","",Y)))|>
  st_as_sf(coords = c("X","Y")) |> st_set_crs(st_crs("EPSG:4326"))

#kml_eve=kml_eve |> 

#  st_transform(st_crs("EPSG:4326"))
puntos_kenn=docs_sheets |> 
  dplyr::filter(RESPONSABLE=='Kenneth'&!is.na(X))
kml_keneth=puntos_kenn |> 
  dplyr::mutate(X=as.numeric(gsub("\\,","",X)))|>
  dplyr::mutate(Y=as.numeric(gsub("\\,","",Y)))|>
  st_as_sf(coords = c("X","Y")) |> st_set_crs(st_crs("EPSG:4326"))

#Y leemos el kmz con las geometrías

#unzip(zipfile ="../Ocultos/Georeferenciados_a_mano/Obras_Jair.kmz" ,exdir = "../Ocultos/Georeferenciados_a_mano/Nueva carpeta/Jair.kml")
#unzip(zipfile ="../Ocultos/Georeferenciados_a_mano/Sipdus_Kenneth.kmz" ,exdir = "../Ocultos/Georeferenciados_a_mano/Nueva carpeta/Keneth.kml")
#"../Ocultos/Georeferenciados_a_mano/Nueva carpeta/Keneth.kml/doc.kml" |> st_read() |> nrow()
kmls=list.files(path = "../Ocultos/Georeferenciados_a_mano/",pattern = ".kml$",full.names = T,recursive = T) |> 
  lapply(st_read) 

kmls=do.call(plyr::rbind.fill,kmls)
kmls=kmls |> 
  dplyr::select(-Description) 

kmls=merge(kmls,docs_sheets,by.x ='Name',by.y='ID_OBRA',all.x=T) ##En este merge se pueden duplicar por los que agregarmos en
#localidad_encontrada (un mismo renglón se divide en varios porque la obra tenía más información)
##Como preliminar, dejamos los duplicados y luego tomamos la primera con el mismo ID
##Para el mapa web sirve. Para la base de obras no tanto. Pero eso está pendiente.
kmls=kmls |> 
  dplyr::group_by(Name,geometry) |> 
  dplyr::slice_head(n=1) |> 
  st_as_sf() |> 
  st_zm() |> 
  dplyr::filter(Name!='River of the birdnidas')
###
kmls=plyr::rbind.fill(kmls,kml_alfred,kml_emma,kml_eve,kml_keneth)
###

library(leaflet)
kmls_faltantes=kmls[grepl("\\,",kmls$municipios_original) & kmls$`municio encontrado` |> is.na(),] |> st_as_sf()|> st_zm()
leaflet() |> addTiles() |> 
  addMarkers(data=kmls_faltantes,
             label =kmls_faltantes$Name)


municipios = sf::read_sf("../../../Importantes_documentos_usar/Municipios/municipiosjair.shp")

#kmls$`municio encontrado`[grepl("\\,",kmls$municipios_original)& kmls$`municio encontrado` |> is.na()]=c("Pachuca de Soto","Ixmiquilpan","Chilcuautla")
kmls_faltantes=st_join(x = kmls_faltantes,y=municipios |> st_transform(st_crs("EPSG:4326")),join = st_within)
kmls_faltantes=kmls_faltantes |> 
  dplyr::mutate(`municio encontrado`=NOM_MUN)

###Si logro unirlas a fuente_3 ya quedaría, porque fuente_3 al reducirse por no_mun ya queda útil
kmls_full=rbind(kmls |> dplyr::filter(!(is.na(`municio encontrado`) & grepl("\\,",x = municipios_original))),
                kmls_faltantes |> dplyr::select(Name:ID_OBRA)
)
kmls_full=kmls_full |> dplyr::mutate(Name=ifelse(Name |> is.na(),ID_OBRA,Name))
kmls_full=kmls_full |> dplyr::mutate(`municio encontrado`=ifelse(`municio encontrado` |> is.na(),municipios_original,`municio encontrado`))

all(!(kmls_full$Name |> is.na()))

kmls_para_merge=kmls_full |> st_as_sf()|>  st_zm() |> dplyr::select(Name,`municio encontrado`,`Localidad encontrada`,municipios_original) |> 
  dplyr::rowwise() |> dplyr::mutate(
    Name = sapply(Name, function(x) {
      parts <- unlist(strsplit(x, split = "_"))
      parts[1]
    })
  ) |> 
  dplyr::mutate(`municio encontrado`=ifelse(!is.na(`municio encontrado`),`municio encontrado`,municipios_original)) |> 
  dplyr::mutate(Name=paste0(Name,"_",`municio encontrado`)) |> 
  dplyr::ungroup() |> 
  dplyr::group_by(Name) |> 
  dplyr::summarise(geometry=st_combine(geometry))

excel_separados_por_mun_para_merge=excel_separados_por_mun |> 
  dplyr::mutate(ID=paste0(No.,"_",Municipio))

###Primero identificamos los que no se pudieron unir. 
#Al menos habrá dos donde eran de cobertura estatal y se encontró el municipio
kmls_para_merge$Name[which(kmls_para_merge$Name |> lapply(\(x){!x%in%excel_separados_por_mun_para_merge$ID}) |> unlist())]

simulacro_union=merge(kmls_para_merge,
                      excel_separados_por_mun_para_merge,
                      by.x='Name',by.y='ID')

simulacro_union$geometry |> plot()
simulacro_union |> dplyr::select(Name:Trabajos) |> st_write("../Datos/simulacro_union",driver = "GeoJSON")
