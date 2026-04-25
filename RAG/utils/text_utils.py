"""Text processing utilities for PDF documents."""

import re 


def is_page_number(line):
    """Check if a line is a page number (Arabic or Roman numerals)."""
    line = line.strip()

    # số thường (regular numbers)
    if re.fullmatch(r'\d+', line):
        return True

    # số La Mã (Roman numerals)
    if re.fullmatch(r'[ivxlcdm]+', line.lower()):
        return True

    return False


def remove_page_numbers(text):
    """Remove page number lines from text."""
    lines = text.split("\n")

    cleaned = [
        line for line in lines
        if not is_page_number(line)
    ]

    return "\n".join(cleaned)


def remove_headers_footers(text, repeated_lines):
    """Remove header and footer lines from text."""
    lines = text.split("\n")
    cleaned = [
        line for line in lines
        if line.strip() not in repeated_lines
    ]
    return "\n".join(cleaned)


def is_toc_page_by_density(page_text, structured_toc, threshold=5):
    count = 0
    for title, _ in structured_toc:
        if title in page_text:
            count += 1
    return count >= threshold