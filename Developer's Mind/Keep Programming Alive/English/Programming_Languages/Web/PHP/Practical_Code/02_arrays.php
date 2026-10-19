<?php
$scores = [3, 7, 9];
$filtered = array_filter($scores, fn($n) => $n >= 7);
echo json_encode(array_values($filtered), JSON_PRETTY_PRINT) . PHP_EOL;
