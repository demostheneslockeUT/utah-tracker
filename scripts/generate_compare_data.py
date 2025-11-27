#!/usr/bin/env python3
"""
Generate compare_data.json for the Compare page

DYNAMIC: Auto-discovers all org position fields from bills.json
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
    """Convert field name to display name: utah_farm_bureau_position -> Utah Farm Bureau"""
    name = field.replace('_position', '').replace('_', ' ').title()
    # Fix common abbreviations
    name = name.replace('Pta', 'PTA').replace('Aclu', 'ACLU').replace('Ulct', 'ULCT')
    name = name.replace('Of ', 'of ').replace('For ', 'for ').replace('And ', 'and ')
    return name

def get_org_emoji(field):
    """Get emoji for org based on field name"""
    emoji_map = {
        'heal_utah': '🌱',
        'libertas': '🗽',
        'utah_education_association': '📚',
        'planned_parenthood': '🏥',
        'utah_pta': '👨‍👩‍👧',
        'utah_league_of_cities_and_towns': '🏛️',
        'alliance_for_a_better_utah': '📊',
        'equality_utah': '🏳️‍🌈',
        'aclu_of_utah': '⚖️',
        'utah_rivers_council': '🌊',
        'salt_lake_chamber': '💼',
        'utah_farm_bureau': '🌾',
        'utahns_against_hunger': '🍽️',
        'disability_law_center': '♿',
        'voices_for_utah_children': '👶',
        'chamber_west': '🏢',
        'breathe_utah': '💨',
        'sierra_club_utah': '🏔️',
        'friends_of_great_salt_lake': '💧',
        'utah_audubon_council': '🦆',
        'trans_legislation_tracker': '🏳️‍⚧️',
        'climate_utah': '🌡️',
        'red_acre_center': '🌾',
        'rural_water_association_of_utah': '💧',
        'utah_bankers_association': '🏦',
        'utah_public_employees_association': '👔',
    }
    
    field_base = field.replace('_position', '')
    return emoji_map.get(field_base, '📋')

def discover_org_positions(bills):
    """Auto-discover all org position fields from bills"""
    
    # Find all fields ending in _position
    position_fields = set()
    for bill in bills:
        for key in bill.keys():
            if key.endswith('_position') and key != 'author_position':
                position_fields.add(key)
    
    # Build org data
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
        
        # Only include orgs with at least 1 Support/Oppose position
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

def calculate_alignment(leg_yeas, leg_nays, org_positions):
    """Calculate alignment percentage between legislator and org"""
    
    agreements = 0
    disagreements = 0
    
    leg_yea_set = set(leg_yeas)
    leg_nay_set = set(leg_nays)
    
    for bill, org_pos in org_positions.items():
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
    
    # Auto-discover org positions
    print("\nDiscovering org positions (dynamic)...")
    org_positions = discover_org_positions(bills)
    print(f"  {len(org_positions)} organizations with Support/Oppose positions")
    
    for org_id, org in sorted(org_positions.items(), key=lambda x: -x[1]['totalBillsTracked']):
        print(f"    {org['emoji']} {org['name']}: {org['supportCount']}S/{org['opposeCount']}O = {org['totalBillsTracked']} bills")
    
    # Build legislator data with alignments
    print("\nCalculating alignments...")
    compare_legislators = {}
    total_votes = 0
    
    for leg_name, leg_data in legislators.items():
        yea_votes = leg_data.get('yea_votes', [])
        nay_votes = leg_data.get('nay_votes', [])
        leg_total = len(yea_votes) + len(nay_votes)
        total_votes += leg_total
        
        # Calculate alignment with each org
        alignments = {}
        for org_id, org in org_positions.items():
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
        
        compare_legislators[leg_name] = {
            'name': leg_name,
            'party': leg_data.get('party', ''),
            'chamber': leg_data.get('chamber', ''),
            'district': leg_data.get('district', ''),
            'email': leg_data.get('email', ''),
            'image': leg_data.get('image', ''),
            'totalVotes': leg_total,
            'alignments': alignments,
            'yea_votes': yea_votes,
            'nay_votes': nay_votes
        }
    
    # Build output (exclude positions from org data to reduce file size)
    compare_data = {
        'organizations': {org_id: {k: v for k, v in org.items() if k != 'positions'} 
                         for org_id, org in org_positions.items()},
        'legislators': compare_legislators,
        'lastUpdated': datetime.now().isoformat(),
        'totalBills': len(bills),
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
    
    # Sample alignments
    sample_leg = list(compare_legislators.values())[0]
    print(f"\nSample: {sample_leg['name']}")
    for org_id, align in list(sample_leg['alignments'].items())[:5]:
        print(f"  vs {org_positions[org_id]['name']}: {align['alignment']}% ({align['billsCompared']} bills)")

if __name__ == '__main__':
    print("="*60)
    print("COMPARE DATA GENERATOR (DYNAMIC)")
    print("="*60)
    
    generate_compare_data()
    
    print("\n" + "="*60)
    print("✅ COMPLETE")
    print("="*60)
