# UTAH LEGISLATIVE TRACKER - PRODUCT ROADMAP

**Last Updated:** November 20, 2025
**Live Site:** ezleut.com (DNS propagating)
**GitHub:** https://github.com/Marcus-Pengue/utah-legislation-tracker

---

## ✅ COMPLETED FEATURES

### Core Tracker
- [x] 959 bills from Utah Legislature API
- [x] 25 organizations tracked in pipeline
- [x] Google Sheets tracker (power user tool)
- [x] Public website with bill cards
- [x] Search bar (bill number, title, sponsor)
- [x] Bill number formatting (HB22 vs HB0022)

### Filtering
- [x] Organization filtering (sidebar)
- [x] Controversial bills filter (orgs disagree)
- [x] High Agreement bills filter (orgs agree)
- [x] Filter tabs UI (Orgs, Status, Topic)

### User Engagement
- [x] User voting on bills (Support/Oppose/Neutral)
- [x] Legislator contact system with email templates
- [x] Sign-up page connected to Google Sheets
- [x] Political Rung Assessment with 2D graph
- [x] Legislator Quiz

### Content
- [x] Blog: "Which Rung Are You On?"
- [x] Compare page

---

## 🔄 IN PROGRESS

### Batch B: Data & Filtering (Current Sprint)
- [ ] Add all 25 orgs to website (currently showing 7)
- [ ] Topic auto-tagging for bills
- [ ] Fix Status filter functionality
- [ ] Fix Topic filter functionality
- [ ] Rebuild bills.json with full data

---

## 📋 TODO BATCHES

### Batch A: User Experience Flow (Next)
- [ ] Fix "My Votes" filter
- [ ] ZIP code auto-find legislators
- [ ] User dashboard page
- [ ] Improve welcome flow for new users

### Batch C: Legislator Deep Dive
- [ ] Legislator profile pages
- [ ] 50K vote dataset integration
- [ ] Alignment scores (Rep X votes with HEAL 73%)
- [ ] Voting history visualization
- [ ] "How did my rep vote?" on bill cards

### Batch D: Polish & Performance
- [ ] Code cleanup (consolidate JS files)
- [ ] Remove unused Python scripts from site
- [ ] Fix duplicate filter code
- [ ] Mobile responsiveness audit
- [ ] Loading performance optimization

### Batch E: Email & Notifications
- [ ] Email digest system
- [ ] Bill status change alerts
- [ ] Weekly summary emails
- [ ] Connect to email service (Mailchimp/SendGrid)

---

## 📊 KEY DATA ASSETS

### Pipeline Data
- **959 bills** from Utah Legislature API (2025GS)
- **25 organizations** with positions
- **104 legislators** with contact info
- **50,000 legislator votes** (2020-2025) - UNTAPPED

### User Data (Google Sheets)
- Sign-up form responses
- Email preferences
- Followed organizations
- Political views

---

## 🎯 STRATEGIC PRIORITIES

1. **Batch B** - Get all org data visible on website
2. **Code cleanup** - Reduce bugs before adding features
3. **Batch C** - Leverage 50K vote dataset (unique value)
4. **Batch A** - Improve user flow completion

---

## 🐛 KNOWN ISSUES

### High Priority
- Status/Topic filters not functional
- "My Votes" filter shows all bills
- Only 7 of 25 orgs showing on website

### Medium Priority
- Some legislator website links broken
- Governor Signed status z-index (visual)
- Email template has placeholder text users might send

### Low Priority
- Tailwind CDN warning (production)
- Missing favicon.ico
- DNS propagation (waiting)

---

## 📁 FILE STRUCTURE
```
utah-tracker/
├── main.py                    # Pipeline orchestration
├── src/
│   ├── core/
│   │   ├── utah_legislature_fetcher.py
│   │   ├── data_merger.py
│   │   ├── sheets_writer.py
│   │   └── org_config.py      # Source of truth for orgs
│   └── scrapers/              # 25 organization scrapers
│
└── utah-tracker-site/         # Public website
    ├── index.html             # Main tracker
    ├── signup.html            # User registration
    ├── compare.html           # Position comparison
    ├── quiz/                  # Legislator quiz
    ├── blog/                  # Essays
    ├── tools/                 # Rung assessment
    ├── data/
    │   └── bills.json         # Exported from pipeline
    └── js/
        ├── app.js             # Main app logic
        ├── filters.js         # Filter system
        ├── signup.js          # Sign-up form
        ├── personalization.js # User preferences
        ├── user-voting.js     # Vote tracking
        └── simple-contact.js  # Legislator contact
```

---

## 📞 QUICK COMMANDS
```bash
# Run pipeline (update data)
cd /Users/marcuspengue/Desktop/utah-tracker
python3 main.py

# Run website locally
cd utah-tracker-site && python3 -m http.server 8000

# Commit changes
git add -A && git commit -m "message" && git push origin main
```
