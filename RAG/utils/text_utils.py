import re 

def is_page_number(line):
    line = line.strip()

    # số thường
    if re.fullmatch(r'\d+', line):
        return True

    # số La Mã
    if re.fullmatch(r'[ivxlcdm]+', line.lower()):
        return True

    return False



def remove_page_numbers(text):
    lines = text.split("\n")

    cleaned = [
        line for line in lines
        if not is_page_number(line)
    ]

    return "\n".join(cleaned)
