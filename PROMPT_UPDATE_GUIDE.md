# Prompt Update Guide - Climb the Ladder

**Last Updated:** November 26, 2025

---

## Overview

The "Climb the Ladder" feature uses prompts stored in `data/prompts.json`. The source of truth is the Google Sheet:

**Google Sheet URL:**  
https://docs.google.com/spreadsheets/d/1lyWzCUU790hdy9veEzXDboegWJvoep29uHBd4UirXmE/edit?gid=0#gid=0

---

## Workflow: Adding New Prompts

### Step 1: Add to Google Sheet

Add new rows with these columns:
| Column | Description | Example |
|--------|-------------|---------|
| ID | Unique number | 51 |
| Topic | Main category | Healthcare |
| Subtopic | Specific focus | insulin prices |
| Stance_Target | Who this challenges | market_healthcare |
| Provocative_Level | 1-10 (10 = most challenging) | 7 |
| Prompt_Type | statistic, question, scenario, perspective, economic, historical, comparison, practical | question |
| Prompt_Text | The actual prompt | "If market competition works..." |
| Source_Type | author, organization, academic_study, government_data, think_tank, historical | author |
| Source_Name | Who said it | Author |
| Source_URL | Link (if applicable) | https://... |
| Is_Author_Content | TRUE/FALSE | TRUE |
| Date_Added | YYYY-MM-DD | 2025-11-26 |
| Tags | comma-separated | drugs,pricing,practical |
| Notes | Internal notes | High impact |

### Step 2: Export to CSV

1. In Google Sheets: File → Download → CSV
2. Save as `prompts_export.csv` in utah-tracker-public/

### Step 3: Run Conversion Script
```bash
cd /Users/marcuspengue/Desktop/utah-tracker-public
python3 scripts/convert_prompts.py
```

### Step 4: Verify
```bash
# Check prompt count
grep -c '"id":' data/prompts.json

# Check new prompts appear
tail -50 data/prompts.json
```

### Step 5: Test Locally
```bash
python3 -m http.server 8080
# Visit http://localhost:8080/climb.html
```

### Step 6: Commit
```bash
git add data/prompts.json
git commit -m "Data: Add X new prompts (total: Y)"
git push origin main
```

---

## Prompt Categories

**Fact Types** (📊 blue badge):
- `statistic` - Data/numbers
- `economic` - Economic data/analysis
- `historical` - Historical events
- `comparison` - Comparing systems/countries

**Idea Types** (💭 purple badge):
- `question` - Provocative questions
- `scenario` - Hypothetical situations
- `perspective` - Viewpoint explanation
- `practical` - Real-world implications

---

## Topic Coverage

Current topics (16):
- Abortion, Immigration, Gun Control, Education
- Tax Policy, Labor, Healthcare, Trans Rights
- LGBTQ+ Rights, Criminal Justice, Housing
- Environment, Government, Disability Rights
- Business, Multiple (meta-prompts)

---

## Stance Targets

These determine WHO the prompt challenges:

| Stance Target | Challenges |
|---------------|------------|
| pro-life | Pro-life people |
| pro-choice | Pro-choice people |
| pro_gun | Gun rights supporters |
| gun_control | Gun control supporters |
| universal_healthcare | Universal healthcare supporters |
| market_healthcare | Free market healthcare supporters |
| restrictive_immigration | Immigration restrictionists |
| open_immigration | Open immigration supporters |
| school_choice | School choice supporters |
| public_education | Public education supporters |
| pro_union | Union supporters |
| anti_union | Union opponents |
| conservative | Conservatives generally |
| progressive | Progressives generally |

---

## Provocative Levels

| Level | Label | Description |
|-------|-------|-------------|
| 1-3 | Gentle | Soft challenges, easy entry |
| 4-6 | Moderate | Requires some reflection |
| 7-8 | Challenging | Uncomfortable, forces deep thought |
| 9-10 | Intense | Reserved for hardest challenges |

Users start at level 3 tolerance, increases as they engage.

---

## File Locations
```
utah-tracker-public/
├── data/
│   └── prompts.json          # Live prompt data
├── js/
│   └── climb.js              # Climb page logic
├── climb.html                # Climb page
├── scripts/
│   └── convert_prompts.py    # CSV → JSON converter
└── PROMPT_UPDATE_GUIDE.md    # This file
```

---

## Quick Reference
```bash
# Check current prompt count
grep -c '"id":' data/prompts.json

# Find prompts by topic
grep -i "healthcare" data/prompts.json | head -5

# Validate JSON syntax
python3 -m json.tool data/prompts.json > /dev/null && echo "Valid JSON"
```
