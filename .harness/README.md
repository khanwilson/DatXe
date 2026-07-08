# Harness New-Style Skills + Subagents

Copy the files into these paths:

```txt
.claude/
  skills/
    architect/SKILL.md
    contractor/SKILL.md
    evaluator/SKILL.md
    implementer/SKILL.md
    planner/SKILL.md
    reviewer/SKILL.md
  agents/
    harness-architect.md
    harness-contractor.md
    harness-evaluator.md
    harness-implementer.md
    harness-planner.md
    harness-planner-opus.md
    harness-reviewer.md
    harness-closer.md
```

Recommended environment change:

```json
// remove this if present, because it forces all subagents to Haiku
"CLAUDE_CODE_SUBAGENT_MODEL": "claude-haiku-4-5-20251001"
```

Use either no `CLAUDE_CODE_SUBAGENT_MODEL`, or:

```json
"CLAUDE_CODE_SUBAGENT_MODEL": "inherit"
```

Expected routing:

```txt
Planning normal      -> harness-planner        -> claude-sonnet-4-6
Planning complex     -> harness-planner-opus   -> claude-opus-4-6
Architect escalation -> harness-architect      -> claude-opus-4-6
Contracting          -> harness-contractor     -> claude-sonnet-4-6
Implementing         -> harness-implementer    -> claude-opus-4-6
Evaluating           -> harness-evaluator      -> claude-sonnet-4-6
Reviewing            -> harness-reviewer       -> claude-sonnet-4-6
Closing              -> harness-closer         -> claude-haiku-4-5-20251001
```

Notes:

- Each skill has `context: fork` and `agent: harness-<role>`, so direct invocation like `/planner T-001` runs in the configured subagent.
- Each subagent has a `model:` field and preloads its matching skill through `skills:` where applicable.
- `harness-closer.md` is included even though no old closer skill was uploaded, because your harness pipeline has a Closing phase.
- Implementer is included too, so the ZIP is a full Harness phase package.
