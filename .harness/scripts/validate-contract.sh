#!/bin/bash

# validate-contract.sh - Validate contract for a task
# Usage: ./.harness/scripts/validate-contract.sh T-0001

set -e

HARNESS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [ $# -lt 1 ]; then
  echo "Usage: $0 T-XXXX"
  exit 1
fi

TASK_ID="$1"
TASK_FOLDER="$HARNESS_ROOT/.harness/tasks/$TASK_ID"*

# Find task folder
FOUND_FOLDER=""
for folder in $TASK_FOLDER; do
  if [ -d "$folder" ]; then
    FOUND_FOLDER="$folder"
    break
  fi
done

if [ -z "$FOUND_FOLDER" ]; then
  echo "❌ Task folder not found for: $TASK_ID"
  exit 1
fi

TASK_FOLDER="$FOUND_FOLDER"
TASK_SHORT=$(basename "$TASK_FOLDER")

echo "🔍 Validating contract for: $TASK_SHORT"
echo ""

# Check required files
REQUIRED_FILES=("task.md" "contract.md" "status.md")

echo "📋 Checking required files:"
for FILE in "${REQUIRED_FILES[@]}"; do
  if [ -f "$TASK_FOLDER/$FILE" ]; then
    echo "  ✅ $FILE"
  else
    echo "  ❌ $FILE (missing)"
  fi
done

echo ""
echo "📄 Checking contract.md content:"

CONTRACT="$TASK_FOLDER/contract.md"

if [ ! -f "$CONTRACT" ]; then
  echo "❌ contract.md not found"
  exit 1
fi

# Check for required sections
SECTIONS=("## Scope" "## Allowed Files" "## Acceptance Criteria" "## Impacted Projects")

for SECTION in "${SECTIONS[@]}"; do
  if grep -q "$SECTION" "$CONTRACT"; then
    echo "  ✅ $SECTION"
  else
    echo "  ❌ $SECTION (missing)"
  fi
done

echo ""
echo "✅ Contract validation complete"
echo ""
echo "📂 Task folder: $TASK_FOLDER"

