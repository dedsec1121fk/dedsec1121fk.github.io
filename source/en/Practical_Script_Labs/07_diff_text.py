import difflib

def changed(old: str, new: str) -> str:
    return ''.join(difflib.unified_diff(old.splitlines(True), new.splitlines(True), fromfile='old', tofile='new'))

if __name__ == '__main__':
    result = changed('one\ntwo\n', 'one\nthree\n')
    assert '-two' in result and '+three' in result
    print(result)
