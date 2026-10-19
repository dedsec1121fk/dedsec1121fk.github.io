greet :: String -> String
greet name = "Hello, " ++ name ++ "!"
main :: IO ()
main = putStrLn (greet "Ada")
