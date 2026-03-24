import { useState, useMemo } from "react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const PLAN_PRICES = { basico: 29, pro: 59, premium: 99 };
const PLAN_COLORS = { basico: "#6ee7b7", pro: "#60a5fa", premium: "#f472b6" };
const PLAN_LABELS = { basico: "Básico", pro: "Pro", premium: "Premium" };

const generatePatients = () => {
  const planes = ["basico", "pro", "premium"];
  const names = [
    "Ana García","Luis Martín","María López","Carlos Ruiz","Elena Sánchez",
    "Pedro Jiménez","Laura Gómez","Miguel Fernández","Sara Torres","David Díaz",
    "Marta Ramírez","Jorge Moreno","Paula Herrero","Andrés Muñoz","Carmen Molina",
    "Raúl Álvarez","Isabel Romero","Alberto Alonso","Lucía Navarro","Francisco Domínguez",
    "Patricia Ramos","Manuel Gutiérrez","Natalia Vega","Roberto Serrano","Cristina Blanco",
    "Javier Suárez","Silvia Ortega","Daniel Castillo","Verónica Delgado","Alejandro Flores",
  ];
  const today = new Date();
  return names.map((name, i) => {
    const plan = planes[i % 3 === 0 ? 0 : i % 3 === 1 ? 1 : 2];
    const joinedDaysAgo = Math.floor(Math.random() * 180);
    const joined = new Date(today);
    joined.setDate(joined.getDate() - joinedDaysAgo);
    // Simulate activity: last active within 0–40 days
    const lastActiveDaysAgo = Math.floor(Math.random() * 40);
    return { id: i + 1, name, plan, joined, lastActiveDaysAgo };
  });
};

const PATIENTS = generatePatients();

// Generate weekly active user counts (last 4 complete weeks + current)
const getWeekLabel = (weeksAgo) => {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() - weeksAgo * 7);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  const fmt = (d) => `${d.getDate()}/${d.getMonth() + 1}`;
  return `${fmt(start)}–${fmt(end)}`;
};

const WEEKLY_DATA = Array.from({ length: 5 }, (_, i) => {
  const weeksAgo = 4 - i;
  const active = { basico: 0, pro: 0, premium: 0 };
  PATIENTS.forEach((p) => {
    if (p.lastActiveDaysAgo <= weeksAgo * 7 + 6 && p.lastActiveDaysAgo >= weeksAgo * 7) {
      // simplified bucketing
    }
    if (p.lastActiveDaysAgo <= (4 - i) * 7 + 6) active[p.plan]++;
  });
  // Normalize for demo variety
  const factor = [0.72, 0.81, 0.88, 0.93, 1.0][i];
  return {
    label: weeksAgo === 0 ? "Semana actual" : getWeekLabel(weeksAgo),
    basico: Math.round(active.basico * factor),
    pro: Math.round(active.pro * factor),
    premium: Math.round(active.premium * factor),
    total: Math.round((active.basico + active.pro + active.premium) * factor),
  };
});

// Generate daily billing transactions over last 6 months
const generateTransactions = () => {
  const txs = [];
  const today = new Date();
  PATIENTS.forEach((p) => {
    // Each patient pays monthly, generate up to 6 payments
    for (let m = 0; m < 6; m++) {
      const d = new Date(today);
      d.setMonth(d.getMonth() - m);
      d.setDate(Math.floor(Math.random() * 28) + 1);
      if (d >= p.joined) {
        txs.push({ date: new Date(d), plan: p.plan, amount: PLAN_PRICES[p.plan] });
      }
    }
  });
  return txs.sort((a, b) => a.date - b.date);
};

const ALL_TRANSACTIONS = generateTransactions();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtCurrency = (n) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

const toDateInput = (d) => d.toISOString().split("T")[0];

// ─── Components ───────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      border: `1px solid ${color}33`,
      borderRadius: 16,
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -10, right: -10,
        fontSize: 64, opacity: 0.08, userSelect: "none",
      }}>{icon}</div>
      <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 38, fontWeight: 800, color, lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: "#64748b" }}>{sub}</span>}
    </div>
  );
}

function WeeklyTable({ data }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      overflow: "hidden",
    }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>
          Usuarios activos — últimas 4 semanas
        </h3>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "rgba(0,0,0,0.2)" }}>
            {["Período", "Básico", "Pro", "Premium", "Total"].map((h) => (
              <th key={h} style={{
                padding: "10px 16px", textAlign: "right", fontSize: 12,
                color: "#64748b", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
                className={h === "Período" ? "text-left" : ""}
              >
                <span style={{ textAlign: h === "Período" ? "left" : "right", display: "block" }}>{h}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{
              borderTop: "1px solid rgba(255,255,255,0.05)",
              background: i === data.length - 1 ? "rgba(99,179,237,0.06)" : "transparent",
            }}>
              <td style={{ padding: "12px 16px", fontSize: 13, color: "#cbd5e1", fontWeight: i === data.length - 1 ? 700 : 400 }}>
                {row.label}
                {i === data.length - 1 && (
                  <span style={{ marginLeft: 8, fontSize: 10, background: "#3b82f6", color: "white", padding: "2px 6px", borderRadius: 999, fontWeight: 700 }}>ACTUAL</span>
                )}
              </td>
              {["basico", "pro", "premium"].map((plan) => (
                <td key={plan} style={{ padding: "12px 16px", textAlign: "right", fontSize: 13, color: PLAN_COLORS[plan], fontWeight: 600 }}>
                  {row[plan]}
                </td>
              ))}
              <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 13, color: "#f8fafc", fontWeight: 700 }}>
                {row.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BillingChart({ transactions }) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [dateFrom, setDateFrom] = useState(toDateInput(sixMonthsAgo));
  const [dateTo, setDateTo] = useState(toDateInput(new Date()));

  const filtered = useMemo(() => {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59);
    return transactions.filter((t) => t.date >= from && t.date <= to);
  }, [transactions, dateFrom, dateTo]);

  // Group by month × plan
  const months = useMemo(() => {
    const map = {};
    filtered.forEach((t) => {
      const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, "0")}`;
      if (!map[key]) map[key] = { label: key, basico: 0, pro: 0, premium: 0 };
      map[key][t.plan] += t.amount;
    });
    return Object.values(map).sort((a, b) => a.label.localeCompare(b.label));
  }, [filtered]);

  const totals = useMemo(() => ({
    basico: filtered.filter((t) => t.plan === "basico").reduce((s, t) => s + t.amount, 0),
    pro: filtered.filter((t) => t.plan === "pro").reduce((s, t) => s + t.amount, 0),
    premium: filtered.filter((t) => t.plan === "premium").reduce((s, t) => s + t.amount, 0),
    total: filtered.reduce((s, t) => s + t.amount, 0),
  }), [filtered]);

  const maxMonth = Math.max(...months.map((m) => m.basico + m.pro + m.premium), 1);

  const fmtMonthLabel = (key) => {
    const [y, m] = key.split("-");
    const names = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    return `${names[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>
          Facturación acumulada por plan
        </h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ fontSize: 12, color: "#64748b" }}>Desde</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            style={dateInputStyle} />
          <label style={{ fontSize: 12, color: "#64748b" }}>Hasta</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            style={dateInputStyle} />
        </div>
      </div>

      {/* Billing Summary Box */}
      <div style={{ padding: "16px 24px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { key: "total", label: "Total facturado", color: "#f8fafc" },
          { key: "basico", label: "Plan Básico", color: PLAN_COLORS.basico },
          { key: "pro", label: "Plan Pro", color: PLAN_COLORS.pro },
          { key: "premium", label: "Plan Premium", color: PLAN_COLORS.premium },
        ].map(({ key, label, color }) => (
          <div key={key} style={{
            background: key === "total" ? "rgba(255,255,255,0.08)" : `${color}15`,
            border: `1px solid ${key === "total" ? "rgba(255,255,255,0.15)" : color + "44"}`,
            borderRadius: 12,
            padding: "14px 16px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color }}>{fmtCurrency(totals[key])}</div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div style={{ padding: "8px 24px 24px" }}>
        {months.length === 0 ? (
          <div style={{ textAlign: "center", color: "#475569", padding: 40, fontSize: 14 }}>
            No hay datos en el período seleccionado
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 200, position: "relative" }}>
            {/* Y axis labels */}
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 24, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
              {[1, 0.75, 0.5, 0.25, 0].map((frac) => (
                <span key={frac} style={{ fontSize: 10, color: "#334155" }}>
                  {fmtCurrency(maxMonth * frac)}
                </span>
              ))}
            </div>
            {/* Bars */}
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 6, paddingLeft: 52 }}>
              {months.map((m) => {
                const total = m.basico + m.pro + m.premium;
                const pct = (v) => `${(v / maxMonth) * 100}%`;
                return (
                  <div key={m.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 170, gap: 1 }}>
                      {["premium", "pro", "basico"].map((plan) => (
                        <div key={plan} title={`${PLAN_LABELS[plan]}: ${fmtCurrency(m[plan])}`} style={{
                          width: "100%",
                          height: pct(m[plan]),
                          background: PLAN_COLORS[plan],
                          borderRadius: plan === "premium" ? "4px 4px 0 0" : 0,
                          transition: "height 0.3s ease",
                          cursor: "default",
                          opacity: 0.9,
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 10, color: "#475569", whiteSpace: "nowrap" }}>{fmtMonthLabel(m.label)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 16 }}>
          {["basico", "pro", "premium"].map((plan) => (
            <div key={plan} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: PLAN_COLORS[plan] }} />
              <span style={{ fontSize: 12, color: "#64748b" }}>{PLAN_LABELS[plan]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const dateInputStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  padding: "6px 10px",
  color: "#cbd5e1",
  fontSize: 13,
  outline: "none",
  colorScheme: "dark",
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const counts = useMemo(() => {
    const c = { basico: 0, pro: 0, premium: 0 };
    PATIENTS.forEach((p) => c[p.plan]++);
    return c;
  }, []);

  const totalPatients = PATIENTS.length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0b1120",
      color: "#f8fafc",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "32px 24px",
    }}>
      {/* Header */}
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>🌿</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
              NutriPlanner <span style={{ color: "#4ade80" }}>Pro</span>
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#475569" }}>Panel de control</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          <StatCard
            label="Total pacientes"
            value={totalPatients}
            sub={`${PATIENTS.filter(p => p.lastActiveDaysAgo <= 7).length} activos esta semana`}
            color="#f8fafc"
            icon="👥"
          />
          <StatCard
            label="Plan Básico"
            value={counts.basico}
            sub={`${fmtCurrency(counts.basico * PLAN_PRICES.basico)}/mes`}
            color={PLAN_COLORS.basico}
            icon="🌱"
          />
          <StatCard
            label="Plan Pro"
            value={counts.pro}
            sub={`${fmtCurrency(counts.pro * PLAN_PRICES.pro)}/mes`}
            color={PLAN_COLORS.pro}
            icon="⚡"
          />
          <StatCard
            label="Plan Premium"
            value={counts.premium}
            sub={`${fmtCurrency(counts.premium * PLAN_PRICES.premium)}/mes`}
            color={PLAN_COLORS.premium}
            icon="👑"
          />
        </div>

        {/* Weekly Active Users Table */}
        <div style={{ marginBottom: 24 }}>
          <WeeklyTable data={WEEKLY_DATA} />
        </div>

        {/* Billing Chart */}
        <BillingChart transactions={ALL_TRANSACTIONS} />
      </div>
    </div>
  );
}
