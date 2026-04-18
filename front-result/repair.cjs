const fs = require('fs');
const path = require('path');

const findJSX = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findJSX(filePath, fileList);
    } else if (filePath.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
};

const iconv = require('iconv-lite');

const files = findJSX(path.join(process.cwd(), 'src/pages'));
for (const file of files) {
  // Read the corrupted file bytes normally
  const buf = fs.readFileSync(file);
  const text = buf.toString('utf8');
  console.log(`Checking ${file}`);
  
  if (text.includes('Ã')) {
    // PowerShell read UTF-8 file bytes into a string assuming windows-1252,
    // then wrote it out as UTF-8. So what was originally e.g. "à" (C3 A0)
    // became seen as two chars "Ã" (C3) and " " (A0). 
    // And what was "é" (C3 A9) became "Ã" (C3) and "©" (A9)
    // 
    // Wait, the corrupted characters inside 'text' are the double-encoded UTF-8.
    // If we decode it as windows-1252, it returns the raw UTF-8 bytes!
    try {
      // Encode back to windows-1252 bytes to get original UTF-8 byte stream
      const decodedBytes = iconv.encode(text, 'win1252');
      // Read those bytes as proper UTF-8
      const fixedText = iconv.decode(decodedBytes, 'utf8');
      
      fs.writeFileSync(file, fixedText, 'utf8');
      console.log('Fixed:', path.basename(file));
    } catch (e) {
      console.error('Error fixing:', file, e.message);
    }
  }
}
