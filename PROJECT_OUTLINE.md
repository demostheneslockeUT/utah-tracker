# UTAH LEGISLATIVE TRACKER - LANDING PAGE PROJECT

**Last Updated:** November 19, 2025  
**Status:** Starting Phase 1 (Static Site MVP)  
**Current Directory:** `/Users/marcuspengue/Desktop/utah-tracker/utah-tracker-site/`

---

## PROJECT VISION

Build a public-facing website for the Utah Legislative Tracker that:
1. Displays 959 bills with positions from 19 organizations
2. Allows search/filtering by bill, topic, organization
3. Shows controversial and high-agreement bills
4. Links to full Google Sheets tracker for power users
5. Eventually updates live from Google Sheets

---

## USER PREFERENCES (CRITICAL - FOLLOW THESE)

### Development Style:
- ✅ **Step-by-step terminal commands** (copy/paste ready)
- ✅ **Use sed, cat, Python scripts** for file creation
- ✅ **Test in isolation before integrating** to main pipeline
- ✅ **Validate before committing** to GitHub
- ✅ **Never download files** - create in terminal
- ❌ **No `mnt/` paths** - use `src/` directory structure
- ❌ **No file downloads** - everything via terminal commands

### File Paths:
```
utah-tracker/                          # Main repo
├── main.py                            # Pipeline orchestration
├── src/
│   ├── core/
│   │   ├── utah_legislature_fetcher.py
│   │   ├── data_merger.py
│   │   ├── sheets_writer.py
│   │   └── org_config.py             # Single source of truth for orgs
│   └── scrapers/
│       ├── __init__.py
│       ├── fogsl_scraper.py          # Just added
│       └── [other scrapers...]
└── utah-tracker-site/                 # NEW - Website directory
    ├── index.html
    ├── data/
    │   └── bills.json                # Exported from pipeline
    ├── css/
    │   └── style.css
    ├── js/
    │   └── app.js
    └── README.md
```

---

## TECHNICAL DECISIONS

### Phase 1: Static Site (Current - Week 1)
**Tech Stack:**
- HTML5 + Tailwind CSS (via CDN)
- Vanilla JavaScript (no frameworks yet)
- JSON data export from pipeline
- Host on Netlify (free, auto-deploy from GitHub)

**Why Static First:**
- ✅ Fastest to deploy (2-3 hours)
- ✅ Free hosting forever
- ✅ Test UI/UX with real users
- ✅ No backend to maintain
- ✅ Easy migration to live data later

### Phase 2: Live Data (Week 2) - 1 Hour Migration
**Changes Needed:**
- Add 30-line Google Apps Script to serve sheet as API
- Change 1 line in `app.js`: data source URL
- Redeploy to Netlify

**Migration Effort:** ~1 hour (95% of code stays the same)

---

## CURRENT STATE

### ✅ Completed:
- Pipeline fetches 959 bills from Utah Legislature API
- 19 organizations tracked (just added FOGSL 💧 and Audubon 🦆)
- Google Sheets tracker fully functional
- org_config.py updated with all 19 orgs
- Website directory created: `utah-tracker-site/`

### 🔄 In Progress:
- Building static landing page
- Need to add JSON export to pipeline

### ❌ Not Started:
- HTML/CSS/JS implementation
- Netlify deployment
- Google Apps Script (Phase 2)

---

## NEXT STEPS - EXACT COMMANDS

### Step 1: Export JSON from Pipeline (15 min)

**Add to `main.py` at the end of the `main()` function:**
```bash
cd /Users/marcuspengue/Desktop/utah-tracker

# Add export function to main.py (before if __name__ == "__main__":)
cat >> main.py << 'EXPORT_FUNC'

def export_for_website(merged_bills, stats):
    """Export bill data to JSON for static website"""
    import json
    import os
    
    # Create website data directory if needed
    os.makedirs('utah-tracker-site/data', exist_ok=True)
    
    # Prepare data for export
    export_data = {
        'bills': merged_bills,
        'stats': {
            'total_bills': stats['total'],
            'bills_with_positions': stats['with_positions'],
            'controversial': stats['controversial'],
            'high_agreement': stats['agreement'],
            'organizations': 19,
            'last_updated': datetime.now().isoformat()
        },
        'organizations': [
            {'name': org['name'], 'emoji': org['emoji'], 'field_name': org['field_name']}
            for org in ORGANIZATIONS
        ]
    }
    
    # Write to JSON
    output_path = 'utah-tracker-site/data/bills.json'
    with open(output_path, 'w') as f:
        json.dump(export_data, f, indent=2)
    
    print(f"\n✅ Exported {len(merged_bills)} bills to {output_path}")
    print(f"   File size: {os.path.getsize(output_path) / 1024:.1f} KB")

EXPORT_FUNC

# Add call to export function (before final print statements)
sed -i '' '/print("="*60)/i\
    # Export data for website\
    export_for_website(merged_bills, {\
        '\''total'\'': len(merged_bills),\
        '\''with_positions'\'': bills_with_positions,\
        '\''controversial'\'': len(controversial),\
        '\''agreement'\'': len(high_agreement)\
    })\
' main.py
```

**Test the export:**
```bash
python3 main.py  # Will add bills.json to utah-tracker-site/data/
```

---

### Step 2: Build HTML Layout (30 min)

**Location:** `utah-tracker-site/index.html`

**Design:**
```
┌─────────────────────────────────────────┐
│  HERO SECTION                           │
│  - Utah Legislative Tracker             │
│  - Stats: 959 bills, 19 orgs           │
│  - Search bar                           │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  FILTERS (Sidebar or Top)               │
│  - By Organization (checkboxes)         │
│  - By Status (dropdown)                 │
│  - Controversial / Agreement toggle     │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  BILL CARDS (Grid)                      │
│  ┌─────────┐  ┌─────────┐              │
│  │ HB0001  │  │ HB0002  │              │
│  │ Title   │  │ Title   │              │
│  │ 🌱🗽📊  │  │ 🦆💧    │              │
│  └─────────┘  └─────────┘              │
└─────────────────────────────────────────┘
```

---

### Step 3: Add Search/Filter Logic (30 min)

**Location:** `utah-tracker-site/js/app.js`

**Key Functions Needed:**
```javascript
// Load bills from JSON
async function loadBills() { ... }

// Search by bill number or keyword
function searchBills(query) { ... }

// Filter by organization
function filterByOrg(orgFieldName) { ... }

// Filter by status
function filterByStatus(status) { ... }

// Show controversial bills
function showControversial() { ... }

// Render bill cards
function renderBills(bills) { ... }
```

---

### Step 4: Style with Tailwind (30 min)

**Using Tailwind CDN (simplest):**
```html
<!-- In <head> of index.html -->
<script src="https://cdn.tailwindcss.com"></script>
```

**Color Scheme:**
- Green: Support positions
- Red: Oppose positions
- Blue: Watching positions
- Neutral: Gray/slate for cards

---

### Step 5: Deploy to Netlify (15 min)
```bash
# Initialize git in website directory (if not already)
cd utah-tracker-site
git init
git add .
git commit -m "Initial website commit"

# Create GitHub repo and push
# (Or push to utah-tracker repo in a separate branch)

# Deploy to Netlify:
# 1. Go to netlify.com
# 2. "Add new site" → "Import from Git"
# 3. Select utah-tracker-site directory
# 4. Deploy!
```

**Netlify will give you:** `https://utah-tracker.netlify.app`

---

## VALIDATION CHECKLIST

Before committing anything:
- [ ] JSON export creates valid `bills.json`
- [ ] Website loads locally (open `index.html` in browser)
- [ ] Search works
- [ ] Filters work
- [ ] Bill cards display correctly
- [ ] Org positions color-coded
- [ ] Mobile responsive (test on phone)
- [ ] No console errors
- [ ] Links to Google Sheet work

---

## MIGRATION TO PHASE 2 (Later)

**When ready for live data from Google Sheets:**

1. **Create Apps Script** (20 min)
   - Extensions → Apps Script in Google Sheet
   - Paste 30-line script to serve data as JSON
   - Deploy as web app
   - Copy URL

2. **Update Frontend** (5 min)
```javascript
   // Change this line in app.js:
   const response = await fetch('https://script.google.com/YOUR_ID/exec');
```

3. **Redeploy** (5 min)
   - Commit change
   - Netlify auto-deploys

**Total migration time:** ~1 hour

---

## IMPORTANT REMINDERS

### Before Every Commit:
1. Test in isolation
2. Run validation checklist
3. No broken features
4. Clean git status (no unrelated files)

### File Creation Pattern:
```bash
# Use cat for multi-line files
cat > filename.ext << 'EOF'
[content here]
