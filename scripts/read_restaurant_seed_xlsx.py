from __future__ import annotations

import json
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path


NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
    "docrel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}


def col_to_index(ref: str) -> int:
    letters = "".join(ch for ch in ref if ch.isalpha())
    value = 0
    for ch in letters:
        value = value * 26 + (ord(ch.upper()) - 64)
    return value - 1


def parse_shared_strings(archive: zipfile.ZipFile) -> list[str]:
    try:
        data = archive.read("xl/sharedStrings.xml")
    except KeyError:
        return []

    root = ET.fromstring(data)
    values: list[str] = []
    for item in root.findall("main:si", NS):
        text_nodes = item.findall(".//main:t", NS)
        values.append("".join(node.text or "" for node in text_nodes))
    return values


def find_sheet_path(archive: zipfile.ZipFile, target_name: str) -> str:
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    rel_map = {
        rel.attrib["Id"]: rel.attrib["Target"] for rel in rels.findall("rel:Relationship", NS)
    }

    for sheet in workbook.findall("main:sheets/main:sheet", NS):
        if sheet.attrib.get("name") != target_name:
            continue
        rel_id = sheet.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
        if not rel_id or rel_id not in rel_map:
            break
        target = rel_map[rel_id].lstrip("/")
        return target if target.startswith("xl/") else f"xl/{target}"

    raise SystemExit(f'Sheet "{target_name}" not found in workbook.')


def cell_value(cell: ET.Element, shared_strings: list[str]) -> str | None:
    cell_type = cell.attrib.get("t")

    if cell_type == "inlineStr":
        text_nodes = cell.findall(".//main:t", NS)
        return "".join(node.text or "" for node in text_nodes)

    value_node = cell.find("main:v", NS)
    if value_node is None or value_node.text is None:
        return None

    raw_value = value_node.text
    if cell_type == "s":
        return shared_strings[int(raw_value)]

    return raw_value


def load_rows(workbook_path: Path) -> list[dict[str, str | None]]:
    with zipfile.ZipFile(workbook_path) as archive:
        shared_strings = parse_shared_strings(archive)
        sheet_path = find_sheet_path(archive, "Restaurants")
        worksheet = ET.fromstring(archive.read(sheet_path))

    rows: list[list[str | None]] = []
    for row in worksheet.findall("main:sheetData/main:row", NS):
        values: list[str | None] = []
        for cell in row.findall("main:c", NS):
            ref = cell.attrib.get("r", "")
            col_index = col_to_index(ref)
            while len(values) <= col_index:
                values.append(None)
            values[col_index] = cell_value(cell, shared_strings)
        rows.append(values)

    if not rows:
        return []

    headers = [value.strip() if isinstance(value, str) else "" for value in rows[0]]
    output: list[dict[str, str | None]] = []
    for row in rows[1:]:
        entry: dict[str, str | None] = {}
        for index, header in enumerate(headers):
            if not header:
                continue
            entry[header] = row[index] if index < len(row) else None
        output.append(entry)
    return output


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: read_restaurant_seed_xlsx.py <workbook-path>")

    workbook_path = Path(sys.argv[1])
    rows = load_rows(workbook_path)
    print(json.dumps(rows))


if __name__ == "__main__":
    main()
