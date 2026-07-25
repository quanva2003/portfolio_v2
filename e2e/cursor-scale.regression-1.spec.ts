import { test, expect } from "@playwright/test";

// Regression: ISSUE-001 — GSAP quickTo(dot, "scale", ...) logged "scale not
// eligible for reset. Try splitting into individual properties" on every
// hover-state change, because CSSPlugin decomposes the "scale" shorthand
// internally so quickTo can't find a direct PropTween to update in place.
// Found by /qa on 2026-07-06
// Report: manual /qa pass, see components/motion/Cursor.tsx (scaleX/scaleY fix)
test("cursor hover across multiple targets logs no GSAP warnings", async ({ page }) => {
  const consoleMessages: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "warning" || msg.type() === "error") {
      consoleMessages.push(msg.text());
    }
  });

  await page.goto("/");
  const dot = page.locator("[data-cursor-dot]");
  await expect(dot).toHaveCount(1);

  // The bug only surfaced across repeated hover-state transitions (the
  // in-place quickTo update path), not on the first hover.
  await page.hover("header nav a >> nth=0");
  await expect(dot).toHaveAttribute("data-state", "hover");
  await page.mouse.move(200, 600);
  await expect(dot).toHaveAttribute("data-state", "default");
  await page.hover("header nav a >> nth=1");
  await expect(dot).toHaveAttribute("data-state", "hover");

  expect(consoleMessages.filter((m) => m.includes("not eligible for reset"))).toHaveLength(0);
  expect(consoleMessages).toHaveLength(0);
});
