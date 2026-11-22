# Integration candidates for MaintenEase

Start with **Samsara** for a fleet pilot. It supplies the two readings MaintenEase already knows how to turn into service work. For a facility pilot, choose **Johnson Controls Metasys** when the customer can identify an existing cumulative runtime point. The following are proposed connectors.

| Candidate | First workflow to validate | What a pilot needs |
| --- | --- | --- |
| Samsara | Open a service order after a vehicle crosses a mileage or engine-hour interval. | A customer-authorized vehicle stats feed, a vehicle-to-meter mapping, and a saved feed cursor. Select one odometer source per meter and convert the source unit before submission. [Planned maintenance](https://developers.samsara.com/docs/planned-preventative-maintenance) · [Stats feed](https://developers.samsara.com/reference/getvehiclestatsfeed) |
| Johnson Controls Metasys | Schedule service for an air handler or pump from its accumulated run hours. | A customer-authorized read account, an equipment point that counts total run hours, and confirmation of its unit and behavior after a controller reset. Trend history requires a configured trend object. [Metasys API](https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/Metasys-System-Product-Bulletin/15.0/System-components/Metasys-Server/Server-features/Metasys-Application-Programming-Interface-API) · [Trended attributes](https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/Metasys-REST-Client-for-.NET-and-COM-Developer-Guide/4.2/Methods-groups/Trends/Get-trended-attributes) |
| Geotab | Import odometer or engine-hour readings for customers already using MyGeotab. | Read the appropriate device diagnostic, preserve whether a value is measured or adjusted, and save the feed version after processing its readings. [Device diagnostics](https://developers.geotab.com/myGeotab/guides/goDeviceLogging/) · [Data feed](https://developers.geotab.com/myGeotab/guides/dataFeed/) |
| Microsoft Dynamics 365 Business Central | Send an approved MaintenEase purchase order to the customer's ERP. | A separate purchasing connector with vendor and item mappings, line items, and a stored external order ID to prevent duplicate purchases. [Purchase orders](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/api-reference/v2.0/api/dynamics_purchaseorder_create) · [Purchase order lines](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/api-reference/v2.0/api/dynamics_purchaseorderline_get) |

## Meter pilot acceptance

Use the endpoint and request example in **API Keys → Meter readings** on Business. Map one source counter to one asset meter. Send observations in order, in the meter's configured unit, with a stable event ID and the original observation time.

1. Enter the current meter reading and the reading at the last service. For a vehicle at 62,000 miles that was serviced at 60,000, a 5,000-mile interval should show service due at 65,000. Enable automatic work orders on the linked checklist. Submit a reading below 65,000 and another at 65,000. Verify that the second response reports one created order and that the order opens the correct checklist.
2. Replay the second event with the same payload. Verify that the API returns the original reading ID and the order list still contains one order.
3. Submit the checklist after service. Advance the meter by the configured interval and verify a new order. Reconcile a reset or a decreasing counter with the customer before resuming the feed.
