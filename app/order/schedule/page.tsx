"use client";
import { useEffect, useMemo, useState } from "react";
import { useOrder } from "../OrderContext";
type ScopeKey = "int" | "ext";
const TIMES = ["8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM"];
const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
function startOfMonth(d: Date){ return new Date(d.getFullYear(), d.getMonth(), 1); }
function monthLabel(d: Date){ return d.toLocaleDateString(undefined, { month:"long", year:"numeric" }); }

function Picker({ scope, title }: { scope: ScopeKey; title: string }) {
  const { schedule, setSchedule } = useOrder();
  const today = useMemo(()=>{ const t=new Date(); t.setHours(0,0,0,0); return t; },[]);
  const currentMonth = useMemo(()=>startOfMonth(today),[today]);
  const nextMonth = useMemo(()=>startOfMonth(new Date(today.getFullYear(), today.getMonth()+1, 1)),[today]);

  const [view, setView] = useState<Date>(currentMonth);
  const [singleNavIsNext, setSingleNavIsNext] = useState(true);
  const [open, setOpen] = useState(true);

  const selectedISO = schedule[scope].dateISO;
  const selectedTime = schedule[scope].time;

  useEffect(()=>{ setSingleNavIsNext(view.getTime()===currentMonth.getTime()); },[view,currentMonth]);

  const days = useMemo(()=>{
    const first=new Date(view.getFullYear(), view.getMonth(), 1);
    const last=new Date(view.getFullYear(), view.getMonth()+1, 0);
    const startOffset=first.getDay();
    const cells: Array<{type:"head"|"blank"|"day"; date?: Date}> = [];
    weekdays.forEach(()=>cells.push({type:"head"}));
    for(let i=0;i<startOffset;i++) cells.push({type:"blank"});
    for(let d=1; d<=last.getDate(); d++) cells.push({type:"day", date:new Date(view.getFullYear(), view.getMonth(), d)});
    return cells;
  },[view]);

  function pickDate(date: Date){
    if(date<today) return;
    if(date.getDay()===0 || date.getDay()===6) return;
    const iso=date.toISOString().slice(0,10);
    setSchedule(scope, { dateISO: iso, time: null });
  }
  function pickTime(time: string){
    if(!selectedISO){ alert("Please pick a date first."); return; }
    setSchedule(scope, { dateISO: selectedISO, time });
    setOpen(false);
  }
  const summary = (selectedISO && selectedTime)
    ? `Scheduled for ${new Date(selectedISO).toLocaleDateString(undefined,{weekday:'long', month:'long', day:'numeric'})} at ${selectedTime}`
    : "Select a date and time";

  return (
    <>
      <button className="accordion" data-open={open ? "true" : "false"} onClick={()=>setOpen(v=>!v)} type="button" aria-expanded={open}>
        <div className="summary-stack">
          <div className="scope-label">{title}</div>
          <div className="scheduled-line">{summary}</div>
        </div>
        <svg className="caret" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </button>

      <div className={`collapse ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="calendar-container">
          <div className="calendar-header">
            <div className="calendar-month">{monthLabel(view)}</div>
            <div className="nav-single">
              <button className="nav-btn" onClick={()=>setView(singleNavIsNext ? nextMonth : currentMonth)}>
                {singleNavIsNext ? "Next ›" : "‹ Back"}
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            {weekdays.map(d=>(
              <div key={`h-${d}`} className="calendar-day-header">{d}</div>
            ))}
            {days.slice(7).map((cell,i)=>{
              if(cell.type==="blank") return <div key={`b-${i}`} />;
              if(cell.type==="day" && cell.date){
                const d=cell.date;
                const isPast=d<today;
                const isWeekend=d.getDay()===0 || d.getDay()===6;
                const iso=d.toISOString().slice(0,10);
                const isSelected=selectedISO===iso;
                const cls="calendar-day "+(isPast||isWeekend?"disabled":"available")+(isSelected?" selected":"");
                return (
                  <div key={`d-${iso}`} className={cls} onClick={()=>pickDate(d)} role="button" aria-label={d.toDateString()}>
                    <span className="day-num">{d.getDate()}</span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

        <div className="field">
          <div className="label">Available times</div>
          <div className="times">
            {TIMES.map(t=>(
              <button key={t} type="button" className="time" data-selected={selectedTime===t ? "true" : undefined} onClick={()=>pickTime(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="disclaimer">
          <strong>Booking Policy:</strong> Appointments can be rescheduled up to 24 hours before the scheduled time. Same-day cancellations may incur a fee. We’ll confirm your appointment 24 hours in advance.
        </div>
      </div>
    </>
  );
}

export default function SchedulePage(){
  return (
    <div className="grid">
      <section className="card">
        <h2>Choose a time</h2>
        <p className="muted">Choose a start time. The site visit takes about 4 hours 30 minutes.</p>
        <Picker scope="int" title="Interior scan" />
        <Picker scope="ext" title="Exterior scan" />
      </section>

      <aside className="sidebar">
        <div className="card">
          <h2 style={{fontSize:18,margin:"0 0 6px"}}>Schedule checklist</h2>
          <ul className="checklist">
            <li><span className="check">✓</span> Date and time selected</li>
            <li><span className="check">✓</span> Site accessibility confirmed</li>
            <li><span className="check">✓</span> Weather backup plan in place</li>
            <li><span className="check">✓</span> Equipment requirements verified</li>
          </ul>
        </div>

        <div className="card" id="estimateCard">
          <h2 style={{fontSize:18,margin:"0 0 6px"}}>Estimate</h2>
          <div className="price-row"><span className="price-label">Interior</span><span className="price-value">$250.00</span></div>
          <div className="price-row"><span className="price-label">Exterior</span><span className="price-value">$250.00</span></div>
          <div className="price-row price-total"><span>Total</span><span>$500.00</span></div>
          <p className="small" style={{marginTop:6}}>*Tax not included</p>
        </div>

        <div className="action-row">
          <button className="btn btn-ghost" onClick={()=>history.back()}>Back</button>
          <button className="btn btn-primary" onClick={()=>location.assign("/order/contact")}>Next</button>
        </div>
      </aside>
    </div>
  );
}
