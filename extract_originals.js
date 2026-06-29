const fs = require('fs');
const readline = require('readline');

async function processTranscript() {
    const fileStream = fs.createReadStream('C:\\Users\\suchi\\.gemini\\antigravity\\brain\\eb985b83-9ad9-4eba-a025-167f97fbc569\\.system_generated\\logs\\transcript.jsonl');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let currentFile = null;
    let originalContents = {};

    for await (const line of rl) {
        try {
            const step = JSON.parse(line);
            
            // Watch for VIEW_FILE to see original contents
            if (step.type === 'VIEW_FILE' && step.content) {
                const lines = step.content.split('\n');
                let filePath = '';
                let fileLines = [];
                let inCode = false;
                
                for (const l of lines) {
                    if (l.startsWith('File Path: `file:///')) {
                        filePath = l.split('`')[1].replace('file:///', '').replace(/\//g, '\\');
                        // url decode just in case
                        filePath = decodeURI(filePath);
                        if (!originalContents[filePath]) {
                            currentFile = filePath;
                        } else {
                            currentFile = null;
                        }
                    } else if (l.match(/^\d+:/) && currentFile) {
                        fileLines.push(l.substring(l.indexOf(':') + 2));
                    }
                }
                
                if (currentFile && fileLines.length > 0) {
                    originalContents[currentFile] = fileLines.join('\n');
                }
            }
        } catch (e) {
            // ignore
        }
    }
    
    // Dump original contents to a file for review
    fs.writeFileSync('C:\\Users\\suchi\\.gemini\\antigravity\\brain\\6c9036e5-b971-4640-9a9f-8a54cc53f4a6\\scratch\\original_files.json', JSON.stringify(originalContents, null, 2));
    console.log("Extracted original files to scratch/original_files.json");
}

processTranscript();
