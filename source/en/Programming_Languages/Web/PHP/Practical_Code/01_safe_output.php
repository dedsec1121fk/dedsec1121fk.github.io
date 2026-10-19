<?php
$name = "Ada <script>";
echo htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . PHP_EOL;
