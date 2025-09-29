# Pending Confirmations

1. First tranche of reusable code (agent kit, wallet adapters, token/defi/misc plugins) should land in **goblin-core (public)** — confirm?
2. Should all Telegram-specific glue (Next.js handlers, Firebase/Postgres state) migrate into **goblin-api** (HTTP) and/or **goblin-agent** (loop), or be deprecated? Yes/No.
3. Do token risk/policy fetchers (e.g., RugCheck, Messari) move to **goblin-policy** so public primitives stay data-agnostic? Yes/No.
4. Are we focusing on Solana-only adapters in goblin-core for now, deferring EVM support to later? Yes/No.
5. Is the MCP adapter intended to remain open-source alongside goblin-core? Yes/No.
6. Should goblin-core expose optional hooks for private policy enforcement (e.g., slippage caps) instead of hardcoding thresholds? Yes/No.
