BEGIN { FS=","; sum=0; count=0 }
NR > 1 { sum += $2; count++ }
END { if (count) printf "Average: %.2f\n", sum/count }
