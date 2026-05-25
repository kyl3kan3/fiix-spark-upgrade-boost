# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/8e4b0baf-d26e-4fdc-947e-b3bad90e188b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8e4b0baf-d26e-4fdc-947e-b3bad90e188b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8e4b0baf-d26e-4fdc-947e-b3bad90e188b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Error monitoring (Sentry)

Client errors are reported to Sentry from `src/lib/sentry.ts`. Reporting is
disabled in development and active in any non-dev build.

Every event is tagged with:

- `route` — current pathname (kept in sync by `SentryContextSync`)
- `session_id` — stable per-tab id (survives navigation, resets on reload)
- `user.id` / `user.email` — when authenticated, `anon:<sessionId>` otherwise
- `release` — from `VITE_APP_VERSION` (CI sets this to the commit SHA)

Network failures (5xx / fetch errors) carry the request URL, method, status,
and response headers via `httpClientIntegration`. For thrown errors inside
service code, prefer:

```ts
import { captureApiError } from "@/lib/sentry";

try {
  // ...fetch / supabase call
} catch (err) {
  captureApiError(err, { method: "POST", url, status, body, response });
  throw err;
}
```

### Releases & alerting

CI sets `VITE_APP_VERSION=${{ github.sha }}` on every build, so each deploy
shows up as a distinct release in Sentry → Releases with crash-free session
and user metrics.

To get notified about production error spikes, create these alerts in the
Sentry UI (Alerts → Create Alert → Issues):

1. **New issue in production** — `event.type:error environment:production`,
   trigger: a new issue is created, action: email / Slack.
2. **Error spike** — Metric alert on `event.count`, filter
   `environment:production level:error`, threshold: `> 20 events in 5m`.
3. **Regression** — trigger: an issue changes state to `regressed`.

The default DSN is hard-coded; override per environment with
`VITE_SENTRY_DSN` if you need a separate Sentry project.
