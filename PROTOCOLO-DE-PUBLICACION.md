# Protocolo de recepción, verificación y publicación de documentos

Uso interno de Biblioteca Digital Chañarense — Ocarina Producciones.

## A. Recepción

Registrar cada material como candidato en INVENTARIO-MAESTRO.csv. No subirlo todavía a la carpeta pública documentos/.

Datos mínimos:
- Título exacto.
- Autor, organismo o institución responsable.
- Fecha, edición y versión.
- Tipo de documento.
- Número de páginas o extensión.
- Fuente original.
- Titular de derechos.
- Licencia o autorización conocida.
- Relación concreta con San Patricio del Chañar.

Si falta un dato, escribir “No determinado”; nunca completarlo por intuición.

## B. Control de integridad

Para cada PDF:
1. Recuperar el archivo original desde una fuente legítima.
2. Comprobar que la descarga finalice correctamente.
3. Confirmar firma binaria PDF (%PDF-).
4. Abrir y recorrer todas las páginas.
5. Comprobar que no falten páginas, anexos, tablas, planos o firmas.
6. Comprobar que el texto sea legible y que las páginas puedan imprimirse.
7. Revisar orientación, recortes, páginas en blanco y errores de digitalización.
8. Registrar número de páginas, tamaño y SHA-256.
9. Conservar el archivo original sin reescribir, resumir, recomponer ni alterar.

Un PDF con texto extraíble no necesariamente está completo; una imagen escaneada puede ser válida si se lee e imprime bien.

## C. Control de derechos y privacidad

No confundir:
- Acceso público con permiso de redistribución.
- Descarga personal con permiso de publicación en otra plataforma.
- Crédito de autor con autorización.
- Publicación institucional con titularidad exclusiva del organismo.
- Norma oficial con fotografías, mapas, ilustraciones o anexos de terceros.

Confirmar la base jurídica o autorización escrita antes de alojar el archivo. En obras mixtas, revisar los derechos de cada componente. Si hay datos personales, domicilios, DNI, firmas manuscritas u otra información identificatoria, evaluar si corresponde publicar, solicitar una versión pública o excluir el documento.

No ocultar ni editar datos dentro de un original para hacerlo publicable. Si se necesita una versión pública, debe obtenerse del organismo emisor o titular autorizado y catalogarse como tal.

## D. Metadatos públicos

Cada registro publicado debe incluir:
- Título completo y fiel.
- Autoría y organismo responsable.
- Fecha y edición.
- Categoría.
- Descripción breve, objetiva y sin interpretaciones no documentadas.
- Formato PDF.
- Ruta local de archivo.
- Estado Publicado.
- Autorización confirmada y fundamento.
- Procedencia.
- Integridad, cantidad de páginas y SHA-256.

No incluir en la ficha pública una URL externa como sustituto del archivo.

## E. Publicación

1. Guardar el PDF completo en documentos/.
2. Agregar metadatos a catalogo.json.
3. Agregar o actualizar su fila en INVENTARIO-MAESTRO.csv.
4. Ejecutar scripts/validar_biblioteca.py.
5. Comprobar que no existan archivos PDF sin catálogo ni registros sin archivo.
6. Revisar la ficha desde un teléfono y una computadora.
7. Abrir el PDF y probar descarga e impresión.
8. Verificar que el despliegue de GitHub Pages haya finalizado.

## F. Estados

- Identificado: se conoce la existencia de la obra.
- Archivo recuperado: se obtuvo una copia.
- Verificado: integridad y legibilidad comprobadas.
- Autorizado: redistribución confirmada.
- Publicado: archivo alojado, catalogado y validado.

La web pública solo puede mostrar registros en estado Publicado.

## G. Motivos de rechazo o pausa

- Fuente no verificable.
- Archivo incompleto o ilegible.
- Falta de anexos.
- Derechos inciertos o licencia restrictiva.
- Datos personales sin evaluación.
- Archivo modificado o reconstruido sin autorización.
- Duplicado sin justificación.
- Documento ajeno al alcance territorial y editorial de la biblioteca.

## H. Principio editorial

No llenar estanterías con fichas vacías. No anunciar descargas que no existen. No convertir un enlace en un archivo. No sacrificar derechos, integridad o privacidad para aumentar el contador.

La calidad de la biblioteca se mide por la confianza que merece cada PDF publicado.
