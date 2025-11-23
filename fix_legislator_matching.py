import json

# Load the data
with open('utah-tracker-site/data/legislators.json', 'r') as f:
    data = json.load(f)

legislators = data['legislators']

# Find issues
no_email = []
no_party = []
no_votes = []

for name, info in legislators.items():
    if not info.get('email'):
        no_email.append(name)
    if not info.get('party') or info.get('party') == 'Unknown':
        no_party.append(name)
    if info.get('vote_count', 0) == 0:
        no_votes.append(name)

print(f"Issues found:")
print(f"  No email: {len(no_email)}")
print(f"  No party: {len(no_party)}")
print(f"  No votes: {len(no_votes)}")

if no_email:
    print(f"\nLegislators without email (first 5):")
    for name in no_email[:5]:
        print(f"  - {name}")

if no_party:
    print(f"\nLegislators without party (first 5):")
    for name in no_party[:5]:
        print(f"  - {name}: {legislators[name]}")
