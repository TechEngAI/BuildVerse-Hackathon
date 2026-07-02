import re
import csv
import json

def parse_summary_file(path, ministry_name):
    """Parses a sector MDA summary table text file.
    Row pattern: N. CODE   MDA NAME (may wrap across lines)   PERSONNEL OVERHEAD CAPITAL TOTAL
    """
    with open(path, encoding="utf-8") as f:
        text = f.read()

    # Remove page break / header noise lines
    noise_patterns = [
        r"Federal Republic of Nigeria.*APPROPRIATION ACT",
        r"Federal Government of Nigeria",
        r"^\s*EXPENDITURE\s*$",
        r"^\s*TOTAL\s*$",
        r"NO\s+CODE\s+MDA\s+PERSONNEL\s+OVERHEAD\s+CAPITAL",
        r"^\s*ALLOCATION\s*$",
        r"NATIONAL ASSEMBLY.*APPROPRIATION ACT",
        r"^\s*\d{4}\s*$",  # stray "2025" lines
    ]
    lines = text.split("\n")
    clean_lines = []
    for line in lines:
        if any(re.search(p, line) for p in noise_patterns):
            continue
        if line.strip() == "":
            continue
        clean_lines.append(line)

    joined = "\n".join(clean_lines)

    # Regex: row number, code, then name+numbers (name may span multiple lines,
    # numbers are the last 4 comma-formatted integers before next row or end)
    row_re = re.compile(
        r"(\d+)\.\s*(\d{4,10})\s*(.*?)\s*"
        r"([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)(?=\s*\n\d+\.|\s*$)",
        re.DOTALL
    )

    results = []
    for m in row_re.finditer(joined):
        row_no, code, name, personnel, overhead, capital, total = m.groups()
        name = re.sub(r"\s+", " ", name).strip()
        # skip if name accidentally empty
        if not name:
            continue
        def num(x):
            return int(x.replace(",", ""))
        results.append({
            "ministry": ministry_name,
            "mda_code": code,
            "line_item": name,
            "personnel_ngn": num(personnel),
            "overhead_ngn": num(overhead),
            "capital_ngn": num(capital),
            "allocated_ngn": num(total),
        })
    return results


if __name__ == "__main__":
    all_rows = []
    all_rows += parse_summary_file("presidency_summary.txt", "Presidency")
    all_rows += parse_summary_file("education_summary.txt", "Federal Ministry of Education")
    all_rows += parse_summary_file("health_summary.txt", "Federal Ministry of Health and Social Welfare")

    print(f"Parsed {len(all_rows)} MDA rows total")
    for r in all_rows[:5]:
        print(r)

    with open("parsed_mda_rows.json", "w") as f:
        json.dump(all_rows, f, indent=2)
