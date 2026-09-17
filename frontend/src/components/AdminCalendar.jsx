import { useState, useEffect } from 'react';
import api from '../utils/api';
import { ChevronLeft, ChevronRight, Plus, X, Ship, CheckCircle, Calendar } from 'lucide-react';

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS_FR   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const EVENT_TYPES = {
  shipment:  { color: '#0BB4B0', bg: 'rgba(11,180,176,.15)',  label: 'Expédition' },
  task:      { color: '#C9A84C', bg: 'rgba(201,168,76,.15)',  label: 'Tâche' },
  meeting:   { color: '#7B5EA7', bg: 'rgba(123,94,167,.15)',  label: 'Réunion' },
  deadline:  { color: '#f87171', bg: 'rgba(248,113,113,.15)', label: 'Deadline' },
  other:     { color: '#4ADE80', bg: 'rgba(74,222,128,.15)',  label: 'Autre' },
};

export default function AdminCalendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents]           = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent]       = useState({ title: '', type: 'meeting', date: '', note: '' });
  const [ships, setShips]             = useState([]);

  useEffect(() => {
    loadShipments();
    const saved = localStorage.getItem('bahria_calendar_events');
    if (saved) setEvents(JSON.parse(saved));
  }, []);

  const loadShipments = async () => {
    try {
      const { data } = await api.get('/admin/shipments');
      setShips(data.shipments || []);
    } catch {}
  };

  const saveEvents = (evs) => {
    setEvents(evs);
    localStorage.setItem('bahria_calendar_events', JSON.stringify(evs));
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    const ev = { ...newEvent, id: Date.now().toString() };
    saveEvents([...events, ev]);
    setNewEvent({ title: '', type: 'meeting', date: '', note: '' });
    setShowAddForm(false);
  };

  const deleteEvent = (id) => {
    saveEvents(events.filter(e => e.id !== id));
  };

  // Build calendar days
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);

  // Monday-first offset
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startOffset + 1;
    if (dayNum < 1 || dayNum > lastDay.getDate()) return null;
    return dayNum;
  });

  // Get all events for a day
  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const custom = events.filter(e => e.date === dateStr);
    const shipEtas = ships
      .filter(s => s.eta === dateStr)
      .map(s => ({ id: `ship-${s._id}`, title: `ETA: ${s.clientName}`, type: 'shipment', note: `${s.origin} → ${s.destination}` }));
    return [...shipEtas, ...custom];
  };

  const isToday = (day) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const openDay = (day) => {
    if (!day) return;
    setSelectedDay(day);
    setShowModal(true);
    setShowAddForm(false);
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    setNewEvent(p => ({ ...p, date: dateStr }));
  };

  const selectedDateStr = selectedDay
    ? `${year}-${String(month + 1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`
    : '';
  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Planning</div>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 40, fontWeight: 700, color: 'var(--white)' }}>Calendrier</h1>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        {Object.entries(EVENT_TYPES).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: v.color }} />
            <span style={{ fontSize: 12, color: 'var(--gray)' }}>{v.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar card */}
      <div style={{ background: 'rgba(13,31,60,.5)', border: '1px solid var(--border-gold)', borderRadius: 20, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid var(--border-gold)', background: 'rgba(201,168,76,.04)' }}>
          <button onClick={prevMonth} style={{ width: 36, height: 36, border: '1px solid var(--border-gold)', borderRadius: 10, background: 'transparent', color: 'var(--gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={18} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--ff-display)', fontSize: 26, fontWeight: 700, color: 'var(--white)' }}>
              {MONTHS_FR[month]} {year}
            </div>
            <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 2 }}>
              {ships.filter(s => s.eta?.startsWith(`${year}-${String(month+1).padStart(2,'0')}`)).length} expéditions ce mois
            </div>
          </div>
          <button onClick={nextMonth} style={{ width: 36, height: 36, border: '1px solid var(--border-gold)', borderRadius: 10, background: 'transparent', color: 'var(--gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Days header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          {DAYS_FR.map((d, i) => (
            <div key={d} style={{ padding: '12px 0', textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: 2, color: i >= 5 ? '#f87171' : 'var(--gold)', textTransform: 'uppercase' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
          {cells.map((day, idx) => {
            const dayEvents  = getEventsForDay(day);
            const isWeekend  = idx % 7 >= 5;
            const isTodayDay = isToday(day);
            return (
              <div
                key={idx}
                onClick={() => openDay(day)}
                style={{
                  minHeight: 90,
                  padding: '8px 10px',
                  borderRight: (idx + 1) % 7 !== 0 ? '1px solid rgba(255,255,255,.04)' : 'none',
                  borderBottom: idx < cells.length - 7 ? '1px solid rgba(255,255,255,.04)' : 'none',
                  background: isTodayDay ? 'rgba(201,168,76,.06)' : isWeekend ? 'rgba(248,113,113,.02)' : 'transparent',
                  cursor: day ? 'pointer' : 'default',
                  transition: 'background .15s',
                  position: 'relative',
                }}
                onMouseEnter={e => { if (day) e.currentTarget.style.background = 'rgba(201,168,76,.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isTodayDay ? 'rgba(201,168,76,.06)' : isWeekend ? 'rgba(248,113,113,.02)' : 'transparent'; }}
              >
                {day && (
                  <>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isTodayDay ? 'var(--gold)' : 'transparent',
                      color: isTodayDay ? 'var(--navy-deep)' : isWeekend ? '#f87171' : 'var(--white)',
                      fontSize: 13, fontWeight: isTodayDay ? 700 : 400, marginBottom: 6,
                    }}>
                      {day}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {dayEvents.slice(0, 3).map((ev, i) => {
                        const et = EVENT_TYPES[ev.type] || EVENT_TYPES.other;
                        return (
                          <div key={i} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 6, background: et.bg, color: et.color, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {ev.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div style={{ fontSize: 10, color: 'var(--gold)', paddingLeft: 4 }}>+{dayEvents.length - 3} autres</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Modal */}
      {showModal && selectedDay && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); setShowAddForm(false); } }}>
          <div style={{ width: 460, maxHeight: '80vh', background: '#0A1628', border: '1px solid rgba(201,168,76,.3)', borderRadius: 22, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Modal header */}
            <div style={{ padding: '22px 28px', borderBottom: '1px solid rgba(201,168,76,.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(201,168,76,.04)' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>Événements</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--white)' }}>
                  {selectedDay} {MONTHS_FR[month]} {year}
                </div>
              </div>
              <button onClick={() => { setShowModal(false); setShowAddForm(false); }} style={{ width: 34, height: 34, border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, background: 'transparent', color: 'var(--gray)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {/* Events list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 28px' }}>
              {selectedEvents.length === 0 && !showAddForm && (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--dark-gray)' }}>
                  <Calendar size={32} strokeWidth={1} color="var(--dark-gray)" style={{ margin: '0 auto 10px' }} />
                  <div style={{ fontSize: 13 }}>Aucun événement ce jour</div>
                </div>
              )}
              {selectedEvents.map((ev) => {
                const et = EVENT_TYPES[ev.type] || EVENT_TYPES.other;
                const isShip = ev.id?.startsWith('ship-');
                return (
                  <div key={ev.id} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: et.bg, border: `1px solid ${et.color}22`, borderRadius: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                    <div style={{ marginTop: 2 }}>
                      {ev.type === 'shipment' ? <Ship size={16} strokeWidth={1.5} color={et.color} /> : <CheckCircle size={16} strokeWidth={1.5} color={et.color} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 2 }}>{ev.title}</div>
                      {ev.note && <div style={{ fontSize: 12, color: 'var(--gray)' }}>{ev.note}</div>}
                      <span style={{ fontSize: 10, color: et.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{et.label}</span>
                    </div>
                    {!isShip && (
                      <button onClick={() => deleteEvent(ev.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: 4 }}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Add event form */}
              {showAddForm && (
                <div style={{ padding: '16px', background: 'rgba(201,168,76,.05)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 14, marginTop: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 2 }}>Nouvel événement</div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 11, color: 'var(--gray)', display: 'block', marginBottom: 6 }}>Titre *</label>
                    <input value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
                      placeholder="Titre de l'événement"
                      style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 8, color: 'var(--white)', fontSize: 13, outline: 'none' }} />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 11, color: 'var(--gray)', display: 'block', marginBottom: 6 }}>Type</label>
                    <select value={newEvent.type} onChange={e => setNewEvent(p => ({ ...p, type: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', background: '#0D1F3C', border: '1px solid rgba(201,168,76,.2)', borderRadius: 8, color: 'var(--white)', fontSize: 13, outline: 'none' }}>
                      {Object.entries(EVENT_TYPES).filter(([k]) => k !== 'shipment').map(([k, v]) => (
                        <option key={k} value={k} style={{ background: '#0D1F3C' }}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11, color: 'var(--gray)', display: 'block', marginBottom: 6 }}>Note (optionnel)</label>
                    <input value={newEvent.note} onChange={e => setNewEvent(p => ({ ...p, note: e.target.value }))}
                      placeholder="Description..."
                      style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 8, color: 'var(--white)', fontSize: 13, outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={addEvent} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', border: 'none', borderRadius: 9, color: 'var(--navy-deep)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                      Ajouter
                    </button>
                    <button onClick={() => setShowAddForm(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9, color: 'var(--gray)', cursor: 'pointer', fontSize: 13 }}>
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Add button */}
            {!showAddForm && (
              <div style={{ padding: '16px 28px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
                <button onClick={() => setShowAddForm(true)} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', border: 'none', borderRadius: 11, color: 'var(--navy-deep)', fontWeight: 700, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Plus size={16} strokeWidth={2} /> Ajouter un événement
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}