# Machine learning — honest temporal validation and leakage checks

## Problem and baseline
A binary classifier predicts events from time-stamped observations. Split the data chronologically so no training row occurs after a test row. Estimate preprocessing statistics, such as the mean used for scaling, from training examples only; fitting a scaler to all rows leaks information about the future. Compare any trained model against a majority-class baseline and report positive-class recall in addition to accuracy.

## Executable model-free experiment
Save as ml_lab.py and run python3 ml_lab.py. No machine-learning framework or external datasets are required. The experiment explicitly calculates a confusion matrix and compares train-only with leaked normalization statistics.

~~~python
def metrics(actual, predicted):
    tp = sum(a == 1 and p == 1 for a,p in zip(actual,predicted))
    fn = sum(a == 1 and p == 0 for a,p in zip(actual,predicted))
    tn = sum(a == 0 and p == 0 for a,p in zip(actual,predicted))
    fp = sum(a == 0 and p == 1 for a,p in zip(actual,predicted))
    return tp,fn,tn,fp

train = [(1,1,0),(2,2,0),(3,3,0),(4,4,1)]
test = [(5,100,0),(6,101,1),(7,99,1)]
assert train[-1][0] < test[0][0]
baseline = [0] * len(test)
tp,fn,tn,fp = metrics([r[2] for r in test], baseline)
assert (tp,fn,tn,fp) == (0,2,1,0)
assert (tp+tn) / len(test) == 1/3
mean_train = sum(r[1] for r in train) / len(train)
mean_all = sum(r[1] for r in train+test) / len(train+test)
assert mean_train == 2.5 and mean_all > 30
print("PASS: temporal split, class recall, leakage")
~~~

## Reading the metrics
The baseline predicts the negative class for all three test observations. It therefore receives one correct answer out of three, and zero positive recall despite a nonzero accuracy. The train-only feature mean is 2.5; including future test values drastically shifts the mean and would improperly influence any model that used this preprocessing during training. Accuracy alone can conceal rare-class failure. A production evaluation also needs appropriate calibration, representativeness and uncertainty estimates.

## Exercises, failure cases, evidence
1. Rearrange the rows randomly and examine whether any future timestamp enters training. Explain why an unconstrained random split can leak time information.
2. Write precision, recall and specificity formulas, including explicit behavior when the denominator is zero.
3. Compare a baseline that always predicts positive. Which errors change, and why should the threshold depend on the relative cost of false alarms and missed events?
4. Group multiple observations by subject and make sure one subject cannot appear in both splits when that is the intended generalization target.

**Completion:** PASS, recorded confusion matrix, both means, and a written explanation of how leakage makes evaluation look better than deployment. These synthetic counts do not validate a real classifier.
