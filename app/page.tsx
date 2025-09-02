import Link from "next/link";

export default function Home() {
  return (
    <main className="container">
      <h1>GoMeasure — Order</h1>
      <p className="page-sub">Professional 3D scanning and LiDAR capture services.</p>
      <p style={{margin:"12px 0"}}>
        <Link href="/order/property" className="btn btn-primary">Begin</Link>
      </p>
    </main>
  );
}
