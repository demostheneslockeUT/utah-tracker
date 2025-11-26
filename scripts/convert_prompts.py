#!/usr/bin/env python3
"""
Convert Google Sheets CSV export to prompts.json
Usage: python3 scripts/convert_prompts.py
"""

import csv
import json
from datetime import datetime
import os

def convert_prompts():
    csv_path = 'prompts_export.csv'
    json_path = 'data/prompts.json'
    
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found")
        print("Export CSV from Google Sheets first:")
        print("  File → Download → CSV")
        return False
    
    prompts = []
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Skip empty rows
            if not row.get('ID') or not row.get('Prompt_Text'):
                continue
            
            prompt = {
                "id": int(row['ID']),
                "topic": row.get('Topic', '').strip(),
                "subtopic": row.get('Subtopic', '').strip(),
                "stance_target": row.get('Stance_Target', '').strip(),
                "provocative_level": int(row.get('Provocative_Level', 5)),
                "prompt_type": row.get('Prompt_Type', 'question').strip(),
                "prompt_text": row.get('Prompt_Text', '').strip(),
                "source_type": row.get('Source_Type', 'author').strip(),
                "source_name": row.get('Source_Name', 'Author').strip(),
                "source_url": row.get('Source_URL', '').strip(),
                "is_author_content": row.get('Is_Author_Content', '').upper() == 'TRUE',
                "tags": [t.strip() for t in row.get('Tags', '').split(',') if t.strip()]
            }
            prompts.append(prompt)
    
    # Sort by ID
    prompts.sort(key=lambda x: x['id'])
    
    # Build output structure
    output = {
        "version": "1.0",
        "last_updated": datetime.now().strftime('%Y-%m-%d'),
        "total_prompts": len(prompts),
        "topic_mapping": {
            "Healthcare": ["Healthcare"],
            "Education": ["Education"],
            "Immigration": ["Immigration"],
            "Guns": ["Gun Control"],
            "Abortion": ["Abortion"],
            "Housing": ["Housing"],
            "Climate": ["Environment"],
            "Taxes": ["Tax Policy"],
            "Labor": ["Labor"],
            "LGBTQ": ["LGBTQ+ Rights", "Trans Rights"],
            "Criminal Justice": ["Criminal Justice"],
            "Government": ["Government"],
            "Disability": ["Disability Rights"],
            "Business": ["Business"]
        },
        "prompts": prompts
    }
    
    # Write JSON
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    # Print stats
    print(f"✅ Converted {len(prompts)} prompts to {json_path}")
    print(f"   Last updated: {output['last_updated']}")
    
    # Topic breakdown
    topics = {}
    for p in prompts:
        topics[p['topic']] = topics.get(p['topic'], 0) + 1
    
    print("\n📊 Prompts by topic:")
    for topic, count in sorted(topics.items()):
        print(f"   {topic}: {count}")
    
    # Cleanup
    print(f"\n🗑️  You can now delete {csv_path}")
    
    return True

if __name__ == '__main__':
    convert_prompts()
