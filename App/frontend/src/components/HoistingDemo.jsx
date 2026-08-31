import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Play } from 'lucide-react';

export default function HoistingDemo() {
  const [results, setResults] = useState([]);

  const runDemo = () => {
    const logs = [];

    // 1. Variable Hoisting with var
    logs.push({
      type: 'var',
      title: 'Variable Hoisting (var)',
      code: `console.log(myVar);\nvar myVar = 'Hello';`,
      result: typeof myVar !== 'undefined' ? myVar : 'undefined', // It evaluates to undefined
      status: 'success',
      explanation: 'Variables declared with var are hoisted to the top of their scope and initialized with undefined.'
    });
    var myVar = 'Hello';

    // 2. Function Declaration Hoisting
    logs.push({
      type: 'function',
      title: 'Function Hoisting',
      code: `sayHello();\nfunction sayHello() {\n  return 'Hi there!';\n}`,
      result: sayHello(),
      status: 'success',
      explanation: 'Function declarations are fully hoisted, meaning you can call them before they appear in the code.'
    });

    function sayHello() {
      return 'Hi there!';
    }

    // 3. let Hoisting - Temporal Dead Zone (TDZ)
    const letTdzDemo = new Function(`
      try {
        return myLet;
        let myLet = 'Test';
      } catch (e) {
        return e.toString();
      }
    `);

    logs.push({
      type: 'let',
      title: 'Temporal Dead Zone (let)',
      code: `console.log(myLet);\\nlet myLet = 'Test';`,
      result: letTdzDemo(),
      status: 'error',
      explanation: 'let is hoisted as a lexical binding but remains uninitialized in the Temporal Dead Zone. Accessing it before its declaration throws a ReferenceError.'
    });

    // 4. const Hoisting - Temporal Dead Zone (TDZ)
    const constTdzDemo = new Function(`
      try {
        console.log(myConst);
        const myConst = 'Test';
        return 'No error';
      } catch (e) {
        return e.toString();
      }
    `);

    logs.push({
      type: 'const',
      title: 'Temporal Dead Zone (const)',
      code: `console.log(myConst);\\nconst myConst = 'Test';`,
      result: constTdzDemo(),
      status: 'error',
      explanation: 'const is hoisted as a lexical binding but remains uninitialized in the Temporal Dead Zone. Accessing it before its declaration throws a ReferenceError. const must also be initialized at declaration and cannot be reassigned.'
    });

    setResults(logs);
  };

  return (
    <div className="card hoisting-demo">
      <div className="card-header">
        <h2>JavaScript Hoisting Demo</h2>
        <button onClick={runDemo} className="btn primary">
          <Play size={16} /> Run Demo
        </button>
      </div>
      
      <div className="demo-results">
        {results.length === 0 && (
          <div className="empty-state">
            <p>Click "Run Demo" to see hoisting in action.</p>
          </div>
        )}
        
        {results.map((log, index) => (
          <div key={index} className={`log-entry ${log.status}`}>
            <div className="log-header">
              <h3>{log.title}</h3>
              {log.status === 'success' ? <CheckCircle2 className="icon-success" /> : <AlertCircle className="icon-error" />}
            </div>
            <pre className="code-block">
              <code>{log.code}</code>
            </pre>
            <div className="log-output">
              <strong>Output: </strong> 
              <span className={log.status === 'error' ? 'text-error' : 'text-success'}>
                {log.result}
              </span>
            </div>
            <p className="log-explanation">{log.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

