using System;
using System.Linq;
var scores = new[] { 10, 15, 22, 31 };
Console.WriteLine($"Even total: {scores.Where(n => n % 2 == 0).Sum()}");
