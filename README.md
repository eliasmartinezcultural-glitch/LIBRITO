# Biblioteca Digital Chañarense

Proyecto independiente de **Ocarina Producciones**, dedicado a reunir y facilitar la descarga directa de documentos y obras preexistentes relacionados con San Patricio del Chañar, Neuquén, Argentina.

## Regla fundamental

**La biblioteca no crea archivos: reúne obras terminadas.**

No escribe ni modifica obras de terceros. Cada archivo debe conservar su integridad, autoría, créditos y procedencia. La atribución no reemplaza el permiso: solo se publican descargas cuando existe una base válida para redistribuirlas.

Leé la [Ley Mundial](LEY-MUNDIAL.md) antes de incorporar cualquier material.

## Sitio web

La portada pública está en `index.html`. GitHub Pages debe configurarse para publicar desde la rama `main`, carpeta `/(root)`. La interfaz también se conserva en `web/` como copia de trabajo.

## Estados de cada documento

Identificado → Archivo recuperado → Verificado → Autorizado → Publicado.

Solo los documentos en estado **Publicado**, con autorización confirmada y archivo local dentro de `documentos/`, aparecen como descargables.

## Estructura

- `LEY-MUNDIAL.md`: reglas obligatorias.
- `INVENTARIO-MAESTRO.csv`: seguimiento de candidatos y documentos.
- `catalogo.json`: catálogo público; comienza vacío.
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

**Estado inicial:** estructura de trabajo. No hay obras publicadas todavía.
