# Condition-Based Maintenance

> Servicing equipment when a monitored condition (temperature, vibration, pressure) crosses a defined threshold — not on a fixed schedule.

Canonical URL: https://maintenease.com/learn/condition-based-maintenance

## Definition

Condition-based maintenance (CBM) triggers service based on the actual, measured condition of an asset rather than a calendar or runtime interval. A monitored parameter — bearing temperature, vibration amplitude, oil cleanliness, differential pressure across a filter — is compared against a defined limit, and when it crosses that limit, a work order is raised. The asset is serviced because it shows it needs it, not because a schedule said so.

## How condition-based maintenance works

First, choose a condition that reliably indicates wear or impending failure for that asset class. Second, set a threshold based on manufacturer specs and your own history. Third, monitor — continuously with sensors, or periodically with manual readings logged in a CMMS. When the reading breaches the threshold, the system generates the work. The art is choosing thresholds that fire early enough to plan but not so early that you waste component life.

## CBM vs preventive vs predictive

Preventive maintenance acts on time. Condition-based maintenance acts on a present-moment reading crossing a line. Predictive maintenance goes one step further, using trends and models to forecast when the line will be crossed in the future. CBM is often the practical middle ground: more efficient than fixed schedules, far simpler to implement than full predictive analytics.

## Getting started with CBM

Pick one critical asset and one telling parameter — vibration on a pump, temperature on a motor, pressure drop on a filter. Decide the threshold, log readings on a regular route, and let your CMMS raise the work order when the limit is hit. As confidence grows, add parameters and assets. Manual CBM with a clipboard and a CMMS is a legitimate, low-cost place to begin.

## FAQ

### Does condition-based maintenance require sensors?

Not necessarily. Permanent sensors enable continuous monitoring, but periodic manual readings (temperature, vibration, pressure) logged in a CMMS are a valid, low-cost form of CBM.

### How is CBM different from predictive maintenance?

CBM reacts when a reading crosses a threshold now. Predictive maintenance forecasts when that threshold will be crossed in the future, usually with trend analysis or models.

## Related

- https://maintenease.com/learn/predictive-maintenance
- https://maintenease.com/learn/preventive-maintenance
- https://maintenease.com/learn/mtbf
