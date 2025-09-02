
'use client';

import { useState } from 'react';

interface PropertyDetailsProps {
  formData: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function PropertyDetails({ formData, onUpdate, onNext, onBack }: PropertyDetailsProps) {
  const [data, setData] = useState({
    address: formData.address || '',
    propertyType: formData.propertyType || 'residential',
    squareFootage: formData.squareFootage || '',
    floors: formData.floors || '1',
    bedrooms: formData.bedrooms || '',
    bathrooms: formData.bathrooms || '',
    ...formData
  });

  const handleChange = (field: string, value: string) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onUpdate(newData);
  };

  return (
    <div className="grid">
      <div className="card">
        <h2>Property Details</h2>
        <p className="muted">Tell us about your property</p>

        <div className="field">
          <label className="label">Property Address</label>
          <input 
            type="text"
            value={data.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Enter property address"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid var(--line)',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>

        <div className="field">
          <label className="label">Property Type</label>
          <select 
            value={data.propertyType}
            onChange={(e) => handleChange('propertyType', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid var(--line)',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        <div className="field">
          <label className="label">Square Footage (estimated)</label>
          <input 
            type="number"
            value={data.squareFootage}
            onChange={(e) => handleChange('squareFootage', e.target.value)}
            placeholder="e.g. 2500"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid var(--line)',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="field">
            <label className="label">Floors</label>
            <select 
              value={data.floors}
              onChange={(e) => handleChange('floors', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="1">1 Floor</option>
              <option value="2">2 Floors</option>
              <option value="3">3 Floors</option>
              <option value="4+">4+ Floors</option>
            </select>
          </div>

          {data.propertyType === 'residential' && (
            <div className="field">
              <label className="label">Bedrooms</label>
              <input 
                type="number"
                value={data.bedrooms}
                onChange={(e) => handleChange('bedrooms', e.target.value)}
                placeholder="e.g. 3"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          )}
        </div>

        <div className="action-row" style={{ marginTop: '24px' }}>
          <button className="btn btn-ghost" onClick={onBack}>
            Back
          </button>
          <button 
            className="btn btn-primary" 
            onClick={onNext}
            disabled={!data.address || !data.squareFootage}
          >
            Continue
          </button>
        </div>
      </div>

      <div className="sidebar">
        <div className="card">
          <h3>What's Included</h3>
          <ul className="checklist">
            <li><span className="check">✓</span> High-resolution 3D scan</li>
            <li><span className="check">✓</span> Floor plans & measurements</li>
            <li><span className="check">✓</span> Virtual walkthrough</li>
            <li><span className="check">✓</span> Digital deliverables</li>
            {data.propertyType === 'commercial' && (
              <>
                <li><span className="check">✓</span> CAD files included</li>
                <li><span className="check">✓</span> Point cloud data</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
