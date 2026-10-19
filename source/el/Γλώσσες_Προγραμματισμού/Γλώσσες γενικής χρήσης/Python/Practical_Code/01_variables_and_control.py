# Python 3: lists, types, a loop, and branching
scores = [85, 92, 77, 100]
mean = sum(scores) / len(scores)
print(f"Average: {mean:.1f}")
for index, score in enumerate(scores, start=1):
    grade = "pass" if score >= 80 else "review"
    print(index, score, grade)
