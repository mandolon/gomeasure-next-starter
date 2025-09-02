"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

type ScopeKey = "int" | "ext";
type Scheduled = { dateISO: string | null; time: string | null };

type OrderState = {
  schedule: Record<ScopeKey, Scheduled>;
  setSchedule: (k: ScopeKey, v: Scheduled) => void;
};

const OrderCtx = createContext<OrderState | null>(null);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [schedule, setScheduleState] = useState<Record<ScopeKey, Scheduled>>({
    int: { dateISO: null, time: null },
    ext: { dateISO: null, time: null },
  });

  useEffect(() => {
    const saved = sessionStorage.getItem("orderState:schedule");
    if (saved) {
      try { setScheduleState(JSON.parse(saved)); } catch {}
    }
  }, []);
  useEffect(() => {
    sessionStorage.setItem("orderState:schedule", JSON.stringify(schedule));
  }, [schedule]);

  const api = useMemo<OrderState>(() => ({
    schedule,
    setSchedule: (k, v) => setScheduleState(s => ({ ...s, [k]: v })),
  }), [schedule]);

  return <OrderCtx.Provider value={api}>{children}</OrderCtx.Provider>;
}

export function useOrder() {
  const ctx = useContext(OrderCtx);
  if (!ctx) throw new Error("useOrder must be used inside OrderProvider");
  return ctx;
}
