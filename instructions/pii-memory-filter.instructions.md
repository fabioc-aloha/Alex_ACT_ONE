---
description: "Guards native memory and repository continuity write boundaries against sensitive data on every persistent write"
applyTo: "**"
lastReviewed: 2026-08-18
---

# PII Memory Filter

Always-active unconscious behavior. Self-monitor before every write to persistent storage.

## Write Boundaries

This filter applies before every persistent write, including native memory and
repository continuity:

| Tier | Write Mechanism | Auto-Loaded? |
|------|-----------------|--------------|
| User Memory | `memory create /memories/` | Yes (200 lines) |
| Repo Memory | `memory create /memories/repo/` | No |
| Session Memory | `memory create /memories/session/` | No |
This instruction constrains what may enter any persistent tier. It does not
select a storage tier, transport, adapter, or publication action.

## Never Write These Categories

Before writing to ANY persistent tier, verify the content does NOT contain:

| Category | Examples | Risk |
|----------|----------|------|
| **Contact info** | Phone numbers, email addresses, physical addresses | L3 identity exposure |
| **Date of birth** | DOB, age calculations, birth year | L3 identity exposure |
| **Health data** | Diagnoses, medications, symptoms, lab values, provider names | L4 — no memory tier is appropriate |
| **Financial data** | Account numbers, balances, income, SSN, tax IDs | L4 — no memory tier is appropriate |
| **Credentials** | API keys, tokens, passwords, connection strings | L4 — use SecretStorage only |
| **File paths with usernames** | `C:\Users\username\...` | L2 identity leakage |
| **Client names** | Employer clients, project clients in fleet context | L3 confidential business data |
| **Biometric / location / behavioral** | Fingerprints, precise GPS, browsing patterns | L3–L4 depending on tier — treat as sensitive |

> **Design-time complement**: for systems that touch user data at architectural boundaries (not just memory-write boundaries), consult the `ethical-reasoning` skill's Privacy by Design (minimize / purpose-limit / anonymize / encrypt / expire) and Responsible AI (fairness / transparency / human oversight / safety) principles. This instruction fires on every persistent-storage write; the skill fires when you are designing the system that produces the writes.

## Allowed Content Per Tier

| Tier | Allowed | Not Allowed |
|------|---------|-------------|
| **User Memory** | Workflow preferences, communication style, tool patterns | Any PII, project-specific data |
| **Repo Memory** | Build commands, code conventions, architecture facts | Credentials, user identity |
| **Session Memory** | Task context, file references, in-progress state | Health data, financial data |

## Self-Check Protocol

Before writing to persistent storage, ask:

1. **Would I be comfortable if this appeared in a GitHub issue?** If no → don't write it.
2. **Does this contain a name + another identifier?** Name alone is L2. Name + phone/DOB/health = L3/L4.
3. **Is this about the person or about the work?** Work patterns are fine. Personal attributes are not.

## If PII Is Requested

When the user asks to store something containing PII:

- **Contact info** → Do not store it in native persistent memory. Use a user-approved protected system designed for contact data, or decline the write.
- **Health data** → Decline. Explain no memory tier is appropriate for L4 health data.
- **Credentials** → Direct to VS Code SecretStorage or environment variables
- **Work patterns** → Generalize: "prefers TDD" not "wrote 47 tests on Tuesday"
