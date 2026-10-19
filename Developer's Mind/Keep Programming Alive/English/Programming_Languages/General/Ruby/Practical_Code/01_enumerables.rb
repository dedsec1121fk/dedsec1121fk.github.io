names = %w[Ada Grace Linus]
puts names.select { |name| name.size >= 5 }.map(&:upcase)
