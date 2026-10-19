import unicodedata

def normalize(text: str) -> str:
    decomposed = unicodedata.normalize("NFD", text.casefold())
    return "".join(c for c in decomposed if not unicodedata.combining(c))

if __name__ == "__main__":
    assert normalize("ΣΥΝΑΡΤΗΣΗ") == normalize("συναρτηση")
    print(normalize("Προγραμματισμός PYTHON"))
