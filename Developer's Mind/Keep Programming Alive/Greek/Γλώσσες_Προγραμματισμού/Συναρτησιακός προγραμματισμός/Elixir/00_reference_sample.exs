defmodule Hello do
  def greet(name), do: "Hello, #{name}!"
end
IO.puts(Hello.greet("Ada"))
