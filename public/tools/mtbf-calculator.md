# MTBF calculator

> Work out mean time between failures from operating hours and a failure count, or from a run schedule across several identical machines. Add repair downtime to get MTTR and availability. Results update as you type, and your numbers stay in your browser.

Canonical URL: https://maintenease.com/tools/mtbf-calculator

## MTBF formula with a worked example

MTBF = total operating time ÷ number of failures. A conveyor gearbox that ran 2,000 hours and failed 4 times has an MTBF of 500 hours. Count only time the asset was running or ready to run, and count only failures that stopped it and needed corrective work. Planned PM stops are not failures, so leave them out of the count.

## Operating time versus calendar time

Textbook MTBF uses operating hours. Calendar MTBF, the average number of days between failures, is easier to track and works well for trending a single asset, but the two are not interchangeable. A machine on one 8-hour weekday shift logs about 2,080 run hours a year, not 8,760, so the same failure history can produce numbers four times apart. Pick one basis per asset and compare like with like.

## Turn the number into a maintenance decision

MTBF says how often an asset fails; MTTR says how long each failure costs you. Together they give availability: MTBF ÷ (MTBF + MTTR). Track the trend per asset rather than chasing a target. A falling MTBF on one machine in a group of identical units flags a bad actor that deserves a root-cause review, a shorter PM interval, or a repair-versus-replace decision.

## FAQ

### How do you calculate MTBF?

Divide total operating time by the number of failures in the same period. For example, 2,000 operating hours with 4 failures gives an MTBF of 500 hours. Use the same window for both numbers and keep planned maintenance stops out of the failure count.

### How do you calculate MTBF for multiple machines?

For identical machines in similar service, add their operating hours together, add their failures together, then divide. Three presses that each ran 1,000 hours with 6 failures between them have a pooled MTBF of 3,000 ÷ 6 = 500 hours. Pooling can hide one bad machine, so check each unit on its own as well.

### How do you calculate availability from MTBF and MTTR?

Availability = MTBF ÷ (MTBF + MTTR). With an MTBF of 500 hours and an MTTR of 4.5 hours, availability is 500 ÷ 504.5 = 99.11%. This figure covers failure downtime only; planned maintenance, changeovers, and waiting on parts pull real-world availability lower.

### How do you convert MTBF to a failure rate?

Failure rate is the inverse of MTBF: λ = 1 ÷ MTBF. An MTBF of 500 hours equals 0.002 failures per hour, or 2 failures per 1,000 operating hours. The conversion assumes a roughly constant failure rate, which fits random failures better than parts that wear out.

### What does the failure-free chance mean?

It estimates the probability that the asset runs a chosen number of operating hours without a failure, using R(t) = e^(-t ÷ MTBF). At an MTBF of 500 hours, the chance of getting through the next 168 operating hours is about 71%. Treat it as a planning estimate for assets with random failures, not a guarantee for wear-out components.

### What is the difference between MTBF and MTTF?

MTBF applies to repairable assets that go back into service after a fix, such as pumps, conveyors, and compressors. MTTF, mean time to failure, applies to items you replace rather than repair, such as belts, bulbs, and bearings, and describes their average life.

## Related resources

- [What MTBF measures and how to use it](https://maintenease.com/learn/mtbf)
- [MTTR: what drives repair time](https://maintenease.com/learn/mttr)
- [Maintenance KPI reference](https://maintenease.com/learn/cmms-benchmarks-2026)
- [Root-cause fishbone generator](https://maintenease.com/tools/root-cause-fishbone-generator)
