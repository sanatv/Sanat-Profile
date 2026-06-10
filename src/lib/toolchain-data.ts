export type ToolchainTool = {
  name: string;
  detail: string;
};

export type ToolchainGroup = {
  category: string;
  description: string;
  tools: ToolchainTool[];
};

export const AI_TOOLCHAIN: ToolchainGroup[] = [
  {
    category: "Agentic Coding Agents",
    description:
      "Daily-driver AI coding agents used to build demos, prototypes, and reusable accelerators at speed.",
    tools: [
      { name: "Claude Code", detail: "Terminal-first agentic development with skills, subagents, and MCP tooling" },
      { name: "OpenAI Codex", detail: "Cloud and CLI coding agent for delegated, parallel build tasks" },
      { name: "Cursor", detail: "AI-native IDE for rapid product iteration and refactoring" },
      { name: "Google Antigravity", detail: "Agent-first IDE orchestrating Gemini-powered autonomous workflows" },
      { name: "Gemini CLI", detail: "Command-line agent for scripting, automation, and codebase Q&A" },
    ],
  },
  {
    category: "Agent Infrastructure & Protocols",
    description: "The plumbing that connects agents to enterprise data, tools, and workflows.",
    tools: [
      {
        name: "Model Context Protocol (MCP)",
        detail: "Standardized tool and data connections between agents and enterprise systems",
      },
      { name: "FastAPI", detail: "Python service layer for AI backends, retrieval APIs, and agent endpoints" },
      { name: "Agentic Patterns", detail: "Tool use, RAG, evals, and multi-agent orchestration blueprints" },
    ],
  },
  {
    category: "Frontier Models & Platforms",
    description: "Model platforms behind the demos, prototypes, and enablement blueprints.",
    tools: [
      { name: "OpenAI GPT", detail: "LLM applications, structured outputs, and assistant experiences" },
      { name: "Google Gemini", detail: "Multimodal analysis and Gemini-powered enterprise workflows" },
      { name: "Anthropic Claude", detail: "Agentic reasoning, long-context analysis, and coding agents" },
    ],
  },
];
