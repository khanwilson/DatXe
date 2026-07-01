# T-0053: Frontend — Goong Places Autocomplete Integration (app_user)

**Status**: Planned  
**Priority**: P1  
**Projects**: app_user  
**Depends On**: T-0050, T-0052

---

## Description

Implement place search (autocomplete + detail) for the "Where to?" flow in app_user. When user taps the search bar on HomeScreen, open a search screen that:
1. Calls Goong Places Autocomplete as user types
2. Shows prediction results in a list
3. On tap → fetch Place Detail (lat/lng) → navigate back with selected destination

Can call Goong directly from the app (public API key, lower latency for search-as-you-type) OR route through backend `/routes/places/autocomplete` endpoint.

---

## Scope

### In Scope
- Create `src/services/goongService.ts` (or hook) for Places Autocomplete + Detail
- Create search screen / modal (destination picker)
- Debounced search input → Goong autocomplete API
- Result list with place name + secondary text
- On select → get place coordinates via Goong Place Detail
- Return selected destination to HomeScreen (lat/lng + name)
- Add `GOONG_API_KEY` env var for frontend (if calling directly) or use backend endpoint
- Update `SearchPanel.tsx` onPressSearch to navigate to search screen

### Out of Scope
- Route calculation / display (T-0054)
- Backend changes (already done in T-0050)
- Booking confirmation flow (future task)
- Saved places (home/work) persistence

---

## Acceptance Criteria

- [ ] Search screen opens on tap "Where to?"
- [ ] Typing triggers debounced Goong autocomplete (300ms debounce)
- [ ] Results show place description + structured formatting
- [ ] Selecting a result fetches lat/lng from Place Detail
- [ ] Selected destination passed back (route param or state)
- [ ] Loading/empty/error states handled
- [ ] Vietnamese locale results by default
- [ ] TypeScript compiles
- [ ] Lint passes

---

## Technical Notes

### Goong Autocomplete API
```
GET https://rsapi.goong.io/Place/AutoComplete
  ?api_key=<KEY>
  &input=<query>
  &location=<lat>,<lng>  (optional: bias toward user location)
  &limit=5
```

Response:
```json
{
  "predictions": [
    {
      "description": "227 Nguyễn Văn Cừ, Phường 4, Quận 5, TP HCM",
      "place_id": "abc123",
      "structured_formatting": {
        "main_text": "227 Nguyễn Văn Cừ",
        "secondary_text": "Phường 4, Quận 5, TP HCM"
      }
    }
  ],
  "status": "OK"
}
```

### Goong Place Detail API
```
GET https://rsapi.goong.io/Place/Detail
  ?api_key=<KEY>
  &place_id=<place_id>
```

Response:
```json
{
  "result": {
    "place_id": "abc123",
    "name": "227 Nguyễn Văn Cừ",
    "formatted_address": "227 Nguyễn Văn Cừ, P.4, Q.5, TP.HCM",
    "geometry": {
      "location": { "lat": 10.758, "lng": 106.680 }
    }
  },
  "status": "OK"
}
```

### UX Flow
```
HomeScreen → tap "Where to?" → SearchDestinationScreen
  → type "Nguyễn" → debounce 300ms → call autocomplete
  → show results list
  → tap result → fetch detail (get lat/lng)
  → navigate back with { lat, lng, name, address }
```
