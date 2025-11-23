with open('app.js', 'r') as f:
    content = f.read()

# Find the billTopicMap and add availableTopics list after it
old = '''const billTopicMap = {
    'HB0106': 'taxes',
    'HB0249': 'energy',
    'HB0408': 'education',
    'HB0455': 'education',
    'SB0142': 'tech',
    'HB0037': 'housing',
    'HB0119': 'energy',
    'HB0167': 'criminal_justice',
    'HB0185': 'transportation',
    'HB0474': 'regulation',
    // Add more mappings as needed
};'''

new = '''const billTopicMap = {
    'HB0106': 'taxes',
    'HB0249': 'energy',
    'HB0408': 'education',
    'HB0455': 'education',
    'SB0142': 'tech',
    'HB0037': 'housing',
    'HB0119': 'energy',
    'HB0167': 'criminal_justice',
    'HB0185': 'transportation',
    'HB0474': 'regulation',
    // Add more mappings as needed
};

// Topics that currently have prompts in Google Sheet
const availableTopics = ['abortion', 'housing', 'education'];'''

content = content.replace(old, new)

# Update the button condition to check availableTopics
old_button = '${billTopicMap[bill.bill_number] ? `'
new_button = '${billTopicMap[bill.bill_number] && availableTopics.includes(billTopicMap[bill.bill_number]) ? `'

content = content.replace(old_button, new_button)

with open('app.js', 'w') as f:
    f.write(content)

print("✅ Updated to only show buttons for available topics")
