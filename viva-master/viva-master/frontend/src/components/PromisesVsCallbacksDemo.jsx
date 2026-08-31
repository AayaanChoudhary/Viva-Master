import { useState } from 'react';
import { Play, RefreshCw } from 'lucide-react';

export default function PromisesVsCallbacksDemo() {
  const [callbackLogs, setCallbackLogs] = useState([]);
  const [promiseLogs, setPromiseLogs] = useState([]);
  const [runningCallback, setRunningCallback] = useState(false);
  const [runningPromise, setRunningPromise] = useState(false);

  // Helper to add delay
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Simulating Callback Hell
  const runCallbackDemo = () => {
    setCallbackLogs([]);
    setRunningCallback(true);
    const logs = [];

    const addLog = (msg, level = 0) => {
      logs.push({ text: '  '.repeat(level) + msg, timestamp: new Date().toLocaleTimeString() });
      setCallbackLogs([...logs]);
    };

    addLog('🚀 Starting callback chain...', 0);

    // Step 1: Get User ID (Callback style)
    setTimeout(() => {
      addLog('👤 Step 1: User fetched (ID: 42)', 1);

      // Step 2: Get User Role (Callback style)
      setTimeout(() => {
        addLog('🔑 Step 2: Permissions verified (Role: admin)', 2);

        // Step 3: Fetch Files (Callback style)
        setTimeout(() => {
          addLog('📂 Step 3: Files loaded (Count: 5)', 3);
          
          // Final callback complete
          addLog('✅ Operation Complete (Callback Style)!', 0);
          setRunningCallback(false);
        }, 1000);

      }, 1000);

    }, 1000);
  };

  // Simulating Promise / Async-Await
  const runPromiseDemo = async () => {
    setPromiseLogs([]);
    setRunningPromise(true);
    const logs = [];

    const addLog = (msg) => {
      logs.push({ text: msg, timestamp: new Date().toLocaleTimeString() });
      setPromiseLogs([...logs]);
    };

    addLog('🚀 Starting Promise/Async chain...');

    try {
      // Step 1: Fetch User
      await delay(1000);
      addLog('👤 Step 1: User fetched (ID: 42)');

      // Step 2: Verify permissions
      await delay(1000);
      addLog('🔑 Step 2: Permissions verified (Role: admin)');

      // Step 3: Fetch Files
      await delay(1000);
      addLog('📂 Step 3: Files loaded (Count: 5)');

      addLog('✅ Operation Complete (Promise Style)!');
    } catch (error) {
      addLog('❌ Error in Promise chain: ' + error.message);
    } finally {
      setRunningPromise(false);
    }
  };

  return (
    <div className="card promises-demo" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <h2>JavaScript: Promises vs Callbacks</h2>
        <p className="text-secondary">Demonstrating asynchronous control flow paradigms and how to prevent callback hell.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Callbacks Section */}
        <div className="demo-box card" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div className="card-header">
            <h3>Callbacks (Callback Hell)</h3>
            <button 
              onClick={runCallbackDemo} 
              className="btn danger small" 
              disabled={runningCallback || runningPromise}
            >
              {runningCallback ? <RefreshCw className="spinner-small" size={14} /> : <Play size={14} />} Run Callbacks
            </button>
          </div>
          
          <pre className="code-block" style={{ fontSize: '0.8rem', height: '180px', overflowY: 'auto' }}>
{`// Nested callbacks - Pyramid of Doom
getUser(userId, (user) => {
  getPermissions(user, (perms) => {
    getFiles(perms, (files) => {
      console.log("Success", files);
    });
  });
});`}
          </pre>

          <div className="console-output" style={{ background: '#0d1117', padding: '1rem', borderRadius: '6px', height: '180px', overflowY: 'auto', fontFamily: 'monospace' }}>
            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Console output:</span>
            {callbackLogs.length === 0 && <p className="text-secondary" style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>Click "Run Callbacks" to simulate...</p>}
            {callbackLogs.map((log, idx) => (
              <div key={idx} style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                <span className="text-secondary" style={{ marginRight: '0.5rem' }}>[{log.timestamp}]</span>
                {log.text}
              </div>
            ))}
          </div>
        </div>

        {/* Promises/Async Section */}
        <div className="demo-box card" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div className="card-header">
            <h3>Promises (Async / Await)</h3>
            <button 
              onClick={runPromiseDemo} 
              className="btn primary small" 
              disabled={runningCallback || runningPromise}
            >
              {runningPromise ? <RefreshCw className="spinner-small" size={14} /> : <Play size={14} />} Run Promises
            </button>
          </div>

          <pre className="code-block" style={{ fontSize: '0.8rem', height: '180px', overflowY: 'auto' }}>
{`// Flat structure with async/await
try {
  const user = await getUser(userId);
  const perms = await getPermissions(user);
  const files = await getFiles(perms);
  console.log("Success", files);
} catch (err) {
  console.error(err);
}`}
          </pre>

          <div className="console-output" style={{ background: '#0d1117', padding: '1rem', borderRadius: '6px', height: '180px', overflowY: 'auto', fontFamily: 'monospace' }}>
            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Console output:</span>
            {promiseLogs.length === 0 && <p className="text-secondary" style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>Click "Run Promises" to simulate...</p>}
            {promiseLogs.map((log, idx) => (
              <div key={idx} style={{ color: '#4ecdc4', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                <span className="text-secondary" style={{ marginRight: '0.5rem' }}>[{log.timestamp}]</span>
                {log.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="card" style={{ background: 'rgba(255, 255, 255, 0.02)', marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Comparison Matrix</h3>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '0.75rem' }}>Feature</th>
              <th style={{ padding: '0.75rem', color: '#ff6b6b' }}>Callbacks</th>
              <th style={{ padding: '0.75rem', color: '#4ecdc4' }}>Promises / Async Await</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>Readability</td>
              <td style={{ padding: '0.75rem' }}>Decreases with nesting (Pyramid of Doom).</td>
              <td style={{ padding: '0.75rem' }}>Sequentially readable like synchronous code.</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>Error Handling</td>
              <td style={{ padding: '0.75rem' }}>Must be handled inside every single callback.</td>
              <td style={{ padding: '0.75rem' }}>Clean, centralized error handling via `try-catch`.</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>Composition</td>
              <td style={{ padding: '0.75rem' }}>Manual and complex coordination.</td>
              <td style={{ padding: '0.75rem' }}>Easy with helpers like `Promise.all()`, `Promise.race()`.</td>
            </tr>
            <tr>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>Control Flow</td>
              <td style={{ padding: '0.75rem' }}>Tight coupling leads to fragile chains.</td>
              <td style={{ padding: '0.75rem' }}>Decoupled states (pending, fulfilled, rejected).</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
