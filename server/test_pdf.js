const { PDFParse } = require('pdf-parse');
const fs = require('fs');

async function test() {
  try {
    const dataBuffer = fs.readFileSync('c:/projects/Cloud project/server/uploads/' + fs.readdirSync('c:/projects/Cloud project/server/uploads/')[0]);
    console.log('Buffer read, length:', dataBuffer.length);
    const parser = new PDFParse({});
    await parser.load(dataBuffer);
    const text = await parser.getText();
    console.log('Extracted text (first 100 chars):', text.substring(0, 100));
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

test();
