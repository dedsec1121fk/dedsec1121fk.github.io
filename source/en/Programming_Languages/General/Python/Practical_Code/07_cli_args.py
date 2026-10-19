import argparse
parser = argparse.ArgumentParser(description="Offline word counter")
parser.add_argument("text", nargs="?", default="Keep Programing Alive")
args = parser.parse_args()
print("Words:", len(args.text.split()))
