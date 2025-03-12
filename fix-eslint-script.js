const fs = require('fs');
const path = require('path');

// List of files with errors from your build log
const filesToFix = [
  'src/app/api/processes/extract-name/route.ts',
  'src/app/api/processes/import/route.ts',
  'src/app/auth/login/page.tsx',
  'src/app/dashboard/admin/operations/[id]/edit/page.tsx',
  'src/app/dashboard/admin/operations/[id]/export/page.tsx',
  'src/app/dashboard/admin/operations/[id]/replace/page.tsx',
  'src/app/dashboard/admin/operations/import/page.tsx',
  'src/app/dashboard/admin/reports/export/route.ts',
  'src/app/dashboard/admin/reports/page.tsx',
  'src/app/dashboard/admin/reports/time-study-data/route.ts',
  'src/app/dashboard/admin/settings/page.tsx',
  'src/app/dashboard/admin/users/[id]/edit/page.tsx',
  'src/app/dashboard/layout.tsx',
  'src/app/dashboard/operator/page.tsx',
  'src/app/dashboard/operator/process/[id]/page.tsx',
  'src/components/forms/EditOperationsClient.tsx',
  'src/components/forms/OperationEditForm.tsx',
  'src/components/time-study/TimeStudy.tsx',
  'src/components/ui/Table.tsx',
  'src/types/next-auth.d.ts'
];

// Fix unescaped entities in JSX
function fixUnescapedEntities(content) {
  // Replace single quotes that need to be escaped in JSX
  let newContent = content.replace(/(\{|>|\s)'([^']*?)'(\s|<|\.)/g, (match, prefix, text, suffix) => {
    return `${prefix}&apos;${text}&apos;${suffix}`;
  });
  
  // Replace double quotes that need to be escaped in JSX
  newContent = newContent.replace(/(\{|>|\s)"([^"]*?)"(\s|<|\.)/g, (match, prefix, text, suffix) => {
    return `${prefix}&quot;${text}&quot;${suffix}`;
  });
  
  return newContent;
}

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
    
    // Fix unescaped entities
    if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
      content = fixUnescapedEntities(content);
    }
    
    // Comment out unused imports
    // Look for lines with import statements that have variables mentioned in the error log
    const unusedImports = [
      'prisma', 'Button', 'useEffect', 'Session'
    ];
    
    unusedImports.forEach(importName => {
      const importRegex = new RegExp(`import[^;]*\\b${importName}\\b[^;]*;`, 'g');
      content = content.replace(importRegex, match => {
        return `// ${match} /* Commented out by fix-eslint.js */`;
      });
    });
    
    // Prefix unused variables with underscore
    const unusedVars = [
      'headers', 'handleSubmit', 'router', 'session', 'isSaving', 'operationId', 'index'
    ];
    
    unusedVars.forEach(varName => {
      const varRegex = new RegExp(`(const|let|var)\\s+(${varName})\\s*=`, 'g');
      content = content.replace(varRegex, `$1 _$2 =`);
    });
    
    // Add temporary type for 'any'
    content = content.replace(/:\s*any\b/g, ': unknown /* TODO: Replace with proper type */');
    
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

console.log('Finished processing files. Run eslint to check for remaining issues.');