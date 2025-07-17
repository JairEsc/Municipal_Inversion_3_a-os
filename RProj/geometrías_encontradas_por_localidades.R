###De hacer el ejercicio de fuzzymatch con los nombres de municipios individuales y localidades individuales
###Se encuentran coincidencias con localidades urbanas o rurales

###Algunas de estas geometrías aparecen una única vez (hay más de 5000 localidades en el estado)
###Se considera la geometría encontrada si aparece una única vez
library(sf)
geometrias_encontradas=read_sf("../Ocultos/Georeferenciadas por joins/Localidades_Obras.shp")
geometrias_encontradas_unica_vez=read_sf("../Ocultos/Georeferenciadas por joins/Localidades_Obras_Repetidas_una_Vez.shp")
geometrias_encontradas_unica_vez$geometry |> unique() |> length()
nrow(geometrias_encontradas_unica_vez)

##
#Como paso preliminar, solamente verificamos que podemos hacer merge con la base de obras (1774)


##No se pudo porque modificamos los nombres de localidades

fuente_1 |> dplyr::group_by(No.,Municipio) |> dplyr::slice_head(n=1) |> nrow()


##Tiene que existir una relación entre fuente 1 y la tabla de obras utilizada en el mapa web. 
#Esta última satisface la propiedad de que las entradas son únicas dado No., Municipio. Sin embargo ya tuvieron un proceso de limpieza

#Para empezar, quiero heredarle este proceso a fuente_1

excel_separados_por_mun=readxl::read_excel("../RProj/SIPDUS_Municipios_2022-2025.xlsx")
excel_separados_por_mun=excel_separados_por_mun |> 
  dplyr::mutate(Municipio=ifelse(Municipio=='Varios',"Cobertura Estatal",Municipio))
excel_separados_por_mun$Municipio |> unique() |> sort()

excel_separados_por_mun |> dplyr::group_by(No.,Municipio) |> dplyr::slice_head(n=1) |> nrow()
##Lo hago de nuevo. 

##Desdoblamos fuente1 por municipio
fuente_2=fuente_1
###Había algunas modificaciones de forma que se le podían hacer.
#Por ejemplo cuando el municipio no era el correcto: E.g. decía cobertura regional y podía ser más específico 
#Porque era san agustín tlax y pachuca
fuente_2$Municipio[fuente_2$No.==227]='Pachuca de Soto, San Agustín Tlaxiaca,Zapotlán de Juárez'
fuente_2$Municipio[fuente_2$No.==228]='Almoloya,Apan,Emiliano Zapata,Tepeapulco,Tlanalapa'
fuente_2=separar_por_comas_dado_campo(df=fuente_2,campo = "Municipio")

fuente_2=fuente_2 |>
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
fuente_2$Municipio |> unique() |> sort()

comparar1=fuente_2|> dplyr::group_by(No.,Municipio) |> dplyr::slice_head(n=1)
comparar2=excel_separados_por_mun|> dplyr::group_by(No.,Municipio) |> dplyr::slice_head(n=1)
difff=comparar2 |> dplyr::group_by(No.,Municipio) |> dplyr::slice_head(n=1) |> 
  dplyr::filter(!paste0(No.,Municipio)%in%paste0(comparar1$No.,comparar1$Municipio))


difff=comparar1 |> dplyr::group_by(No.,Municipio) |> dplyr::slice_head(n=1) |> 
  dplyr::filter(!paste0(No.,Municipio)%in%paste0(comparar2$No.,comparar2$Municipio))

#Si ambas diferencias son vacías entonces uno está contenido en el otro
#y por tanto son iguales


#############
fuente_2 |> dplyr::group_by(No.,Municipio) |> dplyr::slice_head(n=1) |> nrow()

#En principio me deberían entregar un subconjunto de fuente_2. La condición
#de pertenencia es la resolución del municipio de pertenencia dadas 
#multiples opciones de municipios



geometrias_encontradas=read_sf("../Ocultos/Localidades_Obras.shp")
geometrias_encontradas_unica_vez=read_sf("../Ocultos/Localidades_Obras_Repetidas_una_Vez.shp")
geometrias_encontradas_unica_vez$geometry |> unique() |> length()
nrow(geometrias_encontradas_unica_vez)

##
#Como paso preliminar, solamente verificamos que podemos hacer merge con la base de obras (1774)

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
geometrias_encontradas_unica_vez$ID_OBRA

geometrias_encontradas_unica_vez_c_ID=geometrias_encontradas_unica_vez |>
  dplyr::rowwise() |> 
  dplyr::mutate(ID_OBRA = stringr::str_c(unlist(strsplit(ID_OBRA, split = "_"))[1:2], collapse = "_")) |>
  dplyr::ungroup() 

geometrias_matcheadas=geometrias_encontradas_unica_vez_c_ID |> 
  dplyr::filter(ID_OBRA%in%paste0(fuente_3$No.,"_",fuente_3$Municipio))
geometrias_no_matcheadas=geometrias_encontradas_unica_vez_c_ID |> 
  dplyr::filter(!ID_OBRA%in%paste0(fuente_3$No.,"_",fuente_3$Municipio))

##Todas las geometrías matcheadas se pueden agrupar por no._mun
geometrias_matcheadas |> dplyr::group_by(ID_OBRA) |> dplyr::summarise(st_combine(geometry)) |> nrow()
##Llevamos información quizás incompleta en 356 obras de las 1574

zzz=geometrias_encontradas[nchar(geometrias_encontradas$CVEGEO)>10,] 
