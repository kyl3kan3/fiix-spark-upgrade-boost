# Preventive Maintenance: Complete Guide, Schedule, Examples, and Templates

> Preventive maintenance is planned work performed before functional failure, triggered by time, usage, condition findings, or asset risk to reduce avoidable downtime and preserve equipment performance.

Canonical URL: https://maintenease.com/learn/preventive-maintenance

## Preventive maintenance definition

Preventive maintenance (PM) is planned inspection, servicing, adjustment, or replacement performed before an asset reaches functional failure. The trigger may be a calendar interval, operating hours, mileage, production cycles, a condition reading, or a risk review. PM is not simply 'maintenance done early': each task needs a defined asset, trigger, procedure, acceptance criterion, owner, and completion record so the team can determine whether the work is preventing the failure mode it targets.

## Preventive vs predictive vs reactive maintenance

Preventive maintenance acts at a planned interval before failure. Predictive maintenance estimates when failure risk is rising from condition and history, while reactive maintenance begins after the asset can no longer perform its required function. A sound strategy uses all three deliberately: preventive work for age- or usage-related failure modes, predictive or condition-based work when a measurable signal exists, and run-to-failure only for low-consequence items that are inexpensive and quick to replace.

_How common maintenance strategies differ_

| Strategy | Work trigger | Best fit | Example |
| --- | --- | --- | --- |
| Preventive | Time, meter, or planned interval | Known wear, required inspections, stable service intervals | Replace an air filter every 90 days |
| Predictive | Forecast from condition trends and history | Critical assets with useful failure signals | Plan a bearing change from vibration trend |
| Condition-based | Measured value crosses a limit | Assets that can be inspected or monitored | Create work when pressure drop exceeds the limit |
| Reactive | Functional failure | Low-risk, non-critical, replaceable items | Replace a non-critical lamp after it fails |

## How to implement a preventive maintenance program

Start with a controlled scope instead of scheduling every asset at once. First, inventory assets and normalize their names and locations. Second, rank criticality by safety, service, production, environmental, and cost consequences. Third, identify the failure modes worth preventing. Fourth, choose a task and trigger that can detect or reduce each failure mode. Fifth, write a short procedure with pass/fail criteria, tools, parts, and safety requirements. Sixth, load the schedule and assign ownership. Seventh, review findings, overdue work, emergency failures, and labor demand each month, then change intervals only when the evidence supports it.

## Four ways to schedule preventive maintenance

Use the trigger that most closely represents exposure to the failure mode. Calendar schedules are simple but can over-maintain assets with variable usage. Meter schedules follow actual use. Condition triggers respond to what technicians or sensors observe. Risk-based schedules set tighter controls where the consequence of failure is higher, even when two assets are otherwise similar. Regulatory, code, warranty, and manufacturer requirements remain minimum constraints; operational history helps refine the schedule beyond them.

_Preventive maintenance scheduling methods_

| Method | Trigger example | Use when | Watch for |
| --- | --- | --- | --- |
| Time-based | Every 30, 90, or 365 days | Exposure is steady or an inspection is required by date | Seasonality and duplicate work |
| Meter-based | Every 500 runtime hours or 5,000 miles | Wear follows equipment use | Missing or late meter readings |
| Condition-based | Temperature, vibration, pressure, wear, or inspection result | A measurable condition indicates deterioration | Thresholds without an action rule |
| Risk-based | Criticality score and failure consequence | Resources must be concentrated on the most consequential assets | Ignoring low-cost quick wins or new risks |

## How to choose a maintenance frequency

Begin with the strictest applicable requirement from regulation, code, warranty, manufacturer guidance, or internal engineering standards. Then compare the interval with operating hours, environment, duty cycle, redundancy, and failure history. Shorten the interval when failures occur between services, findings repeatedly exceed limits, or consequence is unacceptable. Consider lengthening it when several cycles produce no actionable findings and the risk remains controlled. Record the reason, approver, effective date, and next review so frequency changes are auditable rather than informal.

_Evidence for adjusting a PM interval_

| Observed pattern | Likely action | Evidence to preserve |
| --- | --- | --- |
| Failure occurs before the next PM | Shorten interval or redesign the task | Failure code, elapsed time, work history |
| Repeated defect at the same inspection point | Improve the task, training, or underlying design | Finding, measurement, corrective work |
| No finding across several cycles | Review for safe extension or elimination | Completed checks, operating exposure, risk approval |
| Usage varies substantially | Move from calendar to meter trigger | Runtime, mileage, cycles, or production volume |

## Preventive maintenance examples by industry

The program structure stays consistent across industries even though assets and triggers change. Each example below connects a failure mode to a specific trigger and a record that can be reviewed later.

_Examples for facilities, fleets, manufacturing, and commercial buildings_

| Environment | Asset and task | Typical trigger | Completion evidence |
| --- | --- | --- | --- |
| Facilities | Emergency generator load test and fuel-system inspection | Monthly test plus runtime-based service | Readings, exceptions, technician, corrective order |
| Fleet | Engine oil and filter service | Mileage, engine hours, or oil-life reading | Odometer, parts, service date, next due |
| Manufacturing | Conveyor drive inspection and lubrication | Operating hours with weekly visual checks | Condition finding, lubrication quantity, follow-up work |
| Commercial building | Air-handling-unit filter and belt inspection | Pressure drop plus seasonal calendar review | Pressure reading, belt condition, filter used |

## Plan preventive maintenance labor capacity

A schedule is feasible only when required labor fits the team's productive capacity. Estimate monthly PM demand as asset count multiplied by PM events per asset multiplied by average task hours. Compare that with technician count multiplied by productive maintenance hours per technician. Keep corrective and emergency capacity outside the PM commitment instead of assuming every paid hour is schedulable. Use the calculator on this page to expose the gap before adding more recurring work.

## Preventive maintenance KPIs

Track PM compliance as completed-on-time PM work divided by PM work due. Pair it with schedule compliance, emergency-work percentage, planned-maintenance percentage, findings that generate corrective work, repeat failures, MTBF, and PM labor hours. A high completion rate is not proof of effectiveness by itself: the program should also reduce targeted failures without consuming more labor than the avoided risk justifies.

_A compact preventive maintenance scorecard_

| Metric | Calculation | What it reveals |
| --- | --- | --- |
| PM compliance | On-time PMs / PMs due × 100 | Whether required recurring work is completed when promised |
| Planned maintenance % | Planned maintenance hours / total maintenance hours × 100 | How much labor is controlled before the day begins |
| Emergency work % | Emergency labor hours / total maintenance hours × 100 | How much capacity is consumed by urgent failures |
| MTBF | Operating time / failure count | Whether reliability is improving |
| MTTR | Total restoration time / repair count | How quickly failed assets return to service |

## How a CMMS supports preventive maintenance

A CMMS connects each preventive schedule to the asset, location, procedure, assigned role, parts, and safety information. When the trigger is reached, the system generates a work order; the technician records findings and completion evidence; failed checks create corrective work; and the asset history feeds interval reviews, MTBF, MTTR, backlog, and cost analysis. This closes the loop between planning and reliability instead of leaving completed checklists in a folder.

## Preventive maintenance launch checklist

Before launch, confirm that each scheduled task has an asset ID, responsible role, trigger, estimated duration, procedure, acceptance limit, safety requirements, parts or tools, escalation rule, and next-due logic. Pilot the program on a critical but manageable asset group for four to six weeks. Review technician feedback and the labor-capacity result, correct the procedures, and only then expand to the next group.

## FAQ

### What is preventive maintenance in simple terms?

Preventive maintenance is planned inspection or service completed before equipment fails. The work is triggered by time, use, condition, or risk and recorded against the asset.

### How is preventive maintenance different from predictive maintenance?

Preventive maintenance follows a defined interval or rule. Predictive maintenance uses condition trends and history to forecast when failure risk is increasing. Predictive work can reduce unnecessary fixed-interval service when reliable signals exist.

### What are the four common preventive maintenance scheduling methods?

Time-based, meter-based, condition-based, and risk-based scheduling are the four common methods. Many programs combine them and still honor regulatory, warranty, and manufacturer requirements.

### How often should preventive maintenance be performed?

There is no universal interval. Start with applicable requirements and manufacturer guidance, then account for duty cycle, environment, criticality, and failure history. Adjust only through a documented review.

### What should a preventive maintenance checklist include?

Include the asset, trigger, task steps, safety requirements, tools and parts, measurable acceptance criteria, owner, estimated duration, findings, escalation rule, completion date, and next due date.

### Can a spreadsheet manage preventive maintenance?

A spreadsheet can support a small stable program. A CMMS becomes more practical when schedules must generate work automatically, multiple technicians update status, findings create follow-up work, or audits require reliable asset history.

## Sources

- [OSHA: Hazard prevention and control, including preventive maintenance](https://www.osha.gov/safety-management/hazard-prevention)
- [OSHA Technical Manual: Documented process-equipment inspection and testing](https://www.osha.gov/otm/section-4-safety-hazards/chapter-5)

## CMMS software and comparisons

- [download the preventive maintenance checklist](https://maintenease.com/templates/preventive-maintenance-checklist)
- [work order workflow](https://maintenease.com/learn/work-order)
- [asset management software](https://maintenease.com/solutions/asset-management-software)
- [preventive maintenance software](https://maintenease.com/solutions/preventive-maintenance-software)
- [facility management guide](https://maintenease.com/facility-management)

## Related

- https://maintenease.com/learn/cmms
- https://maintenease.com/learn/work-order
- https://maintenease.com/learn/fleet-maintenance
- https://maintenease.com/learn/predictive-maintenance
- https://maintenease.com/learn/mtbf
- https://maintenease.com/learn/mttr
- https://maintenease.com/learn/total-productive-maintenance
