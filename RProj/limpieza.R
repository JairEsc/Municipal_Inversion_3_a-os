library(sf)
municipios=read_sf("../../../Reutilizables/Cartografia/municipiosjair.shp")
demos=read.csv("../../../Reutilizables/Demograficos/iter_13_cpv2020/conjunto_de_datos/conjunto_de_datos_iter_13CSV20.csv")
demos=demos|> 
  dplyr::select(MUN,NOM_MUN,LOC,POBTOT) |> 
  dplyr::filter(MUN>0) |> 
  dplyr::filter(LOC==0)|> 
  dplyr::mutate(MUN=sprintf("%03d",MUN)) |> 
  dplyr::select(-NOM_MUN)
municipios=municipios |> 
  dplyr::select(CVEGEO,NOM_MUN,CVE_MUN) 
municipios=merge(municipios,demos,by.x='CVE_MUN',by.y='MUN',all.x=T)


##Pre-proceso para calcular montos de inversión.
#dummys
municipios$inv_per_cap_dir=rnorm(84,mean = 150000,sd=5000)
municipios$inv_per_cap_indir=rnorm(84,mean = 1500,sd=50)





st_write(municipios,"geojson_hgo.geojson",driver = "geojson")



zzz=sf::read_sf("Datos/SIPDUS_BDGeneral2/SIPDUS_BDGeneral2.shp")



zzz$No. |> unique() |> length()


csv_leido=readxl::read_excel("../../RProj/SIPDUS_Municipios_2022-2025.xlsx")
csv_leido=csv_leido |> dplyr::select(No.,Municipio_ind,Rubro,Inversión,Habitantes.beneficiados,Ejercicio,Obra)
zzz2=zzz |> 
  dplyr::group_by(No.) |> dplyr::slice_head(n=1)

csv_leido=merge(csv_leido,zzz2 |> dplyr::select(No.,geometry),by='No.',all.x=T)
csv_leido$tiene_geo=sf::st_is_empty(csv_leido$geometry)

###
csv_leido |> sf::st_as_sf() |> 
  sf::st_drop_geometry() |> write.table("../../Datos/SIPDUS_2022-2025_tiene_geo.tsv",row.names = F,sep = "\t")

csv_leido |> sf::st_as_sf() |> 
  dplyr::filter(!sf::st_is_empty(geometry)) |> 
  sf::st_transform(sf::st_crs("EPSG:4326")) |> 
  sf::st_write("../../geojson_obras_c_geo.geojson",driver='GeoJSON')
