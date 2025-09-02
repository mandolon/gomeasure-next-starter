import { OrderProvider } from './context';
import Sidebar from './components/Sidebar';
import StickyFooter from './components/StickyFooter';

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrderProvider>
      <div className="page">
        <main className="container">
          <header>
            <h1>Complete order details</h1>
            <p className="page-sub">Only a few steps left to complete the capture service order.</p>
          </header>
          <div className="grid">
            <div>
              {children}
            </div>
            <Sidebar />
          </div>
        </main>
        <StickyFooter />
      </div>
    </OrderProvider>
  );
}
