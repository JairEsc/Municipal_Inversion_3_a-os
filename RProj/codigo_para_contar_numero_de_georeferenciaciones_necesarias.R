fuente_0_sipdus_2306=readxl::read_excel("../Ocultos/Originales/SIPDUS_INVERSIÓN GLOBAL 23062025.xlsx",sheet='B.D GENERAL',skip =3 ) |> 
  dplyr::filter(!is.na(No.))

#Notamos que hay 1481 obras únicas (ID=No.)

#Al georeferenciar, se deberá generar una geometría por obra, ya sea punto, multipunto, poligono o línea según aplique

#Muchas de las referencias geográficas son simples. E.g. Municipio, Localidad

fuente_0_sipdus_2306_simples=fuente_0_sipdus_2306 |> 
  dplyr::filter(!(grepl(pattern = ",",x = Municipio) | grepl(pattern = " y ",x = Municipio))) |> #falso
  dplyr::filter(!(grepl(pattern = ",",x = Localidad) | grepl(pattern = " y ",x = Localidad)) )#falso

##Específicamente, son 1423 simples. 
#Es decir, que no tienen ni municipios separados por comas ni localidades separadas por comas

#Podemos suponer que estas obras requieren geometrías simples, como puntos o líneas (no multipuntos ni multilineas)

##Por otro lado, no satisfacer tener geometrías simples se clasifican en dos: 

#Geometría dada por varias localidades dentro de un municipio
fuente_0_sipdus_2306_varias_localidades=fuente_0_sipdus_2306 |> 
  dplyr::filter(!(grepl(pattern = ",",x = Municipio) | grepl(pattern = " y ",x = Municipio))) |> #falso
  dplyr::filter((grepl(pattern = ",",x = Localidad) | grepl(pattern = " y ",x = Localidad)) ) #verdadero

#Estas obras ocurren dentro de un municipio y benefician a más de una localidad, por lo que requiere una geometría compleja
#Una manera sencilla de generar una geometría simple para cada una es separando por renglones para cada localidad
####Código para separar por comas




##El caso faltante es aquellas obras que suceden en varias localidades distribuidas en varios municipios

fuente_0_sipdus_2306_varias_localidades_y_varios_municipios=fuente_0_sipdus_2306 |> 
  dplyr::filter((grepl(pattern = ",",x = Municipio) | grepl(pattern = " y ",x = Municipio))) |>#verdaero 
  dplyr::filter((grepl(pattern = ",",x = Localidad) | grepl(pattern = " y ",x = Localidad)) )  #verdadero

##Un último caso ( verdadero falso) Estas son obras que ocurren en varios municipios pero no sabemos en cuáles localidades
fuente_0_sipdus_2306_varios_municipios=fuente_0_sipdus_2306 |> 
  dplyr::filter((grepl(pattern = ",",x = Municipio) | grepl(pattern = " y ",x = Municipio))) |>#verdaero 
  dplyr::filter(!(grepl(pattern = ",",x = Localidad) | grepl(pattern = " y ",x = Localidad)) )  #falso


#Naturalmente, se debe cumplir que son una partición
nrow(fuente_0_sipdus_2306_simples)+
nrow(fuente_0_sipdus_2306_varias_localidades)+
nrow(fuente_0_sipdus_2306_varias_localidades_y_varios_municipios)+
nrow(fuente_0_sipdus_2306_varios_municipios)
# Y sí.


#########################
#Separamos los que son de varias localidades y un solo municipio por renglones
#Separamos los que son de varios municipios y una sola localidad por renglones
#Separamos las que son varias localidades y varios municipios por renglones de localidades dejando incógnita los municipios verdaderos
fuente_0_sipdus_2306_varias_localidades |> openxlsx::write.xlsx("../Ocultos/obras_varias_localidades_mismos_municipios.xlsx")
fuente_0_sipdus_2306_varias_localidades_y_varios_municipios |> openxlsx::write.xlsx("../Ocultos/obras_varias_localidades_varios_municipios.xlsx")
fuente_0_sipdus_2306_varios_municipios |> openxlsx::write.xlsx("../Ocultos/obras_varios_municipios_sin_localidades.xlsx")
##Entonces nos da un total de :

library(dplyr)
library(tidyr)
library(rlang)

separar_por_comas_dado_campo <- function(df, campo) {
  campo_sym <- rlang::sym(campo)
  
  original_campo_name <- paste0(campo, "_original")
  
  df_processed <- df |>
    dplyr::mutate(!!original_campo_name := !!campo_sym) |>
    dplyr::mutate(!!campo_sym := gsub(pattern = " y ", replacement = ",", x = !!campo_sym)) |>
    tidyr::separate_rows(!!campo_sym, sep = ",") |>
    dplyr::filter(!is.na(!!campo_sym),
                  !!campo_sym != '',
                  !!campo_sym != '.',
                  !!campo_sym != ' ') |>
    dplyr::mutate(!!campo_sym := trimws(!!campo_sym))
  
  return(df_processed)
}

fuente_0_sipdus_2306_varias_localidades_separadas=separar_por_comas_dado_campo(df=fuente_0_sipdus_2306_varias_localidades,campo="Localidad")
fuente_0_sipdus_2306_varios_municipios_separados=separar_por_comas_dado_campo(df=fuente_0_sipdus_2306_varios_municipios,campo="Municipio")
fuente_0_sipdus_2306_varias_localidades_y_varios_municipios_separados_por_localidades=separar_por_comas_dado_campo(
  df=fuente_0_sipdus_2306_varias_localidades_y_varios_municipios,
  campo="Localidad")

##Entonces nos queda final: 
fuente_1=plyr::rbind.fill(fuente_0_sipdus_2306_simples,fuente_0_sipdus_2306_varias_localidades_separadas,
                 fuente_0_sipdus_2306_varios_municipios_separados,fuente_0_sipdus_2306_varias_localidades_y_varios_municipios_separados_por_localidades)
fuente_1$ID_OBRA=paste0(fuente_1$No.,"_",fuente_1$Municipio,"_",fuente_1$Localidad)
##############

fuente_1$ID_OBRA |> unique() |> length()
fuente_1 |> nrow()

##############
