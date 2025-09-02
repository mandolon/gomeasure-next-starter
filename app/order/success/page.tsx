
export default function Success() {
  return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <h1 style={{ color: 'var(--accent)', marginBottom: '16px' }}>Order Submitted!</h1>
        <p style={{ fontSize: '18px', marginBottom: '24px' }}>
          Thank you for your order. We'll contact you within 24 hours to confirm your appointment details.
        </p>
        <p className="muted">
          You'll receive a confirmation email shortly with your order details and next steps.
        </p>
        <div style={{ marginTop: '32px' }}>
          <a href="/" className="btn btn-primary">Return Home</a>
        </div>
      </div>
    </div>
  );
}
