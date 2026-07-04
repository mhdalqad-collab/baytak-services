import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiBase = process.env.API_BASE || "http://127.0.0.1:8787/api";
const simulatorKey = process.env.SIM_API_KEY || "";
const intervalMs = Number(process.env.SIM_INTERVAL_MS || 4000);
const watch = process.argv.includes("--watch");
const scenarioName = getArgValue("--scenario") || "standard";

function getArgValue(name) {
  const arg = process.argv.find((item) => item.startsWith(`${name}=`));
  return arg ? arg.slice(name.length + 1) : null;
}

async function api(pathname, options = {}) {
  const response = await fetch(`${apiBase}${pathname}`, {
    headers: {
      "Content-Type": "application/json",
      ...(simulatorKey ? { "X-Simulator-Key": simulatorKey } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${pathname} failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function post(pathname, body = {}) {
  return api(pathname, { method: "POST", body: JSON.stringify(body) });
}

async function loadScenario(name) {
  const scenarioPath = path.join(__dirname, "scenarios", `${name}.json`);
  return JSON.parse(await readFile(scenarioPath, "utf8"));
}

async function runTick(scenario) {
  const state = await api("/simulator/work");
  const events = [];

  for (const request of state.requests) {
    if (request.status !== "Matching") continue;
    const existingOffers = state.offersByRequest?.[request.id] || [];
    if (existingOffers.length) continue;

    await post(`/requests/${encodeURIComponent(request.id)}/provider-offers`, {
      scenario: scenario.name,
      ...scenario.matching
    });
    const nextState = await api("/simulator/work");
    const offerCount = nextState.offersByRequest?.[request.id]?.length || 0;
    events.push(`offers:${request.id}:${offerCount}`);
  }

  if (scenario.tracking?.advanceActiveJobs) {
    for (const request of state.requests) {
      if (request.status !== "Active") continue;
      const nextStep = Math.min(
        Number(scenario.tracking.completeAtStep || 5),
        Number(request.timelineStep || 1) + Number(scenario.tracking.stepIncrement || 1)
      );
      await post(`/requests/${encodeURIComponent(request.id)}/advance`, {
        scenario: scenario.name,
        timelineStep: nextStep
      });
      events.push(`advance:${request.id}:${nextStep}`);
    }
  }

  if (events.length) {
    console.log(`[external-sim:${scenario.name}] ${events.join(", ")}`);
  } else {
    console.log(`[external-sim:${scenario.name}] no events at ${new Date().toLocaleTimeString()}`);
  }
}

async function main() {
  const scenario = await loadScenario(scenarioName);
  await api("/health");

  console.log(`[external-sim] API ${apiBase}`);
  console.log(`[external-sim] scenario "${scenario.name}" - ${scenario.description}`);

  await runTick(scenario);
  if (watch) {
    console.log(`[external-sim] watching every ${intervalMs}ms. Press Ctrl+C to stop.`);
    setInterval(() => runTick(scenario).catch((error) => console.error(`[external-sim] ${error.message}`)), intervalMs);
  }
}

main().catch((error) => {
  console.error(`[external-sim] ${error.message}`);
  process.exit(1);
});
