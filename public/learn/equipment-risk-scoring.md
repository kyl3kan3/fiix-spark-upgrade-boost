# Equipment Risk Scoring

> A repeatable way to rank assets by likelihood and consequence of failure so maintenance teams can direct limited labor toward the most important work.

Canonical URL: https://maintenease.com/learn/equipment-risk-scoring

## What is equipment risk scoring?

Equipment risk scoring assigns each asset a comparable value based on how likely it is to fail and how much that failure would matter. It turns scattered evidence - age, failure history, overdue preventive work, downtime, condition readings, and asset criticality - into a prioritized maintenance view. The score is a decision aid, not a diagnosis. Its purpose is to help a supervisor answer which assets deserve attention first when labor, parts, and shutdown windows are limited.

## Likelihood and consequence

A useful model separates probability from impact. Likelihood can reflect recent failures, shrinking time between failures, unresolved corrective work, condition trends, and missing preventive maintenance. Consequence reflects safety, production, service, environmental, cost, and redundancy effects. A frequently failing non-critical fan may deserve routine attention, while a rarely failing single-point-of-failure pump may still rank high because its consequence is severe. Combining the two prevents teams from prioritizing only the noisiest asset.

## Inputs available without sensors

Teams can build a meaningful starting score from existing CMMS history: failure count, work-order frequency, reactive-to-planned ratio, downtime hours, repair cost, asset age, PM compliance, and criticality. Sensors add current condition evidence but are not a prerequisite for basic prioritization. The first model should favor explainable inputs the team actually records. A sophisticated formula fed by inconsistent data produces false precision; a simple transparent score often changes behavior faster.

## Make every score explainable

Show the number and the drivers behind it. A supervisor should see that a motor is high risk because of three failures in 60 days, declining MTBF, an overdue inspection, and high production criticality. Explainability lets technicians challenge bad source data and tells planners what action might lower the score. It also exposes missing evidence: if a score depends heavily on asset age because no failures are logged, the right next action may be improving records rather than replacing equipment.

## Thresholds and workflow

Map score bands to review behavior, not automatic physical instructions. A high score can trigger supervisor review, a condition reading, an inspection, or planning for parts. Medium risk may remain on the normal PM cadence, while low risk receives monitoring. Avoid generating excessive work orders from every score change; that creates alarm fatigue and teaches the team to ignore the system. Recompute on a consistent schedule and require meaningful evidence before escalating an asset repeatedly.

## How to validate the model

Back-test scores against known failures, then run them prospectively. Compare high-risk assets with actual corrective work and downtime over the next 30 to 90 days. Track false positives, missed failures, data gaps, and whether planners act on the result. Review weights with technicians who know the equipment. A risk model is successful when it improves prioritization and prevents consequential surprises, not when it produces an impressive dashboard number.

## FAQ

### Is an equipment risk score the probability of failure?

Not necessarily. Many scores combine failure likelihood, consequence, and data-quality factors into a priority index rather than a calibrated probability.

### Do risk scores require IoT sensors?

No. Work history, downtime, cost, PM compliance, asset age, and criticality can support a useful first model. Sensors add condition evidence later.

### How often should equipment risk be recalculated?

Use a cadence that matches data change and operational need. Daily or several-times-daily updates may suit active facilities; slower environments may review weekly.

### Should a high score automatically create a repair?

Usually no. It should trigger review or inspection. A score prioritizes attention but does not by itself identify the correct physical repair.

## Related

- https://maintenease.com/learn/predictive-maintenance
- https://maintenease.com/learn/predictive-maintenance-without-sensors
- https://maintenease.com/learn/mtbf
- https://maintenease.com/learn/ai-maintenance-assistant
