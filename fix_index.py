# Read the corrupted file
with open('index.html', 'r') as f:
    lines = f.readlines()

# Find first occurrence of each section
first_nav_start = None
first_nav_end = None
first_header_start = None

for i, line in enumerate(lines):
    if '<!-- Navigation Bar -->' in line and first_nav_start is None:
        first_nav_start = i
    if '</nav>' in line and first_nav_start is not None and first_nav_end is None:
        first_nav_end = i + 1
    if '<!-- Hero Section -->' in line and first_header_start is None:
        first_header_start = i
        break

# Build clean file
clean_lines = []
clean_lines.extend(lines[:first_nav_start])  # Head section
clean_lines.extend(lines[first_nav_start:first_nav_end])  # One nav
clean_lines.extend(lines[first_header_start:])  # From hero onwards

# Write clean version
with open('index_clean.html', 'w') as f:
    f.writelines(clean_lines)

print(f"✅ Created clean version")
print(f"   Original nav start: {first_nav_start}")
print(f"   First header: {first_header_start}")
