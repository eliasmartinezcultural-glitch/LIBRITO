# Hemeroteca de LIBRITO · criterios y expansión

## Misión

Reunir referencias a noticias publicadas por diarios y medios de comunicación que mencionen expresamente a San Patricio del Chañar, aunque la nota también trate asuntos provinciales, regionales o nacionales. La Hemeroteca conserva memoria periodística: no reemplaza a los diarios ni pretende apropiarse de sus artículos.

## Qué se registra

Cada ficha conserva, cuando el medio lo informa:
- título exacto de la noticia;
- fecha de publicación;
- nombre del diario o medio;
- autor o firma;
- enlace a la noticia original o a la página digitalizada;
- descripción breve, redactada por LIBRITO, que permite saber por qué sirve para investigar;
- etiquetas temáticas para búsquedas;
- tipo de acceso (artículo web o página de diario digitalizada).

No se copia el texto completo, las fotografías, las páginas ni los PDF de los medios. El registro bibliográfico y la descripción no reemplazan la consulta de la fuente. Si el enlace se rompe, se conserva la referencia y se busca una copia autorizada o una alternativa institucional; nunca se suplanta el artículo con una transcripción no autorizada.

## Primer relevamiento incorporado

La primera versión contiene 30 noticias con fecha entre 1999 y 2026, localizadas en:
- Diario Río Negro.
- La Mañana de Neuquén.

Se detectaron noticias sobre aniversarios, historia de pioneros, fruticultura, vitivinicultura, huertas familiares, clima y heladas, educación, escuelas, cuidado infantil, trabajo rural, política municipal, vivienda, territorio, ambiente, participación ciudadana y cambios productivos.

Este primer conjunto es una **base inicial comprobada**, no una afirmación de que estén reunidas todas las noticias históricas existentes. El índice debe crecer mediante búsquedas por año, medio, tema y variantes del topónimo: “San Patricio del Chañar”, “El Chañar”, “Chañar”, “localidad”, “colonia”, “chacras”, “Tratayén” y nombres de instituciones locales. Una mención a otra localidad o a un paraje cercano solo se incorpora si el texto establece una relación concreta con San Patricio del Chañar.

## Fuentes y rutas de investigación

1. **Diario Río Negro** — archivo de noticias y páginas históricas. La búsqueda inicial permitió localizar notas desde 1999 y ampliar el período hasta 2026: https://www.rionegro.com.ar/
2. **La Mañana de Neuquén** — archivo web y páginas digitalizadas en PDF: https://www.lmneuquen.com/
3. **Hemeroteca Digital de la Biblioteca Nacional Mariano Moreno** — herramienta de búsqueda simple y avanzada, índice alfabético por título y fascículos digitalizados. La Biblioteca informa una colección de 415 títulos y más de 150.000 fascículos al inicio del proyecto; algunos títulos son de acceso libre y otros restringidos. https://hemerotecadigital.bn.gob.ar/
4. **Acceso libre a diarios y periódicos provinciales o locales de la Biblioteca Nacional** — la institución informó en agosto de 2026 la apertura de nuevas colecciones locales/provinciales luego de analizar su situación de derechos. Esto ofrece una ruta para encontrar prensa regional, sin asumir que todos los títulos neuquinos estén disponibles. https://www.bn.gov.ar/noticias/hemeroteca-digital-acceso-libre-a-las-colecciones-de-diarios-y-periodicos-de-circulacion-provincial-o-local
5. **Mapa de la prensa argentina digitalizada (siglos XIX y XX), CONICET** — inventario de prensa histórica digitalizada en repositorios nacionales e internacionales. https://ri.conicet.gov.ar/items/2e584664-866a-45f9-bd5e-4e8b1a618dc8
6. **Hemeroteca Pública José Hernández de la Legislatura porteña** — repositorio de publicaciones periódicas y artículos digitalizados; puede orientar búsquedas temáticas y consultas documentales. https://hemeroteca.legislatura.gob.ar/
7. **Biblioteca del Congreso de la Nación** — colecciones nacionales y provinciales, índices temáticos y consulta de microfilms. https://bcn.gob.ar/salas-y-horarios/hemeroteca-diarios

## Cómo leer críticamente una noticia

Una noticia es una fuente histórica, pero no es automáticamente una descripción neutral ni una prueba definitiva. Para trabajos y presentaciones se recomienda:
- distinguir información reportada, declaraciones de entrevistados, opinión editorial y notas firmadas;
- comparar noticias del mismo acontecimiento publicadas por distintos medios;
- contrastar fechas, nombres, cifras y decisiones con ordenanzas, decretos, censos, archivos escolares y documentos institucionales;
- conservar la fecha original de publicación y no presentar una noticia antigua como situación actual;
- no confundir una noticia que menciona al Chañar con una investigación integral sobre la localidad.

## Regla de derechos y preservación

La noticia completa se abre en el sitio del medio. LIBRITO no reproduce artículos periodísticos ni imágenes protegidas. Para preservar una copia local de una página impresa o PDF de diario se necesita permiso, licencia aplicable o una base jurídica comprobada. El crédito es obligatorio, pero no sustituye el permiso de reproducción.

## Cómo sumar una nueva ficha

Añadir un registro a `hemeroteca.json` con ID único, título, fecha AAAA-MM-DD, medio, autoría disponible, descripción original breve, URL HTTP/HTTPS, etiquetas, tipo y estado `enlace_al_original`. No introducir texto completo de la nota ni imágenes copiadas. Verificar manualmente que la noticia mencione realmente a San Patricio del Chañar, que la fecha corresponda a la publicación y que el enlace abra el original. Ejecutar después `python scripts/validar_biblioteca.py`.

## Separación de fondos

- `catalogo.json`: libros, documentos, investigaciones, mapas, publicaciones y materiales de consulta.
- `hemeroteca.json`: noticias y páginas periodísticas.
- **Listos para descargar:** archivos completos alojados por LIBRITO y verificados.
- **Listos para leer:** obras consultables en sus fuentes originales.
- **Hemeroteca:** índice de noticias por fecha, medio y tema.

No sumar una noticia a la biblioteca general solo por tener un enlace. Mantenerla en Hemeroteca y, si aporta valor bibliográfico especial, relacionarla desde una ficha documental sin duplicar el registro.
