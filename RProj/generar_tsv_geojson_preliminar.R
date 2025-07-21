##Ocupamos las geometrías que se encontraron una única vez
#Y ocupamos las goemetrías que se encontraron a mano (kmls_para_merge)
##Si hubiera intersección no vacía (sí la hay), le damos prioridad a los de a mano

geometrias_encontradas_unica_vez_c_ID$ID_OBRA |> unique() |> length()
geometrias_encontradas_unica_vez_c_ID= geometrias_encontradas_unica_vez_c_ID|>
  dplyr::group_by(ID_OBRA) |> 
  dplyr::summarise(geometry=st_combine(geometry))
#y
geometrias_encontradas_unica_vez_c_ID |> dplyr::filter(ID_OBRA%in%kmls_para_merge$Name)
kmls_para_merge$Name |> unique() |> length()


obras_ya_encontradas=rbind(geometrias_encontradas_unica_vez_c_ID |> 
                             dplyr::mutate(fuente='Lalo'),kmls_para_merge |> 
                             dplyr::rename(ID_OBRA=Name)|> 
                             dplyr::mutate(fuente='mano'))
##Revisamos que ambas sean únicas. Es posible que se hayan encontrado las mismas de diferentes 
#maneras. Le daremos prioridad a las que se hicieron a mano.

###Le voy a dar prioridad a las que se encontraron a mano
obras_ya_encontradas_slice= obras_ya_encontradas |> 
  dplyr::group_by(ID_OBRA) |> 
  dplyr::arrange(dplyr::desc(fuente)) |> 
  dplyr::slice_head(n=1)



obras_ya_encontradas=obras_ya_encontradas_slice 
###De las 1481 obras originales, vamos a tratar de excluir las que ya están hechas.
por_obra_y_loc=fuente_2
por_obra_y_loc=por_obra_y_loc |> 
  dplyr::mutate(ID_OBRA=paste0(No.,"_",Municipio))
por_obra_y_loc=merge(por_obra_y_loc,obras_ya_encontradas,by='ID_OBRA',all.x=T)
###
por_obra_y_loc_s_g_3_muns=por_obra_y_loc |> 
  dplyr::filter(st_is_empty(geometry)) |> 
  dplyr::filter(Municipio%in%c("Pachuca de Soto","Mineral de la Reforma","Tizayuca"))
por_obra_y_loc_s_g_tula_zempoala_zapotlan=por_obra_y_loc |> 
  dplyr::filter(st_is_empty(geometry)) |> 
  dplyr::filter(Municipio%in%c("Tula de Allende","Zempoala","Zapotlán de Juárez"))
por_obra_y_loc_s_g_tula_zempoala_zapotlan |> dplyr::select(-geometry,-fuente) |> 
  openxlsx::write.xlsx("../Ocultos/Georeferenciacion_SIPDUS_tula_zemp_zapotl.xlsx")

por_obra_y_loc_s_g_3_muns |>st_drop_geometry() |> dplyr::select(-geometry) |> as.data.frame()  |> openxlsx::write.xlsx("../Ocultos/Georeferenciacion_SIPDUS_pachuca_mineral_tiza.xlsx")


##
por_obra_y_loc_c_g=por_obra_y_loc |> 
  dplyr::filter(!st_is_empty(geometry)) |> 
  dplyr::group_by(ID_OBRA) |> 
  dplyr::slice_head(n=1) 

#por_obra_y_loc_c_g=por_obra_y_loc_c_g |> dplyr::group_by(ID_OBRA) |> 
#  dplyr::summarise(geometry=st_combine(geometry))


# obras_ya_util_tiene_geo=merge(obras_ya_util |> 
#                                 dplyr::mutate(ID_OBRA=paste0(ID,"_",NOM_MUN)),
#                               por_obra_y_loc_c_g,by="ID_OBRA",all.x=T)
obras_ya_util_tiene_geo=por_obra_y_loc_c_g
obras_ya_util_tiene_geo=obras_ya_util_tiene_geo |> 
  dplyr::mutate(tiene_geo=!st_is_empty(geometry)) |> 
  st_drop_geometry() |> 
  dplyr::select(-geometry)


obras_ya_util_tiene_geo |> write.table("../Datos/SIPDUS_2022-2025_tiene_geo (2).tsv",row.names = F,sep = "\t")
#obras_ya_util_tiene_geo$geometry[420]=st_cast(obras_ya_util_tiene_geo$geometry[420],"LINESTRING")
obras_ya_util_tiene_geo |> dplyr::filter(!st_is_empty(geometry)) |> 
  dplyr::mutate(tiene_geo=!st_is_empty(geometry)) |> 
  st_write("../Datos/spidus_obras_c_geometrias_bien.geojson")
