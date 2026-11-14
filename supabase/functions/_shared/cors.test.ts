import { assertEquals } from "jsr:@std/assert@1";
import { isAllowedOrigin, LOVABLE_PROJECT_ID } from "./cors.ts";

const ID = LOVABLE_PROJECT_ID;

const allowedOrigins = [
  "https://maintenease.com",
  "https://www.maintenease.com",
  "https://maintenease.lovable.app",
  `https://project--${ID}.lovable.app`,
  `https://project--${ID}.lovableproject.com`,
  `https://project--${ID}-dev.lovableproject-dev.com`,
  `https://id-preview--${ID}.lovable.app`,
  `https://id-preview--${ID}-dev.gpt-eng.com`,
  `https://id-preview-abc123--${ID}.gptengineer.run`,
  `https://live--${ID}.lovable.app`,
  `https://live--${ID}-thr_abc12.lovableproject.com`,
  `https://${ID}.lovable.app`,
  "http://localhost",
  "http://localhost:5173",
  "https://localhost:8080",
  "http://127.0.0.1:3000",
];

const rejectedOrigins: (string | null)[] = [
  null,
  `https://${ID}-evil.lovable.app`,
  `https://${ID}.evil.lovable.app`,
  `https://project--${ID}.evil.lovable.app`,
  "https://evil-lovable.app",
  "https://maintenease.com.evil.com",
  "http://maintenease.com",
  `http://project--${ID}.lovable.app`,
  `https://other--${ID}.lovable.app`,
  `https://project--00000000-0000-0000-0000-000000000000.lovable.app`,
];

for (const origin of allowedOrigins) {
  Deno.test(`allows ${origin}`, () => {
    assertEquals(isAllowedOrigin(origin), true);
  });
}

for (const origin of rejectedOrigins) {
  const name = origin === null ? "null" : origin;
  Deno.test(`rejects ${name}`, () => {
    assertEquals(isAllowedOrigin(origin), false);
  });
}