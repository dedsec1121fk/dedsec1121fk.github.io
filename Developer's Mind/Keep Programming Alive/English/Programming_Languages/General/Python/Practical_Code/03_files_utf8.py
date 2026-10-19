# All files are created in a local demo folder
from pathlib import Path
root = Path(__file__).resolve().parent / "example_output"
root.mkdir(exist_ok=True)
path = root / "hello.txt"
path.write_text("Καλημέρα / Hello\n", encoding="utf-8")
print(path.read_text(encoding="utf-8"))
