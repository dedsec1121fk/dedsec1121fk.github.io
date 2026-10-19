# Dynamic programming — minimum coins, unreachable states and memory

## Problem
A local payment-change helper must choose the fewest coins needed to make an amount. A greedy pick of the largest coin is not always optimal: for denominations 1, 3 and 4, a target of 6 is best made by 3+3 (two coins), rather than 4+1+1 (three coins). Dynamic programming uses already solved smaller amounts. Define dp[x] as the minimum number of coins to make exactly x; use None to represent an unreachable amount.

## Executable Python 3 lab
Save as coin_dp_lab.py and run python3 coin_dp_lab.py. The amount is bounded to 10,000 to prevent an untrusted request from allocating arbitrary memory; invalid and zero-valued denominations are rejected.

~~~python
def min_coins(amount, denoms):
    if type(amount) is not int or not 0 <= amount <= 10000:
        raise ValueError("amount outside bounded lab")
    if not denoms or any(type(c) is not int or c <= 0 for c in denoms):
        raise ValueError("invalid denominations")
    dp = [None] * (amount + 1)
    dp[0] = 0
    for value in range(1, amount + 1):
        options = [dp[value-c] + 1 for c in denoms
                   if c <= value and dp[value-c] is not None]
        dp[value] = min(options) if options else None
    return dp[amount]

assert min_coins(6,(1,3,4)) == 2
assert min_coins(3,(2,)) is None
assert min_coins(0,(2,)) == 0
try:
    min_coins(10,(0,))
except ValueError:
    pass
else:
    raise AssertionError("zero coin accepted")
print("PASS: optimal count and unreachable amounts")
~~~

## State transition and proof sketch
The initial case dp[0]=0 is reachable with no coins. For every x from 1 to the target, consider each denomination c not greater than x. If dp[x-c] exists, candidate dp[x-c]+1 represents a valid solution ending with c. Taking the minimum over all final coins cannot miss the optimal choice. The running time is O(amount × number_of_denominations) and memory is O(amount). A very large amount can still be impractical despite polynomial complexity in the numeric value.

## Bounded exercises and diagnostics
1. Reconstruct the actual coin sequence by storing which final denomination produced each dp entry, not just the count.
2. Remove denomination 1 and test an amount that cannot be represented. Contrast None with zero, which represents only amount zero.
3. Implement the naive greedy choice and use amount 6 with 1/3/4 coins as a counterexample.
4. Compare top-down memoization and bottom-up iteration for a maximum amount of 1000, recording recursion depth and memory use.

**Evidence:** PASS, a state table for amounts 0 through 6, one unreachable case and a justified complexity bound.
