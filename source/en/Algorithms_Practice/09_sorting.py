items = [('Ada', 2),('Grace', 1),('Linus', 2)]
items_sorted = sorted(items, key=lambda item: item[1])
assert items_sorted == [('Grace',1),('Ada',2),('Linus',2)]
