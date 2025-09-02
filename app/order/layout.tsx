import StepNav from "../../components/StepNav";

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="container">
      <header>
        <h1>Complete order details</h1>
        <p className="page-sub">Only a few steps left to complete the capture service order.</p>
      </header>
      <StepNav />
      {children}
    </main>
  );
}
