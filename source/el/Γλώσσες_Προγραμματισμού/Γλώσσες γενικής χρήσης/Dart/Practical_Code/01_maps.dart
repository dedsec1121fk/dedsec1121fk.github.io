void main() {
  final scores = <String, int>{'Ada': 90, 'Grace': 100};
  for (final entry in scores.entries) {
    print('${entry.key}: ${entry.value}');
  }
}
