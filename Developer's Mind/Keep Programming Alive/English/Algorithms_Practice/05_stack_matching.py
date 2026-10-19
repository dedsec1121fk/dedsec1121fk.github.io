def balanced(text):
    stack, pairs = [], {')': '(', ']': '[', '}': '{'}
    for char in text:
        if char in '([{': stack.append(char)
        elif char in pairs:
            if not stack or stack.pop() != pairs[char]: return False
    return not stack
assert balanced('([])') and not balanced('([)]')
