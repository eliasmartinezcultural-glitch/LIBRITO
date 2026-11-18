# Biblioteca Digital Chañarense

Proyecto independiente de **Ocarina Producciones**, dedicado a reunir y facilitar la descarga directa de documentos y obras preexistentes relacionados con San Patricio del Chañar, Neuquén, Argentina.

## Regla fundamental

**La biblioteca no crea archivos: reúne obras terminadas.**

No escribe ni modifica obras de terceros. Cada archivo debe conservar su integridad, autoría, créditos y procedencia. La atribución no reemplaza el permiso: solo se publican descargas cuando existe una base válida para redistribuirlas.

Leé la [Ley Mundial](LEY-MUNDIAL.md) antes de incorporar cualquier material.

## Estado documental — 18 de noviembre de 2026

- **20 registros identificados** en el relevamiento ampliado de obras y documentos vinculados con San Patricio del Chañar.
- **0** archivos recuperados y verificados localmente en esta ampliación.
- **0** autorizaciones de redistribución confirmadas en esta ampliación.
- **0 obras nuevas publicadas** para descarga.

El relevamiento ampliado está en [RELEVAMIENTO-20-OBRAS-CHANARENSES.md](RELEVAMIENTO-20-OBRAS-CHANARENSES.md). Se incorporaron siete nuevas fuentes oficiales al [INVENTARIO-MAESTRO.csv](INVENTARIO-MAESTRO.csv), documentadas en [RECURSOS-OFICIALES.md](RECURSOS-OFICIALES.md) y presentadas en la página [Fuentes documentales](fuentes.html). Los registros son investigación y consulta en origen: no forman parte de la colección pública ni deben anunciarse como descargas alojadas por la biblioteca.

## Sitio web

La portada pública está en `index.html`. GitHub Pages debe configurarse para publicar desde la rama `main`, carpeta `/(root)`. La interfaz también se conserva en `web/` como copia de trabajo.

## Estados de cada documento

Identificado → Archivo recuperado → Verificado → Autorizado → Publicado.

Solo los documentos en estado **Publicado**, con autorización confirmada y archivo local dentro de `documentos/`, aparecen como descargables.

## Estructura

- `LEY-MUNDIAL.md`: reglas obligatorias.
- `CANDIDATOS-INICIALES.md`: primer relevamiento de materiales existentes.
- `RELEVAMIENTO-20-OBRAS-CHANARENSES.md`: veinte obras y producciones identificadas.
- `RECURSOS-OFICIALES.md`: fuentes primarias y recursos oficiales verificados.
- `fuentes.html`: página pública para consultar los originales en sus organismos de origen.
- `INVENTARIO-MAESTRO.csv`: seguimiento documental.
- `catalogo.json`: catálogo público; permanece vacío hasta que existan obras autorizadas.
- `index.html`: portada para GitHub Pages.
- `web/`: interfaz y archivos de trabajo.
- `documentos/`: archivos originales autorizados para descarga.

## Incorporación documental

1. Comprobar existencia y relevancia territorial.
2. Recuperar el archivo completo desde una fuente identificable.
3. Revisar integridad, legibilidad, metadatos y correspondencia.
4. Documentar licencia o autorización válida para alojar y distribuir.
5. Guardar una copia fiel en `documentos/` y calcular SHA-256.
6. Incorporar el registro a `catalogo.json` con `estado: "Publicado"` y `autorizacion.estado: "confirmada"`.
7. Probar la descarga desde el sitio publicado.

No se contabilizan referencias, enlaces externos, fichas sin archivo, archivos parciales ni materiales con derechos pendientes como parte de la colección pública.

**La prioridad es la autenticidad, integridad, pertinencia y situación legal; nunca inflar el volumen de la colección.**
