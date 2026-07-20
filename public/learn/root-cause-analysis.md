# Root Cause Analysis (RCA)

> A structured method for finding why a failure happened — not just what broke — so the same problem can be eliminated instead of repeatedly repaired.

Canonical URL: https://maintenease.com/learn/root-cause-analysis

## What is Root Cause Analysis?

Root Cause Analysis (RCA) is a structured problem-solving process used to identify the underlying cause of a failure rather than just the symptoms. In a maintenance context, RCA turns a recurring bearing failure, a leaking seal, or a repeated trip event into a permanent fix. Teams that skip RCA end up in a loop — same asset, same failure, same repair — while teams that adopt it systematically shift work from reactive to planned and cut downtime hours over time.

## When to run an RCA

Not every work order deserves a full RCA. Trigger one when a failure is safety-related, causes significant downtime, exceeds a cost threshold (many teams use $5,000), or has repeated more than twice on the same asset in a rolling 90-day window. A CMMS makes these triggers visible: filter closed work orders by asset and failure code, and any asset that shows up three or more times is a candidate.

## The 5 Whys method

The 5 Whys is the simplest RCA technique — ask 'why' five times, each answer becoming the next question. Example: the conveyor stopped (why?) — the motor overheated (why?) — the cooling fan failed (why?) — the bearing seized (why?) — it was never lubricated (why?) — it wasn't on the PM schedule. The corrective action isn't 'replace the fan' — it's 'add lubrication PM.' Five is a guideline, not a rule; keep asking until you hit a systemic cause you can actually change.

## Fishbone (Ishikawa) diagrams

When a failure has multiple contributing factors, a Fishbone diagram organizes them into categories — commonly Man, Machine, Method, Material, Measurement, and Environment (the '6 Ms'). Teams brainstorm potential causes under each branch, then vote on which ones to investigate. Fishbones are ideal for group RCA sessions and for failures where the 5 Whys keeps splitting into parallel chains.

## Turning findings into tracked corrective actions

An RCA that ends in a report is worth almost nothing; an RCA that ends in scheduled work is worth everything. Every root cause should map to a corrective action with an owner, a due date, and a completion record. In MaintenEase, corrective actions become work orders or PM schedule changes linked back to the original failure, so you can prove the fix actually landed and measure whether the failure recurs.

## FAQ

### How long should an RCA take?

A 5 Whys walkthrough takes 15–30 minutes and can happen at the work-order close-out. A full Fishbone session with a cross-functional team takes 60–90 minutes. Reserve deeper investigations only for safety events or high-cost failures.

### Who should lead an RCA?

A maintenance supervisor or reliability engineer usually facilitates, but the technician who did the repair must be in the room — they hold the most useful evidence. Involve operators too when human factors are in play.

### How does a CMMS help with Root Cause Analysis?

A CMMS surfaces the failure history that makes RCA possible (same asset, same failure code, repeated), stores photos and notes from the original work order, and tracks the corrective actions that come out of the analysis so nothing falls through the cracks.

### What is the difference between RCA and RCFA?

RCFA (Root Cause Failure Analysis) is RCA applied specifically to equipment failures. In maintenance the terms are used interchangeably; RCA is the broader label used across quality, safety, and operations.

## Related

- https://maintenease.com/learn/mtbf
- https://maintenease.com/learn/mttr
- https://maintenease.com/learn/preventive-maintenance
- https://maintenease.com/learn/corrective-maintenance
