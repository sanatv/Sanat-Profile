export type DomainArea = {
  function: string;
  summary: string;
  capabilities: string[];
  platforms: string[];
};

export const DOMAIN_EXPERTISE: DomainArea[] = [
  {
    function: "Finance / FP&A & EPM",
    summary:
      "End-to-end finance transformation — planning, consolidation, close, and CFO reporting across Fortune 500 programs.",
    capabilities: [
      "FP&A & forecasting (AOP, variance, price-volume-mix)",
      "Consolidation, close & M&A finance integration",
      "CFO & persona-based reporting, KPI design",
      "Chart of accounts rationalization & CFIN",
    ],
    platforms: ["OneStream", "Anaplan", "Oracle Hyperion / DRM", "SAP S/4 CFIN", "SAP BPC", "Oracle EDMCS"],
  },
  {
    function: "Supply Chain & Operations",
    summary:
      "Product and supply chain data foundations connecting engineering, planning, and manufacturing workflows.",
    capabilities: [
      "BOM architecture & material master design",
      "Planning & production master data",
      "Supply chain data modeling & validation",
      "Graph-based BOM visualization",
    ],
    platforms: ["SAP S/4HANA", "SAP ECC", "SAP BOM", "PLM", "Databricks", "NetworkX"],
  },
  {
    function: "CRM, Customer & Commerce",
    summary:
      "Customer, commerce, and revenue systems spanning marketing, sales, fulfillment, and quote-to-cash.",
    capabilities: [
      "Loyalty program management",
      "Campaign management",
      "Contact & account management",
      "Order management & fulfillment",
      "Quote-to-cash, billing & revenue recognition (ASC 606)",
      "Customer & commerce data analytics",
    ],
    platforms: ["Salesforce (SFDC)", "FinanceForce", "Demandware", "Zuora", "PeopleSoft CRM / ERP"],
  },
];
