const { retrieveRelevantChunks } = require('./rag');
const fs = require('fs');
const path = require('path');
const File = require('../models/File');

/**
 * Prompt Injection Awareness & Defenses
 * This checks user input against known injection attack vectors.
 */
function checkPromptInjection(query) {
  const lowerQuery = query.toLowerCase();
  
  // Basic heuristic/regex for common prompt injections
  const injectionPatterns = [
    /ignore previous/i,
    /ignore all/i,
    /system prompt/i,
    /you are now/i,
    /disregard/i,
    /forget everything/i
  ];

  for (let pattern of injectionPatterns) {
    if (pattern.test(lowerQuery)) {
      return true; // Injection detected!
    }
  }
  return false;
}

/**
 * Multi-step Agent (Mock ReAct loop)
 * Demonstrates Thought -> Action -> Observation -> Final Answer paradigm
 */
async function runAgent(query, userId) {
  let logs = [];
  const addLog = (step, detail) => logs.push({ step, detail });

  addLog('Thought', `Received query: "${query}". Checking for prompt injections.`);

  if (checkPromptInjection(query)) {
    addLog('Action', 'Triggered Security Filter');
    addLog('Observation', 'Query contains potential prompt injection syntax.');
    return { 
      answer: "Security Alert: I cannot process this request as it appears to be a prompt injection attempt.", 
      logs 
    };
  }

  addLog('Thought', 'Query is safe. Deciding which tool to use. Query asks about files.');

  // Mocking the tool selection step
  if (query.toLowerCase().includes('delete') || query.toLowerCase().includes('remove')) {
    addLog('Action', 'Use tool: DeleteFileTool');
    return { answer: "I understand you want to delete a file. Please use the red trash icon on the dashboard to safely remove files.", logs };
  } else if (query.toLowerCase().includes('summarize') || query.toLowerCase().includes('what is in')) {
    addLog('Action', 'Use tool: SearchFilesTool (RAG)');
    
    // Simulate RAG Tool Execution
    try {
      const files = await File.find({ user: userId, mimetype: 'text/plain' });
      if (files.length === 0) {
        addLog('Observation', 'No text files found for user.');
        return { answer: "You don't have any text files uploaded for me to read.", logs };
      }
      
      const file = files[0]; // Just read the first text file for the demo
      addLog('Observation', `Found text file: ${file.originalname}. Reading contents.`);
      
      const filePath = path.join(__dirname, '..', file.path);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const relevantChunks = retrieveRelevantChunks(query, content);
      addLog('Observation', `RAG retrieved chunks: [${relevantChunks.join(' ... ')}]`);
      
      return { 
        answer: `Based on your file '${file.originalname}', here is the relevant information: ${relevantChunks.join(' ')}`, 
        logs 
      };
    } catch (err) {
      addLog('Observation', `Error executing tool: ${err.message}`);
      return { answer: "I encountered an error trying to read your files.", logs };
    }
  } else {
    addLog('Action', 'No specific tool needed. Using default conversation.');
    return { answer: "I am your Secure Vault AI Assistant! I can summarize your uploaded text files or help you manage them.", logs };
  }
}

module.exports = { runAgent, checkPromptInjection };
