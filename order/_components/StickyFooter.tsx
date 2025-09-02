"use client";

import { usePathname, useRouter } from "next/navigation";

export default function StickyFooter() {
  const router = useRouter();
  const pathname = usePathname();
  const order = ["/order/property","/order/schedule","/order/contact","/order/review"];
  const idx = order.findIndex(p => pathname.startsWith(p));
  const back = idx > 0 ? order[idx - 1] : null;
  const next = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : "/order/payment";

  return (
    <div className="action-row" style={{ marginTop: 16 }}>
      <button className="btn btn-ghost" onClick={() => back ? router.push(back) : router.back()}>Back</button>
      <button className="btn btn-primary" onClick={() => router.push(next)}>Next</button>
    </div>
  );
}
