#!/usr/bin/env python3
"""Valida estructura, integridad básica y lectura técnica de los PDF públicos de LIBRITO."""
import hashlib
import json
import re
import sys
from pathlib import Path
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "catalogo.json"
DOCS = ROOT / "documentos"
errors = []

def fail(message):
    errors.append(message)

try:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
except Exception as exc:
    print(f"ERROR: no se pudo leer catalogo.json: {exc}")
    sys.exit(1)

documents = catalog.get("documentos")
if not isinstance(documents, list):
    fail("catalogo.json debe contener una lista 'documentos'.")
    documents = []

seen_ids = set()
listed_files = set()

for number, item in enumerate(documents, start=1):
    prefix = f"Documento #{number}"
    if not isinstance(item, dict):
        fail(f"{prefix}: registro inválido.")
        continue

    required = ("id", "titulo", "autoria", "institucion", "fecha",
                "categoria", "descripcion", "formato", "archivo",
                "estado", "autorizacion", "sha256", "procedencia",
                "integridad")
    for field in required:
        if not item.get(field):
            fail(f"{prefix}: falta el campo '{field}'.")

    doc_id = item.get("id")
    if doc_id in seen_ids:
        fail(f"{prefix}: ID duplicado '{doc_id}'.")
    seen_ids.add(doc_id)

    path_value = item.get("archivo", "")
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

    if item.get("formato", "").upper() != "PDF":
        fail(f"{prefix}: el formato público debe ser PDF.")
    if item.get("estado") != "Publicado":
        fail(f"{prefix}: solo se permite estado 'Publicado'.")

    authorization = item.get("autorizacion")
    if not isinstance(authorization, dict):
        fail(f"{prefix}: falta el objeto de autorización.")
    else:
        if authorization.get("estado") != "confirmada":
            fail(f"{prefix}: la autorización debe estar confirmada.")
        if not authorization.get("base") or not authorization.get("referencia"):
            fail(f"{prefix}: la autorización debe documentar base y referencia.")

    try:
        reader = PdfReader(str(file_path), strict=True)
        if reader.is_encrypted:
            fail(f"{prefix}: el PDF está cifrado y no es de acceso directo.")
        page_count = len(reader.pages)
        if page_count < 1:
            fail(f"{prefix}: el PDF no contiene páginas.")
        declared_pages = item.get("paginas")
        if declared_pages is not None and declared_pages != page_count:
            fail(f"{prefix}: el catálogo declara {declared_pages} páginas, pero el PDF tiene {page_count}.")
    except Exception as exc:
        fail(f"{prefix}: no se pudo leer la estructura del PDF: {exc}")

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
    if re.search(r"""(?:href|src)\s*=\s*["']https?://""", page, re.I):
        fail(f"{relative}: la portada pública contiene enlaces externos.")
    if re.search(r"<\s*(?:video|iframe|audio)\b", page, re.I):
        fail(f"{relative}: la portada no puede incluir videos, audio ni iframes.")

if (ROOT / "fuentes.html").exists():
    fail("No debe existir una página pública de enlaces externos llamada fuentes.html.")

if errors:
    print("VALIDACIÓN FALLIDA:")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print(f"VALIDACIÓN CORRECTA: {len(documents)} PDF publicados; estructura PDF, páginas, hash, metadatos y controles públicos aprobados.")
print("Nota: la autorización jurídica y la legibilidad visual siguen requiriendo revisión humana.")
