'use client';

import { useState, useEffect, use } from 'react';

const DashboardPage = ({ params }) => {
  const { affiliateId } = use(params);
  
  const [clicks, setClicks] = useState([]);
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const postbackUrl = `http://localhost:3001/postback?click_id={CLICK_ID}&affiliate_id=${affiliateId}&amount={AMOUNT}&currency={CURRENCY}`;

  useEffect(() => {
    if (!affiliateId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/dashboard/${affiliateId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data from the server.');
        }
        const data = await response.json();
        setClicks(data.clicks);
        setConversions(data.conversions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [affiliateId]);
  
  // Base styles for dark mode
  const pageStyles = {
    backgroundColor: '#121212',
    color: '#e0e0e0',
    fontFamily: 'sans-serif',
    padding: '2rem',
    maxWidth: '800px',
    margin: 'auto',
    minHeight: '100vh',
  };

  const sectionStyles = {
    backgroundColor: '#1e1e1e',
    border: '1px solid #333',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '2rem',
  };
  
  const codeBlockStyles = {
    backgroundColor: '#2c2c2c',
    padding: '1rem',
    borderRadius: '4px',
    display: 'block',
    whiteSpace: 'nowrap',
    overflowX: 'auto',
    color: '#d4d4d4',
    border: '1px solid #444',
  };
  
  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem',
  };

  const thStyles = {
    border: '1px solid #444',
    padding: '12px',
    textAlign: 'left',
    backgroundColor: '#2c2c2c',
    color: '#ffffff',
  };

  const tdStyles = {
    border: '1px solid #444',
    padding: '12px',
  };

  if (loading) return <main style={pageStyles}><p>Loading data...</p></main>;
  if (error) return <main style={pageStyles}><p style={{ color: '#ff8a80' }}>Error: {error}</p></main>;

  return (
    <main style={pageStyles}>
      <h1>Dashboard for Affiliate #{affiliateId}</h1>

      <section style={sectionStyles}>
        <h2>Your Unique Postback URL</h2>
        <p>Use the following URL format to report conversions:</p>
        <code style={codeBlockStyles}>
          {postbackUrl}
        </code>
        <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: '#a0a0a0' }}>
          Replace `{'{CLICK_ID}'}`, `{'{AMOUNT}'}`, and `{'{CURRENCY}'}` with the actual transaction values.
        </p>
      </section>

      <section>
        <h2>Clicks</h2>
        {clicks.length > 0 ? (
          <table style={tableStyles}>
            <thead>
              <tr>
                <th style={thStyles}>Click ID</th>
                <th style={thStyles}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {clicks.map((click) => (
                <tr key={click.click_id}>
                  <td style={tdStyles}>{click.click_id}</td>
                  <td style={tdStyles}>{new Date(click.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No clicks recorded yet.</p>
        )}
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Conversions</h2>
        {conversions.length > 0 ? (
          <table style={tableStyles}>
            <thead>
              <tr>
                <th style={thStyles}>Associated Click ID</th>
                <th style={thStyles}>Amount</th>
                <th style={thStyles}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {conversions.map((conv, index) => (
                <tr key={index}>
                  <td style={tdStyles}>{conv.click_id}</td>
                  <td style={tdStyles}>{conv.amount} {conv.currency}</td>
                  <td style={tdStyles}>{new Date(conv.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No conversions recorded yet.</p>
        )}
      </section>
    </main>
  );
};

export default DashboardPage;