import { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, Code, AlertTriangle, Info } from 'lucide-react';

export default function SqlJoinsDemo() {
  const [usersTable, setUsersTable] = useState([]);
  const [filesTable, setFilesTable] = useState([]);
  const [joinResult, setJoinResult] = useState([]);
  const [sqlQuery, setSqlQuery] = useState('');
  const [activeJoin, setActiveJoin] = useState('');
  const [executionMode, setExecutionMode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTables = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/sql/tables');
      setUsersTable(res.data.users);
      setFilesTable(res.data.files);
    } catch {
      setError('Failed to fetch SQL tables from backend. Make sure backend server is running on port 5000.');
    }
  };

  const runJoin = async (joinType) => {
    setLoading(true);
    setError(null);
    setActiveJoin(joinType);
    try {
      const res = await axios.get(`http://localhost:5000/api/sql/joins?type=${joinType}`);
      setJoinResult(res.data.data);
      setSqlQuery(res.data.query);
      setExecutionMode(res.data.mode);
    } catch {
      setError('Failed to execute SQL JOIN query.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  return (
    <div className="card sql-joins-demo" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Database className="text-primary" size={28} />
          <div>
            <h2>SQL JOINs Interactive Demo</h2>
            <p className="text-secondary">Explore different types of SQL JOIN operations using PostgreSQL query syntax.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1.5rem' }}>
          <AlertTriangle size={18} className="text-error" />
          <p className="text-error" style={{ fontSize: '0.9rem' }}>{error}</p>
        </div>
      )}

      {/* Database Tables Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.75rem', display: 'flex', justifySelf: 'start', fontSize: '1rem' }}>Table: <code>users</code></h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '0.5rem' }}>id (PK)</th>
                  <th style={{ padding: '0.5rem' }}>name</th>
                  <th style={{ padding: '0.5rem' }}>email</th>
                  <th style={{ padding: '0.5rem' }}>role</th>
                </tr>
              </thead>
              <tbody>
                {usersTable.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{u.id}</td>
                    <td style={{ padding: '0.5rem' }}>{u.name}</td>
                    <td style={{ padding: '0.5rem' }}>{u.email}</td>
                    <td style={{ padding: '0.5rem' }}><span className="badge small">{u.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.75rem', display: 'flex', justifySelf: 'start', fontSize: '1rem' }}>Table: <code>files</code></h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '0.5rem' }}>id (PK)</th>
                  <th style={{ padding: '0.5rem' }}>originalname</th>
                  <th style={{ padding: '0.5rem' }}>size (B)</th>
                  <th style={{ padding: '0.5rem' }}>user_id (FK)</th>
                </tr>
              </thead>
              <tbody>
                {filesTable.map(f => (
                  <tr key={f.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{f.id}</td>
                    <td style={{ padding: '0.5rem' }}>{f.originalname}</td>
                    <td style={{ padding: '0.5rem' }}>{f.size}</td>
                    <td style={{ padding: '0.5rem', color: f.user_id ? 'white' : 'var(--error)' }}>
                      {f.user_id || 'NULL'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* JOIN Selection Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
        <button onClick={() => runJoin('inner')} className={`btn ${activeJoin === 'inner' ? 'primary' : 'outline'}`}>
          INNER JOIN
        </button>
        <button onClick={() => runJoin('left')} className={`btn ${activeJoin === 'left' ? 'primary' : 'outline'}`}>
          LEFT JOIN
        </button>
        <button onClick={() => runJoin('right')} className={`btn ${activeJoin === 'right' ? 'primary' : 'outline'}`}>
          RIGHT JOIN
        </button>
        <button onClick={() => runJoin('full')} className={`btn ${activeJoin === 'full' ? 'primary' : 'outline'}`}>
          FULL OUTER JOIN
        </button>
      </div>

      {/* Results Section */}
      {activeJoin && (
        <div className="card" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div className="card-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Code size={18} /> SQL Query Statement & Result
            </h3>
            {executionMode && (
              <span className={`badge ${executionMode === 'live-postgres' ? 'badge-admin' : 'badge-user'}`} style={{ fontSize: '0.75rem' }}>
                Mode: {executionMode === 'live-postgres' ? '🟢 PostgreSQL Live' : '🔵 Mock SQL Engine Fallback'}
              </span>
            )}
          </div>

          <pre className="code-block" style={{ fontSize: '0.85rem', marginBottom: '1.5rem', padding: '1rem', background: '#0d1117' }}>
            <code>{sqlQuery}</code>
          </pre>

          <h4 style={{ marginBottom: '0.75rem', display: 'flex' }}>Query Result Dataset:</h4>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <div className="spinner-small"></div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '0.5rem' }}>user_id</th>
                    <th style={{ padding: '0.5rem' }}>name</th>
                    <th style={{ padding: '0.5rem' }}>email</th>
                    <th style={{ padding: '0.5rem' }}>role</th>
                    <th style={{ padding: '0.5rem' }}>file_id</th>
                    <th style={{ padding: '0.5rem' }}>originalname</th>
                    <th style={{ padding: '0.5rem' }}>size</th>
                  </tr>
                </thead>
                <tbody>
                  {joinResult.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: (row.user_id === null || row.file_id === null) ? 'rgba(239, 68, 68, 0.03)' : 'transparent' }}>
                      <td style={{ padding: '0.5rem', fontWeight: row.user_id ? 'bold' : 'normal', color: row.user_id ? 'white' : 'rgba(255,255,255,0.3)' }}>
                        {row.user_id !== null ? row.user_id : 'NULL'}
                      </td>
                      <td style={{ padding: '0.5rem', color: row.name ? 'white' : 'rgba(255,255,255,0.3)' }}>{row.name || 'NULL'}</td>
                      <td style={{ padding: '0.5rem', color: row.email ? 'white' : 'rgba(255,255,255,0.3)' }}>{row.email || 'NULL'}</td>
                      <td style={{ padding: '0.5rem' }}>{row.role ? <span className="badge small">{row.role}</span> : <span style={{ color: 'rgba(255,255,255,0.3)' }}>NULL</span>}</td>
                      <td style={{ padding: '0.5rem', fontWeight: row.file_id ? 'bold' : 'normal', color: row.file_id ? 'white' : 'rgba(255,255,255,0.3)' }}>
                        {row.file_id !== null ? row.file_id : 'NULL'}
                      </td>
                      <td style={{ padding: '0.5rem', color: row.originalname ? 'white' : 'rgba(255,255,255,0.3)' }}>{row.originalname || 'NULL'}</td>
                      <td style={{ padding: '0.5rem', color: row.size ? 'white' : 'rgba(255,255,255,0.3)' }}>
                        {row.size !== null ? row.size : 'NULL'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Educational Note */}
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.1)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Info size={16} className="text-primary" />
            <p className="text-secondary" style={{ fontSize: '0.8rem', textAlign: 'left' }}>
              {activeJoin === 'inner' && 'INNER JOIN returns rows when there is a match in both users and files. Notice that David (user_id 4) is excluded because he has no files, and unowned_file.zip (file_id 105) is excluded because its user_id is NULL.'}
              {activeJoin === 'left' && 'LEFT JOIN returns all users from the left table, even if they do not match any file. David (user_id 4) is included with NULL file attributes because he has no files.'}
              {activeJoin === 'right' && 'RIGHT JOIN returns all files from the right table, even if they do not match any user. unowned_file.zip (file_id 105) is included with NULL user attributes because its user_id is NULL.'}
              {activeJoin === 'full' && 'FULL OUTER JOIN returns all users and all files. Missing matches on either side are padded with NULL values (David has NULL file attributes, and unowned_file.zip has NULL user attributes).'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
