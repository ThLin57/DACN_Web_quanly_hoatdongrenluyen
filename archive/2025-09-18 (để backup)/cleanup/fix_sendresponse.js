// fix_sendresponse.js - Script để fix sendResponse calls
const fs = require('fs');
const path = require('path');

function fixSendResponseInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Pattern 1: sendResponse(res, ApiResponse.success(...))
    content = content.replace(
      /sendResponse\(res,\s*ApiResponse\.success\(([^)]+)\)\)/g,
      'sendResponse(res, 200, ApiResponse.success($1))'
    );
    
    // Pattern 2: sendResponse(res, ApiResponse.error(...))
    content = content.replace(
      /sendResponse\(res,\s*ApiResponse\.error\(([^)]+)\)\)/g,
      'sendResponse(res, 500, ApiResponse.error($1))'
    );
    
    // Pattern 3: sendResponse(res, ApiResponse.validationError(...))
    content = content.replace(
      /sendResponse\(res,\s*ApiResponse\.validationError\(([^)]+)\)\)/g,
      'sendResponse(res, 400, ApiResponse.validationError($1))'
    );
    
    // Pattern 4: sendResponse(res, ApiResponse.unauthorized(...))
    content = content.replace(
      /sendResponse\(res,\s*ApiResponse\.unauthorized\(([^)]+)\)\)/g,
      'sendResponse(res, 401, ApiResponse.unauthorized($1))'
    );
    
    // Pattern 5: sendResponse(res, ApiResponse.forbidden(...))
    content = content.replace(
      /sendResponse\(res,\s*ApiResponse\.forbidden\(([^)]+)\)\)/g,
      'sendResponse(res, 403, ApiResponse.forbidden($1))'
    );
    
    // Pattern 6: sendResponse(res, ApiResponse.notFound(...))
    content = content.replace(
      /sendResponse\(res,\s*ApiResponse\.notFound\(([^)]+)\)\)/g,
      'sendResponse(res, 404, ApiResponse.notFound($1))'
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`⚪ No changes: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

function findJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findJSFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Main execution
const backendDir = './backend/src';
const jsFiles = findJSFiles(backendDir);

console.log(`🔧 Fixing sendResponse calls in ${jsFiles.length} files...`);

jsFiles.forEach(fixSendResponseInFile);

console.log('✨ Fix completed!');