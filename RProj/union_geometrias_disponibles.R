##Ahora generaremos un segundo preliminar 

##Son todas las geometrías que encontramos por fuzzy merge +
## Las geometrías encontradas a mano

geometrias_encontradas=read_sf("../Ocultos/Georeferenciadas por joins/Localidades_Obras.shp")
fuente_3=fuente_1
###Había algunas modificaciones de forma que se le podían hacer.
#Por ejemplo cuando el municipio no era el correcto: E.g. decía cobertura regional y podía ser más específico 
#Porque era san agustín tlax y pachuca
fuente_3$Municipio[fuente_3$No.==227]='Pachuca de Soto, San Agustín Tlaxiaca,Zapotlán de Juárez'
fuente_3$Municipio[fuente_3$No.==228]='Almoloya,Apan,Emiliano Zapata,Tepeapulco,Tlanalapa'
fuente_3=fuente_3|>
  dplyr::mutate(
    Municipio = dplyr::case_when(
      Municipio == "Atotonilco El Grande" ~ "Atotonilco el Grande",
      Municipio == "Epezoyucan" ~ "Epazoyucan",
      Municipio == "Estatal" ~ "Cobertura Estatal",
      Municipio == "Cobertura estatal" ~ "Cobertura Estatal",
      Municipio == "Cobertura Regional" ~ "Cobertura Estatal",
      Municipio == "Varios" ~ "Cobertura Estatal",
      Municipio == "San salvador" ~ "San Salvador",
      Municipio == "Tula de allende" ~ "Tula de Allende",
      Municipio == "Francisco I Madero" ~ "Francisco I. Madero",
      Municipio == "Nopala de Villagran" ~ "Nopala de Villagrán",
      Municipio == "Pachuca" ~ "Pachuca de Soto",
      Municipio == "San Agustín Meztquititlán" ~ "San Agustín Metzquititlán",
      TRUE ~ Municipio
    )
  )

geometrias_encontradas_c_ID=geometrias_encontradas |>
  dplyr::rowwise() |> 
  dplyr::mutate(ID_OBRA = stringr::str_c(unlist(strsplit(ID_OBRA, split = "_"))[1:2], collapse = "_")) |>
  dplyr::ungroup() 

geometrias_matcheadas=geometrias_encontradas_c_ID |> 
  dplyr::filter(ID_OBRA%in%paste0(fuente_3$No.,"_",fuente_3$Municipio))
geometrias_no_matcheadas=geometrias_encontradas_unica_vez_c_ID |> 
  dplyr::filter(!ID_OBRA%in%paste0(fuente_3$No.,"_",fuente_3$Municipio))

##Todas las geometrías matcheadas se pueden agrupar por no._mun
geometrias_matcheadas |> dplyr::group_by(ID_OBRA) |> dplyr::summarise(st_combine(geometry)) |> nrow()
##Llevamos información quizás incompleta en 356 obras de las 1574
geometrias_matcheadas_por_no_mun=geometrias_matcheadas |> 
  dplyr::group_by(ID_OBRA) |> dplyr::summarise(geometry=st_combine(geometry))
geometrias_matcheadas_por_no_mun=merge(geometrias_matcheadas_por_no_mun,
                                       geometrias_matcheadas |> st_drop_geometry() |> 
                                         dplyr::group_by(ID_OBRA) |> 
                                         dplyr::slice_head(n=1),
                                       by='ID_OBRA',all.x=T)

###Esta es una fuente de información


##Por otro lado, tenemos el simulacro de unión.
geometrias_matcheadas_por_no_mun |> colnames()
simulacro_union |> colnames()

zzz=rbind(geometrias_matcheadas_por_no_mun|> dplyr::select(ID_OBRA,NOM_MUN,Obra,Rubro),
      simulacro_union |> dplyr::select(Name,Municipio,Obra,Rubro) |> 
        dplyr::rename(ID_OBRA=Name,
                      NOM_MUN=Municipio))
zzz |> dplyr::group_by(ID_OBRA) |> 
  dplyr::summarise(geometry=st_combine(geometry)) |> st_write("../Ocultos/prototipo_geojson_para_resumen_NO_MUNICIPIO.geojson",driver = "GeoJSON")
