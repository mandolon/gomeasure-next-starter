"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
type ScopeKey = "int" | "ext";
type Scheduled = { dateISO: string | null; time: string | null };
type OrderState = { schedule: Record<ScopeKey, Scheduled>; setSchedule: (k: ScopeKey, v: Scheduled) => void; };
const Ctx = createContext<OrderState | null>(null);
export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [schedule, setScheduleState] = useState<Record<ScopeKey, Scheduled>>({ int:{dateISO:null,time:null}, ext:{dateISO:null,time:null} });
  useEffect(()=>{ const s=sessionStorage.getItem("order:schedule"); if(s){ try{ setScheduleState(JSON.parse(s)); }catch{} }},[]);
  useEffect(()=>{ sessionStorage.setItem("order:schedule", JSON.stringify(schedule)); },[schedule]);
  const api = useMemo<OrderState>(()=>({ schedule, setSchedule:(k,v)=>setScheduleState(s=>({...s,[k]:v})) }),[schedule]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
export function useOrder(){ const v=useContext(Ctx); if(!v) throw new Error("useOrder must be used inside OrderProvider"); return v; }
