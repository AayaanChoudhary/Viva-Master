import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Cpu, Layers, Zap, Clock, Terminal, CheckCircle2, ArrowRight } from 'lucide-react';

const PRESETS = {
  basic: {
    title: '1. Standard Event Loop Order',
    code: `console.log('1: Sync Start');

setTimeout(() => {
  console.log('2: Macrotask (setTimeout)');
}, 0);

Promise.resolve().then(() => {
  console.log('3: Microtask (Promise)');
});

console.log('4: Sync End');`,
    steps: [
      {
        description: 'Global script execution begins. main() pushed to Call Stack.',
        callStack: ['main()'],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        consoleOutput: [],
        activeComponent: 'callstack',
        highlightLine: 1
      },
      {
        description: 'Execute console.log("1: Sync Start") synchronously.',
        callStack: ['main()', 'console.log("1: Sync Start")'],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        consoleOutput: ['1: Sync Start'],
        activeComponent: 'callstack',
        highlightLine: 1
      },
      {
        description: 'setTimeout() called. Handled by Web APIs / Browser timer.',
        callStack: ['main()', 'setTimeout(fn, 0)'],
        webApis: ['Timer (0ms) -> fn()'],
        microtaskQueue: [],
        macrotaskQueue: [],
        consoleOutput: ['1: Sync Start'],
        activeComponent: 'webapi',
        highlightLine: 3
      },
      {
        description: 'Timer expires immediately (0ms). Callback moved to Macrotask Queue.',
        callStack: ['main()'],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: ['fn() [setTimeout]'],
        consoleOutput: ['1: Sync Start'],
        activeComponent: 'macrotask',
        highlightLine: 3
      },
      {
        description: 'Promise.resolve().then() executes. Callback registered into Microtask Queue.',
        callStack: ['main()', 'Promise.then()'],
        webApis: [],
        microtaskQueue: ['fn() [Promise.then]'],
        macrotaskQueue: ['fn() [setTimeout]'],
        consoleOutput: ['1: Sync Start'],
        activeComponent: 'microtask',
        highlightLine: 7
      },
      {
        description: 'Execute console.log("4: Sync End") synchronously.',
        callStack: ['main()', 'console.log("4: Sync End")'],
        webApis: [],
        microtaskQueue: ['fn() [Promise.then]'],
        macrotaskQueue: ['fn() [setTimeout]'],
        consoleOutput: ['1: Sync Start', '4: Sync End'],
        activeComponent: 'callstack',
        highlightLine: 11
      },
      {
        description: 'Synchronous script complete. main() popped from Call Stack. Call Stack is empty!',
        callStack: [],
        webApis: [],
        microtaskQueue: ['fn() [Promise.then]'],
        macrotaskQueue: ['fn() [setTimeout]'],
        consoleOutput: ['1: Sync Start', '4: Sync End'],
        activeComponent: 'eventloop',
        highlightLine: null
      },
      {
        description: '⚡ Event Loop Check: Microtask Queue has higher priority! Dequeue Promise callback to Call Stack.',
        callStack: ['Promise callback'],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: ['fn() [setTimeout]'],
        consoleOutput: ['1: Sync Start', '4: Sync End'],
        activeComponent: 'microtask',
        highlightLine: 8
      },
      {
        description: 'Execute Promise callback: console.log("3: Microtask (Promise)").',
        callStack: ['Promise callback', 'console.log("3: Microtask...")'],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: ['fn() [setTimeout]'],
        consoleOutput: ['1: Sync Start', '4: Sync End', '3: Microtask (Promise)'],
        activeComponent: 'callstack',
        highlightLine: 8
      },
      {
        description: 'Promise callback finishes and pops off Call Stack. Microtask Queue is now empty.',
        callStack: [],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: ['fn() [setTimeout]'],
        consoleOutput: ['1: Sync Start', '4: Sync End', '3: Microtask (Promise)'],
        activeComponent: 'eventloop',
        highlightLine: null
      },
      {
        description: '⚡ Event Loop Check: Microtask Queue empty. Dequeue from Macrotask Queue to Call Stack.',
        callStack: ['setTimeout callback'],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        consoleOutput: ['1: Sync Start', '4: Sync End', '3: Microtask (Promise)'],
        activeComponent: 'macrotask',
        highlightLine: 4
      },
      {
        description: 'Execute setTimeout callback: console.log("2: Macrotask (setTimeout)").',
        callStack: ['setTimeout callback', 'console.log("2: Macrotask...")'],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        consoleOutput: ['1: Sync Start', '4: Sync End', '3: Microtask (Promise)', '2: Macrotask (setTimeout)'],
        activeComponent: 'callstack',
        highlightLine: 4
      },
      {
        description: 'setTimeout callback pops off Call Stack. All queues empty! Program completed.',
        callStack: [],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        consoleOutput: ['1: Sync Start', '4: Sync End', '3: Microtask (Promise)', '2: Macrotask (setTimeout)'],
        activeComponent: 'done',
        highlightLine: null
      }
    ]
  },
  microtaskPriority: {
    title: '2. Microtask Starvation / Chaining Priority',
    code: `console.log('Start');

setTimeout(() => console.log('Timeout'), 0);

Promise.resolve()
  .then(() => {
    console.log('Microtask 1');
    return Promise.resolve();
  })
  .then(() => {
    console.log('Microtask 2 (Chained)');
  });

console.log('End');`,
    steps: [
      {
        description: 'Script starts executing.',
        callStack: ['main()'],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        consoleOutput: [],
        activeComponent: 'callstack',
        highlightLine: 1
      },
      {
        description: 'console.log("Start") executes.',
        callStack: ['main()', 'console.log("Start")'],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        consoleOutput: ['Start'],
        activeComponent: 'callstack',
        highlightLine: 1
      },
      {
        description: 'setTimeout scheduled for Macrotask Queue.',
        callStack: ['main()'],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: ['fn() [Timeout]'],
        consoleOutput: ['Start'],
        activeComponent: 'macrotask',
        highlightLine: 3
      },
      {
        description: 'Promise 1 registered into Microtask Queue.',
        callStack: ['main()'],
        webApis: [],
        microtaskQueue: ['fn() [Microtask 1]'],
        macrotaskQueue: ['fn() [Timeout]'],
        consoleOutput: ['Start'],
        activeComponent: 'microtask',
        highlightLine: 5
      },
      {
        description: 'console.log("End") executes.',
        callStack: ['main()', 'console.log("End")'],
        webApis: [],
        microtaskQueue: ['fn() [Microtask 1]'],
        macrotaskQueue: ['fn() [Timeout]'],
        consoleOutput: ['Start', 'End'],
        activeComponent: 'callstack',
        highlightLine: 13
      },
      {
        description: 'Sync execution finishes. Call Stack is clear.',
        callStack: [],
        webApis: [],
        microtaskQueue: ['fn() [Microtask 1]'],
        macrotaskQueue: ['fn() [Timeout]'],
        consoleOutput: ['Start', 'End'],
        activeComponent: 'eventloop',
        highlightLine: null
      },
      {
        description: 'Event Loop picks Microtask 1 first.',
        callStack: ['Microtask 1'],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: ['fn() [Timeout]'],
        consoleOutput: ['Start', 'End', 'Microtask 1'],
        activeComponent: 'callstack',
        highlightLine: 7
      },
      {
        description: 'Microtask 1 returns a new resolved Promise, adding Microtask 2 to Microtask Queue BEFORE macrotasks can run!',
        callStack: [],
        webApis: [],
        microtaskQueue: ['fn() [Microtask 2]'],
        macrotaskQueue: ['fn() [Timeout]'],
        consoleOutput: ['Start', 'End', 'Microtask 1'],
        activeComponent: 'microtask',
        highlightLine: 10
      },
      {
        description: 'Event Loop drains remaining Microtask 2 before reaching the Macrotask Queue.',
        callStack: ['Microtask 2'],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: ['fn() [Timeout]'],
        consoleOutput: ['Start', 'End', 'Microtask 1', 'Microtask 2 (Chained)'],
        activeComponent: 'callstack',
        highlightLine: 10
      },
      {
        description: 'Microtasks fully drained. Now Event Loop executes Macrotask (Timeout).',
        callStack: ['Timeout callback'],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        consoleOutput: ['Start', 'End', 'Microtask 1', 'Microtask 2 (Chained)', 'Timeout'],
        activeComponent: 'macrotask',
        highlightLine: 3
      },
      {
        description: 'Execution complete.',
        callStack: [],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        consoleOutput: ['Start', 'End', 'Microtask 1', 'Microtask 2 (Chained)', 'Timeout'],
        activeComponent: 'done',
        highlightLine: null
      }
    ]
  },
  asyncAwait: {
    title: '3. Async / Await Internal Execution Flow',
    code: `async function fetchData() {
  console.log('1: Inside async function (Sync)');
  await Promise.resolve();
  console.log('2: After await (Microtask)');
}

console.log('3: Script Start');
fetchData();
console.log('4: Script End');`,
    steps: [
      {
        description: 'Script starts.',
        callStack: ['main()'],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        consoleOutput: [],
        activeComponent: 'callstack',
        highlightLine: 7
      },
      {
        description: 'console.log("3: Script Start") executes.',
        callStack: ['main()', 'console.log("3: Script Start")'],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        consoleOutput: ['3: Script Start'],
        activeComponent: 'callstack',
        highlightLine: 7
      },
      {
        description: 'fetchData() invoked. Synchronous code inside async function runs until first await.',
        callStack: ['main()', 'fetchData()'],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        consoleOutput: ['3: Script Start', '1: Inside async function (Sync)'],
        activeComponent: 'callstack',
        highlightLine: 2
      },
      {
        description: '`await Promise.resolve()` pauses fetchData execution and schedules continuation to Microtask Queue.',
        callStack: ['main()'],
        webApis: [],
        microtaskQueue: ['fetchData() continuation [after await]'],
        macrotaskQueue: [],
        consoleOutput: ['3: Script Start', '1: Inside async function (Sync)'],
        activeComponent: 'microtask',
        highlightLine: 3
      },
      {
        description: 'Execution continues synchronously after fetchData() invocation.',
        callStack: ['main()', 'console.log("4: Script End")'],
        webApis: [],
        microtaskQueue: ['fetchData() continuation [after await]'],
        macrotaskQueue: [],
        consoleOutput: ['3: Script Start', '1: Inside async function (Sync)', '4: Script End'],
        activeComponent: 'callstack',
        highlightLine: 9
      },
      {
        description: 'Call Stack empty. Event Loop drains Microtask Queue.',
        callStack: ['fetchData() continuation'],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        consoleOutput: ['3: Script Start', '1: Inside async function (Sync)', '4: Script End'],
        activeComponent: 'microtask',
        highlightLine: 4
      },
      {
        description: 'Execute continuation: console.log("2: After await (Microtask)").',
        callStack: ['fetchData() continuation', 'console.log("2: After await...")'],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        consoleOutput: ['3: Script Start', '1: Inside async function (Sync)', '4: Script End', '2: After await (Microtask)'],
        activeComponent: 'callstack',
        highlightLine: 4
      },
      {
        description: 'Function complete.',
        callStack: [],
        webApis: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        consoleOutput: ['3: Script Start', '1: Inside async function (Sync)', '4: Script End', '2: After await (Microtask)'],
        activeComponent: 'done',
        highlightLine: null
      }
    ]
  }
};

export default function EventLoopDemo() {
  const [selectedPreset, setSelectedPreset] = useState('basic');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1500); // ms per step

  const activePreset = PRESETS[selectedPreset];
  const totalSteps = activePreset.steps.length;
  const currentStep = activePreset.steps[currentStepIndex];

  const timerRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setTimeout(() => {
        if (currentStepIndex < totalSteps - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, speed);
    }

    return () => clearTimeout(timerRef.current);
  }, [isPlaying, currentStepIndex, totalSteps, speed]);

  const handlePresetChange = (presetKey) => {
    setIsPlaying(false);
    setSelectedPreset(presetKey);
    setCurrentStepIndex(0);
  };

  const handlePlayPause = () => {
    if (currentStepIndex >= totalSteps - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  return (
    <div className="card event-loop-demo" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Title & Header */}
      <div className="card-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Cpu className="text-primary" size={28} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>JavaScript Event Loop Visualizer</h2>
          </div>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Understand the single-threaded asynchronous runtime model: Call Stack, Web APIs, Microtask Queue (Promises), and Macrotask Queue (Timers).
          </p>
        </div>

        {/* Preset selector */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {Object.keys(PRESETS).map(key => (
            <button
              key={key}
              onClick={() => handlePresetChange(key)}
              className={`btn ${selectedPreset === key ? 'primary' : 'outline'}`}
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              {key === 'basic' ? 'Basic Loop' : key === 'microtaskPriority' ? 'Microtask Priority' : 'Async / Await'}
            </button>
          ))}
        </div>
      </div>

      {/* Control Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.6)', padding: '1rem 1.5rem', borderRadius: '12px', border: 'var(--glass-border)', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={handlePlayPause} className="btn primary small" style={{ minWidth: '100px' }}>
            {isPlaying ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Play</>}
          </button>
          <button onClick={handleStepForward} disabled={currentStepIndex >= totalSteps - 1} className="btn outline small">
            <SkipForward size={16} /> Next Step
          </button>
          <button onClick={handleReset} className="btn outline small">
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        {/* Step progress & speed */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Speed:</span>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="form-control"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', width: 'auto', background: '#0f172a' }}
            >
              <option value={2500}>0.5x (Slow)</option>
              <option value={1500}>1.0x (Normal)</option>
              <option value={800}>2.0x (Fast)</option>
            </select>
          </div>

          <div className="badge badge-user" style={{ fontSize: '0.85rem' }}>
            Step {currentStepIndex + 1} of {totalSteps}
          </div>
        </div>
      </div>

      {/* Main Visual Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(400px, 2fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Left Column: Code Editor & Explanation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Code Viewer */}
          <div className="card" style={{ background: '#0d1117', padding: '1rem', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={14} /> Source Code ({activePreset.title})
            </h3>
            <pre style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.5', margin: 0, color: '#e6edf3' }}>
              {activePreset.code.split('\n').map((line, idx) => {
                const lineNum = idx + 1;
                const isHighlighted = currentStep.highlightLine === lineNum;
                return (
                  <div
                    key={idx}
                    style={{
                      background: isHighlighted ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                      borderLeft: isHighlighted ? '3px solid var(--primary)' : '3px solid transparent',
                      paddingLeft: '0.5rem',
                      borderRadius: '2px',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <span style={{ color: '#6e7681', display: 'inlineBlock', width: '24px', userSelect: 'none' }}>
                      {lineNum}
                    </span>
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>

          {/* Current Step Description */}
          <div className="card" style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1rem' }}>
            <h4 style={{ color: '#93c5fd', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Current Step Action
            </h4>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
              {currentStep.description}
            </p>
          </div>

          {/* Console Output Box */}
          <div className="card" style={{ background: '#090d16', padding: '1rem', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={14} /> Console Output
            </h3>
            <div style={{ minHeight: '100px', background: '#000', padding: '0.75rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
              {currentStep.consoleOutput.length === 0 ? (
                <span style={{ color: '#4b5563', fontStyle: 'italic' }}>Console log is empty...</span>
              ) : (
                currentStep.consoleOutput.map((out, idx) => (
                  <div key={idx} style={{ color: '#4ade80', marginBottom: '0.25rem' }}>
                    &gt; {out}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Event Loop Architecture Visualization Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Top Row: Call Stack & Web APIs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            {/* Call Stack Container */}
            <div
              className="card"
              style={{
                background: currentStep.activeComponent === 'callstack' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(15, 23, 42, 0.5)',
                border: currentStep.activeComponent === 'callstack' ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
                padding: '1rem',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa' }}>
                  <Layers size={16} /> Call Stack (LIFO)
                </h3>
                <span className="badge small" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd' }}>
                  {currentStep.callStack.length} frame(s)
                </span>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column-reverse', gap: '0.5rem', justifyContent: 'flex-start' }}>
                {currentStep.callStack.length === 0 ? (
                  <div style={{ margin: 'auto', color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center' }}>
                    (Stack Empty)
                  </div>
                ) : (
                  currentStep.callStack.map((frame, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: idx === currentStep.callStack.length - 1 ? '#2563eb' : 'rgba(30, 41, 59, 0.8)',
                        color: '#fff',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        borderLeft: idx === currentStep.callStack.length - 1 ? '4px solid #60a5fa' : 'none'
                      }}
                    >
                      {frame}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Web APIs Container */}
            <div
              className="card"
              style={{
                background: currentStep.activeComponent === 'webapi' ? 'rgba(234, 179, 8, 0.12)' : 'rgba(15, 23, 42, 0.5)',
                border: currentStep.activeComponent === 'webapi' ? '2px solid #eab308' : '1px solid rgba(255,255,255,0.08)',
                padding: '1rem',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fde047' }}>
                  <Clock size={16} /> Web APIs / Timers
                </h3>
                <span className="badge small" style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#fef08a' }}>
                  {currentStep.webApis.length} active
                </span>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {currentStep.webApis.length === 0 ? (
                  <div style={{ margin: 'auto', color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center' }}>
                    (No active timers/requests)
                  </div>
                ) : (
                  currentStep.webApis.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(234, 179, 8, 0.15)',
                        border: '1px solid rgba(234, 179, 8, 0.3)',
                        color: '#fef08a',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace'
                      }}
                    >
                      {item}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Event Loop Tick Spinner Banner */}
          <div
            style={{
              background: currentStep.activeComponent === 'eventloop' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.4)',
              border: currentStep.activeComponent === 'eventloop' ? '2px dashed #10b981' : '1px dashed rgba(255,255,255,0.1)',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={18} className="text-secondary" style={{ animation: isPlaying || currentStep.activeComponent === 'eventloop' ? 'spin 2s linear infinite' : 'none' }} />
              <span style={{ fontWeight: '600', fontSize: '0.9rem', color: currentStep.activeComponent === 'eventloop' ? '#6ee7b7' : 'var(--text-secondary)' }}>
                EVENT LOOP TICK ENGINE
              </span>
            </div>
            <ArrowRight size={16} className="text-secondary" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Checks Call Stack == Empty? &rarr; Drain Microtasks &rarr; Dequeue 1 Macrotask
            </span>
          </div>

          {/* Bottom Row: Microtask Queue & Macrotask Queue */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            {/* Microtask Queue (Promises, queueMicrotask) */}
            <div
              className="card"
              style={{
                background: currentStep.activeComponent === 'microtask' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                border: currentStep.activeComponent === 'microtask' ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.08)',
                padding: '1rem',
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc' }}>
                  <Zap size={16} /> Microtask Queue (High Priority)
                </h3>
                <span className="badge small" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#e9d5ff' }}>
                  {currentStep.microtaskQueue.length} job(s)
                </span>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {currentStep.microtaskQueue.length === 0 ? (
                  <div style={{ margin: 'auto', color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center' }}>
                    (Microtask Queue Empty)
                  </div>
                ) : (
                  currentStep.microtaskQueue.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(168, 85, 247, 0.2)',
                        border: '1px solid rgba(168, 85, 247, 0.4)',
                        color: '#f3e8ff',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace'
                      }}
                    >
                      {item}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Macrotask Queue (setTimeout, setInterval, I/O) */}
            <div
              className="card"
              style={{
                background: currentStep.activeComponent === 'macrotask' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                border: currentStep.activeComponent === 'macrotask' ? '2px solid #ec4899' : '1px solid rgba(255,255,255,0.08)',
                padding: '1rem',
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f472b6' }}>
                  <Clock size={16} /> Macrotask Queue (Task Queue)
                </h3>
                <span className="badge small" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#fbcfe8' }}>
                  {currentStep.macrotaskQueue.length} task(s)
                </span>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {currentStep.macrotaskQueue.length === 0 ? (
                  <div style={{ margin: 'auto', color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center' }}>
                    (Macrotask Queue Empty)
                  </div>
                ) : (
                  currentStep.macrotaskQueue.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(236, 72, 153, 0.2)',
                        border: '1px solid rgba(236, 72, 153, 0.4)',
                        color: '#fce7f3',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace'
                      }}
                    >
                      {item}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Educational Summary Section */}
      <div className="card" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.25rem', marginTop: '1rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} className="text-secondary" /> Viva Exam Key Concepts: JavaScript Event Loop Rulebook
        </h3>
        <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
          <li>
            <strong style={{ color: '#fff' }}>1. Single Threaded:</strong> JS runs on one main execution thread with one Call Stack.
          </li>
          <li>
            <strong style={{ color: '#fff' }}>2. Run-to-Completion:</strong> Each synchronous function executes until the stack is empty.
          </li>
          <li>
            <strong style={{ color: '#fff' }}>3. Microtask Priority:</strong> Once Call Stack clears, ALL Microtasks (Promises, `queueMicrotask`) run until the microtask queue is 100% empty.
          </li>
          <li>
            <strong style={{ color: '#fff' }}>4. Macrotask Execution:</strong> After microtasks finish, the Event Loop takes exactly ONE Macrotask (`setTimeout`, `setInterval`) and executes it.
          </li>
        </ul>
      </div>
    </div>
  );
}
