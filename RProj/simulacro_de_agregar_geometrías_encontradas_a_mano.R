##Teníamos un conjunto de puntos que podemos mejorar. 

puntos_preliminares=st_read("../Datos/spidus_geojson_by_id_mun_poquitos.geojson")
puntos_preliminares=merge(puntos_preliminares,
                          obras_ya_util |> 
                            dplyr::select(ID,NOM_MUN,Rubro) |> 
                            dplyr::rowwise() |> 
                            dplyr::mutate(ID=paste0(ID, "-",NOM_MUN)) |> 
                            dplyr::ungroup(),
                          by.x="join",by.y='ID',all.x=T)

simulacro_union$Name |> lapply(\(x){!x%in%gsub(pattern = "-",replacement = "_",puntos_preliminares$join)}) |> 
  unlist() |> sum()
##
simulacro_union$Name |> unique() |> length()

puntos_simples=simulacro_union |> st_cast("POINT") |> 
  dplyr::group_by(Name) |> 
  dplyr::summarise(conteo=dplyr::n()) |> 
  dplyr::filter(conteo==1) 

puntos_simples=simulacro_union |> dplyr::filter(Name%in%puntos_simples$Name) |> 
  st_cast("POINT")
multipuntos=simulacro_union |> 
  dplyr::filter(!Name%in%puntos_simples$Name)
puntos_preliminares=rbind(rbind(puntos_preliminares |> dplyr::select(-NOM_MUN),
      puntos_simples |> 
        dplyr::select(Name,Obra,Rubro,geometry) |>
        dplyr::rowwise() |> 
        dplyr::mutate(Municipio_inters=
                        sapply(Name, function(x) {
                          parts <- unlist(strsplit(x, split = "_"))
                          parts[2]
                        })
                      ) |> 
        dplyr::rename(join=Name,
                      Obra.x=Obra)),
      multipuntos |> 
        dplyr::select(Name,Obra,Rubro,geometry) |>
        dplyr::rowwise() |> 
        dplyr::mutate(Municipio_inters=
                        sapply(Name, function(x) {
                          parts <- unlist(strsplit(x, split = "_"))
                          parts[2]
                        })
                      ) |> 
        dplyr::rename(join=Name,
                      Obra.x=Obra)
      
      )

##################Hay que ponerle tambié el rubro de la obra para el select.

puntos_preliminares |> dplyr::mutate(join=gsub("_","-",join)) |> 
  st_write("../Datos/spidus_geojson_by_id_mun_poquitos_update.geojson",driver = "GeoJSON",append = FALSE)
