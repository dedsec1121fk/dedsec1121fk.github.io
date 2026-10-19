import hashlib

def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

if __name__ == '__main__':
    assert sha256_bytes(b'abc') == 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    print(sha256_bytes('Γεια'.encode('utf-8')))
