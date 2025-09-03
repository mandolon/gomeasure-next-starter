import Link from 'next/link';

export default function Home() {
  return (
    <>
      <header className="site-header">
        <div className="header-content">
          <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent)' }}>
            GoMeasure
          </div>
        </div>
      </header>

      <main className="container">
        <div style={{ maxWidth: '800px', margin: '60px auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
            Professional 3D Scanning Services
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--ink-7)', marginBottom: '40px' }}>
            Fast, accurate LiDAR capture for residential and commercial properties.
            Get precise measurements and 3D models delivered within 48 hours.
          </p>
          
          <Link href="/order" className="btn btn-primary" style={{ 
            height: '52px', 
            fontSize: '18px', 
            padding: '0 32px',
            display: 'inline-flex'
          }}>
            Start Your Order
          </Link>
        </div>

        <div className="grid" style={{ marginTop: '80px', gap: '24px' }}>
          <div>
            <h2>How It Works</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  flexShrink: 0
                }}>
                  1
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px' }}>Book Online</h3>
                  <p style={{ margin: 0 }}>
                    Provide property details and choose your preferred appointment time
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  flexShrink: 0
                }}>
                  2
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px' }}>We Scan</h3>
                  <p style={{ margin: 0 }}>
                    Our technicians capture your property with professional LiDAR equipment
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  flexShrink: 0
                }}>
                  3
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px' }}>Get Results</h3>
                  <p style={{ margin: 0 }}>
                    Receive accurate 3D models, floor plans, and measurements within 48 hours
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>What&apos;s Included</h3>
            <ul className="checklist">
              <li>
                <span className="check">✓</span>
                <span>High-resolution 3D point cloud data</span>
              </li>
              <li>
                <span className="check">✓</span>
                <span>Accurate floor plans (±1% accuracy)</span>
              </li>
              <li>
                <span className="check">✓</span>
                <span>Virtual walkthrough access</span>
              </li>
              <li>
                <span className="check">✓</span>
                <span>All measurements and dimensions</span>
              </li>
              <li>
                <span className="check">✓</span>
                <span>CAD/BIM compatible files</span>
              </li>
              <li>
                <span className="check">✓</span>
                <span>48-hour turnaround</span>
              </li>
            </ul>

            <div style={{ marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: 'var(--ink-5)', marginBottom: '4px' }}>
                Starting from
              </div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--accent)' }}>
                $100
              </div>
              <div style={{ fontSize: '14px', color: 'var(--ink-5)' }}>
                Final price based on property size
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '80px' }}>
          <h2>Service Coverage</h2>
          <div className="grid-2" style={{ marginTop: '24px' }}>
            <div className="card">
              <h3 style={{ marginTop: 0, color: 'var(--accent)' }}>Residential</h3>
              <p>
                Perfect for homeowners, real estate agents, and contractors. 
                Document existing conditions, plan renovations, or create virtual tours.
              </p>
              <ul style={{ paddingLeft: '20px', color: 'var(--ink-7)' }}>
                <li>Single-family homes</li>
                <li>Condos and apartments</li>
                <li>Multi-family properties</li>
                <li>Historic homes</li>
              </ul>
            </div>
            
            <div className="card">
              <h3 style={{ marginTop: 0, color: 'var(--accent)' }}>Commercial</h3>
              <p>
                Ideal for property managers, architects, and facility teams. 
                Create as-builts, space planning, and maintenance documentation.
              </p>
              <ul style={{ paddingLeft: '20px', color: 'var(--ink-7)' }}>
                <li>Office buildings</li>
                <li>Retail spaces</li>
                <li>Industrial facilities</li>
                <li>Healthcare facilities</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ 
          marginTop: '80px', 
          padding: '48px', 
          background: 'var(--card)', 
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          textAlign: 'center' 
        }}>
          <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: '18px', marginBottom: '32px' }}>
            Book your 3D scanning service in just a few minutes
          </p>
          <Link href="/order" className="btn btn-primary" style={{ 
            height: '52px', 
            fontSize: '18px', 
            padding: '0 32px',
            display: 'inline-flex'
          }}>
            Start Your Order
          </Link>
        </div>
      </main>
    </>
  );
}