@main def hello(): Unit =
  def greet(name: String) = s"Hello, $name!"
  println(greet("Ada"))
