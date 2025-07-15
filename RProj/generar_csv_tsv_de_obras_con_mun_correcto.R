z=read.csv("../Datos/SIPDUS_Municipios_2022-2025.csv")
z$Obra=gsub("\\,",replacement = ";",z$Obra)

z$NOM_MUN[z$NOM_MUN=='Cobertura Estatal']
z |> dplyr::select(Rubro,Ejercicio,NOM_MUN,Inversión,Habitantes.beneficiados,Obra) |> 
  write.csv("../Datos/SIPDUS_2022-2025.csv")

localidades_urbanas=sf::read_sf("../../../Reutilizables/Cartografia/conjunto_de_datos/13l.shp")
localidades_puntuales=sf::read_sf("../../../Reutilizables/Cartografia/conjunto_de_datos/13lpr.shp")
municipios=sf::read_sf("../../../Reutilizables/Cartografia/municipiosjair.shp")


zz=read.csv("../Datos/SIPDUS_2022-2025.csv")
zz$Obra |> duplicated() |> sum()


zzz=readxl::read_excel("../Datos/SIPDUS_geometry_2022-2025.xlsx")
zzz |> dplyr::select(No.,Municipio_ind,Localidad,Habitantes.beneficiados,Rubro,Ejercicio,Obra,Inversión,Tiene_Geo) |>
  #dplyr::mutate(Obra=gsub("\\,",";",Obra)) |> 
  #dplyr::mutate(Localidad=gsub("\\,",";",Localidad)) |> 
  write.table( file = "../Datos/SIPDUS_2022-2025.tsv", row.names=FALSE, sep="\t")


zzz$Tiene_Geo |> sum()
