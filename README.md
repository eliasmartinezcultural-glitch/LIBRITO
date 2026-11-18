# Biblioteca Digital Chañarense

Proyecto independiente de **Ocarina Producciones** dedicado a reunir y ofrecer documentos completos relacionados con San Patricio del Chañar, Neuquén, Argentina.

## Identidad y propósito

LIBRITO es una biblioteca de archivos, no un buscador, directorio, portal de noticias ni catálogo de enlaces. Su misión es facilitar el acceso y la conservación de documentos que permiten conocer la historia, memoria, cultura, instituciones y territorio local.

La experiencia debe ser cálida, editorial, clara y especialmente sencilla desde un teléfono. El visitante debe poder reconocer qué contiene la biblioteca, encontrar un documento y abrirlo o descargarlo sin pasos innecesarios.

## Regla pública innegociable

La colección pública contiene exclusivamente documentos PDF que se pueden leer en su totalidad, descargar directamente desde esta biblioteca, imprimir y conservar con sus créditos, autoría y procedencia.

No se publican videos, audios, enlaces externos, referencias a materiales que no estén disponibles como archivo, fichas de obras pendientes ni contenido incompleto.

La biblioteca no crea, reescribe, resume ni modifica obras ajenas. La atribución no reemplaza el permiso: antes de alojar y ofrecer una copia debe existir una licencia o autorización válida para su redistribución, o una base jurídica documentada.

## Colección actual

Hay **2 documentos PDF publicados**:
1. Carta Orgánica Municipal de San Patricio del Chañar (2006, 44 páginas).
2. Ordenanza Municipal 1536/25 y Decreto Municipal 2253/2025 (3 páginas).

Ambos originales están alojados en la carpeta documentos, tienen SHA-256 registrado y ofrecen lectura, descarga e impresión desde la portada. Los candidatos restantes siguen fuera de la colección hasta cumplir las mismas verificaciones.

## Investigación documental ampliada

El inventario interno alcanza 36 registros (CND-001 a CND-036). Se incorporaron seis nuevas líneas de investigación normativa: ediciones 4435 y 4466 del Boletín Oficial; Ordenanzas 1442/24, 1533/25, 1445/24 y 1479/25. Estos materiales están identificados, no publicados. Los boletines completos requieren revisión de derechos, datos personales y anexos; se prioriza recuperar los documentos normativos individuales.

Documentación interna de crecimiento y control:
- MAPA-DE-COLECCION.md: líneas temáticas, prioridades y fuentes de investigación.
- PROTOCOLO-DE-PUBLICACION.md: recepción, integridad, derechos, privacidad y publicación.
- MODELO-DE-AUTORIZACION.md: modelo orientativo para solicitar permisos a autores y titulares.

## Arquitectura

- index.html: portada pública principal.
- catalogo.json: fuente única de los metadatos públicos.
- web/estilos.css: sistema visual responsive.
- web/biblioteca.js: buscador, filtros y fichas documentales.
- web/index.html: vista secundaria sincronizada para la carpeta web.
- documentos/: originales PDF completos autorizados para descarga.
- scripts/validar_biblioteca.py: controles automáticos de integridad, rutas, permisos y enlaces externos.
- INVENTARIO-MAESTRO.csv: registro interno de investigación y estados; no se muestra en la portada pública.
- LEY-MUNDIAL.md: criterios jurídicos y de publicación.

## Organización temática prevista

Las categorías son una herramienta de navegación, no una promesa de que ya existan materiales publicados: Historia y memoria; Normativa y documentos públicos; Cultura y patrimonio; Educación y conocimiento; Informes y estadísticas; Territorio y cartografía; Hemeroteca y prensa; Libros y publicaciones.

Una categoría solo aparece como filtro cuando tiene documentos publicados.

## Estados documentales

1. Identificado: existe evidencia de que la obra o documento existe.
2. Archivo recuperado: se obtuvo una copia completa.
3. Verificado: se revisaron integridad, legibilidad, páginas, autoría y procedencia.
4. Autorizado: existe una licencia o permiso de redistribución, o base jurídica suficiente y registrada.
5. Publicado: el PDF local está incorporado al catálogo, validado y disponible.

Solo el estado Publicado aparece en la web. Un archivo encontrado en internet no se considera automáticamente libre para redistribuir.

## Incorporación de un archivo

1. Recuperar el documento completo y original desde una fuente legítima.
2. Comprobar que sea legible, íntegro y apto para impresión.
3. Verificar autoría, créditos, institución, fecha y procedencia.
4. Confirmar licencia o permiso de redistribución.
5. Guardarlo sin alteraciones en documentos/.
6. Incorporarlo a catalogo.json con metadatos suficientes.
7. Registrar SHA-256 y número de páginas.
8. Probar lectura, descarga e impresión desde celular y computadora.
9. Ejecutar python3 scripts/validar_biblioteca.py.

La publicación debe detenerse si falta el archivo, no coincide el hash, no se confirma la autorización o el documento no es un PDF local.

## Principios de experiencia

- Primero los documentos, no la decoración.
- Una búsqueda visible y filtros comprensibles.
- Títulos legibles y datos bibliográficos claros.
- Dos acciones principales: leer/imprimir y descargar.
- Créditos y procedencia accesibles en cada ficha.
- Diseño adaptable a celulares, pantallas pequeñas y escritorio.
- Sin cuentas, formularios, rastreadores ni dependencias externas para mostrar el catálogo.
- Sin páginas vacías ni categorías que aparenten contenido inexistente.

**La biblioteca solo anuncia lo que efectivamente entrega: archivos completos, accesibles y autorizados.**