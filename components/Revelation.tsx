'use client';

import { V3_NARRATIVE_BLUEPRINT } from '@/lib/blueprint';

// A simple component to display a core message from the blueprint.
export default function Revelation() {
  // For now, let's extract and display the "Why" section.
  const blueprintLines = V3_NARRATIVE_BLUEPRINT.split('\n');
  const whySection = blueprintLines.slice(4, 11).join('\n');

  const revelationStyle = {
    padding: '15px',
    margin: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#00FF00', // Classic terminal green
    border: '1px solid #00FF00',
    borderRadius: '5px',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    fontSize: '12px',
  };

  return (
    <div style={revelationStyle}>
      <strong>The Architect&apos;s Revelation:</strong>
      <p>{whySection}</p>
    </div>
  );
}
