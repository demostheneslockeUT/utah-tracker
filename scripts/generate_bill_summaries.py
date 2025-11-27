#!/usr/bin/env python3
"""
Generate AI summaries for controversial bills using Claude API
Usage: python3 scripts/generate_bill_summaries.py
"""

import json
import os
import time
from datetime import datetime

try:
    import anthropic
except ImportError:
    print("Installing anthropic package...")
    os.system("pip install anthropic")
    import anthropic

from dotenv import load_dotenv

load_dotenv()

# Configuration
API_KEY = os.getenv('ANTHROPIC_API_KEY')
BILLS_FILE = 'data/bills.json'
SUMMARIES_FILE = 'data/bill_summaries.json'
MODEL = 'claude-sonnet-4-20250514'
DELAY_BETWEEN_CALLS = 1  # seconds


def load_bills():
    """Load bills data"""
    with open(BILLS_FILE, 'r') as f:
        data = json.load(f)
    return data.get('bills', data) if isinstance(data, dict) else data


def load_existing_summaries():
    """Load existing summaries if any"""
    if os.path.exists(SUMMARIES_FILE):
        with open(SUMMARIES_FILE, 'r') as f:
            return json.load(f)
    return {"generated_date": None, "summaries": {}}


def save_summaries(summaries_data):
    """Save summaries to file"""
    with open(SUMMARIES_FILE, 'w') as f:
        json.dump(summaries_data, f, indent=2)


def get_controversial_bills(bills):
    """Find bills with controversy_score > 0"""
    controversial = []
    
    for bill in bills:
        if bill.get('controversy_score', 0) > 0:
            # Gather org positions
            positions = {}
            for key in bill.keys():
                if key.endswith('_position') and key != 'author_position':
                    pos = bill.get(key, '')
                    if pos and pos.lower() in ['support', 'oppose']:
                        org_name = key.replace('_position', '').replace('_', ' ').title()
                        positions[org_name] = pos
            
            controversial.append({
                'bill_number': bill.get('bill_number'),
                'title': bill.get('title', ''),
                'status': bill.get('status', ''),
                'sponsor': bill.get('sponsor', ''),
                'controversy_score': bill.get('controversy_score'),
                'general_provisions': bill.get('general_provisions', ''),
                'highlighted_provisions': bill.get('highlighted_provisions', ''),
                'positions': positions,
                'url': bill.get('url', ''),
                'topics': bill.get('topics', [])
            })
    
    return sorted(controversial, key=lambda x: x['controversy_score'], reverse=True)


def generate_summary(client, bill):
    """Generate AI summary for a single bill"""
    
    # Build position context
    support_orgs = [org for org, pos in bill['positions'].items() if pos == 'Support']
    oppose_orgs = [org for org, pos in bill['positions'].items() if pos == 'Oppose']
    
    prompt = f"""Analyze this Utah legislative bill and provide a balanced summary.

BILL: {bill['bill_number']} - {bill['title']}
STATUS: {bill['status']}
SPONSOR: {bill['sponsor']}

OFFICIAL DESCRIPTION:
{bill['general_provisions']}

KEY PROVISIONS:
{bill['highlighted_provisions'][:2000] if bill['highlighted_provisions'] else 'Not available'}

ORGANIZATIONS SUPPORTING: {', '.join(support_orgs) if support_orgs else 'None listed'}
ORGANIZATIONS OPPOSING: {', '.join(oppose_orgs) if oppose_orgs else 'None listed'}

Please provide:
1. A 2-3 sentence plain English summary a high schooler could understand
2. Who this bill primarily affects (1 sentence)
3. The strongest argument FOR this bill (2-3 sentences, steel-man the supporters)
4. The strongest argument AGAINST this bill (2-3 sentences, steel-man the opponents)
5. One key question citizens should ask about this bill

Format your response as JSON:
{{
  "plain_summary": "...",
  "who_affected": "...",
  "argument_for": "...",
  "argument_against": "...",
  "key_question": "..."
}}

Be balanced and fair to both sides. Avoid partisan language."""

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        
        # Extract JSON from response
        content = response.content[0].text
        
        # Try to parse JSON
        try:
            # Handle potential markdown code blocks
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0]
            elif '```' in content:
                content = content.split('```')[1].split('```')[0]
            
            summary = json.loads(content.strip())
            return summary
        except json.JSONDecodeError:
            # If JSON parsing fails, return raw content
            return {"raw_response": content, "parse_error": True}
            
    except Exception as e:
        return {"error": str(e)}


def main():
    if not API_KEY or API_KEY == 'your_key_here':
        print("❌ Error: Please add your Anthropic API key to .env file")
        print("   Get a key at: https://console.anthropic.com/settings/keys")
        return
    
    print("="*60)
    print("BILL SUMMARY GENERATOR")
    print("="*60)
    
    # Load data
    bills = load_bills()
    controversial = get_controversial_bills(bills)
    existing = load_existing_summaries()
    
    print(f"\n📊 Found {len(controversial)} controversial bills")
    print(f"📁 Existing summaries: {len(existing['summaries'])}")
    
    # Initialize client
    client = anthropic.Anthropic(api_key=API_KEY)
    
    # Track progress
    generated = 0
    skipped = 0
    errors = 0
    
    summaries_data = {
        "generated_date": datetime.now().isoformat(),
        "model": MODEL,
        "total_bills": len(controversial),
        "summaries": existing['summaries'].copy()
    }
    
    for i, bill in enumerate(controversial):
        bill_num = bill['bill_number']
        
        # Skip if already generated
        if bill_num in summaries_data['summaries']:
            print(f"⏭️  [{i+1}/{len(controversial)}] {bill_num} - Already generated, skipping")
            skipped += 1
            continue
        
        print(f"🔄 [{i+1}/{len(controversial)}] Generating summary for {bill_num}...")
        
        summary = generate_summary(client, bill)
        
        if 'error' in summary:
            print(f"   ❌ Error: {summary['error']}")
            errors += 1
        else:
            summaries_data['summaries'][bill_num] = {
                **summary,
                "title": bill['title'],
                "positions": bill['positions'],
                "controversy_score": bill['controversy_score'],
                "url": bill['url'],
                "generated_at": datetime.now().isoformat()
            }
            generated += 1
            print(f"   ✅ Done")
        
        # Save after each generation (in case of interruption)
        save_summaries(summaries_data)
        
        # Rate limiting
        time.sleep(DELAY_BETWEEN_CALLS)
    
    # Final save
    save_summaries(summaries_data)
    
    print("\n" + "="*60)
    print("COMPLETE!")
    print("="*60)
    print(f"✅ Generated: {generated}")
    print(f"⏭️  Skipped (existing): {skipped}")
    print(f"❌ Errors: {errors}")
    print(f"\n📁 Summaries saved to: {SUMMARIES_FILE}")


if __name__ == '__main__':
    main()
