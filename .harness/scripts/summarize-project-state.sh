#!/bin/bash

# summarize-project-state.sh - Summarize project state from completed tasks
# Usage: ./.harness/scripts/summarize-project-state.sh

set -e

HARNESS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TASKS_DIR="$HARNESS_ROOT/.harness/tasks"

echo "📋 Project State Summary"
echo ""

# Find all completed tasks (those with handoff.md)
echo "✅ Completed Tasks:"
COMPLETED_COUNT=0
for folder in "$TASKS_DIR"/T-[0-9]*; do
  if [ -f "$folder/handoff.md" ]; then
    TASK_NAME=$(basename "$folder")
    ((COMPLETED_COUNT++))
    echo "   $TASK_NAME"
  fi
done

if [ $COMPLETED_COUNT -eq 0 ]; then
  echo "   (None yet)"
fi

echo ""
echo "📊 Summary:"
echo "   Total completed tasks: $COMPLETED_COUNT"
echo ""
echo "📖 To review handoffs:"
echo "   ls -la $TASKS_DIR/T-*/handoff.md"

