```mermaid
flowchart TD
  TG[Telegram User Message]
  Webhook[Next.js /grammy webhook handler]
  AgentInit[initializeAgent()
- create SolanaAgentKit
- load plugins/actions]
  Planner[LangChain React Agent LLM loop]
  ActionExec[executeAction()
(validate input, call handler)]
  Primitive[On-chain tool (e.g., Jupiter trade,
Orca CLMM, sendTx)]
  Wallet[Wallet.signOrSendTX / signAndSendTransaction]
  SolanaRPC[SOL RPC Endpoint]
  Reply[Telegram Response via ctx.reply]

  TG --> Webhook
  Webhook --> AgentInit
  AgentInit --> Planner
  Planner -->|Tool call| ActionExec
  ActionExec --> Primitive
  Primitive --> Wallet
  Wallet --> SolanaRPC
  SolanaRPC --> Wallet
  Primitive --> Planner
  Planner --> Webhook
  Webhook --> Reply
```
