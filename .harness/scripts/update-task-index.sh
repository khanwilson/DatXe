#!/bin/bash

# update-task-index.sh - Update TASKS.md index from task folders
# Usage: ./.harness/scripts/update-task-index.sh

set -e

HARNESS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TASKS_DIR="$HARNESS_ROOT/.harness/tasks"
TASKS_INDEX="$HARNESS_ROOT/.harness/TASKS.md"

if [ ! -d "$TASKS_DIR" ]; then
  echo "❌ Tasks directory not found: $TASKS_DIR"
  exit 1
fi

echo "📊 Updating task index..."

# Count tasks
TASK_COUNT=0
for folder in "$TASKS_DIR"/T-[0-9]*; do
  if [ -d "$folder" ]; then
    ((TASK_COUNT++))
  fi
done

echo "   Found $TASK_COUNT tasks"
echo ""
echo "✅ Task index update support: To be fully implemented"
echo "   For now, manually update $TASKS_INDEX with new tasks"

