# Proposed Component Placement

| Repo A Path | Purpose | Proposed Repo | Why (Decision Rule) | Open Questions |
| --- | --- | --- | --- | --- |
| packages/core/src/agent/index.ts | Core agent wrapper exposing connection + plugin loading. | goblin-core (public) | Fundamental executor SDK primitive for all higher layers. | None. |
| packages/core/src/types/index.ts | Shared type contracts for plugins/actions. | goblin-core (public) | Required to define primitives and SDK surface. | Confirm exposure of config keys that reference private APIs is acceptable publicly? |
| packages/core/src/types/wallet.ts | Wallet abstraction & tx dispatcher. | goblin-core (public) | Wallet adapters and execution utilities belong in primitives repo. | Should `signOrSendTX` remain in public repo if private policy logic hooks into it later? |
| packages/core/src/utils/send_tx.ts | Compute-budget + send pipeline. | goblin-core (public) | Transaction execution primitive. | Need to ensure HELIUS API usage is optional without leaking private endpoints. |
| packages/core/src/utils/actionExecutor.ts | Validated action execution helper. | goblin-core (public) | Shared primitive used by multiple tool adapters. | None. |
| packages/core/src/utils/keypairWallet.ts | Local keypair wallet adapter. | goblin-core (public) | Wallet adapter per decision rules. | Non-custodial stance: keep as dev-only? maybe flagged for docs only? |
| packages/core/src/utils/getMintInfo.ts | SPL token metadata fetch. | goblin-core (public) | Low-level chain query primitive. | None. |
| packages/core/src/constants/index.ts | Default mints/config values. | goblin-core (public) | SDK constants for primitives. | Confirm no private partner addresses embedded. |
| packages/core/src/langchain/index.ts | LangChain tool shim. | goblin-core (public) | SDK integrations for planners to call primitives. | Should LLM adapters move to orchestrator instead? |
| packages/core/src/openai/* | OpenAI tool bridge. | goblin-core (public) | Part of SDK for LLM frameworks. | Validate exposing Agents API glue publicly. |
| packages/core/src/vercel-ai/index.ts | Vercel AI adapter. | goblin-core (public) | Same as above. | None. |
| packages/adapter-mcp/src/index.ts | MCP server adapter. | goblin-core (public) | Developer integration exposing primitives via MCP. | Need to confirm MCP bridge remains public. |
| packages/plugin-token/src/index.ts & subtools | Token swaps, balances, external quote APIs. | goblin-core (public) | Execution primitives (swap, stake, price fetch). | Some actions use partner APIs (Jupiter, RugCheck). Ensure licensing/compliance ok for public. |
| packages/plugin-defi/src/**/*.ts | DeFi protocol executors (Orca, Drift, etc.). | goblin-core (public) | Protocol-level primitives/executors. | Some files contain large generated IDLs—should any partner-specific configs move to goblin-policy/data? |
| packages/plugin-misc/src/**/*.ts | Domain/risk/oracle utilities. | goblin-core (public) | Mixed primitives (webhooks, oracle sim, squads). | Contains risk intelligence fetchers (Messari, RugCheck) – should results feed into private policy repo instead? |
| packages/plugin-token/src/rugcheck/tools/rugcheck.ts | Token risk check fetcher. | goblin-policy (private) | Consumes third-party risk data -> closer to policy evaluation than execution. | Decide if risk heuristics stay public or align with policy repo. |
| examples/social/tg-bot-starter/**/route.ts | Telegram HTTP handlers & UX glue. | goblin-api (private) or goblin-web (private) | HTTP endpoints bridging user chat to agent; not primitives. | Are Telegram bots still in scope? Should migrate to orchestrator/api or be archived? |
| examples/social/tg-bot-starter/** (Firebase/Postgres state) | User wallet mgmt & storage. | goblin-agent (private) or goblin-api | Implements autonomous loop scaffolding + persistence. | Need policy review for storing private keys (violates non-custodial). |
| packages/plugin-misc/src/switchboard/tools/simulate_feed.ts | Oracle simulation. | goblin-core (public) | Simulation primitive for actions. | None. |
| packages/plugin-token/src/jupiter/tools/trade.ts | Swap execution pipeline. | goblin-core (public) | Direct executor primitive. | Confirm new architecture still uses Jupiter as core primitive. |
| docs/examples referencing Telegram | Developer guides for Telegram integration. | goblin-web or goblin-api docs (private) | Support material for front-end/service layer. | Keep as docs in which repo? |
