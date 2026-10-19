import json
from pathlib import Path
path = Path(__file__).resolve().parent / "example_output" / "settings.json"
path.parent.mkdir(exist_ok=True)
payload = {"language": "en", "themes": ["dark", "light"], "autostart": False}
path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
data = json.loads(path.read_text(encoding="utf-8"))
assert data["autostart"] is False
print(data)
