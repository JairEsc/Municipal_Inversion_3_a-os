##Aqui va el código para mejorar las geometrías

##Las que ya tenemos: 
geometrias_especificas=st_read("../Datos/spidus_obras_c_geometrias_bien.geojson")

# > geometrias_encontradas$ID_OBRA |> unique() |> length()
# [1] 1428
# > geometrias_encontradas$ID_OBRA |> length()
# [1] 1428

geometrias_nuevas=simulacro_union_sv


geometrias_especificas=rbind(geometrias_especificas |> dplyr::select(ID_OBRA:Trabajos) |> dplyr::rename(
  `Habitantes beneficiados`=Habitantes.beneficiados,
  `Informe de Gobierno`=Informe.de.Gobierno,
  `Clave de Obra`=Clave.de.Obra
)
,geometrias_nuevas |> dplyr::select(Name,No.:Trabajos,-`LOCALIDAD ENCONTRADA`) |> 
  dplyr::rename(ID_OBRA=Name) )






###Obras de caasim inter-municipales
caasim_obras=st_read("../Ocultos/Georeferenciados_a_mano/Segunda vuelta/Caasim_No_Manual.geojson")
caasim_obras=caasim_obras |> 
  dplyr::mutate(ID_OBRA=paste0(No.,'_',Municipio_ind))
#caasim_obras=caasim_obras |> 
  #dplyr::filter(ID_OBRA!='911_Pachuca De Soto')
caasim_obras$geometry[caasim_obras$ID_OBRA=='911_Pachuca De Soto']=kml_911$geometry[1] |> st_zm()
kml_911=st_read("../Ocultos/Georeferenciados_a_mano/Segunda vuelta/911.kml")
caasim_obras=caasim_obras |> dplyr::filter(!ID_OBRA%in%geometrias_especificas$ID_OBRA)
##I.e. nos quedamos con las versiones anteriores
geometrias_especificas=rbind(geometrias_especificas |> dplyr::select(ID_OBRA:Trabajos) ,caasim_obras |> dplyr::select(ID_OBRA,No.:Trabajos,-Municipio_ind)|> dplyr::rename(
  `Habitantes beneficiados`=Habitantes.beneficiados,
  `Informe de Gobierno`=Informe.de.Gobierno,
  `Clave de Obra`=Clave.de.Obra
)  )
geometrias_especificas=geometrias_especificas |> 
  dplyr::filter(!(ID_OBRA=='geometrias_especificas' & st_geometry_type(geometry)=='MULTILINESTRING') )


#geometrias_especificas=geometrias_especificas |> 
  #dplyr::filter(ID_OBRA!='')
##########

##

geometrias_especificas$ID_OBRA=gsub("Varios","Cobertura Estatal",geometrias_especificas$ID_OBRA )



geometrias_especificas |> st_write("../Datos/sipdus_geometrias.geojson",driver='GeoJSON')





###

#Cosas de educación. 


