import { useState } from "react";

export default function PropertiesNew() {
  const [showForm, setShowForm] = useState(false);
  
  const handleClick = () => {
    alert("BOTTONE CLICCATO! Il JavaScript funziona!");
    setShowForm(!showForm);
  };

  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>
        🏠 Test Immobili
      </h1>
      
      <button
        onClick={handleClick}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '15px 30px',
          fontSize: '18px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        🔴 CLICK QUI PER TEST
      </button>

      {showForm && (
        <div style={{
          marginTop: '30px',
          padding: '40px',
          backgroundColor: '#10b981',
          color: 'white',
          borderRadius: '16px',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          ✅ SUCCESSO! Il form funziona perfettamente!
        </div>
      )}
    </div>
  );
}
