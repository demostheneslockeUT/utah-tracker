with open('app.js', 'r') as f:
    content = f.read()

# Find and replace the "no perspectives found" message
old = '''        } else {
            showOtherSideModal('No perspectives found', `We don't have opposing perspectives for ${topic} yet.`);
        }'''

new = '''        } else {
            showOtherSideModal('Coming Soon!', `We're building opposing perspectives for "${topic}" bills. Check back soon! (Currently available: abortion, housing)`);
        }'''

content = content.replace(old, new)

with open('app.js', 'w') as f:
    f.write(content)

print("✅ Improved error message")
