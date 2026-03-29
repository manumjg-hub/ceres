// src/auth.jsx
// Contiene: AuthContext, useAuth, AuthGate, LoginPage, PricingPage, AccountButton
// Importar en main.jsx o App.jsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";

// ─── Precios (deben coincidir con los Price IDs de Stripe) ────────────────────
export const PLANS = {
  basico: {
    name:    "Básico",
    price:   10,
    priceId: import.meta.env.VITE_STRIPE_PRICE_BASICO,
    color:   "#4caf88",
    features: ["Hasta 20 pacientes","Planificador semanal","Exportar PDF","Soporte email"],
  },
  pro: {
    name:    "Pro",
    price:   25,
    priceId: import.meta.env.VITE_STRIPE_PRICE_PRO,
    color:   "#3a7ab5",
    features: ["Pacientes ilimitados","Todo lo de Básico","Plantillas de dieta","Estadísticas avanzadas","Soporte prioritario"],
    popular: true,
  },
  premium: {
    name:    "Premium",
    price:   50,
    priceId: import.meta.env.VITE_STRIPE_PRICE_PREMIUM,
    color:   "#9b7cb6",
    features: ["Todo lo de Pro","Marca blanca PDF","API acceso","Gestor multi-clínica","Account manager"],
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);  // Supabase auth user
  const [profile, setProfile] = useState(null);  // public.profiles row
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!error && data) setProfile(data);
  };

  useEffect(() => {
    // Sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      setLoading(false);
    });

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Refrescar perfil (ej. después de pagar)
  const refreshProfile = () => user && loadProfile(user.id);

  const signOut = () => supabase.auth.signOut();

  const isActive = profile?.subscription_status === "active"
                || profile?.subscription_status === "trialing";

  return (
    <AuthContext.Provider value={{ user, profile, loading, isActive, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// ─── Estilos compartidos Auth ─────────────────────────────────────────────────
const AuthStyles = () => (
  <style>{`
    .auth-bg{min-height:100vh;background:linear-gradient(135deg,#3a5c3a 0%,#2a4a2a 50%,#1a2e1a 100%);display:flex;align-items:center;justify-content:center;padding:20px;font-family:'DM Sans',sans-serif}
    .auth-box{background:#fff;border-radius:20px;padding:40px;width:100%;max-width:420px;box-shadow:0 24px 80px rgba(0,0,0,.3)}
    .auth-logo{text-align:center;margin-bottom:28px}
    .auth-logo h1{font-family:'Playfair Display',serif;font-size:28px;color:#3a5c3a;margin:8px 0 4px}
    .auth-logo p{font-size:13px;color:#6b6b6b}
    .auth-tabs{display:flex;background:#f8f4ed;border-radius:10px;padding:4px;margin-bottom:24px}
    .auth-tab{flex:1;padding:8px;border:none;border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;background:transparent;color:#6b6b6b;transition:all .15s}
    .auth-tab.active{background:#fff;color:#3a5c3a;box-shadow:0 1px 4px rgba(0,0,0,.1)}
    .auth-input{width:100%;padding:11px 14px;border:1.5px solid #ede7da;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;color:#2a2a2a;background:#f8f4ed;outline:none;box-sizing:border-box;transition:border-color .15s;margin-bottom:12px}
    .auth-input:focus{border-color:#5c7a5c;background:#fff}
    .auth-btn{width:100%;padding:13px;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .16s;margin-bottom:10px}
    .auth-btn-primary{background:#3a5c3a;color:#fff}
    .auth-btn-primary:hover:not(:disabled){background:#2a4a2a}
    .auth-btn:disabled{opacity:.5;cursor:not-allowed}
    .auth-err{background:#fce8e8;color:#c05353;border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:14px}
    .auth-ok{background:#e8f4e8;color:#2a6a2a;border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:14px}
    .auth-sep{text-align:center;font-size:12px;color:#9b9b9b;margin:10px 0}
    /* Pricing */
    .pricing-bg{min-height:100vh;background:linear-gradient(135deg,#3a5c3a,#1a2e1a);display:flex;flex-direction:column;align-items:center;padding:40px 20px;font-family:'DM Sans',sans-serif}
    .pricing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;max-width:900px;width:100%;margin:28px 0}
    .pricing-card{background:#fff;border-radius:18px;padding:28px;position:relative;transition:transform .2s;display:flex;flex-direction:column}
    .pricing-card:hover{transform:translateY(-4px)}
    .pricing-card.popular{border:2.5px solid #3a7ab5;box-shadow:0 12px 48px rgba(58,122,181,.25)}
    .popular-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#3a7ab5;color:#fff;padding:4px 16px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap}
    .pricing-name{font-size:15px;font-weight:700;margin-bottom:6px}
    .pricing-price{font-family:'Playfair Display',serif;font-size:38px;font-weight:700;line-height:1;margin:10px 0 4px}
    .pricing-period{font-size:12px;color:#6b6b6b;margin-bottom:18px}
    .pricing-feat{list-style:none;padding:0;margin:0 0 20px;flex:1}
    .pricing-feat li{font-size:13px;color:#3a3a3a;padding:5px 0;display:flex;align-items:center;gap:8px}
    .pricing-feat li::before{content:"✓";color:#5c7a5c;font-weight:700;flex-shrink:0}
    .pricing-trial{font-size:11px;color:#6b6b6b;text-align:center;margin-top:8px}
    /* Account */
    .acc-menu{position:absolute;right:0;top:calc(100% + 6px);background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.15);padding:12px;min-width:220px;z-index:500}
    .acc-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:#2a2a2a;transition:background .14s;width:100%;border:none;background:none;text-align:left}
    .acc-item:hover{background:#f8f4ed}
    .acc-item.danger{color:#c05353}
    .sub-badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase}
  `}</style>
);

// ─── LoginPage ────────────────────────────────────────────────────────────────
export function LoginPage() {
  const [tab,      setTab]  = useState("login");   // login | register
  const [email,    setEmail]   = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [msg,      setMsg]      = useState("");

  const handleSubmit = async () => {
    if (!email || !password) { setError("Rellena todos los campos"); return; }
    setLoading(true); setError(""); setMsg("");
    try {
      if (tab === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { email } }
        });
        if (error) throw error;
        setMsg("¡Cuenta creada! Revisa tu email para confirmarla.");
      }
    } catch (e) {
      const msgs = {
        "Invalid login credentials": "Email o contraseña incorrectos",
        "Email not confirmed": "Confirma tu email antes de entrar",
        "User already registered": "Ya existe una cuenta con este email",
      };
      setError(msgs[e.message] || e.message);
    }
    setLoading(false);
  };

  const handleKey = (e) => e.key === "Enter" && handleSubmit();

  return (
    <>
      <AuthStyles/>
      <div className="auth-bg">
        <div className="auth-box">
          <div className="auth-logo">
            <div style={{fontSize:40}}>🌿</div>
            <h1>NutriPlanner Pro</h1>
            <p>Gestión nutricional profesional</p>
          </div>

          <div className="auth-tabs">
            <button className={"auth-tab"+(tab==="login"?" active":"")} onClick={()=>{setTab("login");setError("");}}>Iniciar sesión</button>
            <button className={"auth-tab"+(tab==="register"?" active":"")} onClick={()=>{setTab("register");setError("");}}>Crear cuenta</button>
          </div>

          {error && <div className="auth-err">⚠️ {error}</div>}
          {msg   && <div className="auth-ok">✅ {msg}</div>}

          <input className="auth-input" type="email"    placeholder="Email profesional" value={email}    onChange={e=>setEmail(e.target.value)}    onKeyDown={handleKey}/>
          <input className="auth-input" type="password" placeholder="Contraseña"        value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={handleKey}/>

          <button className="auth-btn auth-btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "..." : tab==="login" ? "Entrar" : "Crear cuenta gratuita"}
          </button>

          {tab === "login" && (
            <>
              <div className="auth-sep">¿Olvidaste tu contraseña?</div>
              <button className="auth-btn" style={{background:"#f8f4ed",color:"#3a5c3a"}}
                onClick={async()=>{
                  if(!email){setError("Introduce tu email primero");return;}
                  await supabase.auth.resetPasswordForEmail(email);
                  setMsg("Email de recuperación enviado");
                }}>
                Recuperar contraseña
              </button>
            </>
          )}

          <p style={{fontSize:11,color:"#9b9b9b",textAlign:"center",marginTop:16,lineHeight:1.6}}>
            Al registrarte aceptas los términos de uso.<br/>14 días de prueba gratuita incluidos.
          </p>
        </div>
      </div>
    </>
  );
}

// ─── PricingPage ──────────────────────────────────────────────────────────────
export function PricingPage({ onBack }) {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(null);  // plan key siendo procesado
  const [error,   setError]   = useState("");

  const subscribe = async (plan) => {
    const planData = PLANS[plan];
    if (!planData?.priceId) {
      setError(`Price ID para plan "${plan}" no configurado. Revisa VITE_STRIPE_PRICE_${plan.toUpperCase()}`);
      return;
    }
    setLoading(plan); setError("");
    try {
      const res = await fetch("/api/create-checkout-session", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId:   planData.priceId,
          userId:    user.id,
          userEmail: user.email,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      window.location.href = data.url;
    } catch (e) {
      setError(e.message);
      setLoading(null);
    }
  };

  const openPortal = async () => {
    if (!profile?.stripe_customer_id) return;
    setLoading("portal");
    try {
      const res  = await fetch("/api/create-portal-session", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: profile.stripe_customer_id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) { setError(e.message); }
    setLoading(null);
  };

  const currentPlan = profile?.subscription_plan;
  const isActive    = profile?.subscription_status === "active" || profile?.subscription_status === "trialing";

  return (
    <>
      <AuthStyles/>
      <div className="pricing-bg">
        <div style={{maxWidth:900,width:"100%"}}>
          {onBack && (
            <button onClick={onBack} style={{background:"rgba(255,255,255,.15)",border:"none",color:"#fff",padding:"8px 16px",borderRadius:8,cursor:"pointer",fontSize:13,marginBottom:20}}>
              ← Volver
            </button>
          )}
          <div style={{textAlign:"center",color:"#fff",marginBottom:8}}>
            <h1 style={{fontFamily:"Playfair Display,serif",fontSize:32,margin:"0 0 8px"}}>🌿 NutriPlanner Pro</h1>
            <p style={{fontSize:15,opacity:.8,margin:0}}>
              {isActive
                ? `Plan activo: ${PLANS[currentPlan]?.name || currentPlan} ✓`
                : "Elige el plan que mejor se adapta a tu consulta"}
            </p>
            {!isActive && <p style={{fontSize:12,opacity:.6,marginTop:4}}>14 días de prueba gratuita · Sin compromiso · Cancela cuando quieras</p>}
          </div>

          {error && (
            <div style={{background:"rgba(192,83,83,.2)",border:"1px solid rgba(192,83,83,.4)",color:"#ffcccc",borderRadius:10,padding:"10px 16px",marginBottom:16,fontSize:13}}>
              ⚠️ {error}
            </div>
          )}

          <div className="pricing-grid">
            {Object.entries(PLANS).map(([key, plan]) => {
              const isCurrent = currentPlan === key && isActive;
              return (
                <div key={key} className={"pricing-card"+(plan.popular?" popular":"")}>
                  {plan.popular && <div className="popular-badge">⭐ MÁS POPULAR</div>}
                  <div className="pricing-name" style={{color:plan.color}}>{plan.name}</div>
                  <div className="pricing-price" style={{color:plan.color}}>{plan.price}€</div>
                  <div className="pricing-period">por mes · IVA no incluido</div>
                  <ul className="pricing-feat">
                    {plan.features.map(f => <li key={f}>{f}</li>)}
                  </ul>
                  {isCurrent ? (
                    <div style={{textAlign:"center",marginBottom:8}}>
                      <span style={{background:plan.color+"20",color:plan.color,padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:700}}>
                        ✓ Plan actual
                      </span>
                    </div>
                  ) : (
                    <button
                      className="auth-btn auth-btn-primary"
                      style={{background:plan.color,marginBottom:0}}
                      onClick={() => subscribe(key)}
                      disabled={!!loading}
                    >
                      {loading===key ? "Redirigiendo..." : isActive ? `Cambiar a ${plan.name}` : `Empezar con ${plan.name}`}
                    </button>
                  )}
                  <p className="pricing-trial">
                    {isCurrent && profile?.subscription_ends_at
                      ? `Próxima factura: ${new Date(profile.subscription_ends_at).toLocaleDateString("es-ES")}`
                      : "14 días gratis · sin tarjeta al inicio"}
                  </p>
                </div>
              );
            })}
          </div>

          {isActive && profile?.stripe_customer_id && (
            <div style={{textAlign:"center",marginTop:8}}>
              <button onClick={openPortal} disabled={loading==="portal"}
                style={{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.3)",color:"#fff",padding:"10px 20px",borderRadius:10,cursor:"pointer",fontSize:13}}>
                {loading==="portal" ? "..." : "⚙️ Gestionar facturación (Stripe Portal)"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── AccountButton (para la sidebar) ─────────────────────────────────────────
export function AccountButton({ onUpgrade }) {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = profile?.subscription_status === "active" || profile?.subscription_status === "trialing";
  const planName = PLANS[profile?.subscription_plan]?.name || "Sin plan";
  const planColor = PLANS[profile?.subscription_plan]?.color || "#6b6b6b";

  const statusColors = {
    active:   { bg:"rgba(76,175,136,.2)",   text:"#2a6a4a"  },
    trialing: { bg:"rgba(58,122,181,.2)",   text:"#1d4f7a"  },
    past_due: { bg:"rgba(196,124,59,.2)",   text:"#7a4a1a"  },
    canceled: { bg:"rgba(192,83,83,.2)",    text:"#7a2a2a"  },
    inactive: { bg:"rgba(107,107,107,.15)", text:"#3a3a3a"  },
  };
  const sc = statusColors[profile?.subscription_status || "inactive"];

  return (
    <div style={{position:"relative",padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,.1)",marginTop:"auto"}}>
      <AuthStyles/>
      <button onClick={()=>setOpen(o=>!o)}
        style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,padding:"9px 12px",cursor:"pointer",color:"#fff",textAlign:"left"}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>
          {user?.email?.[0]?.toUpperCase() || "?"}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {profile?.name || user?.email?.split("@")[0] || "Usuario"}
          </div>
          <div style={{fontSize:10,opacity:.7,display:"flex",alignItems:"center",gap:4}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:isActive?"#4caf88":"#9b9b9b",display:"inline-block"}}/>
            {isActive ? planName : "Sin suscripción"}
          </div>
        </div>
        <span style={{fontSize:10,opacity:.5}}>{open?"▲":"▼"}</span>
      </button>

      {open && (
        <div className="acc-menu" style={{bottom:"calc(100% + 6px)",top:"auto"}}>
          {/* Estado suscripción */}
          <div style={{padding:"8px 12px",marginBottom:6,background:sc.bg,borderRadius:8}}>
            <div style={{fontSize:11,fontWeight:700,color:sc.text,textTransform:"uppercase",letterSpacing:".05em"}}>
              {profile?.subscription_status === "active"   ? "✓ Suscripción activa"
             : profile?.subscription_status === "trialing" ? "⏱ Período de prueba"
             : profile?.subscription_status === "past_due" ? "⚠️ Pago pendiente"
             : profile?.subscription_status === "canceled" ? "✕ Cancelada"
             : "Sin suscripción"}
            </div>
            {isActive && <div style={{fontSize:10,color:sc.text,opacity:.8,marginTop:2}}>Plan {planName}</div>}
          </div>

          <button className="acc-item" onClick={()=>{setOpen(false);onUpgrade();}}>
            {isActive ? "⚙️ Gestionar plan" : "⭐ Ver planes"}
          </button>
          <div style={{height:1,background:"#f0f0f0",margin:"6px 0"}}/>
          <button className="acc-item danger" onClick={()=>{setOpen(false);signOut();}}>
            🚪 Cerrar sesión
          </button>
        </div>
      )}

      {open && <div style={{position:"fixed",inset:0,zIndex:499}} onClick={()=>setOpen(false)}/>}
    </div>
  );
}

// ─── AuthGate: envuelve la app y muestra Login si no hay sesión ───────────────
export function AuthGate({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f8f4ed"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:12}}>🌿</div>
        <div style={{fontSize:14,color:"#6b6b6b",fontFamily:"DM Sans,sans-serif"}}>Cargando NutriPlanner...</div>
      </div>
    </div>
  );

  if (!user) return <LoginPage/>;

  return children;
}

// ─── UpgradeBanner: se muestra cuando no hay suscripción activa ───────────────
export function UpgradeBanner({ onUpgrade }) {
  const { profile } = useAuth();
  const isPastDue = profile?.subscription_status === "past_due";

  return (
    <div style={{
      background: isPastDue
        ? "linear-gradient(135deg,#c47c3b,#a06020)"
        : "linear-gradient(135deg,#3a5c3a,#2a4a2a)",
      borderRadius:14, padding:"20px 24px", marginBottom:24, color:"#fff",
      display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap",
    }}>
      <div>
        <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>
          {isPastDue ? "⚠️ Problema con tu pago" : "🌿 Activa tu suscripción"}
        </div>
        <div style={{fontSize:13,opacity:.85,lineHeight:1.5}}>
          {isPastDue
            ? "No pudimos procesar tu último pago. Actualiza tu método de pago para continuar."
            : "Tienes acceso a todas las funciones durante 14 días. Activa un plan para continuar después."}
        </div>
      </div>
      <button onClick={onUpgrade}
        style={{background:"#fff",color:"#3a5c3a",border:"none",padding:"10px 20px",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap"}}>
        {isPastDue ? "Actualizar pago" : "Ver planes →"}
      </button>
    </div>
  );
}
