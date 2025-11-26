# Advanced Features - Future Development

**Last Updated:** November 26, 2025
**Status:** Planned for later implementation

---

## Lobbyist Tools (Phase 2)

### 1. May vs Must Counter
- Scan bill text for "may" vs "must" language
- Small word changes have big legal effects
- Display count and highlight in bill viewer
- Example: "The department MAY provide..." vs "The department MUST provide..."

### 2. Fiscal Note Analyzer & Visualizer
- Parse fiscal notes from bill data
- Visualize cost projections over time
- Compare fiscal impact across bills
- Flag bills with significant fiscal impact

### 3. Coalition Messaging Toolkit
- Identify organizations with aligned positions
- Generate suggested coalition talking points
- Prompt communication between orgs that agree
- Template emails for coalition building

### 4. Advanced Contact Information
- Lobbyist contact database
- Organization leadership contacts
- Committee staff contacts
- Relationship mapping between orgs and legislators

---

## AI Bill Summaries (Next Priority)

### Phase 1: Controversial Bills Only
- Start with ~16 controversial bills (where orgs disagree)
- Reduces API costs significantly
- Test system before scaling

### Requirements:
- Anthropic API key (Claude)
- Prompt template for bill analysis
- Storage for generated summaries
- UI to display summaries on bill cards

### Summary Format (Draft):
```
{
  "bill_number": "HB0001",
  "plain_english_summary": "...",
  "who_it_affects": "...",
  "key_provisions": ["...", "..."],
  "why_support": "...",
  "why_oppose": "...",
  "generated_date": "2025-11-26"
}
```

### Cost Estimate:
- ~16 controversial bills
- ~1000 tokens input (bill text) + ~500 tokens output per bill
- Roughly $0.02-0.05 per bill with Claude
- Total Phase 1: ~$1

### Implementation Steps:
1. Create summaries generator script (Python)
2. Store summaries in data/bill_summaries.json
3. Update bill cards to show AI summary
4. Add "AI Summary" badge/indicator

---

## Priority Order

1. ✅ Climb the Ladder (DONE)
2. 🔄 AI Bill Summaries (NEXT)
3. ⏳ Lobbyist Tools (LATER)
4. ⏳ Email Digest System (LATER)
5. ⏳ Personalized Dashboard (LATER)

---

## Notes

- API key needed: Yes (Anthropic API for Claude)
- Store key in .env file (not committed to git)
- Run summary generation locally, commit JSON output
- This keeps live site static (no API calls from frontend)
