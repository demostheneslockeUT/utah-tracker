"""
Bill Language Analyzer - Counts and extracts SHALL/MAY/MUST sentences
"""

import re
import json
import requests
from html import unescape
import os
import time

def fetch_bill_xml(bill_number, session="2025"):
    """Fetch bill XML from Utah Legislature"""
    urls = [
        f"https://le.utah.gov/Session/{session}/bills/enrolled/{bill_number}.xml",
        f"https://le.utah.gov/Session/{session}/bills/introduced/{bill_number}.xml"
    ]
    
    for url in urls:
        try:
            response = requests.get(url, timeout=30)
            if response.status_code == 200 and '<?xml' in response.text[:100]:
                return response.text
        except:
            continue
    return None

def extract_text_from_xml(xml_content):
    """Strip XML tags and get plain text"""
    text = re.sub(r'<[^>]+>', ' ', xml_content)
    text = re.sub(r'\s+', ' ', text)
    text = unescape(text)
    return text

def find_keyword_sentences(text, keyword):
    """Find sentences containing a keyword"""
    sentences = re.split(r'(?<=[.;:])\s+', text)
    
    matches = []
    pattern = re.compile(rf'\b{keyword}\b', re.IGNORECASE)
    
    for sentence in sentences:
        if pattern.search(sentence):
            clean = sentence.strip()[:300]
            if len(clean) > 20:
                matches.append(clean)
    
    return matches

def analyze_bill(bill_number, session="2025"):
    """Analyze a bill for SHALL/MAY/MUST language"""
    xml = fetch_bill_xml(bill_number, session)
    if not xml:
        return None
    
    text = extract_text_from_xml(xml)
    
    # Find SHALL
    shall_sentences = find_keyword_sentences(text, 'shall')
    shall_not_sentences = [s for s in shall_sentences if re.search(r'\bshall\s+not\b', s, re.IGNORECASE)]
    shall_positive = [s for s in shall_sentences if s not in shall_not_sentences]
    
    # Find MAY - separate "may not" (prohibition) from "may" (discretionary)
    may_sentences = find_keyword_sentences(text, 'may')
    # Filter out date references (May 1, May 7, etc.)
    may_filtered = [s for s in may_sentences if not re.search(r'\bMay\s+\d', s)]
    # Separate "may not" as prohibitions
    may_not_sentences = [s for s in may_filtered if re.search(r'\bmay\s+not\b', s, re.IGNORECASE)]
    may_positive = [s for s in may_filtered if s not in may_not_sentences]
    
    # Find MUST
    must_sentences = find_keyword_sentences(text, 'must')
    must_not_sentences = [s for s in must_sentences if re.search(r'\bmust\s+not\b', s, re.IGNORECASE)]
    must_positive = [s for s in must_sentences if s not in must_not_sentences]
    
    return {
        'bill_number': bill_number,
        'shall': {
            'count': len(shall_positive),
            'sentences': shall_positive[:10]
        },
        'shall_not': {
            'count': len(shall_not_sentences),
            'sentences': shall_not_sentences[:10]
        },
        'may': {
            'count': len(may_positive),
            'sentences': may_positive[:10]
        },
        'may_not': {
            'count': len(may_not_sentences),
            'sentences': may_not_sentences[:10]
        },
        'must': {
            'count': len(must_positive),
            'sentences': must_positive[:10]
        },
        'totals': {
            'mandatory': len(shall_positive) + len(must_positive),
            'prohibited': len(shall_not_sentences) + len(may_not_sentences) + len(must_not_sentences),
            'discretionary': len(may_positive)
        }
    }

def generate_all_analyses():
    """Generate language analysis for controversial bills"""
    
    # Load bills to find which ones to analyze
    with open('data/bills.json', 'r') as f:
        bills_data = json.load(f)
    
    # Get controversial bills (have org positions with disagreement)
    controversial = bills_data['bills']  # Process ALL bills
    print(f"Found {len(controversial)} controversial bills to analyze")
    
    # Load existing analyses if any
    output_file = 'data/bill_language.json'
    if os.path.exists(output_file):
        with open(output_file, 'r') as f:
            existing = json.load(f)
        analyses = existing.get('analyses', {})
    else:
        analyses = {}
    
    # Analyze each bill
    for i, bill in enumerate(controversial):
        bill_num = bill['bill_number']
        
        if bill_num in analyses:
            print(f"  Skipping {bill_num} (already analyzed)")
            continue
        
        print(f"  [{i+1}/{len(controversial)}] Analyzing {bill_num}...")
        
        result = analyze_bill(bill_num)
        if result:
            analyses[bill_num] = result
            
            # Save after each to preserve progress
            output = {
                'generated_date': time.strftime('%Y-%m-%dT%H:%M:%S'),
                'total_bills': len(analyses),
                'analyses': analyses
            }
            with open(output_file, 'w') as f:
                json.dump(output, f, indent=2)
        
        time.sleep(0.5)  # Be nice to their server
    
    print(f"\n✅ Analyzed {len(analyses)} bills")
    print(f"   Saved to {output_file}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--all':
        generate_all_analyses()
    else:
        # Test with one bill
        print("Testing bill language analyzer...")
        print("Use --all flag to analyze all controversial bills\n")
        
        result = analyze_bill("HB0085")
        
        if result:
            print(f"{result['bill_number']} Analysis:")
            print(f"  SHALL (mandatory):     {result['shall']['count']}")
            print(f"  SHALL NOT (prohibited): {result['shall_not']['count']}")
            print(f"  MAY (discretionary):   {result['may']['count']}")
            print(f"  MAY NOT (prohibited):  {result['may_not']['count']}")
            print(f"  MUST (mandatory):      {result['must']['count']}")
            print(f"\nTotals:")
            print(f"  Mandatory actions:  {result['totals']['mandatory']}")
            print(f"  Prohibited actions: {result['totals']['prohibited']}")
            print(f"  Discretionary:      {result['totals']['discretionary']}")
