##Aqui va el código para mejorar las geometrías

por_obra_y_loc_c_g$ID_OBRA |> unique() |> length()
##
por_obra_y_loc_c_g|> colnames() |> sort()

simulacro_union_sv |> colnames() |> sort()

appended=plyr::rbind.fill(por_obra_y_loc_c_g |> dplyr::select(ID_OBRA:Municipio_original,geometry) ,
      simulacro_union_sv |> dplyr::select(Name:Municipio_original,,geometry)|> 
        dplyr::rename(ID_OBRA=Name))


appended=appended |> 
  dplyr::select(ID_OBRA:Municipio_original)
