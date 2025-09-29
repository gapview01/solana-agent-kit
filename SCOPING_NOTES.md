# Scoping Notes for Repo B Targets

## goblin-core (public)
- `src/agent/SolanaAgentKit.ts`
- `src/types/index.ts`
- `src/types/wallet.ts`
- `src/constants/index.ts`
- `src/utils/` (actionExecutor.ts, sendTx.ts, getMintInfo.ts, keypair wallets)
- `src/adapters/langchain.ts`
- `src/adapters/openai.ts`
- `src/adapters/vercelAi.ts`
- `src/adapters/mcp.ts`
- `src/plugins/token/**`
- `src/plugins/defi/**`
- `src/plugins/misc/**`
- Interface expectations:
  - Expose `SolanaAgentKit` constructor accepting wallet + RPC URL + config.
  - `BaseWallet` interface must match signing API used by orchestrator/agent.
  - Export pure action definitions (metadata + handler) that return structured `{status, ...}` objects.
  - No hard dependency on private policy data; accept overrides via dependency injection/config.

## goblin-policy (private)
- `src/token-risk/rugcheckClient.ts`
- `src/slippage/defaults.ts`
- `src/allowlist/*.ts`
- Interfaces:
  - Provide pure functions consumed by goblin-core actions (`fetchTokenRisk(mint)` etc.).
  - Return machine-readable policy verdicts + human-readable reasons.
  - Support caching/injection so goblin-core can call via optional provider.

## goblin-agent (private)
- `src/loop/telegramBridge.ts`
- `src/loop/contextStore.ts`
- `src/loop/stateMachine.ts`
- `src/wallet/provisioning.ts`
- Interfaces:
  - Consume goblin-core actions through orchestrator-generated plans.
  - Maintain per-user mandate + wallet metadata without storing raw secret keys (only delegated approvals).
  - Emit explainability + safety logs for goblin-console.

## goblin-api (private)
- `src/routes/telegram/webhook.ts`
- `src/routes/plans.ts`
- `src/routes/preview.ts`
- `src/routes/simulate.ts`
- `src/routes/execute.ts`
- `src/routes/receipts.ts`
- Interfaces:
  - Call orchestrator for plan compilation, goblin-agent for execution state, goblin-policy for enforcement.
  - Provide REST responses with plan IDs and human-readable errors.
  - Authenticate requests and enforce quotas before forwarding to orchestrator/agent.

## goblin-web (private)
- `src/pages/telegram-migration.md` (docs)
- `src/app/` (React UI for retail flows)
- `src/services/apiClient.ts`
- Interfaces:
  - Call goblin-api endpoints only.
  - Render preview/simulation results and show compliance messaging from goblin-policy outputs.

## Documentation cross-cutting
- Ensure README per repo describing dependencies on others.
- Provide integration guidelines for plugging goblin-core actions into orchestrator/agent flows.
