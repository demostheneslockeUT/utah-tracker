# Dynamic Loading Guide - Utah Tracker Website

**Last Updated:** November 21, 2025

---

## Core Principle

**NEVER hardcode data that changes.** Always load from `data/bills.json`.

The pipeline (`main.py`) is the single source of truth. Website JS files consume what the pipeline exports.

---

## What Should Be Dynamic

| Data | Source | Why |
|------|--------|-----|
| Organizations | `data.organizations` | We add new orgs regularly |
| Bills | `data.bills` | Changes every pipeline run |
| Stats | `data.stats` | Total counts change |
| Field names | `org.field_name` | Must match pipeline exactly |

---

## Standard Pattern
```javascript
// ✅ CORRECT: Load from bills.json
let ORGANIZATIONS = [];

async function loadData() {
    const response = await fetch('data/bills.json');
    const data = await response.json();
    ORGANIZATIONS = data.organizations;
    renderUI();
}

// ❌ WRONG: Hardcoded array
const ORGANIZATIONS = [
    { name: 'HEAL Utah', emoji: '🌱', id: 'heal_utah' },
    // ... this will get outdated!
];
```

---

## Common Mistakes

### 1. Hardcoding organization lists
```javascript
// ❌ BAD - Will be outdated next week
const ORGS = ['HEAL Utah', 'Libertas', 'UEA'];

// ✅ GOOD - Always current
const data = await fetch('data/bills.json').then(r => r.json());
const ORGS = data.organizations;
```

### 2. Mismatched field names
```javascript
// ❌ BAD - signup.js uses 'aclu' but pipeline uses 'aclu_of_utah'
{ name: 'ACLU', id: 'aclu' }

// ✅ GOOD - Use field_name from bills.json
{ name: org.name, id: org.field_name }
```

### 3. Hardcoding org count
```javascript
// ❌ BAD - Says "19 orgs" but we now have 26
<p>Track bills across 19 organizations</p>

// ✅ GOOD - Dynamic count
<p>Track bills across ${data.organizations.length} organizations</p>
```

### 4. Forgetting fallbacks
```javascript
// ❌ BAD - Crashes if fetch fails
const data = await fetch('data/bills.json').then(r => r.json());

// ✅ GOOD - Has fallback
try {
    const data = await fetch('data/bills.json').then(r => r.json());
    ORGANIZATIONS = data.organizations;
} catch (error) {
    console.error('Failed to load, using fallback');
    ORGANIZATIONS = getFallbackOrgs();
}
```

### 5. Case sensitivity in field matching
```javascript
// ❌ BAD - Weekly digest expects 'Email', signup sends 'email'
{ email: formData.get('email') }

// ✅ GOOD - Match the expected format
{ Email: formData.get('email') }
```

---

## Data Flow
```
org_config.py (source of truth)
      ↓
main.py (pipeline)
      ↓
data/bills.json (exported data)
      ↓
Website JS files (consume via fetch)
```

**When adding a new org:**
1. Add to `src/core/org_config.py`
2. Add scraper to `src/scrapers/`
3. Run pipeline (`python3 main.py`)
4. Website automatically has new org ✅

---

## Files That Must Use Dynamic Loading

| File | What to load dynamically |
|------|-------------------------|
| `js/signup.js` | Organizations list |
| `js/app.js` | Organizations, bills, stats |
| `js/filters.js` | Organization filter options |
| `index.html` | Stats in hero section |
| `compare.html` | Organization comparisons |

---

## Testing Dynamic Loading

After changing any JS file:
```bash
# Start local server
cd /Users/marcuspengue/Desktop/utah-tracker/utah-tracker-site
python3 -m http.server 8080

# Open in browser
open http://localhost:8080/signup.html

# Check console for:
# ✅ Loaded 26 organizations from bills.json
```

---

## Fallback Strategy

Always have a minimal fallback for critical features:
```javascript
function getFallbackOrgs() {
    // Minimal set that's unlikely to change
    return [
        { name: 'HEAL Utah', emoji: '🌱', id: 'heal_utah' },
        { name: 'Libertas Institute', emoji: '🗽', id: 'libertas' },
        { name: 'Utah Education Association', emoji: '🎓', id: 'utah_education_association' }
    ];
}
```

---

## Quick Reference: bills.json Structure
```json
{
  "bills": [...],
  "stats": {
    "total_bills": 959,
    "bills_with_positions": 450,
    "controversial": 16,
    "high_agreement": 10,
    "organizations": 26,
    "last_updated": "2025-11-21T..."
  },
  "organizations": [
    {
      "name": "HEAL Utah",
      "emoji": "🌱",
      "field_name": "heal_utah"
    },
    ...
  ]
}
```

---

## Checklist Before Committing JS Changes

- [ ] No hardcoded organization arrays
- [ ] No hardcoded org counts
- [ ] Field names match `org.field_name` from bills.json
- [ ] Has try/catch with fallback for fetch
- [ ] Tested with `python3 -m http.server 8080`
- [ ] Console shows "Loaded X organizations from bills.json"
