#!/bin/bash

# run-checks.sh - Run lint, typecheck, test, build for affected projects
# Usage: ./.harness/scripts/run-checks.sh [projects]
# If no projects specified, checks all projects with package.json

set -e

HARNESS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECTS=("app_taixe" "app_user" "nestjs_prisma")
if [ $# -gt 0 ]; then
  PROJECTS=("$@")
fi

FAILED_PROJECTS=()
PASSED_PROJECTS=()
SKIPPED_PROJECTS=()

echo -e "${BLUE}🔍 Running checks for: ${PROJECTS[*]}${NC}"
echo ""

for PROJECT in "${PROJECTS[@]}"; do
  PROJECT_DIR="$HARNESS_ROOT/$PROJECT"

  if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}⏭️  Skipping: $PROJECT (directory not found)${NC}"
    SKIPPED_PROJECTS+=("$PROJECT")
    continue
  fi

  if [ ! -f "$PROJECT_DIR/package.json" ]; then
    echo -e "${YELLOW}⏭️  Skipping: $PROJECT (no package.json)${NC}"
    SKIPPED_PROJECTS+=("$PROJECT")
    continue
  fi

  echo -e "${BLUE}📦 Checking: $PROJECT${NC}"

  cd "$PROJECT_DIR"

  # Detect package manager
  PKG_MANAGER="npm"
  if [ -f "pnpm-lock.yaml" ]; then
    PKG_MANAGER="pnpm"
  elif [ -f "yarn.lock" ]; then
    PKG_MANAGER="yarn"
  elif [ -f "package-lock.json" ]; then
    PKG_MANAGER="npm"
  fi

  echo "  📌 Using: $PKG_MANAGER"

  PROJECT_FAILED=0

  # Run checks in order
  CHECKS=("lint" "typecheck" "test" "build")

  # For nestjs_prisma, add prisma checks
  if [ "$PROJECT" = "nestjs_prisma" ]; then
    CHECKS=("prisma:validate" "lint" "typecheck" "test" "build")
  fi

  for CHECK in "${CHECKS[@]}"; do
    if grep -q "\"$CHECK\"" "$PROJECT_DIR/package.json" 2>/dev/null; then
      echo -n "  ▸ $CHECK... "
      if $PKG_MANAGER run "$CHECK" > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
      else
        echo -e "${RED}❌${NC}"
        PROJECT_FAILED=1
      fi
    else
      echo "  ▸ $CHECK... ${YELLOW}skipped${NC} (not in scripts)"
    fi
  done

  if [ $PROJECT_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ $PROJECT passed${NC}"
    PASSED_PROJECTS+=("$PROJECT")
  else
    echo -e "${RED}❌ $PROJECT failed${NC}"
    FAILED_PROJECTS+=("$PROJECT")
  fi

  echo ""

  cd "$HARNESS_ROOT"
done

echo -e "${BLUE}📊 Summary${NC}"
echo "  ✅ Passed: ${#PASSED_PROJECTS[@]} - ${PASSED_PROJECTS[*]:-none}"
echo "  ❌ Failed: ${#FAILED_PROJECTS[@]} - ${FAILED_PROJECTS[*]:-none}"
echo "  ⏭️  Skipped: ${#SKIPPED_PROJECTS[@]} - ${SKIPPED_PROJECTS[*]:-none}"
echo ""

if [ ${#FAILED_PROJECTS[@]} -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some checks failed${NC}"
  exit 1
fi

