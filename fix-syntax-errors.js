const fs = require('fs');
const path = require('path');

// Files identified with syntax errors from build log
const filesToFix = [
  'src/components/forms/OperationEditForm.tsx',
  'src/app/dashboard/admin/operations/import/page.tsx',
  'src/app/dashboard/admin/reports/page.tsx',
  'src/components/time-study/TimeStudy.tsx',
  'src/components/ui/Table.tsx'
];

// Process each file
filesToFix.forEach(filePath => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    console.log(`Checking ${fullPath}`);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${fullPath}`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;
    
    // Fix 1: Remove HTML entities in JS expressions
    // This regex looks for HTML entities within JS expressions (not within JSX tags)
    // It looks for entities that are not within angle brackets < >
    
    // Fix &apos; in JS expressions (but not in JSX)
    content = content.replace(/([^<>]*?)&apos;([^<>]*?)/g, (match, prefix, suffix) => {
      // Make sure we're not in a JSX tag
      if (prefix.includes('{') && !prefix.includes('}')) {
        return `${prefix}'${suffix}`;
      }
      return match;
    });
    
    // Fix &quot; in JS expressions (but not in JSX)
    content = content.replace(/([^<>]*?)&quot;([^<>]*?)/g, (match, prefix, suffix) => {
      // Make sure we're not in a JSX tag
      if (prefix.includes('{') && !prefix.includes('}')) {
        return `${prefix}"${suffix}`;
      }
      return match;
    });
    
    // Fix 2: Add Card import if missing
    if (filePath === 'src/components/forms/OperationEditForm.tsx' && !content.includes('import { Card }')) {
      // Add import statement to the top of the file (after other imports)
      content = content.replace(
        /(import[\s\S]*?from.*?['"];)/,
        '$1\nimport { Card } from "@/components/ui/card";'
      );
    }
    
    // Fix 3: Add JSX form import if needed
    if (filePath === 'src/app/dashboard/admin/operations/import/page.tsx' && 
        content.includes('<form') && 
        !content.includes('import { form }')) {
      // This is likely a client component issue
      // Add "use client" at the top if missing
      if (!content.includes('"use client"')) {
        content = '"use client";\n\n' + content;
      }
    }
    
    // Only write if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Fixed issues in: ${filePath}`);
    } else {
      console.log(`No changes needed for: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
});

console.log('Finished processing files. Try building again.');
