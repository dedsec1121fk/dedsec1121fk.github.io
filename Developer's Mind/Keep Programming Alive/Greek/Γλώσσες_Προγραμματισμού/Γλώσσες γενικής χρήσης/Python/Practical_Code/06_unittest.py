import unittest

def normalize_title(value: str) -> str:
    return " ".join(value.strip().split())

class TitleTests(unittest.TestCase):
    def test_whitespace(self):
        self.assertEqual(normalize_title("  DedSec    Project "), "DedSec Project")

if __name__ == "__main__":
    unittest.main()
