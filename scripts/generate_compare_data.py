#!/usr/bin/env python3
"""
Generate compare_data.json for the Compare page

DYNAMIC: Auto-discovers all org position fields from bills.json
Calculates BOTH all-votes AND contested-only alignments
"""

import json
from datetime import datetime

def load_data():
    """Load source data files"""
    
    with open('../utah-tracker-public/data/legislators.json', 'r') as f:
        legislators_data = json.load(f)
    
    with open('../utah-tracker-public/data/bills.json', 'r') as f:
        bills_data = json.load(f)
    
    return legislators_data, bills_data

def field_to_name(field):
    """Convert field name to display name"""
    name = field.replace('_position', '').replace('_', ' ').title()
    name = name.replace('Pta', 'PTA').replace('Aclu', 'ACLU').replace('Ulct', 'ULCT')
    name = name.replace('Of ', 'of ').replace('For ', 'for ').replace('And ', 'and ')
    return name

def get_org_emoji(field):
    """Get emoji for org based on field name"""
    emoji_map = {
        'heal_utah': '🌱', 'libertas': '🗽', 'utah_education_association': '📚',
        'planned_parenthood': '🏥', 'utah_pta': '👨‍👩‍👧', 'utah_league_of_cities_and_towns': '🏛️',
        'alliance_for_a_better_utah': '📊', 'equality_utah': '🏳️‍🌈', 'aclu_of_utah': '⚖️',
        'utah_rivers_council': '🌊', 'salt_lake_chamber': '💼', 'utah_farm_bureau': '🌾',
        'utahns_against_hunger': '🍽️', 'disability_law_center': '♿', 'voices_for_utah_children': '👶',
        'chamber_west': '🏢', 'breathe_utah': '💨', 'sierra_club_utah': '🏔️',
        'friends_of_great_salt_lake': '💧', 'utah_audubon_council': '🦆',
        'trans_legislation_tracker': '🏳️‍⚧️', 'climate_utah': '🌡️', 'red_acre_center': '🌾',
        'rural_water_association_of_utah': '💧', 'utah_bankers_association': '🏦',
        'utah_public_employees_association': '👔',
    }
    return emoji_map.get(field.replace('_position', ''), '📋')

def get_contested_bills(bills, min_nays=6):
    """Get set of bill numbers that had contested votes (6+ nay votes)"""
    contested = set()
    
    for bill in bills:
        h_against = bill.get('house_votes_against', 0) or 0
        s_against = bill.get('senate_votes_against', 0) or 0
        total_against = h_against + s_against
        
        if total_against >= min_nays:
            contested.add(bill['bill_number'])
    
    return contested

def discover_org_positions(bills):
    """Auto-discover all org position fields from bills"""
    
    position_fields = set()
    for bill in bills:
        for key in bill.keys():
            if key.endswith('_position') and key != 'author_position':
                position_fields.add(key)
    
    org_positions = {}
    
    for field in sorted(position_fields):
        positions = {}
        support_count = 0
        oppose_count = 0
        
        for bill in bills:
            pos = bill.get(field, '')
            if pos in ['Support', 'Oppose']:
                positions[bill['bill_number']] = pos
                if pos == 'Support':
                    support_count += 1
                else:
                    oppose_count += 1
        
        if positions:
            field_base = field.replace('_position', '')
            org_positions[field_base] = {
                'id': field_base,
                'name': field_to_name(field),
                'emoji': get_org_emoji(field),
                'positions': positions,
                'totalBillsTracked': len(positions),
                'supportCount': support_count,
                'opposeCount': oppose_count
            }
    
    return org_positions

def calculate_alignment(leg_yeas, leg_nays, org_positions, contested_only=None):
    """Calculate alignment percentage between legislator and org
    
    If contested_only is a set of bill numbers, only count those bills.
    """
    agreements = 0
    disagreements = 0
    
    leg_yea_set = set(leg_yeas)
    leg_nay_set = set(leg_nays)
    
    for bill, org_pos in org_positions.items():
        # Skip non-contested bills if filtering
        if contested_only is not None and bill not in contested_only:
            continue
            
        if bill in leg_yea_set:
            if org_pos == 'Support':
                agreements += 1
            elif org_pos == 'Oppose':
                disagreements += 1
        elif bill in leg_nay_set:
            if org_pos == 'Oppose':
                agreements += 1
            elif org_pos == 'Support':
                disagreements += 1
    
    total = agreements + disagreements
    if total == 0:
        return None, 0, 0, 0
    
    alignment = round((agreements / total) * 100, 1)
    return alignment, agreements, disagreements, total

def generate_compare_data():
    """Generate the full compare_data.json"""
    
    print("Loading data...")
    legislators_data, bills_data = load_data()
    
    legislators = legislators_data.get('legislators', legislators_data)
    bills = bills_data.get('bills', bills_data)
    
    print(f"  {len(legislators)} legislators")
    print(f"  {len(bills)} bills")
    
    # Get contested bills (6+ nay votes)
    contested_bills = get_contested_bills(bills, min_nays=6)
    print(f"  {len(contested_bills)} contested bills (6+ nay votes)")
    
    # Auto-discover org positions
    print("\nDiscovering org positions...")
    org_positions = discover_org_positions(bills)
    print(f"  {len(org_positions)} organizations with Support/Oppose positions")
    
    # Build legislator data with BOTH alignment types
    print("\nCalculating alignments (all + contested-only)...")
    compare_legislators = {}
    total_votes = 0
    
    for leg_name, leg_data in legislators.items():
        yea_votes = leg_data.get('yea_votes', [])
        nay_votes = leg_data.get('nay_votes', [])
        leg_total = len(yea_votes) + len(nay_votes)
        total_votes += leg_total
        
        # Calculate alignment with each org - BOTH ways
        alignments = {}
        alignments_contested = {}
        
        for org_id, org in org_positions.items():
            # All votes alignment
            alignment, agrees, disagrees, compared = calculate_alignment(
                yea_votes, nay_votes, org['positions']
            )
            if alignment is not None:
                alignments[org_id] = {
                    'alignment': alignment,
                    'agreements': agrees,
                    'disagreements': disagrees,
                    'billsCompared': compared
                }
            
            # Contested-only alignment
            alignment_c, agrees_c, disagrees_c, compared_c = calculate_alignment(
                yea_votes, nay_votes, org['positions'], contested_only=contested_bills
            )
            if alignment_c is not None:
                alignments_contested[org_id] = {
                    'alignment': alignment_c,
                    'agreements': agrees_c,
                    'disagreements': disagrees_c,
                    'billsCompared': compared_c
                }
        
        compare_legislators[leg_name] = {
            'name': leg_name,
            'party': leg_data.get('party', ''),
            'chamber': leg_data.get('chamber', ''),
            'district': leg_data.get('district', ''),
            'email': leg_data.get('email', ''),
            'image': leg_data.get('image', ''),
            'totalVotes': leg_total,
            'alignments': alignments,              # All votes
            'alignmentsContested': alignments_contested,  # Contested only
            'yea_votes': yea_votes,
            'nay_votes': nay_votes
        }
    
    # Build output
    compare_data = {
        'organizations': {org_id: {k: v for k, v in org.items() if k != 'positions'} 
                         for org_id, org in org_positions.items()},
        'legislators': compare_legislators,
        'lastUpdated': datetime.now().isoformat(),
        'totalBills': len(bills),
        'contestedBills': len(contested_bills),
        'totalVotesAnalyzed': total_votes
    }
    
    # Save
    output_path = '../utah-tracker-public/data/compare_data.json'
    with open(output_path, 'w') as f:
        json.dump(compare_data, f, indent=2)
    
    print(f"\n✅ Generated compare_data.json")
    print(f"   {len(compare_legislators)} legislators")
    print(f"   {len(org_positions)} organizations")
    print(f"   {total_votes:,} total votes analyzed")
    print(f"   {len(contested_bills)} contested bills")
    
    # Compare all vs contested alignments for sample
    sample_leg = list(compare_legislators.values())[0]
    print(f"\nSample: {sample_leg['name']}")
    print(f"  {'Org':<25} {'All Votes':>12} {'Contested':>12}")
    print(f"  {'-'*25} {'-'*12} {'-'*12}")
    
    for org_id in list(sample_leg['alignments'].keys())[:5]:
        all_align = sample_leg['alignments'].get(org_id, {})
        con_align = sample_leg['alignmentsContested'].get(org_id, {})
        
        all_pct = f"{all_align.get('alignment', 0)}% ({all_align.get('billsCompared', 0)})"
        con_pct = f"{con_align.get('alignment', 0)}% ({con_align.get('billsCompared', 0)})" if con_align else "N/A"
        
        print(f"  {org_positions[org_id]['name']:<25} {all_pct:>12} {con_pct:>12}")

if __name__ == '__main__':
    print("="*60)
    print("COMPARE DATA GENERATOR (with Contested Filter)")
    print("="*60)
    
    generate_compare_data()
    
    print("\n" + "="*60)
    print("✅ COMPLETE")
    print("="*60)
