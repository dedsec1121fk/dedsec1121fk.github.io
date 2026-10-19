scores = [1, 2, 3, 4]
scores |> Enum.map(&(&1 * 2)) |> IO.inspect()
