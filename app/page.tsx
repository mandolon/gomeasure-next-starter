import Link from "next/link";

export default function Home() {
  return (
    <main className="container">
      <h1>GoMeasure — Order</h1>
      <p className="page-sub">Start a new order.</p>
      <p style={{margin:"12px 0"}}>
        <Link href="/order/details" className="btn btn-primary">Begin</Link>
      </p>
    </main>
  );
}

