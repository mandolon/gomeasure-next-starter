// components/order/PropertyDetails.tsx
"use client";

import { useState } from "react";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";

export default function PropertyDetails() {
  const [address, setAddress] = useState("");

  return (
    <section className="card p-6 space-y-4">
      <h2 className="text-xl font-semibold">Where is the scan location?</h2>
      <AddressAutocomplete value={address} onChange={setAddress} />
    </section>
  );
}
