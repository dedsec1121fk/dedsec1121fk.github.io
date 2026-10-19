double :: Int -> Int
double n = n * 2
main :: IO ()
main = print (map double [1, 2, 3])
