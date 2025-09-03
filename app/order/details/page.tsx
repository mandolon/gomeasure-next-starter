// app/order/details/page.tsx
"use client";

import PropertyDetails from "@/components/order/PropertyDetails";

export default function DetailsPage() {
  return (
    <main className="page">
      <div className="container">
        <PropertyDetails />
      </div>
    </main>
  );
}
