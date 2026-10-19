let scores = [10; 12; 20]
let average = scores |> List.averageBy float
printfn "Average: %f" average
