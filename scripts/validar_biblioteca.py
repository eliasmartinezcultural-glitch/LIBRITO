#!/usr/bin/env python3
"""Valida el catálogo mixto de LIBRITO y la integridad de los PDF alojados."""
import hashlib
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "catalogo.json"
DOCS = ROOT / "documentos"
ERRORS = []

def fail(message):
    ERRORS.append(message)

def valid_url(value):
    if not isinstance(value, str) or not value.strip():
        return False
    try:
        parsed = urlparse(value)
        return parsed.scheme in ("http", "https") and bool(parsed.hostname) and not parsed.username and not parsed.password
    except ValueError:
        return False

try:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
except Exception as exc:
    print(f"ERROR: no se pudo leer catalogo.json: {exc}")
    sys.exit(1)

documents = catalog.get("documentos")
if not isinstance(documents, list):
    fail("catalogo.json debe contener una lista 'documentos'.")
    documents = []

allowed_formats = {"PDF", "JPG", "JPEG", "PNG", "WEBP", "MAPA"}
allowed_categories = set(catalog.get("categorias", []))
seen_ids = set()
listed_files = set()
local_count = 0
external_count = 0

for number, item in enumerate(documents, start=1):
    prefix = f"Documento #{number}"
    if not isinstance(item, dict):
        fail(f"{prefix}: registro inválido.")
        continue

    required = ("id", "titulo", "autoria", "institucion", "fecha",
                "categoria", "descripcion", "formato", "estado",
                "autorizacion", "procedencia", "integridad")
    for field in required:
        if not item.get(field):
            fail(f"{prefix}: falta el campo '{field}'.")

    doc_id = item.get("id")
    if not isinstance(doc_id, str) or not doc_id.strip():
        fail(f"{prefix}: ID vacío o inválido.")
    elif doc_id in seen_ids:
        fail(f"{prefix}: ID duplicado '{doc_id}'.")
    else:
        seen_ids.add(doc_id)

    if item.get("categoria") not in allowed_categories:
        fail(f"{prefix}: categoría no incluida en catalogo.json.")
    if str(item.get("formato", "")).upper() not in allowed_formats:
        fail(f"{prefix}: formato no permitido.")
    if not isinstance(item.get("autorizacion"), dict) or not item["autorizacion"].get("estado") or not item["autorizacion"].get("base"):
        fail(f"{prefix}: faltan estado o fundamento de uso.")

    state = item.get("estado")
    if state == "Publicado":
        local_count += 1
        path_value = item.get("archivo", "")
        if str(item.get("formato", "")).upper() != "PDF":
            fail(f"{prefix}: los archivos alojados deben ser PDF.")
        if not isinstance(path_value, str) or not re.fullmatch(r"documentos/[A-Za-z0-9._/-]+\.pdf", path_value, re.I):
            fail(f"{prefix}: el archivo debe ser un PDF dentro de documentos/.")
            continue
        if ".." in Path(path_value).parts:
            fail(f"{prefix}: ruta no permitida.")
            continue

        file_path = ROOT / path_value
        listed_files.add(file_path.resolve())
        if not file_path.is_file():
            fail(f"{prefix}: no existe {path_value}.")
            continue

        raw = file_path.read_bytes()
        if not raw.startswith(b"%PDF-"):
            fail(f"{prefix}: el archivo no tiene firma PDF válida.")
            continue
        if len(raw) < 10_000:
            fail(f"{prefix}: el archivo parece incompleto (menos de 10 KB).")

        expected = item.get("sha256", "")
        actual = hashlib.sha256(raw).hexdigest()
        if not re.fullmatch(r"[0-9a-f]{64}", expected, re.I):
            fail(f"{prefix}: SHA-256 ausente o inválido.")
        elif expected.lower() != actual:
            fail(f"{prefix}: SHA-256 no coincide con el archivo.")

        authorization = item.get("autorizacion", {})
        if authorization.get("estado") != "confirmada":
            fail(f"{prefix}: la autorización del archivo alojado debe estar confirmada.")
        if not authorization.get("referencia"):
            fail(f"{prefix}: falta la referencia que fundamenta la autorización.")

        try:
            reader = PdfReader(str(file_path), strict=True)
            if reader.is_encrypted:
                fail(f"{prefix}: el PDF está cifrado.")
            page_count = len(reader.pages)
            if page_count < 1:
                fail(f"{prefix}: el PDF no contiene páginas.")
            declared_pages = item.get("paginas")
            if declared_pages is not None and declared_pages != page_count:
                fail(f"{prefix}: el catálogo declara {declared_pages} páginas, pero el PDF tiene {page_count}.")
        except Exception as exc:
            fail(f"{prefix}: no se pudo leer la estructura del PDF: {exc}")

    elif state == "Disponible en origen":
        external_count += 1
        if item.get("acceso") not in ("origen", "ficha"):
            fail(f"{prefix}: el acceso externo debe ser 'origen' o 'ficha'.")
        if not valid_url(item.get("urlOriginal")):
            fail(f"{prefix}: falta una URL HTTP/HTTPS válida para la fuente original.")
        if item.get("archivo") or item.get("sha256"):
            fail(f"{prefix}: una referencia externa no debe fingir que tiene un archivo local o hash.")
    else:
        fail(f"{prefix}: estado desconocido '{state}'.")

    if item.get("urlFicha") and not valid_url(item.get("urlFicha")):
        fail(f"{prefix}: urlFicha no es una URL HTTP/HTTPS válida.")


# Validación independiente de la hemeroteca periodística
HEMEROTECA = ROOT / "hemeroteca.json"
try:
    hemeroteca = json.loads(HEMEROTECA.read_text(encoding="utf-8"))
    news = hemeroteca.get("noticias")
    if not isinstance(news, list):
        fail("hemeroteca.json debe contener una lista 'noticias'.")
        news = []
    news_ids = set()
    for number, item in enumerate(news, start=1):
        prefix = f"Noticia #{number}"
        if not isinstance(item, dict):
            fail(f"{prefix}: registro inválido.")
            continue
        for field in ("id", "titulo", "fecha", "medio", "descripcion", "url", "derechos"):
            if not item.get(field):
                fail(f"{prefix}: falta el campo '{field}'.")
        news_id = item.get("id")
        if not isinstance(news_id, str) or not news_id.strip():
            fail(f"{prefix}: ID vacío o inválido.")
        elif news_id in news_ids:
            fail(f"{prefix}: ID duplicado '{news_id}'.")
        else:
            news_ids.add(news_id)
        if not re.fullmatch(r"\\d{4}-\\d{2}-\\d{2}", str(item.get("fecha", ""))):
            fail(f"{prefix}: fecha debe tener formato AAAA-MM-DD.")
        if not valid_url(item.get("url")):
            fail(f"{prefix}: URL original inválida.")
        if item.get("estado") != "enlace_al_original":
            fail(f"{prefix}: la noticia debe enlazar al medio original.")
        if item.get("tipo") not in ("articulo_web", "pagina_digitalizada"):
            fail(f"{prefix}: tipo de material periodístico desconocido.")
except Exception as exc:
    fail(f"No se pudo validar hemeroteca.json: {exc}")

actual_files = {p.resolve() for p in DOCS.rglob("*") if p.is_file() and p.suffix.lower() == ".pdf"}
for path in sorted(actual_files - listed_files):
    fail(f"PDF sin registro en catalogo.json: {path.relative_to(ROOT)}")
for path in sorted(listed_files - actual_files):
    fail(f"Registro sin archivo PDF local: {path.relative_to(ROOT)}")

for relative in ("index.html", "web/index.html"):
    page_path = ROOT / relative
    if not page_path.is_file():
        fail(f"No existe la portada {relative}.")
        continue
    page = page_path.read_text(encoding="utf-8")
    if 'name="viewport"' not in page:
        fail(f"{relative}: falta la configuración adaptable para móviles.")
    if re.search(r"""(?:href|src)\s*=\s*["']https?://""", page, re.I):
        fail(f"{relative}: la portada pública contiene enlaces externos.")
    if re.search(r"<\s*(?:video|iframe|audio)\b", page, re.I):
        fail(f"{relative}: la portada no puede incluir videos, audio ni iframes.")
    for element_id in ("contenido", "buscador", "coleccion-lista", "contador", "total-documentos"):
        if f'id="{element_id}"' not in page:
            fail(f"{relative}: falta el elemento necesario #{element_id}.")

if not (ROOT / "web" / "biblioteca.js").is_file():
    fail("Falta web/biblioteca.js.")
if not (ROOT / "web" / "estilos.css").is_file():
    fail("Falta web/estilos.css.")

if ERRORS:
    print("VALIDACIÓN FALLIDA:")
    for error in ERRORS:
        print(f"- {error}")
    sys.exit(1)

print(f"VALIDACIÓN CORRECTA: {len(documents)} materiales; {local_count} PDF locales verificados y {external_count} referencias externas diferenciadas.")
print("Se comprobaron IDs, metadatos, categorías, permisos declarados, enlaces, hashes, estructura y páginas de los PDF, rutas y portadas.")
print("La revisión jurídica, la exactitud histórica y la legibilidad visual requieren control humano.");
