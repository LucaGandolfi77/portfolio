# AI-Powered Project Orchestrator — Product Brief

## The Problem
Project managers and team leads waste hours on manual planning, estimation, task decomposition, and stakeholder alignment. 68% of projects miss deadlines or exceed budgets due to poor planning and weak visibility into dependencies.

## The Opportunity
Generative AI can now reliably decompose high-level goals into task DAGs, estimate effort, and generate stakeholder updates. Early movers in AI-assisted planning capture market share before incumbents fully integrate LLMs into their workflows.

## The Solution
A hosted LLM-powered project management tool that:
- Accepts a high-level goal description
- Auto-decomposes into tasks with dependencies (DAG builder)
- Allocates resources and owners
- Generates milestone plans and risk flags
- Auto-updates stakeholders as work progresses
- Provides a hybrid engine: rule-based for routine tasks (assignment, deadline alerts), LLM for creative decomposition and summarization

## Target Users
- Project managers (primary)
- Team leads in software, marketing, and operations
- Startup founders managing execution
- Agencies coordinating client work

## Why Now
- Generative AI for project management is the hottest trend in enterprise tooling
- Hosted LLM APIs (OpenAI, Anthropic, open-source) are production-ready and cheap enough for MVP
- Remote work makes automated planning and alignment more valuable
- Enterprises are actively budgeting for AI productivity tools

## Core Server Requirements
- LLM inference endpoint (hosted or open-source model serving)
- Project state graph (DAG manager)
- Real-time sync layer for live status updates
- Cost-tracking and budget optimization module
- Audit trail for compliance and accountability
- Hybrid rule-LLM engine to manage inference costs

## Monetization
- Freemium with token-based AI usage billing
- Pro subscription for teams with advanced orchestration
- Enterprise tier with private deployment and audit requirements

## Next Playbook
graphs/01-discovery.json (full market validation + Go/No-Go decision)
