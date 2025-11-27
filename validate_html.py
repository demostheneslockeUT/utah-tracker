#!/usr/bin/env python3
"""
Validate HTML files before committing.
Run: python3 validate_html.py
"""

from pathlib import Path
import re
import sys

def check_file(filepath):
    """Check a single HTML file for required elements."""
    errors = []
    content = filepath.read_text()
    
    # Calculate expected depth
    rel_path = str(filepath)
    depth = rel_path.count('/')
    expected_prefix = "../" * depth if depth > 0 else ""
    
    # Check for favicon references
    if 'favicon.svg' not in content:
        errors.append("Missing favicon.svg reference")
    elif f'href="{expected_prefix}favicon.svg' not in content:
        errors.append(f"Wrong favicon.svg path (expected prefix: '{expected_prefix}')")
    
    if 'favicon.png' not in content:
        errors.append("Missing favicon.png reference")
    
    if 'apple-touch-icon' not in content:
        errors.append("Missing apple-touch-icon reference")
    
    # Check for viewport meta
    if 'viewport' not in content:
        errors.append("Missing viewport meta tag")
    
    # Check for charset
    if 'charset' not in content.lower():
        errors.append("Missing charset meta tag")
    
    # Check for title
    if '<title>' not in content:
        errors.append("Missing <title> tag")
    
    return errors

def main():
    print("=" * 60)
    print("HTML VALIDATION")
    print("=" * 60)
    
    # Find all HTML files (exclude templates and node_modules)
    html_files = [f for f in Path('.').rglob('*.html') 
                  if 'templates' not in str(f) and 'node_modules' not in str(f)]
    
    all_passed = True
    
    for filepath in sorted(html_files):
        errors = check_file(filepath)
        
        if errors:
            print(f"\n❌ {filepath}")
            for error in errors:
                print(f"   • {error}")
            all_passed = False
        else:
            print(f"✅ {filepath}")
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✅ All files passed validation!")
        return 0
    else:
        print("❌ Some files have issues. Fix before committing.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
