import { test, expect, type Page } from "@playwright/test";

const user = {
  id: "00000000-0000-4000-8000-000000000001",
  aud: "authenticated",
  role: "authenticated",
  email: "alex@example.test",
  app_metadata: { provider: "email" },
  user_metadata: { full_name: "Alex Morgan" },
  created_at: "2026-01-01T00:00:00Z",
};
const expires = Math.floor(Date.now() / 1000) + 3600;
const token = [
  Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"),
  Buffer.from(JSON.stringify({ sub: user.id, exp: expires, role: "authenticated" })).toString(
    "base64url",
  ),
  "local-ui-fixture",
].join(".");
const session = {
  access_token: token,
  refresh_token: "local-ui-fixture",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: expires,
  user,
};
const summary = {
  metrics: { logs: 24890, anomalies: 128, critical: 12, threats: 86, blocked: 34 },
  trend: Array.from({ length: 48 }, (_, i) => ({
    time: `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
    anomalies: 14 + Math.round(Math.sin(i * 0.45) * 9 + i * 0.4),
    critical: 2 + (i % 5),
  })),
  threatPatterns: [
    { name: "Brute Force", value: 48 },
    { name: "API Abuse", value: 31 },
    { name: "Unusual Login", value: 26 },
    { name: "SQL Injection", value: 15 },
    { name: "Geo Anomaly", value: 8 },
  ],
  geoOrigins: [
    { country: "India", code: "IN", x: 77.2, y: 28.6, threats: 48, intensity: "high" },
    { country: "United States", code: "US", x: -95.7, y: 37.1, threats: 31, intensity: "medium" },
    { country: "Germany", code: "DE", x: 10.4, y: 51.1, threats: 22, intensity: "low" },
  ],
  alerts: [
    "Credential stuffing detected",
    "Unusual API activity",
    "New location sign-in",
    "Repeated authentication failure",
    "Elevated request volume",
    "Suspicious query pattern",
  ].map((event, i) => ({
    id: `alert-${i}`,
    timestamp: `2026-09-25T09:${String(i * 5).padStart(2, "0")}:00Z`,
    user: i % 2 ? "service-bot" : "alex.morgan",
    ip: `192.0.2.${i + 1}`,
    event,
    severity: ["Critical", "High", "Medium", "Low"][i % 4],
    status: i === 4 ? "Resolved" : "Open",
    country: "IN",
    rawLog: `event=${event} source=ui-fixture`,
  })),
};
const pages = [
  ["/dashboard", "Dashboard"],
  ["/alerts", "Alerts"],
  ["/live-logs", "Live Logs"],
  ["/threat-analytics", "Threat Analytics"],
  ["/ueba", "User Behavior (UEBA)"],
  ["/geo", "Geo Intelligence"],
  ["/incident-response", "Incident Response"],
  ["/integrations", "Integrations"],
  ["/settings", "Settings"],
] as const;

async function signedIn(page: Page) {
  await page.route("**/auth/v1/**", (route) =>
    route.fulfill({ json: route.request().url().includes("/token") ? session : user }),
  );
  await page.route("**/api/**", (route) => {
    const url = route.request().url();
    const json = url.includes("dashboard/summary")
      ? summary
      : url.includes("live-logs")
        ? [
            {
              id: "log-1",
              ts: "2026-09-25T09:00:00Z",
              level: "info",
              source: "gateway",
              msg: "Request evaluated successfully.",
            },
            {
              id: "log-2",
              ts: "2026-09-25T09:01:00Z",
              level: "warn",
              source: "identity",
              msg: "Unusual sign-in pattern detected.",
            },
          ]
        : [];
    return route.fulfill({ json, headers: { "access-control-allow-origin": "*" } });
  });
  await page.goto("/auth");
  await expect(page.locator("html")).toHaveAttribute("data-motion", /.+/);
  await page.getByLabel("Email address").fill("alex@example.test");
  await page.getByLabel("Password", { exact: true }).fill("test-password");
  await page.getByRole("button", { name: "Sign in to Sentivoy" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard", level: 1 })).toBeVisible();
}
async function noOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
    over: [...document.querySelectorAll("body *")]
      .filter((el) => el.getBoundingClientRect().right > innerWidth + 1 && !el.closest("table"))
      .slice(0, 20)
      .map((el) => ({
        tag: el.tagName,
        class: el.className,
        width: el.getBoundingClientRect().width,
      })),
  }));
  expect(dimensions.scroll, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.width + 1);
}

test("landing and login render, navigate, and validate authentication", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", /.+/);
  await expect(
    page.getByRole("heading", { name: /A world of signals.*One clear view/ }),
  ).toBeVisible();
  await expect(page.locator(".earth-canvas")).toHaveCSS("opacity", "1");
  await page.screenshot({ path: info.outputPath("landing-desktop.png"), fullPage: true });
  await page.screenshot({ path: info.outputPath("landing-hero.png") });
  await page.getByRole("button", { name: "Pause Earth rotation" }).click();
  await expect(page.getByRole("button", { name: "Rotate Earth" })).toBeVisible();
  await page.getByRole("button", { name: "Understand the unusual" }).click();
  await expect(page.locator("#feature-panel-1")).toBeVisible();
  await expect(page.locator("#feature-panel-0")).toBeHidden();
  await page.getByText("What can I monitor with Sentivoy?").click();
  await expect(page.getByText("Sentivoy brings ingested logs", { exact: false })).toBeVisible();
  await page.goto("/auth");
  await expect(page.getByRole("heading", { name: "Welcome back." })).toBeVisible();
  await page.screenshot({ path: info.outputPath("login-desktop.png"), fullPage: true });
  await page.getByRole("tab", { name: "Create account" }).click();
  await expect(page.getByLabel("Full name")).toBeVisible();
  await page.getByLabel("Password", { exact: true }).fill("test-password");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "text");
  await page.getByRole("tab", { name: "Sign in", exact: true }).click();
  await page.route("**/auth/v1/token**", (route) =>
    route.fulfill({
      status: 400,
      json: { error: "invalid_grant", error_description: "Invalid login credentials" },
    }),
  );
  await page.getByLabel("Email address").fill("alex@example.test");
  await page.getByRole("button", { name: "Sign in to Sentivoy" }).click();
  await expect(page.getByRole("alert")).toContainText("Invalid login credentials");
  await noOverflow(page);
  expect(errors).toEqual([]);
});

test("every workspace route uses the same shell and renders without errors", async ({
  page,
}, info) => {
  await signedIn(page);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const [url, title] of pages) {
    await page.goto(url);
    await expect(page.getByRole("heading", { name: title, exact: true, level: 1 })).toBeVisible();
    await expect(page.locator(".workspace-header")).toBeVisible();
    await expect(page.locator(".workspace-sidebar .sentivoy-brand-mark")).toBeVisible();
    await expect(
      page
        .locator(
          ".workspace-content .surface, .workspace-content .reference-card, .workspace-content .bg-card",
        )
        .first(),
    ).toBeVisible();
    await noOverflow(page);
    await page.screenshot({
      path: info.outputPath(`desktop${url}.png`),
      fullPage: true,
      animations: "disabled",
    });
  }
  expect(errors).toEqual([]);
});

test("Zustand preferences persist and filters remain functional", async ({ page }) => {
  await signedIn(page);
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Expand sidebar" })).toBeVisible();
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await page.getByRole("searchbox", { name: "Search alerts" }).fill("Credential");
  await expect(page.getByRole("cell", { name: "Credential stuffing detected" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Unusual API activity" })).toHaveCount(0);
  await page.goto("/settings");
  await page.getByRole("button", { name: "Appearance", exact: true }).click();
  await page.getByRole("switch", { name: "Interface animations" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Appearance", exact: true }).click();
  await expect(page.getByRole("switch", { name: "Interface animations" })).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await page.goto("/integrations");
  await page.getByRole("textbox", { name: "Search integrations" }).fill("Cloudflare");
  await expect(page.getByText("Cloudflare", { exact: true })).toBeVisible();
  await expect(page.getByText("AWS CloudTrail", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "View setup" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("mobile screens fit and navigation opens", async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", /.+/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.screenshot({ path: info.outputPath("landing-mobile.png"), fullPage: true });
  await noOverflow(page);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile website" })).toBeVisible();
  await page.goto("/auth");
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath("login-mobile.png"), fullPage: true });
  await signedIn(page);
  for (const [url, title] of pages) {
    await page.goto(url);
    await expect(page.getByRole("heading", { name: title, exact: true, level: 1 })).toBeVisible();
    await noOverflow(page);
    await page.screenshot({ path: info.outputPath(`mobile${url}.png`), fullPage: true });
  }
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("link", { name: "Threat Analytics", exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath("navigation-mobile.png"), fullPage: true });
});

test("GSAP reveals remain visible when motion is enabled", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator(".landing-intro")).toBeVisible();
  await expect(page.locator(".landing-content")).toHaveAttribute("inert", "");
  await expect(page.locator(".landing-intro")).toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute("data-motion", /.+/);
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toBeVisible();
  await expect(heading).toHaveCSS("opacity", "1");
  const firstRole = page.locator("#solutions .blue-role-grid article").first();
  await expect(firstRole).toHaveCSS("visibility", "hidden");
  await firstRole.evaluate((element) => element.scrollIntoView({ block: "center" }));
  await expect(firstRole).toBeVisible();
  await expect(firstRole).toHaveCSS("opacity", "1");
  await page.getByRole("link", { name: "Explore the platform" }).click();
  await expect(page.locator("#platform h2")).toBeInViewport();
  await expect(page.locator("#platform h2")).toBeVisible();
});
