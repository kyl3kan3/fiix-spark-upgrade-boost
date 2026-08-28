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

Pick one critical asset and one telling parameter — vibration on a pump, temperature on a motor, pressure drop on a filter. Document the measurement method, unit, baseline, warning limit, action limit, reading context, evidence, and the person authorized to decide what happens next. Log readings on a regular route and create follow-up work when the defined decision rule is met. As confidence grows, add parameters and assets. Manual CBM with a portable instrument and consistent history is a legitimate, low-cost place to begin.

## Where MaintenEase fits in a condition route

MaintenEase can retain asset records, inspection results, notes, attachments, work orders, and calendar-based recurring routes so a team can build reviewable condition history. Its current scheduler should not be described as a native threshold-trigger engine. Use qualified procedures or manufacturer guidance to define the measurement and limits, then use the downloadable worksheet to make the evidence and follow-up decision explicit before considering sensor or automation claims.

## FAQ

### Does condition-based maintenance require sensors?

Not necessarily. Permanent sensors enable continuous monitoring, but periodic manual readings (temperature, vibration, pressure) logged in a CMMS are a valid, low-cost form of CBM.

### How is CBM different from predictive maintenance?

CBM reacts when a reading crosses a threshold now. Predictive maintenance forecasts when that threshold will be crossed in the future, usually with trend analysis or models.

## Downloads

- [Condition-based inspection worksheet (CSV)](https://maintenease.com/templates/downloads/condition-based-maintenance-inspection-template.csv) — Document the parameter, method, baseline, limits, reading context, evidence, decision, and resulting work order.

## Sources

- [U.S. Department of Energy: Operations and Maintenance Best Practices Guide](https://www.energy.gov/cmei/femp/articles/operations-and-maintenance-best-practices-guide-achieving-operational-efficiency)
- [U.S. Department of Energy: Complete O&M Best Practices Guide (PDF)](https://www.energy.gov/sites/default/files/2020/04/f74/omguide_complete_w-eo-disclaimer.pdf)

## Related

- https://maintenease.com/learn/predictive-maintenance
- https://maintenease.com/learn/predictive-maintenance-without-sensors
- https://maintenease.com/learn/preventive-maintenance
- https://maintenease.com/learn/mtbf
