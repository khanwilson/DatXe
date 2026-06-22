# Resume Task

Resume work on an existing task from its current phase.

## Usage

```
/resume-task T-XXXX
```

## Example

```
/resume-task T-0001
```

## What It Does

1. Reads task folder `docs/harness/tasks/T-XXXX-*/`
2. Reads current `status.md` to find phase
3. Loads `task.md`, `plan.md`, `contract.md`, `evaluation.md`
4. Resumes from current phase

## Phases

- **Created**: Task initialized, awaiting planning
- **Planning**: Plan in progress
- **Contracting**: Contract in progress
- **Generating**: Implementation in progress
- **Evaluating**: Testing and checks in progress
- **Fixing**: Issues found, being fixed
- **Closing**: Final cleanup, handoff
- **Done**: Task complete

## Example: Resume from Generating

If task is in `Generating` phase:
```
/resume-task T-0001
→ Reads current implementation status
→ Continues from where it left off
```

