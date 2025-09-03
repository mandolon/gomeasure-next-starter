// app/order/page.tsx
"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import PropertyDetails from "@/components/order/PropertyDetails";

const Schedule = dynamic(() => import("@/components/order/Schedule"), {
  ssr: false,
});
const Contact = dynamic(() => import("@/components/order/Contact"), {
  ssr: false,
});
const Review = dynamic(() => import("@/components/order/Review"), {
  ssr: false,
});

type StepKey = "details" | "schedule" | "contact" | "review";

const STEPS: StepKey[] = ["details", "schedule", "contact", "review"];

export default function OrderPage() {
  const router = useRouter();
  const params = useSearchParams();

  const step: StepKey = useMemo(() => {
    const s = (params.get("step") || "details") as StepKey;
    return STEPS.includes(s) ? s : "details";
  }, [params]);

  const idx = useMemo(() => STEPS.indexOf(step), [step]);

  const goTo = (i: number) => {
    const next = Math.min(Math.max(i, 0), STEPS.length - 1);
    router.replace(`/order?step=${STEPS[next]}`);
  };

  const next = () => goTo(idx + 1);
  const back = () => goTo(idx - 1);

  return (
    <main className="min-h-screen w-full">
      <div className="mx-auto max-w-5xl p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Place Your Order</h1>
          <p className="text-sm text-gray-500">
            Step {idx + 1} of {STEPS.length}
          </p>
          <div className="mt-3 flex gap-2">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => goTo(i)}
                className={`px-3 py-1 rounded border text-sm ${
                  i === idx
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {step === "details" && <PropertyDetails />}
            {step === "schedule" && <Schedule />}
            {step === "contact" && <Contact />}
            {step === "review" && <Review />}
          </div>

          <aside className="lg:col-span-1">
            <div className="rounded border border-gray-200 p-4">
              <h3 className="font-medium mb-2">Order Summary</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Provide address</li>
                <li>• Choose a time</li>
                <li>• Add contact info</li>
                <li>• Review & confirm</li>
              </ul>
            </div>
          </aside>
        </section>

        <footer className="mt-6 flex items-center justify-between">
          <button
            onClick={back}
            disabled={idx === 0}
            className={`px-4 py-2 rounded border ${
              idx === 0
                ? "cursor-not-allowed border-gray-200 text-gray-300"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Back
          </button>

          <button
            onClick={next}
            disabled={idx === STEPS.length - 1}
            className={`px-4 py-2 rounded ${
              idx === STEPS.length - 1
                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                : "bg-black text-white hover:opacity-90"
            }`}
          >
            {idx === STEPS.length - 2
              ? "Review"
              : idx === STEPS.length - 1
                ? "Done"
                : "Next"}
          </button>
        </footer>
      </div>
    </main>
  );
}
