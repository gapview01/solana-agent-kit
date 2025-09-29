# Phase 0 → Phase 1 Readiness Checklist

## goblin-core (public)
- [ ] Confirm which primitives/plugins move in the first tranche (agent kit, wallet interfaces, token/defi/misc actions).
- [ ] Validate no private API keys or partner configs must stay private before open-sourcing.
- [ ] Decide how policy hooks (risk checks, slippage caps) will inject into public actions.

## goblin-policy (private)
- [ ] Approve migration of RugCheck + similar heuristics into dedicated policy services.
- [ ] Define schema for allow/deny lists and thresholds consumed by orchestrator.

## goblin-agent (private)
- [ ] Confirm long-running agent loop requirements vs. Telegram glue retained.
- [ ] Specify mandate/state storage that avoids raw private key custody.

## goblin-api (private)
- [ ] Approve HTTP surface (plans/preview/simulate/execute/receipts) and whether Telegram webhook lives here or in agent repo.
- [ ] Finalize auth/quota strategy before wiring to orchestrator.

## goblin-web (private)
- [ ] Decide whether Telegram UX is still supported or replaced by retail web app flows.
- [ ] Align on initial pages/components that depend on goblin-api.

## Cross-repo dependencies
- [ ] Document orchestration flow: Policy → Preview → Simulate → Execute using goblin-core primitives.
- [ ] Identify any missing simulators/explainability hooks before scaffold.

**Gating token:** Proceed to coding only when I reply **APPROVE: scaffold in <repo>**.
