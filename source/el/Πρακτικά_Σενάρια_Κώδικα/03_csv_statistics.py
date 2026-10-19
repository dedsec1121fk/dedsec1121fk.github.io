import csv
import io
import statistics

def summarize(text: str):
    valid, invalid = [], []
    for n, row in enumerate(csv.DictReader(io.StringIO(text)), 2):
        try:
            valid.append(float(row['score']))
        except (KeyError, ValueError, TypeError):
            invalid.append(n)
    return {'count': len(valid), 'mean': statistics.mean(valid) if valid else None, 'bad_lines': invalid}

if __name__ == '__main__':
    report = summarize('name,score\nAda,10\nGrace,20\nLin,invalid\n')
    assert report == {'count': 2, 'mean': 15.0, 'bad_lines': [4]}
    print(report)
