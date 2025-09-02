import { OrderProvider } from "./OrderContext";
import Progress from "./_components/Progress";
import StickyFooter from "./_components/StickyFooter";
import "./order.css";

export const metadata = { title: "GoMeasure — Order" };

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrderProvider>
      <main className="container">
        <header>
          <h1>Complete order details</h1>
          <p className="page-sub">Only a few steps left to complete the capture service order.</p>
        </header>
        <Progress />
        {children}
        <StickyFooter />
      </main>
    </OrderProvider>
  );
}
