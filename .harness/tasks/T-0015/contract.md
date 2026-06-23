# Contract

**Task ID**: T-0015  
**Phase**: Contracting  
**Created**: 2026-06-22  

---

## Scope

### In Scope

- [Feature/component 1]
- [Feature/component 2]
- [Feature/component 3]

### Out of Scope

- [Explicitly excluded 1]
- [Explicitly excluded 2]

---

## Allowed Files

```
app_taixe/**
nestjs_prisma/**
docs/harness/**
```

**Rationale**: Task involves driver app and backend only.

---

## Impacted Projects

- [ ] app_taixe
- [ ] app_user
- [ ] nestjs_prisma
- [ ] docs
- [ ] harness

---

## Acceptance Criteria

- [ ] Feature works as specified
- [ ] No lint errors: `npm run lint`
- [ ] TypeScript compiles: `npm run typecheck`
- [ ] Tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] No breaking changes to APIs
- [ ] No hard-coded secrets/API keys
- [ ] Follows project conventions
- [ ] All changes within Allowed Files

---

## API Contract Changes

### New Endpoints

```
POST /api/[resource]
  Request: { ... }
  Response: { ... }
  Status: 201 Created | 400 Bad Request | 401 Unauthorized
```

### Modified Endpoints

```
GET /api/[resource]/:id
  Before: { oldField: string }
  After: { oldField: string, newField: string }
  Breaking: No (backward compatible)
```

### Deprecated Endpoints

```
DELETE /api/[old-endpoint]
  Status: Will be removed in v2.0
```

---

## Database Impact

### Prisma Schema Changes

```prisma
model [Model] {
  id        Int     @id @default(autoincrement())
  newField  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Migrations Required

- [ ] `create_[model]` migration needed
- [ ] Data backfill needed
- [ ] Deployment: [online | offline | atomic]

---

## Test Strategy

- **Unit Tests**: [What to test]
- **Integration Tests**: [What to test]
- **API Contract Tests**: [What endpoints to verify]
- **Edge Cases**: [What edge cases]
- **Manual Testing**: [What to test manually]

---

## Sign-off

- **Planner**: [Name]
- **Code Owner**: [Name]
- **Approved**: [ ] Yes / [ ] No
- **Approved At**: 2026-06-22

