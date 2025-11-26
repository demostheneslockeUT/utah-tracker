# 2026 LEGISLATIVE SESSION CHECKLIST

**When:** January 2026 (session typically starts late January)
**Prep Start:** January 1, 2026
**Estimated Time:** 4-6 hours total

---

## PHASE 1: API & Core Updates (30 min)

### Utah Legislature API
- [ ] Update `src/core/utah_legislature_fetcher.py`: Change `2025GS` → `2026GS`
- [ ] Test API endpoint: `https://glen.le.utah.gov/bills/2026GS/billlist/{token}`
- [ ] Verify API token still works (check `.env` file)

### Fiscal Notes
- [ ] Update `scripts/scrape_fiscal_notes.py`: Change `2025GS` → `2026GS`
- [ ] Test URL: `https://pf.utleg.gov/public-web/sessions/2026GS/fiscal-notes/`

### Bill Language Analyzer
- [ ] Update `scripts/analyze_bill_language.py`: Change `2025` → `2026` in XML URLs
- [ ] Test URL: `https://le.utah.gov/Session/2026/bills/introduced/`

---

## PHASE 2: Organization Scrapers (2-3 hours)

**Each scraper may have URL changes. Test each one individually.**

### Priority 1: High-value scrapers
- [ ] `libertas_scraper.py` - Check bill tracker URL
- [ ] `uea_scraper.py` - Check bill tracker URL
- [ ] `heal_scraper.py` - Check bill tracker URL
- [ ] `salt_lake_chamber_scraper.py` - Check watchlist URL

### Priority 2: Other active scrapers
- [ ] `planned_parenthood_scraper.py`
- [ ] `utah_pta_scraper.py`
- [ ] `ulct_scraper.py`
- [ ] `better_utah_scraper.py`
- [ ] `equality_utah_scraper.py`
- [ ] `aclu_utah_scraper.py`
- [ ] `utah_rivers_council_scraper.py`

### Priority 3: Remaining scrapers
- [ ] Check all scrapers in `src/scrapers/` directory
- [ ] Run each with `python3 src/scrapers/[name]_scraper.py`
- [ ] Document any that need URL updates

### Common Issues to Watch:
- Table IDs changing (Libertas uses Airtable)
- New page structures
- Authentication/CAPTCHA added
- PDF-only trackers (may need manual entry)

---

## PHASE 3: Clear Old Data (5 min)
```bash
# Clear all cached/generated data
rm -f data/bill_language.json
rm -f data/fiscal_notes.json
rm -f data/bill_summaries.json
rm -f cache/*.json  # If cache directory exists

# Keep these (static reference data):
# - data/legislators.json (update separately if needed)
# - data/org_config.json
```

---

## PHASE 4: Generate Fresh Data (1-2 hours)

### Step 1: Run main pipeline
```bash
cd /Users/marcuspengue/Desktop/utah-tracker
source venv/bin/activate
python3 main.py
```
**Expected:** ~959 new bills fetched, org positions merged

### Step 2: Generate language analysis
```bash
python3 scripts/analyze_bill_language.py --all
```
**Expected:** ~5-10 min, creates `data/bill_language.json`

### Step 3: Generate fiscal notes
```bash
python3 scripts/scrape_fiscal_notes.py --all
```
**Expected:** ~15-20 min, creates `data/fiscal_notes.json`

### Step 4: (Optional) Generate AI summaries
```bash
python3 scripts/generate_bill_summaries.py --all
```
**Expected:** ~30 min, costs ~$2-5, creates `data/bill_summaries.json`

---

## PHASE 5: Deploy to Website (15 min)
```bash
# Copy to public site
cd /Users/marcuspengue/Desktop/utah-tracker-public
cp ../utah-tracker/utah-tracker-site/data/bills.json data/
cp ../utah-tracker/data/bill_language.json data/
cp ../utah-tracker/data/fiscal_notes.json data/
cp ../utah-tracker/data/bill_summaries.json data/  # If generated

# Commit and push
git add data/
git commit -m "2026 Session: Initial data load"
git push origin main
```

---

## PHASE 6: Validation (30 min)

### Website Checks
- [ ] Homepage loads with new bills
- [ ] Bill count shows ~900+ bills
- [ ] Search works
- [ ] Filters work
- [ ] Bill detail pages load
- [ ] Policy Analysis page works (language + fiscal)
- [ ] Org positions display correctly

### Data Quality Checks
- [ ] At least 3-5 orgs have positions on bills
- [ ] Fiscal notes display for bills that have them
- [ ] Language analysis shows SHALL/MAY counts
- [ ] No JavaScript console errors

---

## ONGOING MAINTENANCE (During Session)

### Daily/Weekly
- [ ] Run `python3 main.py` to fetch new bills
- [ ] Check if any scrapers broke (websites change)
- [ ] Monitor for new org position updates

### After Major Votes
- [ ] Run full pipeline to get updated vote counts
- [ ] Update fiscal notes for amended bills

---

## REFERENCE: File Locations
```
utah-tracker/                    # Private development
├── main.py                      # Pipeline orchestrator
├── .env                         # API tokens
├── src/
│   ├── core/
│   │   ├── utah_legislature_fetcher.py  # UPDATE: 2025GS → 2026GS
│   │   ├── data_merger.py
│   │   └── org_config.py
│   └── scrapers/                # CHECK EACH ONE
├── scripts/
│   ├── analyze_bill_language.py # UPDATE: 2025 → 2026
│   ├── scrape_fiscal_notes.py   # UPDATE: 2025GS → 2026GS
│   └── generate_bill_summaries.py

utah-tracker-public/             # Public website
├── data/                        # Copy files here after generation
│   ├── bills.json
│   ├── bill_language.json
│   ├── fiscal_notes.json
│   └── bill_summaries.json
```

---

## EMERGENCY CONTACTS

- **Utah Legislature API Issues:** Check https://le.utah.gov/
- **GitHub Pages Down:** Check https://status.github.com/
- **Netlify Issues:** Check https://www.netlifystatus.com/

---

## NOTES FROM 2025 SESSION

- API token is in `.env` file as `UTAH_API_TOKEN`
- Libertas uses Airtable embed - may change yearly
- UEA tracker usually ready by session start
- Some orgs don't publish trackers until 2-3 weeks in
- Fiscal notes may not exist for brand new bills (check back later)

---

**Last Updated:** November 2025
**Maintainer:** demostheneslockeUT@proton.me
