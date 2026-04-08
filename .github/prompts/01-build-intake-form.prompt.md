# Build PEN2PRO intake form

Build a production-ready intake form for PEN2PRO.

## Goal
Create a clean, sectioned intake experience for everyday users who may not know formal business language.

## Stack
- React
- Vite

## Requirements
Create reusable components for a multi-step form with these sections:

1. Idea Basics
- business idea
- short description
- industry or niche
- business type:
  - service
  - product
  - digital
  - local
  - ecommerce
  - hybrid

2. Customer & Market
- target customer
- problem being solved
- geographic market
- online, local, or both

3. Founder Resources
- startup budget
- current skills
- tools already available
- time available per week
- team size

4. Stage & Goals
- stage:
  - idea
  - startup
  - launch
  - growth
- 30-day goal
- 90-day goal
- whether user needs:
  - startup help
  - launch help
  - scale help

5. Risk & Compliance Flags
- regulated industry yes/no
- licensing concerns yes/no
- physical location needed yes/no
- employees or contractors planned yes/no

## UX requirements
- mobile responsive
- accessible labels
- helper text for non-technical users
- progress indicator
- previous/next navigation
- final review screen before submit
- inline validation errors
- clean premium layout using cards and spacing

## Technical requirements
- use controlled React state or a clean form abstraction
- emit one final JSON object
- ensure field names align with a future backend schema
- do not hard-code fake API responses
- add TODO comments where API submission will connect

## Deliverables
- intake page or component set
- validation logic
- TypeScript types or JS object contract
- example submit handler that logs structured JSON

Keep the structure modular and production-ready.