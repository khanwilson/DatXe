# New Task

Create a new task and initialize all task documents.

**Model**: Haiku 4.5 (documentation task — just creates folder structure and initializes templates)

## Usage

```
/new-task <task-description>
```

## Example

```
/new-task Implement user registration for drivers
```

## What It Does

1. Creates task folder: `docs/harness/tasks/T-XXXX-slug/`
2. Initializes all task files from templates
3. Updates `CURRENT_TASK.md`
4. Updates `TASKS.md` index

## Next Steps

After creating:
1. Review `task.md` to confirm requirement
2. Run `/planner T-XXXX` to create plan
3. Review and approve plan
4. Run `/contract T-XXXX` to create contract

