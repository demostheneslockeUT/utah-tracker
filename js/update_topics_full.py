with open('app.js', 'r') as f:
    content = f.read()

# Update the availableTopics list with all topics that have prompts
old = "const availableTopics = ['abortion', 'housing', 'education'];"
new = "const availableTopics = ['abortion', 'housing', 'education', 'taxes', 'tax_policy', 'criminal_justice', 'healthcare', 'labor', 'gun_control', 'environment'];"

content = content.replace(old, new)

# Also update the billTopicMap to use matching topic names
old_map = """const billTopicMap = {
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
};"""

new_map = """const billTopicMap = {
    'HB0106': 'tax_policy',  // Has prompts (rows 9, 32-33)
    'HB0249': 'energy',  // Need to add nuclear prompts
    'HB0408': 'education',  // Has prompts (rows 8, 11-14)
    'HB0455': 'education',  // Has prompts (rows 8, 11-14)
    'SB0142': 'tech',  // Need to add tech/privacy prompts
    'HB0037': 'housing',  // Has prompts (rows 29-31)
    'HB0119': 'energy',  // Need to add solar/energy prompts
    'HB0167': 'criminal_justice',  // Has prompts (rows 26-28)
    'HB0185': 'transportation',  // Need to add transportation prompts
    'HB0474': 'regulation',  // Could use business prompts (rows 45-46)
    // Add more mappings as needed
};"""

content = content.replace(old_map, new_map)

with open('app.js', 'w') as f:
    f.write(content)

print("✅ Updated topics with all available prompts")
