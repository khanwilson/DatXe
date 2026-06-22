#!/bin/bash

# create-task.sh - Create a new task folder with template files
# Usage: ./.harness/scripts/create-task.sh "Task title"

set -e

HARNESS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TASKS_DIR="$HARNESS_ROOT/.harness/tasks"
TEMPLATES_DIR="$HARNESS_ROOT/.harness/templates"

if [ $# -lt 1 ]; then
  echo "Usage: $0 \"Task title\""
  exit 1
fi

TASK_TITLE="$1"

# Check if directories exist
if [ ! -d "$TASKS_DIR" ]; then
  echo "❌ Error: Tasks directory not found: $TASKS_DIR"
  exit 1
fi

if [ ! -d "$TEMPLATES_DIR" ]; then
  echo "❌ Error: Templates directory not found: $TEMPLATES_DIR"
  exit 1
fi

# Find next task ID (max existing ID + 1)
NEXT_ID=1
for dir in "$TASKS_DIR"/T-[0-9]*; do
  if [ -d "$dir" ]; then
    DIR_NAME=$(basename "$dir")
    ID=${DIR_NAME#T-}
    ID=${ID%%-*}
    # Remove leading zeros for arithmetic
    ID=$((10#$ID))
    if [ "$ID" -ge "$NEXT_ID" ]; then
      NEXT_ID=$((ID + 1))
    fi
  fi
done

# Pad ID to 4 digits
TASK_ID=$(printf "T-%04d" $NEXT_ID)

TASK_FOLDER="$TASKS_DIR/$TASK_ID"

# Create task folder
mkdir -p "$TASK_FOLDER"

echo "📝 Creating task: $TASK_ID"
echo "📁 Folder: $TASK_FOLDER"

# Copy and customize templates
NOW=$(date -u +"%Y-%m-%d")

# task.md
sed "s/T-XXXX/$TASK_ID/g; s/\[Task title\]/$TASK_TITLE/g; s/\[Date\]/$NOW/g" \
  "$TEMPLATES_DIR/task.template.md" > "$TASK_FOLDER/task.md"

# status.md
sed "s/T-XXXX/$TASK_ID/g; s/\[Task title\]/$TASK_TITLE/g; s/2026-06-22/$NOW/g" \
  "$TEMPLATES_DIR/status.template.md" > "$TASK_FOLDER/status.md"

# plan.md
sed "s/T-XXXX/$TASK_ID/g; s/\[Date\]/$NOW/g" \
  "$TEMPLATES_DIR/plan.template.md" > "$TASK_FOLDER/plan.md"

# contract.md
sed "s/T-XXXX/$TASK_ID/g; s/\[Date\]/$NOW/g" \
  "$TEMPLATES_DIR/contract.template.md" > "$TASK_FOLDER/contract.md"

# implementation.md
sed "s/T-XXXX/$TASK_ID/g; s/\[Date\]/$NOW/g" \
  "$TEMPLATES_DIR/implementation.template.md" > "$TASK_FOLDER/implementation.md"

# evaluation.md
sed "s/T-XXXX/$TASK_ID/g; s/\[Date\]/$NOW/g" \
  "$TEMPLATES_DIR/evaluation.template.md" > "$TASK_FOLDER/evaluation.md"

# files-changed.md
sed "s/T-XXXX/$TASK_ID/g; s/\[Date\]/$NOW/g" \
  "$TEMPLATES_DIR/files-changed.template.md" > "$TASK_FOLDER/files-changed.md"

# decisions.md
sed "s/T-XXXX/$TASK_ID/g; s/\[Date\]/$NOW/g" \
  "$TEMPLATES_DIR/decisions.template.md" > "$TASK_FOLDER/decisions.md"

# handoff.md
sed "s/T-XXXX/$TASK_ID/g; s/\[Task title\]/$TASK_TITLE/g; s/\[Date\]/$NOW/g" \
  "$TEMPLATES_DIR/handoff.template.md" > "$TASK_FOLDER/handoff.md"

echo ""
echo "✅ Task created successfully!"
echo ""
echo "📂 Task folder: $TASK_FOLDER"
echo ""
echo "📋 Next steps:"
echo "  1. Review task/task.md"
echo "  2. Run: /harness-planner $TASK_ID"
echo "  3. Create contract in $TASK_ID/contract.md"
echo ""
echo "📖 Task files:"
ls -1 "$TASK_FOLDER" | sed 's/^/   /'

