# Arcora System Documentation & Research Corpus

Welcome to the Arcora technical documentation library. This repository contains the complete architectural specifications, engineering blueprints, and regional sample packs for Intelligent Document Processing (IDP).

---

## 📁 Directory Structure

```
docs/
├── architecture/                   # System design, specs, and engineering roadmaps
│   ├── Design.md                   # Product design specification, UI tokens, and UX flows
│   └── TechSpec.md                 # Full technical specification & system architecture
└── research/                       # Ground-truth validation corpus & regional dataset
    └── pakistan-sample-pack/       # Bills, official documents, and benchmark samples
        ├── bills/                  # Scraped and synthetic utility bills (FESCO, K-Electric, etc.)
        └── documents/              # Government and financial document structures
```

---

## 📖 Key Specifications

- **[Architecture & Design Specification](architecture/Design.md)**: Details the design tokens, glassmorphic atmospheric UI, responsive layouts, and user flows.
- **[Technical Specification](architecture/TechSpec.md)**: Documents the client-side AES-GCM encryption model, Firestore schema rules, multi-model LLM extraction cascading, and WebGPU ONNX pipeline.
- **[Research Sample Corpus](research/pakistan-sample-pack/)**: Reference formats for utility bills, invoices, warranty documents, and identity certificates used to validate zero-shot classification and regex extraction heuristics.
