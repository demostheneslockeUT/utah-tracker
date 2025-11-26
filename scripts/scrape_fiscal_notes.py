"""
Fiscal Note Scraper - Extracts fiscal impact data from Utah Legislature
"""

import re
import json
import requests
from html import unescape
import time
import os

def fetch_fiscal_html(bill_number, session="2025GS"):
    """Fetch fiscal note HTML"""
    url = f"https://pf.utleg.gov/public-web/sessions/{session}/fiscal-notes/{bill_number}.fn.html"
    try:
        r = requests.get(url, timeout=15)
        if r.status_code == 200:
            return r.text
    except:
        pass
    return None

def parse_fiscal_note(html):
    """Parse fiscal note HTML and extract key data"""
    if not html:
        return None
    
    result = {
        'state_government': {},
        'local_government': '',
        'individuals_businesses': '',
        'regulatory_impact': '',
        'summary': '',
        'fiscal_years': [],
        'total_expenditures': {},
        'total_revenues': {},
        'net_impact': {}
    }
    
    # Extract fiscal years
    fy_matches = re.findall(r'FY\s*(\d{4})', html)
    result['fiscal_years'] = sorted(list(set(fy_matches)))
    
    # Extract dollar amounts with context
    # Find Total Expenditures line
    exp_match = re.search(r'Total Expenditures[^\$]*(\$[\d,\(\)\-]+)[^\$]*(\$[\d,\(\)\-]+)[^\$]*(\$[\d,\(\)\-]+)', html)
    if exp_match:
        for i, fy in enumerate(result['fiscal_years'][:3]):
            result['total_expenditures'][f'FY{fy}'] = exp_match.group(i+1) if i < 3 else ''
    
    # Find Total Revenues line
    rev_match = re.search(r'Total Revenues[^\$]*(\$[\d,\(\)\-]+)[^\$]*(\$[\d,\(\)\-]+)[^\$]*(\$[\d,\(\)\-]+)', html)
    if rev_match:
        for i, fy in enumerate(result['fiscal_years'][:3]):
            result['total_revenues'][f'FY{fy}'] = rev_match.group(i+1) if i < 3 else ''
    
    # Find Net All Funds
    net_match = re.search(r'Net All Funds[^\$]*(\$[\d,\(\)\-]+)[^\$]*(\$[\d,\(\)\-]+)[^\$]*(\$[\d,\(\)\-]+)', html)
    if net_match:
        for i, fy in enumerate(result['fiscal_years'][:3]):
            result['net_impact'][f'FY{fy}'] = net_match.group(i+1) if i < 3 else ''
    
    # Extract text summaries
    # Local Government
    local_match = re.search(r'Local Government.*?UCA[^>]*>([^<]+)', html, re.DOTALL)
    if local_match:
        result['local_government'] = clean_text(local_match.group(1))
    else:
        local_match = re.search(r'Local.*?Government.*?</td>\s*</tr>\s*<tr[^>]*>\s*<td[^>]*>([^<]+)', html, re.DOTALL | re.IGNORECASE)
        if local_match:
            result['local_government'] = clean_text(local_match.group(1))
    
    # Individuals & Businesses
    ind_match = re.search(r'Individuals.*?Businesses.*?UCA[^>]*>([^<]+)', html, re.DOTALL)
    if ind_match:
        result['individuals_businesses'] = clean_text(ind_match.group(1))
    
    # Regulatory Impact
    reg_match = re.search(r'Regulatory.*?Impact.*?UCA[^>]*>([^<]+)', html, re.DOTALL)
    if reg_match:
        result['regulatory_impact'] = clean_text(reg_match.group(1))
    
    # Find summary sentences (lines with "This bill")
    summaries = re.findall(r'(This bill [^<]{20,300})', html)
    if summaries:
        result['summary'] = ' '.join(set(summaries))[:500]
    
    # Calculate impact level
    result['impact_level'] = calculate_impact_level(result)
    
    return result

def clean_text(text):
    """Clean HTML text"""
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    text = unescape(text).strip()
    return text[:300]

def parse_amount(amount_str):
    """Parse dollar amount string to number"""
    if not amount_str:
        return 0
    # Remove $ and commas, handle parentheses for negative
    clean = amount_str.replace('$', '').replace(',', '').strip()
    negative = '(' in clean or '-' in clean
    clean = re.sub(r'[^\d]', '', clean)
    try:
        val = int(clean)
        return -val if negative else val
    except:
        return 0

def calculate_impact_level(data):
    """Calculate fiscal impact level"""
    max_exp = 0
    for fy, amt in data.get('total_expenditures', {}).items():
        val = abs(parse_amount(amt))
        max_exp = max(max_exp, val)
    
    if max_exp == 0:
        return 'Minimal'
    elif max_exp < 100000:
        return 'Low'
    elif max_exp < 1000000:
        return 'Medium'
    elif max_exp < 10000000:
        return 'High'
    else:
        return 'Very High'

def generate_all_fiscal():
    """Generate fiscal data for controversial bills"""
    with open('data/bills.json', 'r') as f:
        bills_data = json.load(f)
    
    # Get controversial bills
    controversial = [b for b in bills_data['bills'] if b.get('controversy_score', 0) > 0]
    print(f"Processing {len(controversial)} controversial bills...")
    
    output_file = 'data/fiscal_notes.json'
    if os.path.exists(output_file):
        with open(output_file, 'r') as f:
            existing = json.load(f)
        notes = existing.get('notes', {})
    else:
        notes = {}
    
    for i, bill in enumerate(controversial):
        bill_num = bill['bill_number']
        
        if bill_num in notes:
            continue
        
        print(f"  [{i+1}/{len(controversial)}] {bill_num}...")
        
        html = fetch_fiscal_html(bill_num)
        if html:
            parsed = parse_fiscal_note(html)
            if parsed:
                notes[bill_num] = parsed
        
        time.sleep(0.3)
    
    output = {
        'generated_date': time.strftime('%Y-%m-%dT%H:%M:%S'),
        'total_bills': len(notes),
        'notes': notes
    }
    
    with open(output_file, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ Saved {len(notes)} fiscal notes to {output_file}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == '--all':
        generate_all_fiscal()
    else:
        # Test one bill
        print("Testing HB0001 fiscal note...")
        html = fetch_fiscal_html("HB0001")
        if html:
            data = parse_fiscal_note(html)
            print(json.dumps(data, indent=2))
        else:
            print("No fiscal note found")
        print("\nUse --all to process all controversial bills")
