## 1. Clear all notifications (UI)

- Add a `clearAllNotifications` query that deletes all of the current user's notifications (requires a new RLS DELETE policy on `notifications`).
- In `NotificationsPanelFooter`, add a destructive "Clear all" button next to "Mark all as read", with a confirm dialog and toast on success/error.
- Optimistically empty the panel and reset unread count to 0.

## 2. Temperature-based notifications (OpenWeather + Twilio)

### Data model
- Add `lat`, `lon`, `weather_alerts_enabled` to `locations` (per-location coords; global thresholds live on the company).
- Add `temp_min_c`, `temp_max_c`, `temp_unit` ('C'|'F'), `weather_alerts_enabled` to `companies`.
- New table `weather_readings` (company_id, location_id, temperature_c, fetched_at) for history + dedupe.
- New table `weather_alert_state` (location_id unique, last_alert_kind 'high'|'low'|'ok', last_alert_at) so we don't spam — only notify when the state transitions.

### Edge function: `weather-poll`
- Cron'd every 15 minutes via `pg_cron` + `pg_net`.
- For every location with coords + alerts enabled, call OpenWeather Current Weather API with `OPENWEATHER_API_KEY`.
- Insert reading; compare to company thresholds; if state flips (ok→high, ok→low, or back to ok), call `dispatch_notification_event('weather_alert', …)`.

### Edge function: `notify-event` extension
- Add `weather_alert` handler. For each admin/manager in the company:
  - In-app notification (existing path).
  - Email via existing Resend flow.
  - SMS via Twilio gateway when phone present and SMS enabled.

### Settings UI
- New "Weather Alerts" card in Settings → company thresholds, unit, enable toggle.
- Location form: coords + per-location enable toggle, with a "look up by address" button (OpenWeather geocoding).

### Secrets / connectors
- Add `OPENWEATHER_API_KEY` (free tier is fine for current weather).
- Connect Twilio via the connector picker → exposes `TWILIO_API_KEY` + `LOVABLE_API_KEY` for the gateway. User will also need to set `TWILIO_FROM_NUMBER` (the verified Twilio number to send from).

### Order of operations
1. Ship "Clear all" (small migration + UI).
2. Connect Twilio + request OpenWeather/From-number secrets.
3. DB migration for weather schema.
4. Edge functions + cron job.
5. Settings UI.