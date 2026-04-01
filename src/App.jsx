import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";

/* ─── SUPABASE CLIENT ────────────────────────────────────────────────────── */
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/* ─── ADMIN CONFIG ───────────────────────────────────────────────────────── */
// Tu email de administrador — tiene acceso completo sin necesidad de suscripción
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "";

/* ─── AUTH CONTEXT ───────────────────────────────────────────────────────── */
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [profile, setProfile]     = useState(null);   // subscription info
  const [authReady, setAuthReady] = useState(false);

  const loadProfile = async (uid) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();
    setProfile(data || null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      setAuthReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = () => user && loadProfile(user.id);

  return (
    <AuthContext.Provider value={{ user, profile, authReady, refreshProfile, supabase, isAdmin: user?.email === ADMIN_EMAIL }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);
// Helper: is the current user the admin?
const useIsAdmin = () => { const { user } = useAuth(); return user?.email === ADMIN_EMAIL; };

/* ─── STRIPE HELPERS ─────────────────────────────────────────────────────── */
const PLANS = [
  {
    id: "basic",
    name: "Básico",
    price: 29,
    priceId: import.meta.env.VITE_STRIPE_PRICE_BASIC,
    color: "#4caf88",
    icon: "🌱",
    features: [
      "Gestión ilimitada de pacientes",
      "Planificador semanal",
      "Lista de compra automática",
      "PDF menú + recetas",
      "Cuestionario personalizable",
      "Historial de peso y seguimiento",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 59,
    priceId: import.meta.env.VITE_STRIPE_PRICE_PRO,
    color: "#3a7ab5",
    icon: "⭐",
    popular: true,
    features: [
      "Todo lo del plan Básico",
      "Composición corporal (masa magra, grasa visceral…)",
      "Editor de dieta por paciente",
      "Plantillas reutilizables ilimitadas",
      "Dashboard de facturación",
      "Módulo de suscripciones de pacientes",
      "Acceso prioritario a nuevas funciones",
    ],
  },
];

async function startCheckout(priceId, userId, email) {
  const res = await fetch("/api/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId, userId, email }),
  });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
  else throw new Error(data.error || "Error al crear sesión de pago");
}

async function openCustomerPortal(userId) {
  const res = await fetch("/api/customer-portal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
  else throw new Error(data.error || "Error al abrir portal");
}

/* ─── VINE CANVAS ────────────────────────────────────────────────────────── */
function VineCanvas({ scrollY }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const progress = Math.min(scrollY / 3000, 1);
    const totalLen = H * 0.85;
    const drawn = totalLen * progress;
    ctx.save();
    ctx.strokeStyle = "#4caf88";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    const stemX = W / 2;
    let startY = 60;
    ctx.moveTo(stemX, startY);
    for (let i = 0; i < drawn; i += 2) {
      ctx.lineTo(stemX + Math.sin(i * 0.04) * 18, startY + i);
    }
    ctx.stroke();
    ctx.restore();
    const leafCount = Math.floor(progress * 24);
    for (let li = 0; li < leafCount; li++) {
      const t = li / 24;
      const vy = 60 + t * totalLen;
      const vx = stemX + Math.sin(li * 0.04 * 24) * 18;
      const side = li % 2 === 0 ? 1 : -1;
      const age = Math.min((progress - t) * 8, 1);
      ctx.save();
      ctx.translate(vx + side * 22 * age, vy);
      ctx.rotate(side * 0.5);
      ctx.globalAlpha = age;
      ctx.fillStyle = li % 3 === 0 ? "#2d7a5a" : "#4caf88";
      ctx.beginPath();
      ctx.ellipse(0, 0, 10 * age, 18 * age, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -14 * age);
      ctx.lineTo(0, 14 * age);
      ctx.stroke();
      ctx.restore();
    }
    const fruits = ["🥭","🍍","🌿","🍋","🥥","🍊","🫐","🍇"];
    const fruitCount = Math.floor(progress * fruits.length);
    for (let fi = 0; fi < fruitCount; fi++) {
      const t = (fi + 0.5) / fruits.length;
      const vy = 60 + t * totalLen;
      const vx = stemX + Math.sin(t * 24 * 0.04) * 18;
      const side = fi % 2 === 0 ? 1 : -1;
      const age = Math.min((progress - t) * 12, 1);
      ctx.save();
      ctx.translate(vx + side * 52 * age, vy - 10);
      ctx.globalAlpha = age;
      ctx.font = `${22 * age}px serif`;
      ctx.textAlign = "center";
      ctx.fillText(fruits[fi], 0, 0);
      ctx.restore();
    }
  }, [scrollY]);
  return (
    <canvas ref={canvasRef} width={120} height={3200}
      style={{position:"fixed",right:"4%",top:0,pointerEvents:"none",zIndex:10,opacity:0.8}}
    />
  );
}

/* ─── LANDING PAGE ───────────────────────────────────────────────────────── */
const LANDING_PLANS = [
  { id:"basico", name:"Básico", price:29, color:"#4caf88", accent:"#2d7a5a", icon:"🌱", desc:"Empieza a gestionar tu consulta",
    features:["Pacientes ilimitados","Planificador semanal de menús","Lista de compra automática","PDF menú + recetas","Cuestionario personalizable","Historial de peso y seguimiento"] },
  { id:"pro", name:"Pro", price:59, color:"#3a7ab5", accent:"#1a4f80", icon:"⭐", popular:true, desc:"La elección de los profesionales",
    features:["Todo lo del plan Básico","Composición corporal completa","Editor de dieta personalizado","Plantillas reutilizables ilimitadas","Dashboard de facturación","Suscripciones de pacientes","Acceso prioritario a novedades"] },
];
const LANDING_FEATURES = [
  { icon:"👥", title:"Gestión de pacientes", desc:"Todos tus pacientes organizados. Historial completo, evolución y documentos en un solo lugar.", fruit:"🥭" },
  { icon:"📋", title:"Planificación de menús", desc:"Crea menús semanales en minutos con el editor visual. Genera PDFs listos para imprimir al momento.", fruit:"🍍" },
  { icon:"📊", title:"Seguimiento nutricional", desc:"Controla el progreso con gráficas detalladas de peso, medidas y composición corporal.", fruit:"🍌" },
  { icon:"🛒", title:"Lista de compra automática", desc:"Genera la lista de compra del menú con un clic. Ahorra tiempo a ti y a tus pacientes.", fruit:"🥥" },
  { icon:"💰", title:"Facturación integrada", desc:"Gestiona cobros, suscripciones y facturas desde la misma plataforma.", fruit:"🍋" },
  { icon:"📱", title:"Acceso desde cualquier lugar", desc:"Funciona en cualquier dispositivo. Sin instalaciones, siempre actualizado.", fruit:"🍊" },
];

function LandingPage({ onLogin, onRegister, onSelectPlan }) {
  const [scrollY, setScrollY] = useState(0);
  const [hoverFeat, setHoverFeat] = useState(null);
  const [hoverPlan, setHoverPlan] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroOpacity = Math.max(0, 1 - scrollY / 500);
  const heroY = scrollY * 0.18;

  const lp = { // landing styles inline
    page: { fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", background:"#fafaf8", color:"#1a1a1a", overflowX:"hidden", minHeight:"100vh" },
    nav: { position:"fixed", top:0, left:0, right:0, zIndex:100, padding:"0 5%", transition:"all .3s", background: scrollY>60?"rgba(255,255,255,0.94)":"transparent", backdropFilter: scrollY>60?"blur(20px)":"none", boxShadow: scrollY>60?"0 1px 0 rgba(0,0,0,.08)":"none" },
    navInner: { maxWidth:1100, margin:"0 auto", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" },
    logo: { display:"flex", alignItems:"center", gap:8 },
    logoTxt: { fontSize:16, fontWeight:600, letterSpacing:"-.02em" },
    navLinks: { display:"flex", alignItems:"center", gap:20 },
    navA: { fontSize:14, color:"#555", textDecoration:"none", fontWeight:400 },
    navBtnPrimary: { fontSize:13, color:"#fff", background:"#2d7a5a", border:"none", cursor:"pointer", padding:"7px 18px", borderRadius:20, fontWeight:600 },
    navBtnGhost: { fontSize:13, color:"#333", background:"transparent", border:"none", cursor:"pointer", padding:"7px 12px" },
    hero: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"110px 5% 60px", maxWidth:1100, margin:"0 auto", gap:60, flexWrap:"wrap" },
    hContent: { flex:"1 1 400px", opacity:heroOpacity, transform:`translateY(${heroY}px)` },
    badge: { display:"inline-block", background:"rgba(76,175,136,.12)", color:"#2d7a5a", fontSize:12, fontWeight:600, padding:"5px 14px", borderRadius:20, marginBottom:24, letterSpacing:".02em" },
    h1: { fontSize:"clamp(34px,5vw,58px)", fontWeight:800, lineHeight:1.08, letterSpacing:"-.035em", margin:"0 0 20px", color:"#050505" },
    accent: { color:"#2d7a5a" },
    hsub: { fontSize:17, lineHeight:1.65, color:"#555", margin:"0 0 32px", maxWidth:440 },
    ctas: { display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" },
    ctaPrimary: { background:"#2d7a5a", color:"#fff", border:"none", padding:"14px 30px", borderRadius:30, fontSize:16, fontWeight:700, cursor:"pointer", letterSpacing:"-.01em" },
    ctaGhost: { color:"#2d7a5a", textDecoration:"none", fontSize:15, fontWeight:500 },
    heroNote: { fontSize:12, color:"#aaa", marginTop:14 },
    mockupWrap: { flex:"0 0 340px", opacity:heroOpacity, transform:`translateY(${heroY * 0.5}px)` },
    mockupWin: { background:"#fff", borderRadius:18, boxShadow:"0 30px 80px rgba(0,0,0,.14)", overflow:"hidden" },
    mockupBar: { background:"#f5f5f5", padding:"10px 14px", display:"flex", gap:6, alignItems:"center" },
    dot: { width:12, height:12, borderRadius:"50%", display:"inline-block" },
    mockupBody: { padding:20 },
    proof: { background:"#f2f2ef", padding:"44px 5%", textAlign:"center" },
    proofLbl: { fontSize:12, color:"#bbb", textTransform:"uppercase", letterSpacing:".1em", marginBottom:28 },
    proofRow: { display:"flex", justifyContent:"center", gap:"clamp(24px,6vw,80px)", flexWrap:"wrap" },
    pNum: { fontSize:30, fontWeight:800, letterSpacing:"-.03em", color:"#050505" },
    pLbl: { fontSize:12, color:"#888", marginTop:3 },
    section: { padding:"90px 5%", maxWidth:1100, margin:"0 auto" },
    sHead: { textAlign:"center", marginBottom:60 },
    sBadge: { display:"inline-block", background:"rgba(76,175,136,.1)", color:"#2d7a5a", fontSize:11, fontWeight:700, padding:"4px 14px", borderRadius:20, marginBottom:14, textTransform:"uppercase", letterSpacing:".07em" },
    sTitle: { fontSize:"clamp(26px,4vw,44px)", fontWeight:800, letterSpacing:"-.035em", lineHeight:1.12, margin:"0 0 14px", color:"#050505" },
    sSub: { fontSize:16, color:"#666", maxWidth:520, margin:"0 auto", lineHeight:1.65 },
    grid3: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:18 },
    featCard: (i) => ({ background:"#fff", borderRadius:16, padding:28, transition:"transform .2s,box-shadow .2s", position:"relative", overflow:"hidden", transform:hoverFeat===i?"translateY(-5px)":"none", boxShadow:hoverFeat===i?"0 20px 50px rgba(0,0,0,.1)":"0 2px 16px rgba(0,0,0,.05)" }),
    howBg: { background:"#f2f2ef", padding:"90px 5%" },
    steps: { display:"flex", justifyContent:"center", gap:"clamp(28px,6vw,72px)", maxWidth:860, margin:"0 auto", flexWrap:"wrap" },
    step: { flex:"0 0 200px", textAlign:"center" },
    stepN: { fontSize:12, fontWeight:700, color:"#4caf88", letterSpacing:".1em", marginBottom:14 },
    stepT: { fontSize:19, fontWeight:700, margin:"0 0 8px", letterSpacing:"-.02em" },
    stepD: { fontSize:13, color:"#666", lineHeight:1.6, margin:0 },
    planGrid: { display:"flex", justifyContent:"center", gap:22, flexWrap:"wrap", marginTop:16 },
    planCard: (p) => ({ background:"#fff", borderRadius:20, padding:"32px 26px", flex:"0 0 330px", textAlign:"left", position:"relative", transition:"transform .2s,box-shadow .2s", border:p.popular?"2px solid "+p.color:"1.5px solid #e8e8e8", transform:(p.popular||hoverPlan===p.id)?"scale(1.03)":"scale(1)", boxShadow:(p.popular||hoverPlan===p.id)?"0 16px 50px rgba(0,0,0,.12)":"0 2px 16px rgba(0,0,0,.05)" }),
    planBtn: (p) => ({ width:"100%", padding:"13px 0", borderRadius:30, fontSize:15, fontWeight:700, cursor:"pointer", letterSpacing:"-.01em", background:p.popular?p.color:"transparent", color:p.popular?"#fff":p.color, border:"2px solid "+p.color }),
    tGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:18 },
    tCard: { background:"#fff", borderRadius:16, padding:26 },
    darkCta: { background:"#081510", padding:"90px 5%", textAlign:"center", position:"relative", overflow:"hidden" },
    footer: { background:"#080808", padding:"28px 5%" },
  };

  return (
    <div style={lp.page}>
      <VineCanvas scrollY={scrollY} />

      {/* NAV */}
      <nav style={lp.nav}>
        <div style={lp.navInner}>
          <div style={lp.logo}>
            <span style={{fontSize:22}}>🌿</span>
            <span style={lp.logoTxt}>NutriPlanner <strong>Pro</strong></span>
          </div>
          <div style={lp.navLinks}>
            <a href="#features" style={lp.navA}>Funciones</a>
            <a href="#pricing" style={lp.navA}>Precios</a>
            <button onClick={onLogin} style={lp.navBtnGhost}>Iniciar sesión</button>
            <button onClick={onRegister} style={lp.navBtnPrimary}>Empezar gratis</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={lp.hero}>
        <div style={lp.hContent}>
          <div style={lp.badge}>✦ El primer mes es gratis · Sin permanencia</div>
          <h1 style={lp.h1}>
            Tu consulta de nutrición,<br/>
            <span style={lp.accent}>más inteligente</span>
          </h1>
          <p style={lp.hsub}>
            La plataforma todo-en-uno para nutricionistas que quieren dedicar
            más tiempo a sus pacientes y menos a la gestión.
          </p>
          <div style={lp.ctas}>
            <button onClick={onRegister} style={lp.ctaPrimary}>Empieza gratis hoy →</button>
            <a href="#features" style={lp.ctaGhost}>Ver cómo funciona</a>
          </div>
          <p style={lp.heroNote}>Sin tarjeta de crédito · Cancela cuando quieras</p>
        </div>

        <div style={lp.mockupWrap}>
          <div style={lp.mockupWin}>
            <div style={lp.mockupBar}>
              <span style={{...lp.dot,background:"#ff5f57"}}/>
              <span style={{...lp.dot,background:"#febc2e"}}/>
              <span style={{...lp.dot,background:"#28c840"}}/>
            </div>
            <div style={lp.mockupBody}>
              <div style={{display:"flex",gap:24,marginBottom:16}}>
                {[["48","Pacientes activos"],["98%","Adherencia media"]].map(([n,l])=>(
                  <div key={l}>
                    <div style={{fontSize:26,fontWeight:800,letterSpacing:"-.03em",color: l==="Adherencia media"?"#4caf88":"#050505"}}>{n}</div>
                    <div style={{fontSize:11,color:"#aaa",marginTop:2}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:6,alignItems:"flex-end",height:90,marginBottom:14}}>
                {[60,80,45,90,70].map((h,i)=>(
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <div style={{width:"100%",height:h,borderRadius:4,background:i===3?"#4caf88":"#e8f5e9"}}/>
                    <div style={{fontSize:9,color:"#ccc"}}>{"LMMJV"[i]}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:11,color:"#555",background:"#f0f9f5",padding:"6px 10px",borderRadius:8,display:"inline-block"}}>
                🥗 Dieta mediterránea · 1.800 kcal
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section style={lp.proof}>
        <p style={lp.proofLbl}>Confían en nosotros</p>
        <div style={lp.proofRow}>
          {[["500+","Nutricionistas"],["24.000+","Pacientes gestionados"],["98%","Satisfacción"],["4,9★","Valoración media"]].map(([n,l])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={lp.pNum}>{n}</div>
              <div style={lp.pLbl}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={lp.section}>
        <div style={lp.sHead}>
          <div style={lp.sBadge}>Funciones</div>
          <h2 style={lp.sTitle}>Todo lo que necesitas,<br/>en un solo lugar</h2>
          <p style={lp.sSub}>Diseñado por y para nutricionistas. Cada función existe para ahorrarte tiempo.</p>
        </div>
        <div style={lp.grid3}>
          {LANDING_FEATURES.map((f,i)=>(
            <div key={f.title} style={lp.featCard(i)} onMouseEnter={()=>setHoverFeat(i)} onMouseLeave={()=>setHoverFeat(null)}>
              <div style={{position:"absolute",top:14,right:14,fontSize:28,opacity:0.15}}>{f.fruit}</div>
              <div style={{fontSize:28,marginBottom:10}}>{f.icon}</div>
              <h3 style={{fontSize:17,fontWeight:700,margin:"0 0 8px",letterSpacing:"-.01em"}}>{f.title}</h3>
              <p style={{fontSize:13,color:"#666",lineHeight:1.65,margin:0}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={lp.howBg}>
        <div style={{...lp.sHead,marginBottom:52}}>
          <div style={lp.sBadge}>Así de simple</div>
          <h2 style={lp.sTitle}>Empieza en 3 minutos</h2>
        </div>
        <div style={lp.steps}>
          {[
            {n:"01",t:"Crea tu cuenta",d:"Regístrate gratis. Sin tarjeta, sin complicaciones."},
            {n:"02",t:"Añade tus pacientes",d:"Importa o crea fichas en segundos con toda su información."},
            {n:"03",t:"Planifica y crece",d:"Gestiona menús, seguimiento y facturación desde un solo panel."},
          ].map(st=>(
            <div key={st.n} style={lp.step}>
              <div style={lp.stepN}>{st.n}</div>
              <h3 style={lp.stepT}>{st.t}</h3>
              <p style={lp.stepD}>{st.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{...lp.section,textAlign:"center"}}>
        <div style={lp.sHead}>
          <div style={lp.sBadge}>Precios</div>
          <h2 style={lp.sTitle}>Inversión mínima,<br/>retorno máximo</h2>
          <p style={lp.sSub}>Un solo paciente nuevo ya cubre el coste del mes. El primer mes es gratis.</p>
        </div>
        <div style={lp.planGrid}>
          {LANDING_PLANS.map(plan=>(
            <div key={plan.id} style={lp.planCard(plan)} onMouseEnter={()=>setHoverPlan(plan.id)} onMouseLeave={()=>setHoverPlan(null)}>
              {plan.popular && (
                <div style={{position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",background:plan.color,color:"#fff",fontSize:11,fontWeight:700,padding:"4px 16px",borderRadius:20,whiteSpace:"nowrap"}}>
                  ✦ Más popular
                </div>
              )}
              <div style={{fontSize:28,marginBottom:10}}>{plan.icon}</div>
              <h3 style={{fontSize:22,fontWeight:800,margin:"0 0 4px",letterSpacing:"-.025em"}}>{plan.name}</h3>
              <p style={{fontSize:13,color:"#999",margin:"0 0 18px"}}>{plan.desc}</p>
              <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:2}}>
                <span style={{fontSize:18,fontWeight:500,color:"#666"}}>€</span>
                <span style={{fontSize:52,fontWeight:900,letterSpacing:"-.05em",lineHeight:1,color:"#050505"}}>{plan.price}</span>
                <span style={{fontSize:13,color:"#aaa"}}>/mes</span>
              </div>
              <div style={{fontSize:11,color:"#4caf88",fontWeight:600,marginBottom:22}}>Primer mes gratis</div>
              <ul style={{listStyle:"none",padding:0,margin:"0 0 26px"}}>
                {plan.features.map(f=>(
                  <li key={f} style={{fontSize:13,color:"#444",padding:"5px 0",borderBottom:"0.5px solid #f0f0f0",display:"flex",alignItems:"flex-start"}}>
                    <span style={{color:plan.color,marginRight:8,flexShrink:0}}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={()=>onSelectPlan?onSelectPlan(plan):onRegister&&onRegister(plan)} style={lp.planBtn(plan)}>
                Empezar con {plan.name} →
              </button>
            </div>
          ))}
        </div>
        <p style={{fontSize:14,color:"#aaa",marginTop:36}}>
          ¿Ya tienes cuenta?{" "}
          <button onClick={onLogin} style={{background:"none",border:"none",color:"#2d7a5a",fontSize:14,cursor:"pointer",textDecoration:"underline"}}>
            Inicia sesión aquí
          </button>
        </p>
      </section>

      {/* TESTIMONIALS */}
      <section style={{...lp.howBg}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{...lp.sHead,marginBottom:52}}>
            <h2 style={lp.sTitle}>Lo que dicen los nutricionistas</h2>
          </div>
          <div style={lp.tGrid}>
            {[
              {name:"Dra. Laura Martínez",role:"Nutricionista clínica, Valencia",av:"LM",txt:"Ahorro más de 3 horas a la semana en gestión. Mis pacientes reciben mejor atención y yo tengo más tiempo para lo que importa."},
              {name:"Pablo Sánchez",role:"Dietista-nutricionista, Madrid",av:"PS",txt:"La función de planificación de menús es increíble. Antes tardaba una hora, ahora lo hago en 10 minutos."},
              {name:"Ana Jiménez",role:"Nutricionista deportiva, Barcelona",av:"AJ",txt:"El seguimiento de composición corporal ha mejorado muchísimo la motivación de mis pacientes. Totalmente recomendado."},
            ].map(t=>(
              <div key={t.name} style={lp.tCard}>
                <div style={{width:42,height:42,borderRadius:"50%",background:"rgba(76,175,136,.14)",color:"#2d7a5a",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,marginBottom:14}}>{t.av}</div>
                <p style={{fontSize:14,lineHeight:1.7,color:"#444",margin:"0 0 14px",fontStyle:"italic"}}>"{t.txt}"</p>
                <div style={{fontSize:13,fontWeight:700,color:"#050505"}}>{t.name}</div>
                <div style={{fontSize:11,color:"#aaa",marginTop:2}}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={lp.darkCta}>
        {["🥭","🍍","🌿","🍋"].map((fr,i)=>(
          <span key={i} style={{position:"absolute",fontSize:[60,80,50,70][i],opacity:0.1,top:["10%","20%","auto","auto"][i],bottom:[null,null,"15%","10%"][i],left:["5%",null,"12%",null][i],right:[null,"8%",null,"5%"][i],pointerEvents:"none"}}>{fr}</span>
        ))}
        <div style={{position:"relative",zIndex:1}}>
          <h2 style={{fontSize:"clamp(28px,5vw,52px)",fontWeight:800,color:"#fff",letterSpacing:"-.035em",margin:"0 0 18px"}}>Empieza hoy, sin riesgos</h2>
          <p style={{fontSize:17,color:"rgba(255,255,255,.55)",lineHeight:1.65,margin:"0 0 36px"}}>
            El primer mes completamente gratis. Sin tarjeta de crédito.<br/>Cancela cuando quieras.
          </p>
          <button onClick={onRegister} style={{background:"#4caf88",color:"#fff",border:"none",padding:"15px 40px",borderRadius:30,fontSize:17,fontWeight:700,cursor:"pointer",letterSpacing:"-.01em"}}>
            Crear mi cuenta gratis →
          </button>
          <p style={{fontSize:12,color:"rgba(255,255,255,.3)",marginTop:20}}>Más de 500 nutricionistas ya confían en NutriPlanner Pro</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={lp.footer}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:18}}>🌿</span>
            <span style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.6)"}}>NutriPlanner Pro</span>
          </div>
          <div style={{display:"flex",gap:18}}>
            {["Funciones","Precios"].map(l=>(
              <a key={l} href={"#"+l.toLowerCase()} style={{fontSize:12,color:"rgba(255,255,255,.35)",textDecoration:"none"}}>{l}</a>
            ))}
            <button onClick={onLogin} style={{fontSize:12,color:"rgba(255,255,255,.35)",background:"none",border:"none",cursor:"pointer"}}>Acceder</button>
          </div>
          <p style={{fontSize:11,color:"rgba(255,255,255,.2)",margin:0}}>© 2025 NutriPlanner Pro · Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
}

/* ─── AUTH PAGE (login / register) ──────────────────────────────────────── */
function AuthPage({ initialMode = "login", preselectedPlan = null, onBack = null }) {
  const { supabase } = useAuth();
  const [mode, setMode]       = useState(initialMode);
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [name, setName]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [msg, setMsg]         = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setMsg(""); setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        setMsg("Revisa tu email para confirmar la cuenta.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setMsg("Email de recuperación enviado. Revisa tu bandeja.");
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @media (max-width: 800px) {
          .auth-rhs { display: none !important; }
        }
      `}</style>
      <div style={{minHeight:"100vh", display:"flex", background:"#fff"}}>
        <div style={{flex:1, display:"flex", flexDirection:"column", padding:"clamp(24px, 5vw, 40px)"}}>
          {onBack && (
            <button onClick={onBack} style={{background:"none",border:"none",color:"var(--sage-dk)",fontSize:14,cursor:"pointer",marginBottom:20,padding:"4px 0",display:"inline-flex",alignItems:"center",gap:6, alignSelf:"flex-start", fontWeight:600}}>
              ← Volver al inicio
            </button>
          )}
          <div style={{maxWidth:400, margin:"auto", width:"100%"}}>
            <div style={{marginBottom:32}}>
              <div style={{fontSize:24, display:"flex", alignItems:"center", gap:8, marginBottom:24}}>
                <span style={{fontSize:32}}>🌿</span>
                <span style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:"var(--sage-dk)",fontSize:24}}>NutriPlanner <span style={{color:"var(--terra)",fontSize:11,fontWeight:800,letterSpacing:".14em",textTransform:"uppercase",verticalAlign:"middle"}}>Pro</span></span>
              </div>
              
              <h2 style={{fontSize:"clamp(26px, 4vw, 32px)", fontWeight:800, color:"#111", marginBottom:8, letterSpacing:"-.03em"}}>
                {mode === "login" ? "Bienvenido de nuevo" : mode === "register" ? "Comienza tu prueba gratis" : "Recupera tu acceso"}
              </h2>
              <p style={{color:"#555", fontSize:15, lineHeight:1.6}}>
                {mode === "login" 
                  ? "Introduce tus datos para acceder a tu panel de gestión."
                  : mode === "register"
                  ? "Únete a cientos de profesionales. Sin tarjeta de crédito."
                  : "Te enviaremos un enlace para restablecer tu contraseña."}
              </p>
              
              {preselectedPlan && (
                <div style={{marginTop:16,display:"inline-flex",alignItems:"center",background:"rgba(76,175,136,.1)",color:"#2d7a5a",fontSize:13,fontWeight:600,padding:"6px 16px",borderRadius:24,gap:8}}>
                  <span style={{fontSize:18}}>{preselectedPlan.icon}</span> 
                  <span>Plan {preselectedPlan.name} seleccionado — {preselectedPlan.price}€/mes</span>
                </div>
              )}
            </div>

            {error && <div style={{background:"#fef0f0",borderLeft:"4px solid var(--danger)",color:"#c53030",padding:"12px 16px",fontSize:14,marginBottom:24,borderRadius:"0 8px 8px 0"}}>{error}</div>}
            {msg   && <div style={{background:"#f0fdf4",borderLeft:"4px solid var(--sage-dk)",color:"#15803d",padding:"12px 16px",fontSize:14,marginBottom:24,borderRadius:"0 8px 8px 0"}}>{msg}</div>}

            <form onSubmit={submit} style={{display:"flex", flexDirection:"column", gap:16}}>
              {mode === "register" && (
                <div style={{display:"flex", flexDirection:"column", gap:6}}>
                  <label style={{fontSize:13, fontWeight:600, color:"#333"}}>Nombre completo</label>
                  <input style={{padding:"12px 16px", borderRadius:12, border:"1px solid #ddd", fontSize:15, outline:"none", transition:"all 0.2s"}} 
                    onFocus={e=>e.target.style.borderColor="var(--sage-dk)"} onBlur={e=>e.target.style.borderColor="#ddd"}
                    value={name} onChange={e=>setName(e.target.value)} placeholder="Ej. Dra. María García" required/>
                </div>
              )}
              <div style={{display:"flex", flexDirection:"column", gap:6}}>
                <label style={{fontSize:13, fontWeight:600, color:"#333"}}>Correo electrónico</label>
                <input type="email" style={{padding:"12px 16px", borderRadius:12, border:"1px solid #ddd", fontSize:15, outline:"none", transition:"all 0.2s"}}
                  onFocus={e=>e.target.style.borderColor="var(--sage-dk)"} onBlur={e=>e.target.style.borderColor="#ddd"}
                  value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" required autoFocus/>
              </div>
              {mode !== "forgot" && (
                <div style={{display:"flex", flexDirection:"column", gap:6}}>
                  <label style={{fontSize:13, fontWeight:600, color:"#333"}}>Contraseña</label>
                  <input type="password" style={{padding:"12px 16px", borderRadius:12, border:"1px solid #ddd", fontSize:15, outline:"none", transition:"all 0.2s"}}
                    onFocus={e=>e.target.style.borderColor="var(--sage-dk)"} onBlur={e=>e.target.style.borderColor="#ddd"}
                    value={password} onChange={e=>setPass(e.target.value)} placeholder="••••••••" required minLength={8}/>
                </div>
              )}
              
              <button type="submit" disabled={loading} style={{
                background: "var(--sage-dk)", color: "#fff", padding: "14px", borderRadius: 12, 
                border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer", 
                marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: loading ? 0.7 : 1, transition:"transform 0.1s"
              }} onMouseDown={e=>e.currentTarget.style.transform="scale(0.98)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                {loading ? <div className="sp2" style={{width:20,height:20,borderWidth:2,borderColor:"rgba(255,255,255,.3)",borderTopColor:"#fff"}}/> : null}
                {mode === "login" ? "Entrar a mi cuenta" : mode === "register" ? "Crear cuenta gratis" : "Enviar instrucciones"}
              </button>
            </form>

            <div style={{marginTop:32, textAlign:"center", fontSize:14, color:"#666"}}>
              {mode === "login" ? (
                <>
                  ¿No tienes cuenta? <button style={{background:"none",border:"none",color:"var(--sage-dk)",fontWeight:700,cursor:"pointer",fontSize:14}} onClick={()=>{setMode("register");setError("");}}>Regístrate gratis</button>
                  <div style={{marginTop:16}}>
                    <button style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontSize:13,textDecoration:"underline"}} onClick={()=>{setMode("forgot");setError("");}}>¿Has olvidado tu contraseña?</button>
                  </div>
                </>
              ) : mode === "register" ? (
                <>
                  ¿Ya tienes una cuenta? <button style={{background:"none",border:"none",color:"var(--sage-dk)",fontWeight:700,cursor:"pointer",fontSize:14}} onClick={()=>{setMode("login");setError("");}}>Inicia sesión</button>
                  <p style={{fontSize:12, color:"#aaa", marginTop:24, lineHeight:1.5}}>Al registrarte, aceptas nuestros términos de servicio y política de privacidad.<br/>El primer mes es totalmente gratuito.</p>
                </>
              ) : (
                <button style={{background:"none",border:"none",color:"var(--sage-dk)",fontWeight:700,cursor:"pointer",fontSize:14}} onClick={()=>{setMode("login");setError("");}}>← Volver a iniciar sesión</button>
              )}
            </div>
          </div>
        </div>
        
        <div className="auth-rhs" style={{flex:1, display:"flex", background:"linear-gradient(135deg, #e4ede8 0%, #f0f4f1 100%)", position:"relative", overflow:"hidden", alignItems:"center", justifyContent:"center"}}>
          <div style={{position:"absolute", width:400, height:400, background:"rgba(76,175,136,0.1)", borderRadius:"50%", filter:"blur(80px)", top:"-100px", right:"-100px"}}></div>
          <div style={{position:"absolute", width:300, height:300, background:"rgba(226,177,153,0.1)", borderRadius:"50%", filter:"blur(80px)", bottom:"-50px", left:"-50px"}}></div>
          
          <div style={{position:"relative", zIndex:1, width:"80%", maxWidth:480}}>
            <div style={{background:"rgba(255,255,255,0.7)", backdropFilter:"blur(20px)", padding:"32px", borderRadius:24, boxShadow:"0 20px 40px rgba(0,0,0,0.06)", transform:"rotate(-2deg)", border:"1px solid rgba(255,255,255,0.8)"}}>
              <div style={{display:"flex", gap:16, marginBottom:20}}>
                <div style={{width:48,height:48,borderRadius:"50%",background:"var(--sage-dk)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>👩🏻‍⚕️</div>
                <div>
                  <div style={{fontWeight:800, color:"#111", fontSize:16}}>Dra. Elena Castro</div>
                  <div style={{color:"#666", fontSize:13}}>Nutricionista Clínica</div>
                </div>
              </div>
              <p style={{fontSize:16, lineHeight:1.6, color:"#333", fontStyle:"italic", margin:0}}>
                "NutriPlanner Pro ha transformado por completo mi consulta. Ahora tardo minutos en crear menús que antes me llevaban horas, y mis pacientes están encantados."
              </p>
              <div style={{display:"flex", gap:4, marginTop:16, color:"#fbbf24", fontSize:20}}>★★★★★</div>
            </div>
            
            <div style={{position:"absolute", right:-30, bottom:-40, background:"#fff", padding:"16px 24px", borderRadius:100, boxShadow:"0 10px 30px rgba(0,0,0,0.08)", display:"flex", alignItems:"center", gap:12, transform:"rotate(3deg)"}}>
               <div style={{width:12, height:12, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 10px #22c55e"}}/>
               <span style={{fontWeight:700, color:"#111", fontSize:14}}>+500 Nutricionistas activos</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── PRICING PAGE ───────────────────────────────────────────────────────── */
function PricingPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(null);    // plan id being loaded
  const [error, setError]     = useState("");

  // Handle /success redirect from Stripe
  useEffect(() => {
    if (window.location.pathname === "/success" || window.location.search.includes("session_id")) {
      // Give webhook a moment, then refresh
      const t = setTimeout(() => {
        refreshProfile();
        window.history.replaceState({}, "", "/");
      }, 2500);
      return () => clearTimeout(t);
    }
  }, []);

  const subscribe = async (plan) => {
    if (!plan.priceId) {
      setError("Price ID no configurado — revisa las variables de entorno.");
      return;
    }
    setLoading(plan.id); setError("");
    try {
      await startCheckout(plan.priceId, user.id, user.email);
    } catch (err) {
      setError(err.message);
    }
    setLoading(null);
  };

  const isSuccess = window.location.pathname === "/success" || window.location.search.includes("session_id");

  return (
    <div style={{minHeight:"100vh",background:"var(--cream)",padding:"48px 24px"}}>
      {/* Header */}
      <div style={{textAlign:"center",maxWidth:600,margin:"0 auto 48px"}}>
        {isSuccess
          ? <><div style={{fontSize:60,marginBottom:16}}>🎉</div>
              <h2 style={{fontSize:28,color:"var(--sage-dk)",marginBottom:8}}>¡Pago completado!</h2>
              <p style={{color:"var(--mid)",fontSize:15}}>Activando tu suscripción… Espera un momento.</p>
              <div className="sp2 sp2-dk" style={{display:"inline-block",marginTop:16,width:24,height:24}}/>
            </>
          : <><div style={{fontSize:48,marginBottom:16}}>🌿</div>
              <h2 style={{fontSize:32,color:"var(--sage-dk)",marginBottom:8}}>Elige tu plan</h2>
              <p style={{color:"var(--mid)",fontSize:15,lineHeight:1.6}}>
                Hola <b>{user.email}</b>. Activa tu suscripción para acceder a NutriPlanner Pro.
              </p>
            </>}
      </div>

      {error && <div style={{maxWidth:600,margin:"0 auto 24px",background:"rgba(192,83,83,.1)",color:"var(--danger)",borderRadius:"var(--rs)",padding:"12px 16px",fontSize:13}}>{error}</div>}

      {/* Plan cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:24,maxWidth:680,margin:"0 auto 48px"}}>
        {PLANS.map(plan => (
          <div key={plan.id} style={{
            background:"#fff",borderRadius:"var(--r)",
            boxShadow: plan.popular ? "0 8px 40px rgba(58,122,181,.25)" : "var(--sh)",
            border: plan.popular ? `2px solid ${plan.color}` : "2px solid transparent",
            overflow:"hidden",position:"relative",
          }}>
            {plan.popular && (
              <div style={{background:plan.color,color:"#fff",textAlign:"center",padding:"6px",fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase"}}>
                ⭐ Más popular
              </div>
            )}
            <div style={{padding:"28px 28px 24px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <span style={{fontSize:28}}>{plan.icon}</span>
                <div>
                  <div style={{fontWeight:700,fontSize:18,color:"var(--char)"}}>{plan.name}</div>
                  <div style={{fontSize:11,color:"var(--mid)",textTransform:"uppercase",letterSpacing:".06em"}}>Plan mensual</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:20}}>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:40,fontWeight:700,color:plan.color}}>{plan.price}€</span>
                <span style={{fontSize:13,color:"var(--mid)"}}>/mes</span>
              </div>
              <ul style={{listStyle:"none",padding:0,margin:0,marginBottom:24,display:"flex",flexDirection:"column",gap:9}}>
                {plan.features.map((f,i) => (
                  <li key={i} style={{display:"flex",gap:9,alignItems:"flex-start",fontSize:13}}>
                    <span style={{color:plan.color,flexShrink:0,marginTop:1}}>✓</span>
                    <span style={{color:"var(--char)",lineHeight:1.4}}>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className="btn"
                style={{width:"100%",justifyContent:"center",background:plan.color,color:"#fff",fontSize:14,padding:"12px",border:"none"}}
                disabled={loading === plan.id}
                onClick={() => subscribe(plan)}
              >
                {loading === plan.id
                  ? <><div className="sp2" style={{borderTopColor:"#fff",borderColor:"rgba(255,255,255,.3)"}}/>Redirigiendo...</>
                  : `Activar plan ${plan.name}`}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer trust */}
      <div style={{textAlign:"center",fontSize:12,color:"var(--mid)",lineHeight:1.8}}>
        🔒 Pago seguro con Stripe · Cancela en cualquier momento · Sin permanencia<br/>
        <button className="btn btn-g btn-sm" style={{marginTop:10}} onClick={()=>supabase.auth.signOut()}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

/* ─── ACCOUNT MODAL ──────────────────────────────────────────────────────── */
function AccountModal({ onClose }) {
  const { user, profile, refreshProfile, supabase } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);

  const { isAdmin } = useAuth();
  const plan = PLANS.find(p => p.name === profile?.plan);
  const status = profile?.subscription_status;
  const periodEnd = profile?.plan_period_end
    ? new Date(profile.plan_period_end).toLocaleDateString("es-ES", {day:"2-digit",month:"long",year:"numeric"})
    : null;

  const openPortal = async () => {
    setPortalLoading(true);
    try { await openCustomerPortal(user.id); }
    catch (err) { alert(err.message); }
    setPortalLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  return (
    <div className="mb" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo" style={{maxWidth:440}}>
        <div className="mo-hd">
          <h3>👤 Mi cuenta</h3>
          <button className="mo-x" onClick={onClose}>✕</button>
        </div>

        {/* User info */}
        <div style={{background:"var(--cream)",borderRadius:"var(--rs)",padding:"14px 16px",marginBottom:20}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:3}}>{user.email}</div>
          <div style={{fontSize:11,color:"var(--mid)"}}>Nutricionista profesional</div>
        </div>

        {/* Subscription status */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--mid)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>Suscripción</div>
          {isAdmin ? (
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:"rgba(58,92,58,.08)",border:"1.5px solid rgba(58,92,58,.3)",borderRadius:"var(--rs)"}}>
              <span style={{fontSize:24}}>👑</span>
              <div>
                <div style={{fontWeight:700,fontSize:15,color:"var(--sage-dk)"}}>Administrador</div>
                <div style={{fontSize:11,color:"var(--mid)"}}>Acceso completo sin suscripción</div>
              </div>
              <span style={{marginLeft:"auto",background:"rgba(58,92,58,.15)",color:"var(--sage-dk)",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>Admin</span>
            </div>
          ) : status === "active" ? (
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:"rgba(76,175,136,.08)",border:"1.5px solid rgba(76,175,136,.3)",borderRadius:"var(--rs)"}}>
              <span style={{fontSize:24}}>{plan?.icon || "✅"}</span>
              <div>
                <div style={{fontWeight:700,fontSize:15,color:plan?.color||"var(--sage-dk)"}}>Plan {profile.plan}</div>
                {periodEnd && <div style={{fontSize:11,color:"var(--mid)"}}>Próxima facturación: {periodEnd}</div>}
              </div>
              <span style={{marginLeft:"auto",background:"rgba(76,175,136,.2)",color:"#2a7a56",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>Activo</span>
            </div>
          ) : status === "past_due" ? (
            <div style={{padding:"14px 16px",background:"rgba(192,83,83,.08)",border:"1.5px solid rgba(192,83,83,.3)",borderRadius:"var(--rs)",fontSize:13,color:"var(--danger)"}}>
              ⚠️ Pago pendiente — Actualiza tu método de pago para evitar la interrupción del servicio.
            </div>
          ) : (
            <div style={{fontSize:13,color:"var(--mid)"}}>Sin suscripción activa.</div>
          )}
        </div>

        {/* Actions */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {!isAdmin && (status === "active" || status === "past_due") && (
            <button className="btn btn-o" style={{justifyContent:"center"}} disabled={portalLoading} onClick={openPortal}>
              {portalLoading ? <><div className="sp2 sp2-dk"/>Abriendo...</> : "⚙️ Gestionar suscripción (Stripe)"}
            </button>
          )}
          <button className="btn btn-g" style={{justifyContent:"center",color:"var(--danger)"}} onClick={logout}>
            🚪 Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── SUBSCRIPTION GATE ──────────────────────────────────────────────────── */
function SubscriptionGate({ children }) {
  const { user, profile } = useAuth();
  // Admin bypasses subscription check completely
  if (user?.email === ADMIN_EMAIL) return children;
  if (profile?.subscription_status === "active") return children;
  return <PricingPage />;
}

/* ─── AUTH GATE ──────────────────────────────────────────────────────────── */
function AuthGate({ children }) {
  const { user, authReady } = useAuth();
  const [authMode, setAuthMode] = useState(null); // null=landing, "login"|"register"
  const [preselectedPlan, setPreselectedPlan] = useState(null);

  if (!authReady) {
    return (
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--cream)"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>🌿</div>
          <div className="sp2 sp2-dk" style={{display:"inline-block",width:28,height:28}}/>
        </div>
      </div>
    );
  }
  if (!user) {
    if (authMode) {
      return <AuthPage initialMode={authMode} preselectedPlan={preselectedPlan} onBack={()=>setAuthMode(null)} />;
    }
    return (
      <LandingPage
        onLogin={() => setAuthMode("login")}
        onRegister={() => setAuthMode("register")}
        onSelectPlan={(plan) => { setPreselectedPlan(plan); setAuthMode("register"); }}
      />
    );
  }
  return <SubscriptionGate>{children}</SubscriptionGate>;
}



/* ─── STYLES ─────────────────────────────────────────────────────────────── */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --sage:#5c7a5c;--sage-lt:#8aab8a;--sage-dk:#3a5c3a;
      --cream:#f8f4ed;--cream-dk:#ede7da;
      --terra:#c47c3b;--terra-lt:#e8a96a;
      --char:#2a2a2a;--mid:#6b6b6b;--white:#fff;
      --danger:#c05353;--info:#3a7ab5;--purple:#7c5cbf;
      --sh:0 4px 24px rgba(42,42,42,.10);--sh-lg:0 8px 40px rgba(42,42,42,.14);
      --r:14px;--rs:8px;
    }
    body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--char);min-height:100vh}
    h1,h2,h3,h4{font-family:'Playfair Display',serif}
    .shell{display:flex;min-height:100vh}
    .sb{width:240px;min-height:100vh;background:var(--sage-dk);display:flex;flex-direction:column;padding:32px 0 24px;position:sticky;top:0;height:100vh;overflow:hidden}
    .sb-logo{padding:0 24px 28px;border-bottom:1px solid rgba(255,255,255,.12);margin-bottom:14px}
    .sb-logo h1{color:#fff;font-size:20px;line-height:1.2}
    .sb-logo span{color:var(--terra-lt);font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase}
    .nav-item{display:flex;align-items:center;gap:12px;padding:12px 24px;cursor:pointer;color:rgba(255,255,255,.6);font-size:14px;font-weight:500;transition:all .18s;border-left:3px solid transparent}
    .nav-item:hover{color:#fff;background:rgba(255,255,255,.07)}
    .nav-item.active{color:#fff;background:rgba(255,255,255,.11);border-left-color:var(--terra-lt)}
    .main{flex:1;padding:40px 48px;overflow-y:auto;max-width:calc(100vw - 240px)}
    .ph{margin-bottom:32px}.ph h2{font-size:30px;margin-bottom:5px}.ph p{color:var(--mid);font-size:14px}
    .card{background:var(--white);border-radius:var(--r);box-shadow:var(--sh);padding:26px}
    .card-sm{background:var(--white);border-radius:var(--r);box-shadow:var(--sh);padding:18px 22px}
    .mg{display:flex;gap:10px;flex-wrap:wrap}
    .mc{display:flex;flex-direction:column;align-items:center;background:var(--cream);border-radius:var(--rs);padding:10px 14px;min-width:76px}
    .mc .val{font-size:17px;font-weight:700;color:var(--sage-dk);font-family:'Playfair Display',serif}
    .mc .lbl{font-size:10px;color:var(--mid);text-transform:uppercase;letter-spacing:.08em;margin-top:2px}
    .btn{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:var(--rs);border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;transition:all .16s;white-space:nowrap}
    .btn:disabled{opacity:.45;cursor:not-allowed}
    .btn-p{background:var(--sage);color:#fff}.btn-p:hover:not(:disabled){background:var(--sage-dk)}
    .btn-t{background:var(--terra);color:#fff}.btn-t:hover:not(:disabled){background:#b36c2a}
    .btn-i{background:var(--info);color:#fff}.btn-i:hover:not(:disabled){background:#2d6493}
    .btn-u{background:var(--purple);color:#fff}.btn-u:hover:not(:disabled){background:#6344a8}
    .btn-o{background:transparent;border:1.5px solid var(--sage);color:var(--sage)}.btn-o:hover:not(:disabled){background:var(--sage);color:#fff}
    .btn-g{background:transparent;color:var(--mid);padding:8px 12px}.btn-g:hover:not(:disabled){background:var(--cream);color:var(--char)}
    .btn-d{background:var(--danger);color:#fff}.btn-d:hover:not(:disabled){opacity:.85}
    .btn-sm{padding:6px 13px;font-size:12px}.btn-xs{padding:4px 9px;font-size:11px}
    .fg{display:flex;flex-direction:column;gap:5px;margin-bottom:16px}
    .fl{font-size:12px;font-weight:600;color:var(--char)}
    .fi,.fs,.fta{padding:9px 13px;border:1.5px solid var(--cream-dk);border-radius:var(--rs);font-family:'DM Sans',sans-serif;font-size:13px;background:var(--cream);color:var(--char);outline:none;transition:border-color .16s}
    .fi:focus,.fs:focus,.fta:focus{border-color:var(--sage);background:#fff}
    .fta{resize:vertical;min-height:76px}
    .f2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .f3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
    .it{width:100%;border-collapse:collapse;font-size:12px}
    .it th{text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--mid);padding:7px;border-bottom:1px solid var(--cream-dk);white-space:nowrap}
    .it td{padding:6px 7px;border-bottom:1px solid var(--cream);vertical-align:middle}
    .it tfoot td{font-weight:700;color:var(--sage-dk);border-top:2px solid var(--cream-dk);border-bottom:none;padding-top:9px}
    .ii{padding:5px 7px;border:1.5px solid var(--cream-dk);border-radius:6px;font-family:'DM Sans',sans-serif;font-size:12px;background:var(--cream);color:var(--char);outline:none;transition:border-color .16s;width:100%}
    .ii:focus{border-color:var(--sage);background:#fff}
    .ii.auto{border-color:var(--sage-lt);background:#f0f6f0}
    .sp{background:var(--white);border:1.5px solid var(--sage-lt);border-radius:var(--rs);padding:14px;margin-bottom:8px;box-shadow:var(--sh)}
    .fl-list{display:flex;flex-direction:column;gap:5px;max-height:230px;overflow-y:auto;margin-top:8px}
    .fl-item{display:flex;align-items:center;gap:8px;background:var(--cream);border:1.5px solid transparent;border-radius:var(--rs);padding:9px 11px;cursor:pointer;transition:all .14s}
    .fl-item:hover{border-color:var(--sage);background:#fff}
    .fl-name{font-size:12px;font-weight:600;color:var(--char)}
    .fl-macros{display:flex;gap:8px;flex-shrink:0;font-size:10px;color:var(--mid)}
    .fl-macros b{display:block;font-size:12px;font-weight:700;color:var(--sage-dk)}
    .mode-tabs{display:flex;gap:4px;margin-bottom:14px;background:var(--cream);border-radius:var(--rs);padding:4px}
    .mode-tab{flex:1;padding:7px 10px;border:none;border-radius:6px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;background:transparent;color:var(--mid);transition:all .15s}
    .mode-tab.active{background:var(--white);color:var(--sage-dk);box-shadow:0 1px 4px rgba(0,0,0,.1)}
    .sc-bg{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:2000;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px}
    .sc-box{background:#000;border-radius:var(--r);overflow:hidden;width:100%;max-width:440px;position:relative}
    .sc-vid{width:100%;display:block}
    .sc-aim{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none}
    .sc-frame{width:190px;height:120px;border:3px solid rgba(255,255,255,.85);border-radius:10px;box-shadow:0 0 0 9999px rgba(0,0,0,.5);position:relative}
    .sc-line{position:absolute;left:8%;right:8%;height:2px;background:linear-gradient(90deg,transparent,var(--terra-lt),transparent);animation:scanline 1.8s linear infinite}
    @keyframes scanline{0%{top:5px}100%{top:calc(100% - 5px)}}
    .sc-x{position:absolute;top:10px;right:10px;background:rgba(0,0,0,.6);border:none;color:#fff;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;z-index:1}
    .sc-cap{color:#fff;text-align:center;padding:12px 8px;font-size:13px}
    .mb{position:fixed;inset:0;background:rgba(42,42,42,.55);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
    .mo{background:#fff;border-radius:var(--r);box-shadow:var(--sh-lg);width:100%;max-width:860px;max-height:92vh;overflow-y:auto;padding:32px}
    .mo-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
    .mo-hd h3{font-size:21px}
    .mo-x{background:var(--cream);border:none;border-radius:50%;width:34px;height:34px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;color:var(--mid)}
    .mo-x:hover{background:var(--cream-dk)}
    .rg{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px}
    .rc{background:var(--white);border-radius:var(--r);box-shadow:var(--sh);overflow:hidden;transition:transform .2s,box-shadow .2s;cursor:pointer;display:flex;flex-direction:column}
    .rc:hover{transform:translateY(-3px);box-shadow:var(--sh-lg)}
    .rc-img{width:100%;height:150px;object-fit:cover;background:var(--cream-dk)}
    .rc-img-ph{width:100%;height:150px;background:linear-gradient(135deg,var(--sage-dk),var(--sage));display:flex;align-items:center;justify-content:center;font-size:40px}
    .rc-hd{background:linear-gradient(135deg,var(--sage-dk),var(--sage));padding:14px 20px 10px}
    .rc-hd h3{color:#fff;font-size:15px;margin-bottom:2px}
    .rc-hd .port{color:rgba(255,255,255,.7);font-size:11px}
    .rc-body{padding:14px 20px;flex:1;display:flex;flex-direction:column;gap:8px}
    .rc-mac{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
    .mm{text-align:center;background:var(--cream);border-radius:6px;padding:6px 2px}
    .mm .v{font-size:12px;font-weight:700;color:var(--sage-dk)}.mm .l{font-size:9px;color:var(--mid);text-transform:uppercase}
    .cat-badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;margin:2px}
    .cat-diet{background:rgba(92,122,92,.15);color:var(--sage-dk)}
    .cat-origin{background:rgba(196,124,59,.15);color:#8a5a1a}
    .cat-diff-easy{background:rgba(92,170,92,.15);color:#2a6a2a}
    .cat-diff{background:rgba(58,122,181,.12);color:var(--info)}
    .cat-diff-hard{background:rgba(192,83,83,.12);color:var(--danger)}
    .filter-bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;align-items:center}
    .filter-chip{padding:5px 12px;border-radius:20px;border:1.5px solid var(--cream-dk);background:var(--white);font-size:12px;font-weight:500;cursor:pointer;transition:all .14s;color:var(--mid)}
    .filter-chip:hover{border-color:var(--sage);color:var(--sage-dk)}
    .filter-chip.on{background:var(--sage-dk);color:#fff;border-color:var(--sage-dk)}
    .wg{display:grid;grid-template-columns:82px repeat(7,1fr);border:1px solid var(--cream-dk);border-radius:var(--r);overflow:hidden;background:var(--cream-dk);gap:1px}
    .wh{background:var(--sage-dk);color:#fff;text-align:center;padding:10px 5px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em}
    .wml{background:var(--cream);color:var(--sage-dk);font-size:9px;font-weight:700;text-transform:uppercase;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:7px 3px;gap:3px}
    .wc{background:var(--white);padding:7px;min-height:68px}
    .mt{background:var(--sage);color:#fff;border-radius:4px;padding:3px 6px;font-size:9px;font-weight:500;display:flex;align-items:center;justify-content:space-between;gap:3px;margin-bottom:3px}
    .mt button{background:none;border:none;color:rgba(255,255,255,.8);cursor:pointer;font-size:11px;line-height:1;padding:0;flex-shrink:0}
    .ab{background:var(--cream);border:1px dashed var(--cream-dk);border-radius:4px;color:var(--mid);font-size:10px;cursor:pointer;padding:3px;width:100%;text-align:center;transition:all .14s}
    .ab:hover{background:var(--cream-dk);color:var(--sage)}
    .shop-item{display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--white);border-radius:var(--rs);margin-bottom:6px;box-shadow:0 1px 4px rgba(0,0,0,.06);cursor:pointer;transition:all .15s}
    .shop-item:hover{box-shadow:var(--sh)}
    .shop-item.checked .shop-name{text-decoration:line-through;color:var(--mid)}
    .shop-name{flex:1;font-size:13px;font-weight:500}
    .shop-qty{font-size:13px;font-weight:700;color:var(--sage-dk);white-space:nowrap}
    .shop-orig{font-size:10px;color:var(--mid);white-space:nowrap;margin-left:4px}
    .eo{background:var(--white);border:2px solid var(--cream-dk);border-radius:var(--r);padding:22px;text-align:center;transition:all .2s}
    .eo:hover{border-color:var(--sage);box-shadow:var(--sh)}
    .eo .eicon{font-size:32px;margin-bottom:8px}.eo h4{font-size:15px;margin-bottom:5px}.eo p{font-size:12px;color:var(--mid);margin-bottom:12px;line-height:1.5}
    .ds{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}
    .dsc{background:var(--white);border-radius:var(--r);box-shadow:var(--sh);padding:22px}
    .dsc .num{font-family:'Playfair Display',serif;font-size:34px;font-weight:700;color:var(--sage-dk);line-height:1;margin-bottom:5px}
    .dsc .dlbl{font-size:12px;color:var(--mid);font-weight:500}
    .badge{display:inline-block;padding:2px 9px;border-radius:20px;font-size:10px;font-weight:600}
    .bg{background:rgba(92,122,92,.15);color:var(--sage-dk)}
    .div{height:1px;background:var(--cream-dk);margin:18px 0}
    .f{display:flex}.ac{align-items:center}.jb{justify-content:space-between}
    .g8{gap:8px}.g12{gap:12px}.g16{gap:16px}
    .mb16{margin-bottom:16px}.mb20{margin-bottom:20px}.mb24{margin-bottom:24px}.mt10{margin-top:10px}
    .tm{color:var(--mid)}.ts{font-size:12px}
    .st{font-size:16px;margin-bottom:12px;color:var(--char)}
    .es{text-align:center;padding:48px 24px;color:var(--mid)}.es .ei{font-size:46px;margin-bottom:10px}
    .sp2{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:rot .7s linear infinite}
    .sp2-dk{border-color:rgba(92,122,92,.3);border-top-color:var(--sage)}
    @keyframes rot{to{transform:rotate(360deg)}}
    .toast{position:fixed;bottom:22px;right:22px;color:#fff;padding:11px 18px;border-radius:var(--rs);font-size:13px;z-index:4000;box-shadow:var(--sh-lg);display:flex;align-items:center;gap:9px;animation:slideup .22s ease}
    .toast.success{background:var(--sage-dk)}.toast.error{background:var(--danger)}.toast.info{background:var(--info)}
    @keyframes slideup{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes flashrow{0%{background:#d4f0da}100%{background:transparent}}
    .flash-row td{animation:flashrow .9s ease forwards}
    .img-upload-box{border:2px dashed var(--cream-dk);border-radius:var(--r);padding:24px;text-align:center;cursor:pointer;transition:all .18s;position:relative;background:var(--cream)}
    .img-upload-box:hover{border-color:var(--sage);background:#f0f6f0}
    .img-upload-box.has-img{border-style:solid;border-color:var(--sage-lt);padding:0;overflow:hidden}
    .img-upload-box img{width:100%;height:200px;object-fit:cover;display:block}
    .img-upload-box .overlay{position:absolute;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .18s}
    .img-upload-box:hover .overlay{opacity:1}
    .profile-logo-box{border:2px dashed var(--cream-dk);border-radius:var(--rs);padding:16px;text-align:center;cursor:pointer;transition:all .18s;background:var(--cream);min-height:90px;display:flex;align-items:center;justify-content:center}
    .profile-logo-box:hover{border-color:var(--sage)}
    .profile-logo-box img{max-height:80px;max-width:180px;object-fit:contain}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--cream-dk);border-radius:8px}
    /* ── INLINE AUTOCOMPLETE ── */
    .ac-wrap{position:relative;flex:1}
    .ac-drop{position:absolute;top:calc(100% + 3px);left:0;right:0;background:#fff;border:1.5px solid var(--sage-lt);border-radius:var(--rs);box-shadow:var(--sh-lg);z-index:300;max-height:200px;overflow-y:auto}
    .ac-item{display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;transition:background .1s;font-size:12px}
    .ac-item:hover,.ac-item.active{background:var(--cream)}
    .ac-name{flex:1;font-weight:500;color:var(--char)}
    .ac-macros{font-size:10px;color:var(--mid);white-space:nowrap;display:flex;gap:6px}
    .ac-macros b{color:var(--sage-dk)}
    /* ── PASTE PREVIEW ── */
    .paste-preview{margin-top:10px;border:1.5px solid var(--cream-dk);border-radius:var(--rs);overflow:hidden}
    .paste-prev-row{display:flex;align-items:center;gap:8px;padding:6px 10px;border-bottom:1px solid var(--cream);font-size:11px}
    .paste-prev-row:last-child{border-bottom:none}
    .paste-prev-row.matched{background:rgba(92,122,92,.04)}
    .paste-prev-row.unmatched{background:rgba(196,124,59,.04)}
    .paste-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
    .paste-dot.ok{background:var(--sage)}
    .paste-dot.warn{background:var(--terra)}
    .paste-ing-name{flex:1;font-weight:500;color:var(--char)}
    .paste-ing-qty{color:var(--mid);white-space:nowrap}
    .paste-ing-db{font-size:10px;color:var(--sage-dk);font-style:italic;margin-left:auto}
  `}</style>
);

/* ─── FOOD DB (80+ items) ─────────────────────────────────────────────────── */
const FOOD_DB=[{n:"Pechuga de pollo (cruda)",k:110,p:23,c:0,f:1.2},{n:"Pechuga de pollo (plancha)",k:165,p:31,c:0,f:3.6},{n:"Muslo de pollo",k:177,p:18,c:0,f:11},{n:"Pavo pechuga",k:104,p:22,c:0,f:1.7},{n:"Carne picada vacuno 5%",k:137,p:21,c:0,f:5},{n:"Carne picada vacuno 20%",k:254,p:17,c:0,f:20},{n:"Lomo de cerdo",k:143,p:22,c:0,f:5.5},{n:"Jamon serrano",k:195,p:30,c:0.5,f:8},{n:"Jamon York",k:107,p:17,c:2,f:3.5},{n:"Salmon",k:208,p:20,c:0,f:13},{n:"Atun fresco",k:144,p:23,c:0,f:5},{n:"Atun lata natural",k:116,p:26,c:0,f:1},{n:"Merluza",k:82,p:18,c:0,f:1},{n:"Sardinas lata",k:208,p:25,c:0,f:11},{n:"Gambas",k:99,p:21,c:0,f:1.4},{n:"Bacalao",k:82,p:18,c:0,f:0.7},{n:"Huevo entero",k:155,p:13,c:1.1,f:11},{n:"Clara de huevo",k:52,p:11,c:0.7,f:0.2},{n:"Leche entera",k:61,p:3.2,c:4.8,f:3.3},{n:"Leche semidesnatada",k:46,p:3.3,c:5,f:1.5},{n:"Yogur griego natural",k:97,p:5.7,c:3.8,f:6.7},{n:"Queso fresco cottage",k:98,p:11,c:3.4,f:4.3},{n:"Queso mozzarella",k:280,p:22,c:2.2,f:20},{n:"Avena copos",k:379,p:13,c:67,f:6.9},{n:"Arroz blanco cocido",k:130,p:2.7,c:28,f:0.3},{n:"Arroz integral cocido",k:111,p:2.6,c:23,f:0.9},{n:"Pasta cocida",k:131,p:5,c:25,f:1.1},{n:"Pasta integral cocida",k:124,p:5.3,c:23,f:1.1},{n:"Pan blanco",k:265,p:9,c:49,f:3.2},{n:"Pan integral",k:247,p:13,c:41,f:3.4},{n:"Quinoa cocida",k:120,p:4.4,c:21,f:1.9},{n:"Patata cocida",k:86,p:1.7,c:20,f:0.1},{n:"Boniato horneado",k:90,p:2,c:21,f:0.1},{n:"Brocoli",k:34,p:2.8,c:7,f:0.4},{n:"Espinacas",k:23,p:2.9,c:3.6,f:0.4},{n:"Tomate",k:18,p:0.9,c:3.9,f:0.2},{n:"Lechuga",k:15,p:1.4,c:2.9,f:0.2},{n:"Pepino",k:16,p:0.7,c:3.6,f:0.1},{n:"Pimiento rojo",k:31,p:1,c:7.6,f:0.3},{n:"Pimiento verde",k:20,p:0.9,c:4.6,f:0.2},{n:"Zanahoria",k:41,p:0.9,c:9.6,f:0.2},{n:"Cebolla",k:40,p:1.1,c:9.3,f:0.1},{n:"Calabacin",k:17,p:1.2,c:3.1,f:0.3},{n:"Berenjena",k:25,p:1,c:5.9,f:0.2},{n:"Champinones",k:22,p:3.1,c:3.3,f:0.3},{n:"Judias verdes",k:31,p:1.8,c:7,f:0.1},{n:"Coliflor",k:25,p:1.9,c:5,f:0.3},{n:"Ajo",k:149,p:6.4,c:33,f:0.5},{n:"Platano",k:89,p:1.1,c:23,f:0.3},{n:"Manzana",k:52,p:0.3,c:14,f:0.2},{n:"Naranja",k:47,p:0.9,c:12,f:0.1},{n:"Fresa",k:32,p:0.7,c:7.7,f:0.3},{n:"Arandanos",k:57,p:0.7,c:14,f:0.3},{n:"Garbanzos cocidos",k:164,p:8.9,c:27,f:2.6},{n:"Lentejas cocidas",k:116,p:9,c:20,f:0.4},{n:"Edamame",k:121,p:11,c:8.9,f:5.2},{n:"Aguacate",k:160,p:2,c:9,f:15},{n:"Aceite oliva virgen",k:884,p:0,c:0,f:100},{n:"Almendras",k:579,p:21,c:22,f:50},{n:"Nueces",k:654,p:15,c:14,f:65},{n:"Proteina whey",k:400,p:80,c:10,f:5},{n:"Tofu",k:76,p:8,c:1.9,f:4.8},{n:"Tomate triturado",k:32,p:1.6,c:5.8,f:0.4},{n:"Tomate cherry",k:18,p:0.9,c:3.9,f:0.2},{n:"Aceite de oliva",k:884,p:0,c:0,f:100}];
const searchLocal=q=>{if(!q||q.length<2)return[];const w=q.toLowerCase().split(/\s+/).filter(Boolean);return FOOD_DB.map(f=>{const nm=f.n.toLowerCase();let s=0;w.forEach(x=>{if(nm.startsWith(x))s+=3;else if(nm.includes(' '+x))s+=2;else if(nm.includes(x))s+=1;});return{food:f,score:s};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,8).map(x=>({name:x.food.n,kcal100:x.food.k,prot100:x.food.p,carbs100:x.food.c,fat100:x.food.f}));};

/* ─── CATEGORIES ──────────────────────────────────────────────────────────── */
const DIETS=["Omnivora","Vegetariana","Vegana","Keto","Mediterranea","Sin gluten","Alta proteina"];
const ORIGINS=["Espanola","Italiana","Asiatica","Americana","Mediterranea","Mexicana","Internacional"];
const DIFFS=["Facil","Media","Dificil"];
const DIFF_CLS={"Facil":"cat-diff-easy","Media":"cat-diff","Dificil":"cat-diff-hard"};
const CatBadge=({cat,type})=>{if(!cat)return null;const cls=type==="diet"?"cat-diet":type==="origin"?"cat-origin":(DIFF_CLS[cat]||"cat-diff");return<span className={`cat-badge ${cls}`}>{cat}</span>;};

/* ─── CONSTANTS ───────────────────────────────────────────────────────────── */
const DAYS=["Lunes","Martes","Miercoles","Jueves","Viernes","Sabado","Domingo"];
const MEALS=["Desayuno","Comida","Cena","Snack"];
const MICON={Desayuno:"☀️",Comida:"🍽️",Cena:"🌙",Snack:"🍎"};
const DEFAULT_PROFILE={name:"",clinic:"",tagline:"",email:"",phone:"",web:"",logo:""};


/* ═══════════════════════════════════════════════════════════════════════════
   PATIENTS MODULE — Harris-Benedict · Interview Builder · History · Plans
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── HARRIS-BENEDICT ───────────────────────────────────────────────────── */
const ACTIVITY_LEVELS = [
  { id:"sedentary",  label:"Sedentario",         desc:"Sin ejercicio / trabajo de oficina", factor:1.2 },
  { id:"light",      label:"Ligero",              desc:"Ejercicio 1-3 días/semana",          factor:1.375 },
  { id:"moderate",   label:"Moderado",            desc:"Ejercicio 3-5 días/semana",          factor:1.55 },
  { id:"active",     label:"Activo",              desc:"Ejercicio intenso 6-7 días/semana",  factor:1.725 },
  { id:"very_active",label:"Muy activo",          desc:"Trabajo físico + deporte diario",    factor:1.9 },
];

const GOALS = [
  { id:"lose_fast",  label:"Perder peso (rápido)", adj:-750, color:"#c05353" },
  { id:"lose",       label:"Perder peso",           adj:-500, color:"#e07a3a" },
  { id:"maintain",   label:"Mantener peso",         adj:0,    color:"#5c7a5c" },
  { id:"gain",       label:"Ganar músculo",         adj:300,  color:"#3a7ab5" },
  { id:"gain_fast",  label:"Ganar peso",            adj:500,  color:"#7c5cbf" },
];

const calcHarrisBenedict = (sex, weight, height, age) => {
  if (!weight || !height || !age) return 0;
  const w=Number(weight), h=Number(height), a=Number(age);
  if (sex === "M") return Math.round(66.5 + 13.75*w + 5.003*h - 6.755*a);
  return Math.round(655.1 + 9.563*w + 1.850*h - 4.676*a);
};

const calcTDEE = (bmr, activityId) => {
  const act = ACTIVITY_LEVELS.find(a => a.id === activityId);
  return act ? Math.round(bmr * act.factor) : bmr;
};

const calcTarget = (tdee, goalId) => {
  const goal = GOALS.find(g => g.id === goalId);
  return goal ? tdee + goal.adj : tdee;
};

/* ─── UTILITY FUNCTIONS ─────────────────────────────────────────────────── */

/** Calcula la edad exacta a partir de la fecha de nacimiento (ISO string o YYYY-MM-DD) */
const calcEdad = (birthdate) => {
  if (!birthdate) return null;
  const hoy = new Date();
  const nac = new Date(birthdate);
  if (isNaN(nac.getTime())) return null;
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad >= 0 ? edad : null;
};

/**
 * Parsea un texto libre de entrevista en un array de preguntas.
 * Detecta saltos de línea, signos "?" y puntos como separadores.
 */
const parseInterview = (text) => {
  if (!text || !text.trim()) return [];
  // 1. Split por salto de línea
  const rawLines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const questions = [];
  rawLines.forEach(line => {
    // 2. Dentro de cada línea, split por "?" o "." seguidos de espacio/fin
    const parts = line.split(/(?<=[?.])\s+|(?<=[?])/);
    parts.forEach(part => {
      // Limpia numeración tipo "1.", "a)", "-", "•"
      const q = part.replace(/^[\s\d]+[.)]\s*|^[-•*]\s*/, '').trim();
      if (q.length > 4) questions.push(q);
    });
  });
  return questions;
};

/** Genera un avatar SVG inline (data URL) según género */
const getDefaultAvatar = (genero) => {
  const isMale = genero === 'M';
  const bg = isMale ? '#3a7ab5' : '#7c5cbf';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
    <circle cx="40" cy="40" r="40" fill="${bg}"/>
    <circle cx="40" cy="30" r="14" fill="rgba(255,255,255,0.9)"/>
    <ellipse cx="40" cy="70" rx="22" ry="18" fill="rgba(255,255,255,0.9)"/>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
};

/** Formatea fecha ISO/YYYY-MM-DD a DD/MM/AAAA */
const fmtFecha = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric' });
};

/* ─── DEFAULT INTERVIEW QUESTIONS ──────────────────────────────────────── */
const DEFAULT_QUESTIONS = [
  { id:"q1", text:"¿Tiene alguna alergia o intolerancia alimentaria?", type:"textarea" },
  { id:"q2", text:"¿Padece alguna enfermedad o condición médica relevante?", type:"textarea" },
  { id:"q3", text:"¿Toma alguna medicación actualmente?", type:"text" },
  { id:"q4", text:"¿Cuántas comidas realiza al día habitualmente?", type:"select",
    options:["1-2","3","4","5 o más"] },
  { id:"q5", text:"¿Con qué frecuencia come fuera de casa?", type:"select",
    options:["Nunca","1-2 veces/semana","3-4 veces/semana","A diario"] },
  { id:"q6", text:"¿Bebe suficiente agua (1.5-2L diarios)?", type:"select",
    options:["Sí, siempre","A veces","Raramente","No"] },
  { id:"q7", text:"¿Cuál es su motivación principal para el cambio?", type:"textarea" },
  { id:"q8", text:"¿Ha seguido alguna dieta anteriormente? ¿Con qué resultado?", type:"textarea" },
];

/* ─── DEFAULT SUBSCRIPTIONS ─────────────────────────────────────────────── */
const DEFAULT_SUBS = [
  { id:"sub_basico",  nombre:"Básico",   precio:29,  color:"#4caf88", descripcion:"Seguimiento mensual, plan semanal + lista de compra.", icono:"🌱" },
  { id:"sub_pro",     nombre:"Pro",      precio:59,  color:"#3a7ab5", descripcion:"Seguimiento quincenal, composición corporal y ajuste de macros.", icono:"⭐" },
  { id:"sub_premium", nombre:"Premium",  precio:99,  color:"#9b7cb6", descripcion:"Seguimiento semanal ilimitado, recetas personalizadas y soporte prioritario.", icono:"👑" },
];

/* ─── SUBSCRIPTIONS VIEW ─────────────────────────────────────────────────── */
function SubscriptionsView({ subscriptions, onAdd, onUpdate, onDelete, showToast }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editSub, setEditSub] = useState(null);

  const blank = { id:null, nombre:"", precio:"", color:"#5c7a5c", descripcion:"", icono:"📋", logo:"" };
  const [form, setForm] = useState(blank);
  const sf = (k,v) => setForm(f=>({...f,[k]:v}));
  const logoRef = useRef();

  const openNew = () => { setForm(blank); setEditSub(null); setFormOpen(true); };
  const openEdit = s => { setForm({...s}); setEditSub(s); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditSub(null); };

  const save = () => {
    if (!form.nombre.trim() || !form.precio) return showToast("Nombre y precio requeridos", "error");
    const sub = { ...form, id: form.id || ("sub_"+Date.now()), precio: Number(form.precio) };
    editSub ? onUpdate(sub) : onAdd(sub);
    showToast(editSub ? "Suscripción actualizada ✓" : "Suscripción creada ✓");
    closeForm();
  };

  const nPatients = () => 0; // placeholder — wired from App

  const EMOJI_OPTIONS = ["🌱","⭐","👑","💎","🔥","🚀","🏆","🎯","⚡","🌟","💪","🍃"];

  return (
    <div>
      <div className="ph f ac jb">
        <div><h2>Suscripciones</h2><p>{subscriptions.length} planes activos</p></div>
        <button className="btn btn-i" onClick={openNew}>+ Nueva suscripción</button>
      </div>

      {subscriptions.length === 0
        ? <div className="es"><div className="ei">💳</div><p>Sin planes de suscripción. Crea el primero.</p></div>
        : <div className="sub-grid">
            {subscriptions.map(s => (
              <div className="sub-card" key={s.id}>
                <div className="sub-head">
                  <div className="sub-logo" style={{background: s.color+"22", border:`2px solid ${s.color}44`}}>
                    {s.logo
                      ? <img src={s.logo} alt=""/>
                      : <span>{s.icono||"📋"}</span>}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:16,color:"var(--char)"}}>{s.nombre}</div>
                    <div style={{fontSize:10,color:"var(--mid)",textTransform:"uppercase",letterSpacing:".06em"}}>Plan activo</div>
                  </div>
                  <div style={{marginLeft:"auto",textAlign:"right"}}>
                    <div className="sub-price" style={{color:s.color}}>{s.precio}€</div>
                    <div className="sub-period">/mes</div>
                  </div>
                </div>
                <div className="sub-body">
                  {s.descripcion && <div className="sub-desc">{s.descripcion}</div>}
                  <div style={{marginTop:8,display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                    <span style={{fontSize:11,color:"var(--mid)"}}>Color identificativo del plan</span>
                  </div>
                </div>
                <div className="sub-actions">
                  <button className="btn btn-o btn-xs" style={{borderColor:s.color,color:s.color}} onClick={()=>openEdit(s)}>✏️ Editar</button>
                  <button className="btn btn-xs" style={{background:"var(--danger)",color:"#fff",border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer"}}
                    onClick={()=>{ if(window.confirm(`¿Eliminar plan "${s.nombre}"?`)) { onDelete(s.id); showToast("Plan eliminado"); } }}>🗑</button>
                </div>
              </div>
            ))}
          </div>}

      {/* ── Form modal ── */}
      {formOpen && (
        <div className="mb" onClick={e=>e.target===e.currentTarget&&closeForm()}>
          <div className="mo" style={{maxWidth:500}}>
            <div className="mo-hd">
              <h3>{editSub?"✏️ Editar suscripción":"💳 Nueva suscripción"}</h3>
              <button className="mo-x" onClick={closeForm}>✕</button>
            </div>

            <div className="f2">
              <div className="fg"><label className="fl">Nombre del plan *</label>
                <input className="fi" value={form.nombre} onChange={e=>sf("nombre",e.target.value)} placeholder="Premium"/>
              </div>
              <div className="fg"><label className="fl">Precio mensual (€) *</label>
                <input className="fi" type="number" min="0" step="0.01" value={form.precio} onChange={e=>sf("precio",e.target.value)} placeholder="99"/>
              </div>
            </div>

            <div className="fg"><label className="fl">Descripción</label>
              <textarea className="fta" style={{minHeight:70}} value={form.descripcion} onChange={e=>sf("descripcion",e.target.value)} placeholder="Seguimiento semanal, recetas personalizadas..."/>
            </div>

            <div className="f2">
              <div className="fg">
                <label className="fl">Emoji / icono</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>
                  {EMOJI_OPTIONS.map(em=>(
                    <button key={em} onClick={()=>sf("icono",em)}
                      style={{width:34,height:34,border:`2px solid ${form.icono===em?"var(--sage-dk)":"var(--cream-dk)"}`,borderRadius:8,background:form.icono===em?"var(--cream)":"#fff",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <div className="fg">
                <label className="fl">Color del plan</label>
                <div style={{display:"flex",gap:8,alignItems:"center",marginTop:4}}>
                  <input type="color" value={form.color} onChange={e=>sf("color",e.target.value)}
                    style={{width:44,height:44,border:"none",background:"none",cursor:"pointer",padding:0,borderRadius:8}}/>
                  <span style={{fontSize:12,color:"var(--mid)"}}>Se usa en tarjetas y badges</span>
                </div>
              </div>
            </div>

            {/* Logo upload */}
            <div className="fg">
              <label className="fl">Logo del plan (opcional)</label>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                {form.logo
                  ? <img src={form.logo} style={{width:52,height:52,borderRadius:10,objectFit:"contain",border:"1px solid var(--cream-dk)"}}/>
                  : <div style={{width:52,height:52,borderRadius:10,background:form.color+"22",border:`2px dashed ${form.color}66`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{form.icono||"📋"}</div>}
                <div>
                  <button className="btn btn-o btn-sm" onClick={()=>logoRef.current.click()}>📷 Subir logo</button>
                  {form.logo && <button className="btn btn-g btn-xs" style={{marginLeft:6}} onClick={()=>sf("logo","")}>✕</button>}
                </div>
                <input ref={logoRef} type="file" accept="image/*" style={{display:"none"}}
                  onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>sf("logo",ev.target.result);r.readAsDataURL(f);}}/>
              </div>
            </div>

            {/* Preview */}
            <div style={{background:"var(--cream)",borderRadius:10,padding:14,marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:42,height:42,borderRadius:9,background:form.color+"22",border:`2px solid ${form.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,overflow:"hidden"}}>
                {form.logo?<img src={form.logo} style={{width:"100%",height:"100%",objectFit:"contain"}}/>:form.icono||"📋"}
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:form.color||"var(--char)"}}>{form.nombre||"Nombre del plan"}</div>
                <div style={{fontSize:13,color:"var(--mid)"}}>{form.precio?form.precio+"€/mes":"Precio"}</div>
              </div>
            </div>

            <div className="f g8" style={{justifyContent:"flex-end"}}>
              <button className="btn btn-g" onClick={closeForm}>Cancelar</button>
              <button className="btn btn-i" disabled={!form.nombre.trim()||!form.precio} onClick={save}>
                💾 {editSub?"Guardar cambios":"Crear plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── PATIENT STYLES ─────────────────────────────────────────────────────── */
const PatientStyles = () => (
  <style>{`
    .pt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px}
    .pt-card{background:#fff;border-radius:var(--r);box-shadow:var(--sh);overflow:hidden;cursor:pointer;transition:transform .2s,box-shadow .2s}
    .pt-card:hover{transform:translateY(-3px);box-shadow:var(--sh-lg)}
    .pt-head{background:linear-gradient(135deg,#2a4a7a,#3a7ab5);padding:18px 20px}
    .pt-head h3{color:#fff;font-size:16px;margin-bottom:2px}
    .pt-head .pt-sub{color:rgba(255,255,255,.7);font-size:11px}
    .pt-body{padding:16px 20px}
    .pt-stat{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--mid);margin-bottom:6px}
    .pt-stat b{color:var(--char)}
    .kcal-big{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;line-height:1}
    .kcal-label{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--mid);margin-top:2px}
    .hist-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--cream-dk)}
    .hist-row:last-child{border-bottom:none}
    .hist-date{font-size:11px;color:var(--mid);min-width:80px}
    .hist-val{font-size:13px;font-weight:600;color:var(--sage-dk)}
    .hist-delta{font-size:11px;padding:2px 7px;border-radius:12px;font-weight:600}
    .delta-down{background:rgba(92,122,92,.15);color:var(--sage-dk)}
    .delta-up{background:rgba(192,83,83,.12);color:var(--danger)}
    .delta-same{background:rgba(107,107,107,.12);color:var(--mid)}
    .q-builder-row{display:flex;align-items:flex-start;gap:8px;padding:10px 12px;background:var(--cream);border-radius:var(--rs);margin-bottom:8px}
    .q-builder-drag{color:var(--mid);cursor:grab;font-size:16px;padding-top:2px;flex-shrink:0}
    .plan-tpl-card{background:#fff;border:2px solid var(--cream-dk);border-radius:var(--r);padding:18px;cursor:pointer;transition:all .2s}
    .plan-tpl-card:hover{border-color:var(--info);box-shadow:var(--sh)}
    .plan-tpl-card.selected{border-color:var(--info);background:rgba(58,122,181,.05)}
    .tab-bar{display:flex;gap:0;border-bottom:2px solid var(--cream-dk);margin-bottom:24px}
    .tab-btn{padding:10px 20px;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:var(--mid);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .18s}
    .tab-btn:hover{color:var(--char)}
    .tab-btn.active{color:var(--info);border-bottom-color:var(--info)}
    .prog-chart{display:flex;align-items:flex-end;gap:6px;height:80px;padding-top:8px}
    .prog-bar{flex:1;border-radius:4px 4px 0 0;min-width:18px;position:relative;transition:height .3s}
    .prog-bar-label{position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);font-size:9px;color:var(--mid);white-space:nowrap}
    .prog-bar-val{position:absolute;top:-18px;left:50%;transform:translateX(-50%);font-size:9px;font-weight:700;color:var(--char);white-space:nowrap}
    .assign-btn{display:flex;align-items:center;gap:8px;padding:10px 14px;border:1.5px solid var(--cream-dk);border-radius:var(--rs);background:#fff;cursor:pointer;transition:all .16s;font-size:12px;font-weight:500;width:100%;text-align:left}
    .assign-btn:hover{border-color:var(--info);background:rgba(58,122,181,.04)}
    .assign-btn.active{border-color:var(--info);background:rgba(58,122,181,.08);font-weight:700;color:var(--info)}
    /* ── NEW v4.1 ── */
    .badge-revisado{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.04em}
    .badge-revisado.ok{background:rgba(92,122,92,.15);color:var(--sage-dk)}
    .badge-revisado.pending{background:rgba(196,124,59,.15);color:#8a5a1a}
    .linechart-svg{overflow:visible}
    .lc-line{fill:none;stroke:var(--info);stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round}
    .lc-area{fill:url(#lc-grad);opacity:.18}
    .lc-dot{fill:#fff;stroke:var(--info);stroke-width:2}
    .lc-label{font-size:9px;fill:var(--mid);text-anchor:middle}
    .lc-val{font-size:9px;fill:var(--char);font-weight:700;text-anchor:middle}
    .collapsible-hd{display:flex;align-items:center;justify-content:space-between;cursor:pointer;padding:10px 14px;background:var(--cream);border-radius:var(--rs);margin-bottom:4px;transition:background .14s}
    .collapsible-hd:hover{background:var(--cream-dk)}
    .collapsible-hd h4{font-size:13px;color:var(--char);margin:0}
    .collapsible-body{padding:0 2px;overflow:hidden}
    .antro-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}
    .antro-card{background:var(--cream);border-radius:var(--rs);padding:10px 12px;text-align:center}
    .antro-card .av{font-size:16px;font-weight:700;color:var(--sage-dk);font-family:'Playfair Display',serif}
    .antro-card .al{font-size:10px;color:var(--mid);text-transform:uppercase;letter-spacing:.07em;margin-top:2px}
    .date-chip{display:inline-block;background:rgba(58,122,181,.1);color:var(--info);border-radius:20px;padding:2px 9px;font-size:10px;font-weight:600}
    /* ── SUBSCRIPTIONS ── */
    .sub-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px}
    .sub-card{background:#fff;border-radius:var(--r);box-shadow:var(--sh);overflow:hidden;transition:transform .2s,box-shadow .2s}
    .sub-card:hover{transform:translateY(-2px);box-shadow:var(--sh-lg)}
    .sub-head{padding:18px 20px 14px;display:flex;align-items:center;gap:12px}
    .sub-logo{width:46px;height:46px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;overflow:hidden}
    .sub-logo img{width:100%;height:100%;object-fit:contain}
    .sub-body{padding:0 20px 16px;flex:1}
    .sub-price{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;line-height:1}
    .sub-period{font-size:11px;color:var(--mid)}
    .sub-desc{font-size:12px;color:var(--mid);margin-top:6px;line-height:1.5}
    .sub-actions{display:flex;gap:6px;padding:0 20px 16px}
    /* ── PATIENT PLAN EDITOR ── */
    .pt-planner{border:1.5px solid var(--cream-dk);border-radius:var(--r);overflow:hidden}
    .pt-planner-hd{background:linear-gradient(90deg,var(--sage-dk),var(--sage));padding:12px 16px;display:flex;align-items:center;justify-content:space-between}
    .pt-planner-hd h4{color:#fff;font-size:14px;margin:0}
    .pt-planner-body{padding:16px;overflow-x:auto}
    .pt-plan-actions{display:flex;gap:8px;flex-wrap:wrap;padding:12px 16px;background:var(--cream);border-top:1px solid var(--cream-dk)}
    /* ── EMAIL FAB ── */
    .email-fab{position:fixed;bottom:28px;left:28px;z-index:900;display:flex;flex-direction:column;align-items:flex-start;gap:8px}
    .email-fab-main{width:48px;height:48px;border-radius:50%;background:var(--sage-dk);color:#fff;border:none;cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center;box-shadow:var(--sh-lg);transition:transform .18s,background .18s}
    .email-fab-main:hover{background:var(--sage);transform:scale(1.08)}
    .email-fab-item{display:flex;align-items:center;gap:9px;background:#fff;border-radius:24px;padding:7px 14px 7px 8px;box-shadow:var(--sh);font-size:12px;font-weight:600;color:var(--char);cursor:pointer;border:1.5px solid var(--cream-dk);transition:all .15s;white-space:nowrap;text-decoration:none}
    .email-fab-item:hover{box-shadow:var(--sh-lg);transform:translateX(3px)}
    .email-fab-icon{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px}
  `}</style>
);

/* ─── INTERVIEW BUILDER ─────────────────────────────────────────────────── */
function InterviewBuilder({ questions, onSave, onClose }) {
  const [qs, setQs] = useState(questions.map(q=>({...q})));
  const [newText, setNewText] = useState("");
  const [newType, setNewType] = useState("textarea");
  const [newOpts, setNewOpts] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [showPaste, setShowPaste] = useState(false);

  const addQ = () => {
    if (!newText.trim()) return;
    const opts = newType==="select" ? newOpts.split('\n').map(s=>s.trim()).filter(Boolean) : [];
    setQs(prev => [...prev, { id:"q"+Date.now(), text:newText.trim(), type:newType, options:opts }]);
    setNewText(""); setNewOpts("");
  };
  const removeQ = id => setQs(prev => prev.filter(q=>q.id!==id));
  const moveQ = (i, dir) => {
    const arr=[...qs]; const j=i+dir;
    if(j<0||j>=arr.length) return;
    [arr[i],arr[j]]=[arr[j],arr[i]]; setQs(arr);
  };

  const importFromPaste = () => {
    const parsed = parseInterview(pasteText);
    if (!parsed.length) return;
    const newQs = parsed.map(text => ({
      id: "q" + Date.now() + Math.random(),
      text,
      type: "textarea",
      options: [],
      fecha_realizacion: new Date().toISOString(),
    }));
    setQs(prev => [...prev, ...newQs]);
    setPasteText("");
    setShowPaste(false);
  };

  return (
    <div className="mb" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo">
        <div className="mo-hd"><h3>📝 Cuestionario de entrevista</h3><button className="mo-x" onClick={onClose}>✕</button></div>
        <p style={{fontSize:12,color:"var(--mid)",marginBottom:20,lineHeight:1.6}}>
          Personaliza las preguntas que aparecerán al registrar un nuevo paciente.
        </p>

        <div style={{marginBottom:14,display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button className="btn btn-g btn-sm" onClick={()=>setShowPaste(v=>!v)}>
            {showPaste?"✕ Cancelar importación":"📋 Importar desde texto"}
          </button>
        </div>
        {showPaste && (
          <div style={{background:"rgba(58,122,181,.06)",border:"1.5px solid var(--info)",borderRadius:"var(--rs)",padding:16,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:"var(--info)",marginBottom:8}}>📋 Pegar texto de entrevista</div>
            <p style={{fontSize:11,color:"var(--mid)",marginBottom:10,lineHeight:1.6}}>
              Pega el texto con las preguntas. Se detectarán automáticamente separadas por saltos de línea, signos <b>?</b> o puntos <b>.</b>.
            </p>
            <textarea className="fta" style={{minHeight:100}} value={pasteText}
              onChange={e=>setPasteText(e.target.value)}
              placeholder={"¿Tienes alguna alergia?\n¿Cuántas comidas haces al día?\n¿Practicas ejercicio? ¿Cuántas veces por semana."}/>
            {pasteText.trim() && (
              <div style={{fontSize:11,color:"var(--sage-dk)",margin:"6px 0"}}>
                ✓ Se detectan <b>{parseInterview(pasteText).length}</b> pregunta(s)
              </div>
            )}
            <button className="btn btn-i btn-sm" style={{marginTop:6}} disabled={!pasteText.trim()} onClick={importFromPaste}>
              ➕ Añadir preguntas detectadas
            </button>
          </div>
        )}
        <div style={{marginBottom:20}}>
          {qs.map((q,i) => (
            <div key={q.id} className="q-builder-row">
              <span className="q-builder-drag">⠿</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500,marginBottom:2}}>{q.text}</div>
                <div style={{fontSize:11,color:"var(--mid)"}}>{q.type==="select"?`Opciones: ${(q.options||[]).join(", ")}`:q.type}</div>
              </div>
              <div style={{display:"flex",gap:4,flexShrink:0}}>
                <button className="btn btn-g btn-xs" onClick={()=>moveQ(i,-1)} disabled={i===0}>↑</button>
                <button className="btn btn-g btn-xs" onClick={()=>moveQ(i,1)} disabled={i===qs.length-1}>↓</button>
                <button className="btn btn-xs" style={{background:"var(--danger)",color:"#fff",border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer"}} onClick={()=>removeQ(q.id)}>✕</button>
              </div>
            </div>
          ))}
          {qs.length===0 && <div className="es" style={{padding:"24px"}}><p>Sin preguntas aún</p></div>}
        </div>

        <div style={{background:"var(--cream)",borderRadius:"var(--rs)",padding:16,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,marginBottom:10,color:"var(--char)"}}>➕ Nueva pregunta</div>
          <div className="fg"><label className="fl">Texto de la pregunta</label>
            <input className="fi" value={newText} onChange={e=>setNewText(e.target.value)} placeholder="¿Cuál es tu...?"/>
          </div>
          <div className="f2">
            <div className="fg"><label className="fl">Tipo de respuesta</label>
              <select className="fs" value={newType} onChange={e=>setNewType(e.target.value)}>
                <option value="text">Texto corto</option>
                <option value="textarea">Texto largo</option>
                <option value="select">Opciones múltiples</option>
                <option value="number">Número</option>
              </select>
            </div>
          </div>
          {newType==="select" && (
            <div className="fg"><label className="fl">Opciones (una por línea)</label>
              <textarea className="fta" style={{minHeight:80}} value={newOpts} onChange={e=>setNewOpts(e.target.value)} placeholder={"Opción A\nOpción B\nOpción C"}/>
            </div>
          )}
          <button className="btn btn-p btn-sm" onClick={addQ} disabled={!newText.trim()}>+ Añadir pregunta</button>
        </div>

        <div className="f g8" style={{justifyContent:"flex-end"}}>
          <button className="btn btn-g" onClick={onClose}>Cancelar</button>
          <button className="btn btn-i" onClick={()=>{onSave(qs);onClose();}}>💾 Guardar cuestionario</button>
        </div>
      </div>
    </div>
  );
}

/* ─── PATIENT FORM ──────────────────────────────────────────────────────── */
function PatientForm({ patient, questions, subscriptions, onSave, onClose }) {
  const blank = {
    id:null, name:"", email:"", phone:"", sex:"F", genero:"F",
    birthdate:"", weight:"", height:"", age:"",
    activityLevel:"moderate", goal:"maintain",
    notes:"", photo:"", contrato:"",
    revisado: false,
    answers:{}, history:[],
    mediciones_corporales:[],   // [{fecha,masa_magra,grasa_visceral,porcentaje_grasa,porcentaje_agua}]
    interview_records:[],       // [{id,fecha_realizacion,answers}]
  };
  const [form, setForm] = useState(() => patient ? {
    ...blank, ...patient,
    genero: patient.genero || patient.sex || 'F',
  } : blank);
  const sf = (k,v) => setForm(f=>({...f,[k]:v}));
  const setAnswer = (qid,v) => setForm(f=>({...f,answers:{...f.answers,[qid]:v}}));
  const photoRef = useRef();

  const bmr = calcHarrisBenedict(form.sex, form.weight, form.height, form.age);
  const tdee = calcTDEE(bmr, form.activityLevel);
  const target = calcTarget(tdee, form.goal);
  const goalObj = GOALS.find(g=>g.id===form.goal);

  const save = () => {
    if (!form.name.trim()) return;
    const edadCalc = calcEdad(form.birthdate);
    const photoFinal = form.photo || getDefaultAvatar(form.genero || form.sex);
    onSave({
      ...form,
      id: form.id || Date.now(),
      age: edadCalc !== null ? edadCalc : Number(form.age) || '',
      photo: photoFinal,
      bmr, tdee, targetKcal: target,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="mb" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo">
        <div className="mo-hd"><h3>{patient?"✏️ Editar paciente":"👤 Nuevo paciente"}</h3><button className="mo-x" onClick={onClose}>✕</button></div>

        {/* DATOS BÁSICOS */}
        <h4 style={{fontSize:13,color:"var(--mid)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:14}}>Datos personales</h4>
        <div className="f2 mb20">
          <div>
            <div className="fg"><label className="fl">Nombre completo *</label>
              <input className="fi" value={form.name} onChange={e=>sf("name",e.target.value)} placeholder="Ana García López"/>
            </div>
            <div className="f2">
              <div className="fg"><label className="fl">Email</label><input className="fi" type="email" value={form.email} onChange={e=>sf("email",e.target.value)} placeholder="ana@email.com"/></div>
              <div className="fg"><label className="fl">Teléfono</label><input className="fi" value={form.phone} onChange={e=>sf("phone",e.target.value)} placeholder="+34 600..."/></div>
            </div>
            <div className="f2">
              <div className="fg"><label className="fl">Sexo biológico</label>
                <select className="fs" value={form.sex} onChange={e=>sf("sex",e.target.value)}>
                  <option value="F">Mujer</option><option value="M">Hombre</option>
                </select>
              </div>
              <div className="fg"><label className="fl">Género (avatar)</label>
                <select className="fs" value={form.genero||form.sex} onChange={e=>sf("genero",e.target.value)}>
                  <option value="F">Femenino</option><option value="M">Masculino</option>
                </select>
              </div>
            </div>
            <div className="fg"><label className="fl">Fecha de nacimiento</label>
              <input className="fi" type="date" value={form.birthdate} onChange={e=>{
                sf("birthdate",e.target.value);
                if(e.target.value){const ed=calcEdad(e.target.value);if(ed!==null)sf("age",ed);}
              }}/>
              {form.birthdate && calcEdad(form.birthdate)!==null && (
                <div style={{fontSize:11,color:"var(--sage-dk)",marginTop:3,fontWeight:600}}>
                  🎂 {calcEdad(form.birthdate)} años
                </div>
              )}
            </div>
            <div className="fg"><label className="fl">Plan contratado</label>
              {subscriptions && subscriptions.length > 0 ? (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8,marginTop:4}}>
                  {subscriptions.map(s=>(
                    <div key={s.id} onClick={()=>sf("contrato",s.nombre)}
                      style={{border:`2px solid ${form.contrato===s.nombre?s.color:"var(--cream-dk)"}`,borderRadius:9,padding:"9px 11px",cursor:"pointer",
                        background:form.contrato===s.nombre?s.color+"14":"#fff",transition:"all .15s",display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:18}}>{s.icono||"📋"}</span>
                      <div>
                        <div style={{fontWeight:700,fontSize:12,color:form.contrato===s.nombre?s.color:"var(--char)"}}>{s.nombre}</div>
                        <div style={{fontSize:10,color:"var(--mid)"}}>{s.precio}€/mes</div>
                      </div>
                    </div>
                  ))}
                  <div onClick={()=>sf("contrato","")}
                    style={{border:`2px solid ${!form.contrato?"var(--mid)":"var(--cream-dk)"}`,borderRadius:9,padding:"9px 11px",cursor:"pointer",
                      background:!form.contrato?"var(--cream)":"#fff",transition:"all .15s",display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:18}}>🚫</span>
                    <div style={{fontWeight:700,fontSize:12,color:"var(--mid)"}}>Sin plan</div>
                  </div>
                </div>
              ) : (
                <input className="fi" value={form.contrato||""} onChange={e=>sf("contrato",e.target.value)} placeholder="Básico · Premium · Intensivo..."/>
              )}
            </div>
          </div>
          {/* Photo upload */}
          <div className="fg">
            <label className="fl">Foto del paciente (opcional)</label>
            <div className={"img-upload-box"+(form.photo?" has-img":"")} onClick={()=>photoRef.current.click()}>
              {form.photo
                ?<><img src={form.photo} alt=""/><div className="overlay" style={{color:"#fff",flexDirection:"column",gap:4,fontSize:12,fontWeight:600}}><span style={{fontSize:20}}>📷</span>Cambiar</div></>
                :<div style={{padding:"20px 0",color:"var(--mid)"}}>
                   <img src={getDefaultAvatar(form.genero||form.sex)} alt="" style={{width:52,height:52,borderRadius:"50%",marginBottom:6,display:"block",margin:"0 auto 8px"}}/>
                   <div style={{fontWeight:600,fontSize:12}}>Foto del paciente</div>
                   <div style={{fontSize:10}}>Opcional · Se usará avatar por género</div>
                 </div>}
            </div>
            <input ref={photoRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>sf("photo",ev.target.result);r.readAsDataURL(f);}}/>
          </div>
        </div>

        {/* DATOS FÍSICOS */}
        <h4 style={{fontSize:13,color:"var(--mid)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:14}}>Datos físicos & objetivo</h4>
        <div className="f3 mb20">
          <div className="fg"><label className="fl">Peso (kg)</label><input className="fi" type="number" step="0.1" value={form.weight} onChange={e=>sf("weight",e.target.value)} placeholder="70"/></div>
          <div className="fg"><label className="fl">Altura (cm)</label><input className="fi" type="number" value={form.height} onChange={e=>sf("height",e.target.value)} placeholder="170"/></div>
          <div className="fg"><label className="fl">Edad (años)</label><input className="fi" type="number" value={form.age} onChange={e=>sf("age",e.target.value)} placeholder="30"/></div>
        </div>

        <div className="fg mb20">
          <label className="fl">Nivel de actividad física</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>
            {ACTIVITY_LEVELS.map(al=>(
              <div key={al.id} onClick={()=>sf("activityLevel",al.id)}
                style={{border:"1.5px solid "+(form.activityLevel===al.id?"var(--sage-dk)":"var(--cream-dk)"),borderRadius:8,padding:"10px 12px",cursor:"pointer",background:form.activityLevel===al.id?"rgba(58,92,58,.07)":"#fff",transition:"all .15s"}}>
                <div style={{fontWeight:700,fontSize:12,color:form.activityLevel===al.id?"var(--sage-dk)":"var(--char)"}}>{al.label}</div>
                <div style={{fontSize:10,color:"var(--mid)",marginTop:2}}>{al.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="fg mb20">
          <label className="fl">Objetivo</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8}}>
            {GOALS.map(g=>(
              <div key={g.id} onClick={()=>sf("goal",g.id)}
                style={{border:"1.5px solid "+(form.goal===g.id?g.color:"var(--cream-dk)"),borderRadius:8,padding:"10px 12px",cursor:"pointer",background:form.goal===g.id?g.color+"18":"#fff",transition:"all .15s"}}>
                <div style={{fontWeight:700,fontSize:12,color:form.goal===g.id?g.color:"var(--char)"}}>{g.label}</div>
                <div style={{fontSize:10,color:"var(--mid)",marginTop:1}}>{g.adj>0?"+"+g.adj:g.adj===0?"sin cambio":g.adj} kcal/día</div>
              </div>
            ))}
          </div>
        </div>

        {/* HARRIS-BENEDICT RESULT */}
        {bmr > 0 && (
          <div style={{background:"linear-gradient(135deg,#f0f6f0,#e8f0e8)",borderRadius:12,padding:20,marginBottom:24,border:"1.5px solid var(--sage-lt)"}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--sage-dk)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>📊 Cálculo Harris-Benedict</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,textAlign:"center"}}>
              <div>
                <div className="kcal-big" style={{color:"var(--mid)"}}>{bmr}</div>
                <div className="kcal-label">GEB (basal)</div>
              </div>
              <div>
                <div className="kcal-big" style={{color:"var(--sage-dk)"}}>{tdee}</div>
                <div className="kcal-label">TDEE (mantenimiento)</div>
              </div>
              <div>
                <div className="kcal-big" style={{color:goalObj?.color||"var(--sage-dk)"}}>{target}</div>
                <div className="kcal-label">Objetivo ({goalObj?.label})</div>
              </div>
            </div>
            <div style={{fontSize:11,color:"var(--mid)",marginTop:12,textAlign:"center"}}>
              GEB {form.sex==="M"?"hombre":"mujer"}: 66.5 + 13.75×{form.weight} + 5.003×{form.height} − 6.755×{form.age} = <b>{bmr} kcal</b>
            </div>
          </div>
        )}

        {/* CUESTIONARIO */}
        {questions.length > 0 && <>
          <h4 style={{fontSize:13,color:"var(--mid)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:14}}>Entrevista inicial</h4>
          {questions.map(q => (
            <div className="fg" key={q.id}>
              <label className="fl">{q.text}</label>
              {q.type==="textarea" && <textarea className="fta" style={{minHeight:66}} value={form.answers[q.id]||""} onChange={e=>setAnswer(q.id,e.target.value)}/>}
              {q.type==="text" && <input className="fi" value={form.answers[q.id]||""} onChange={e=>setAnswer(q.id,e.target.value)}/>}
              {q.type==="number" && <input className="fi" type="number" value={form.answers[q.id]||""} onChange={e=>setAnswer(q.id,e.target.value)}/>}
              {q.type==="select" && <select className="fs" value={form.answers[q.id]||""} onChange={e=>setAnswer(q.id,e.target.value)}>
                <option value="">— Seleccionar —</option>
                {(q.options||[]).map(o=><option key={o}>{o}</option>)}
              </select>}
            </div>
          ))}
        </>}

        <div className="fg"><label className="fl">Notas internas del nutricionista</label>
          <textarea className="fta" value={form.notes} onChange={e=>sf("notes",e.target.value)} placeholder="Observaciones, recomendaciones especiales..."/>
        </div>

        <div className="f g8" style={{justifyContent:"flex-end"}}>
          <button className="btn btn-g" onClick={onClose}>Cancelar</button>
          <button className="btn btn-i" disabled={!form.name.trim()} onClick={save}>💾 Guardar paciente</button>
        </div>
      </div>
    </div>
  );
}

/* ─── CHECK-IN MODAL ────────────────────────────────────────────────────── */
function CheckInModal({ patient, onSave, onClose }) {
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const lastW = patient.history?.slice(-1)[0]?.weight;

  const save = () => {
    if (!weight) return;
    onSave({ date, weight: Number(weight), notes, id: Date.now() });
    onClose();
  };

  const diff = weight && lastW ? (Number(weight) - lastW).toFixed(1) : null;

  return (
    <div className="mb" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo" style={{maxWidth:420}}>
        <div className="mo-hd"><h3>📏 Nuevo registro</h3><button className="mo-x" onClick={onClose}>✕</button></div>
        <div className="fg"><label className="fl">Fecha</label><input className="fi" type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
        <div className="fg"><label className="fl">Peso (kg)</label>
          <input className="fi" type="number" step="0.1" autoFocus value={weight} onChange={e=>setWeight(e.target.value)} placeholder="70.5"/>
          {diff && <div style={{fontSize:12,marginTop:4,fontWeight:600,color:Number(diff)<0?"var(--sage-dk)":"var(--danger)"}}>
            {Number(diff)<0?"▼":"▲"} {Math.abs(diff)} kg respecto al último registro
          </div>}
        </div>
        <div className="fg"><label className="fl">Notas de la sesión</label><textarea className="fta" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Evolución, adherencia, comentarios..."/></div>
        <div className="f g8" style={{justifyContent:"flex-end"}}>
          <button className="btn btn-g" onClick={onClose}>Cancelar</button>
          <button className="btn btn-p" disabled={!weight} onClick={save}>✓ Guardar registro</button>
        </div>
      </div>
    </div>
  );
}

/* ─── PATIENT PLAN EDITOR ───────────────────────────────────────────────── */
function PatientPlanEditor({ patient, recipes, weekTemplates, onUpdate, onSaveTemplate, profile, showToast }) {
  const [week, setWeek] = useState(() => patient.personalWeek || mkWeek());
  const [modal, setModal] = useState(null);
  const [saveAsGlobalOpen, setSaveAsGlobalOpen] = useState(false);
  const [planName, setPlanName] = useState(patient.name + " — Plan Personalizado");
  const [showPlanName, setShowPlanName] = useState(false);

  // Sync if patient.personalWeek changes externally
  useEffect(() => { setWeek(patient.personalWeek || mkWeek()); }, [patient.id]);

  const addMeal = (day, meal, id) => setWeek(w => {
    const nw = JSON.parse(JSON.stringify(w));
    nw[day][meal] = [...(nw[day][meal]||[]), id];
    return nw;
  });
  const removeMeal = (day, meal, idx) => setWeek(w => {
    const nw = JSON.parse(JSON.stringify(w));
    nw[day][meal] = (nw[day][meal]||[]).filter((_,i)=>i!==idx);
    return nw;
  });

  const totalRecipes = Object.values(week).reduce((a,d)=>a+Object.values(d).reduce((b,m)=>b+(m||[]).length,0),0);
  const shopList = buildShoppingList(week, recipes, 1.2);

  const saveForPatient = () => {
    onUpdate({ ...patient, personalWeek: week, fecha_asignacion: new Date().toISOString() });
    showToast("Plan guardado para " + patient.name + " ✓");
  };

  const doPlanPDF = () => {
    const ok = openPrintWindow(buildMenuPDF(week, recipes, profile));
    if (ok) showToast("PDF menú — Ctrl+P para guardar", "info");
    else showToast("Activa ventanas emergentes", "error");
  };

  const doShopPDF = () => {
    onUpdate({ ...patient, fecha_lista_compra: new Date().toISOString() });
    const ok = openPrintWindow(buildShopPDF(shopList, true, week, recipes, profile));
    if (ok) showToast("PDF lista de compra — Ctrl+P para guardar", "info");
    else showToast("Activa ventanas emergentes", "error");
  };

  return (
    <div className="pt-planner" style={{marginBottom:16}}>
      <div className="pt-planner-hd">
        <h4>🗓 Diseñar plan personalizado</h4>
        <span style={{fontSize:11,color:"rgba(255,255,255,.7)"}}>{totalRecipes} recetas · {shopList.length} ing. en lista compra</span>
      </div>
      <div className="pt-planner-body">
        <div className="wg" style={{minWidth:780}}>
          <div className="wh" style={{background:"var(--char)",fontSize:9}}>Comida</div>
          {DAYS.map(d=><div key={d} className="wh" style={{fontSize:9}}>{d}</div>)}
          {MEALS.map(meal=>(
            <React.Fragment key={meal}>
              <div className="wml"><span>{MICON[meal]}</span><span style={{textAlign:"center",lineHeight:1.2,fontSize:9}}>{meal}</span></div>
              {DAYS.map(day=>(
                <div key={day+meal} className="wc">
                  {(week[day]?.[meal]||[]).map((id,i)=>{
                    const r = recipes.find(x=>x.id===id);
                    return r ? (
                      <div key={i} className="mt">
                        <span style={{fontSize:9,flex:1,lineHeight:1.3}}>{r.name}</span>
                        <button onClick={()=>removeMeal(day,meal,i)}>✕</button>
                      </div>
                    ) : null;
                  })}
                  <button className="ab" onClick={()=>setModal({day,meal})}>+</button>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
        {/* Daily summary */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:8,marginTop:14}}>
          {DAYS.map(day=>{
            const dm = dayM(week,day,recipes);
            return dm.kcal > 0 ? (
              <div key={day} style={{background:"var(--cream)",borderRadius:6,padding:"7px 9px"}}>
                <div style={{fontWeight:700,fontSize:10,color:"var(--sage-dk)",marginBottom:3}}>{day.slice(0,3)}</div>
                <div style={{fontSize:11,color:"var(--char)",fontWeight:600}}>{dm.kcal} kcal</div>
                <div style={{fontSize:9,color:"var(--mid)"}}>{dm.prot}g P · {dm.carbs}g HC</div>
              </div>
            ) : null;
          })}
        </div>
      </div>

      {/* Action bar */}
      <div className="pt-plan-actions">
        <button className="btn btn-p btn-sm" disabled={totalRecipes===0} onClick={saveForPatient}>
          💾 Guardar plan del paciente
        </button>
        <button className="btn btn-i btn-sm" disabled={totalRecipes===0} onClick={()=>setSaveAsGlobalOpen(true)}>
          📋 Guardar como plantilla
        </button>
        {totalRecipes > 0 && <>
          <button className="btn btn-t btn-sm" onClick={doPlanPDF}>🖨️ PDF Menú</button>
          <button className="btn btn-o btn-sm" onClick={doShopPDF}>🛒 PDF Lista Compra</button>
        </>}
        <button className="btn btn-g btn-sm" style={{marginLeft:"auto"}} onClick={()=>{if(window.confirm("¿Limpiar todo el plan?"))setWeek(mkWeek());}}>🗑 Limpiar</button>
      </div>

      {/* Add meal modal */}
      {modal && (
        <AddMeal day={modal.day} meal={modal.meal} recipes={recipes}
          onAdd={id=>addMeal(modal.day,modal.meal,id)}
          onClose={()=>setModal(null)}/>
      )}

      {/* Save as global template modal */}
      {saveAsGlobalOpen && (
        <SaveTemplateModal week={week} recipes={recipes}
          onSave={tpl=>{ onSaveTemplate(tpl); showToast("Plantilla guardada ✓"); }}
          onClose={()=>setSaveAsGlobalOpen(false)}/>
      )}
    </div>
  );
}

/* ─── WEIGHT LINE CHART (SVG nativo) ────────────────────────────────────── */
function WeightLineChart({ data }) {
  if (!data || data.length < 2) return null;
  const W = 520, H = 130, PX = 40, PY = 20;
  const vals = data.map(d => d.w);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;
  const xStep = (W - PX * 2) / (data.length - 1);

  const pt = (i) => ({
    x: PX + i * xStep,
    y: PY + (1 - (vals[i] - minV) / range) * (H - PY * 2),
  });

  const points = data.map((_, i) => pt(i));
  const linePath = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
  const areaPath = linePath + ` L${points[points.length-1].x},${H - PY} L${points[0].x},${H - PY} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="linechart-svg" style={{width:"100%",height:H}}>
      <defs>
        <linearGradient id="lc-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--info)" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="var(--info)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0,0.25,0.5,0.75,1].map((t,i)=>{
        const y = PY + (1-t)*(H-PY*2);
        const val = (minV + t*range).toFixed(1);
        return (
          <g key={i}>
            <line x1={PX} y1={y} x2={W-PX} y2={y} stroke="var(--cream-dk)" strokeWidth="1"/>
            <text x={PX-4} y={y+3} fontSize="8" fill="var(--mid)" textAnchor="end">{val}</text>
          </g>
        );
      })}
      {/* Area + Line */}
      <path d={areaPath} className="lc-area"/>
      <path d={linePath} className="lc-line"/>
      {/* Dots + labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} className="lc-dot"/>
          <text x={p.x} y={p.y - 10} className="lc-val">{vals[i]}</text>
          <text x={p.x} y={H - PY + 13} className="lc-label">{data[i].date.slice(5)}</text>
        </g>
      ))}
    </svg>
  );
}

/* ─── ANTHROPOMETRIC SECTION (collapsible) ──────────────────────────────── */
function AntroSection({ patient, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    masa_magra: '', grasa_visceral: '', porcentaje_grasa: '', porcentaje_agua: '',
  });
  const mediciones = patient.mediciones_corporales || [];
  const last = mediciones[mediciones.length - 1];

  const save = () => {
    if (!form.fecha) return;
    const entry = { ...form, id: Date.now() };
    onUpdate({ ...patient, mediciones_corporales: [...mediciones, entry] });
    setForm({ fecha: new Date().toISOString().split('T')[0], masa_magra:'', grasa_visceral:'', porcentaje_grasa:'', porcentaje_agua:'' });
  };

  return (
    <div style={{marginBottom:20}}>
      <div className="collapsible-hd" onClick={()=>setOpen(o=>!o)}>
        <h4>🧬 Composición corporal {last && <span className="date-chip" style={{marginLeft:8}}>Último: {fmtFecha(last.fecha)}</span>}</h4>
        <span style={{fontSize:12,color:"var(--mid)"}}>{open?"▲":"▼"}</span>
      </div>
      {open && (
        <div className="collapsible-body" style={{padding:"14px 2px"}}>
          {last && (
            <div className="antro-grid" style={{marginBottom:16}}>
              {[["masa_magra","Masa Magra","kg"],["grasa_visceral","Gr. Visceral","nivel"],
                ["porcentaje_grasa","% Grasa","%"],["porcentaje_agua","% Agua","%"]].map(([k,lbl,u])=>(
                last[k] ? (
                  <div className="antro-card" key={k}>
                    <div className="av">{last[k]}<span style={{fontSize:11}}> {u}</span></div>
                    <div className="al">{lbl}</div>
                  </div>
                ) : null
              ))}
            </div>
          )}
          {/* Historical table */}
          {mediciones.length > 0 && (
            <div style={{overflowX:"auto",marginBottom:16}}>
              <table className="it">
                <thead><tr>
                  <th>Fecha</th><th>Masa Magra (kg)</th><th>Gr. Visceral</th><th>% Grasa</th><th>% Agua</th>
                </tr></thead>
                <tbody>
                  {[...mediciones].reverse().map(m=>(
                    <tr key={m.id}>
                      <td>{fmtFecha(m.fecha)}</td>
                      <td>{m.masa_magra||'—'}</td>
                      <td>{m.grasa_visceral||'—'}</td>
                      <td>{m.porcentaje_grasa||'—'}</td>
                      <td>{m.porcentaje_agua||'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Add new entry */}
          <div style={{background:"var(--cream)",borderRadius:"var(--rs)",padding:14}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:10,color:"var(--char)"}}>➕ Nueva medición</div>
            <div className="f3" style={{gap:10}}>
              <div className="fg" style={{marginBottom:0}}>
                <label className="fl">Fecha</label>
                <input className="fi" type="date" value={form.fecha} onChange={e=>setForm(f=>({...f,fecha:e.target.value}))}/>
              </div>
              <div className="fg" style={{marginBottom:0}}>
                <label className="fl">Masa Magra (kg)</label>
                <input className="fi" type="number" step="0.1" placeholder="52.4" value={form.masa_magra} onChange={e=>setForm(f=>({...f,masa_magra:e.target.value}))}/>
              </div>
              <div className="fg" style={{marginBottom:0}}>
                <label className="fl">Grasa Visceral</label>
                <input className="fi" type="number" step="1" placeholder="8" value={form.grasa_visceral} onChange={e=>setForm(f=>({...f,grasa_visceral:e.target.value}))}/>
              </div>
            </div>
            <div className="f2" style={{gap:10,marginTop:10}}>
              <div className="fg" style={{marginBottom:0}}>
                <label className="fl">% Grasa corporal</label>
                <input className="fi" type="number" step="0.1" placeholder="24.5" value={form.porcentaje_grasa} onChange={e=>setForm(f=>({...f,porcentaje_grasa:e.target.value}))}/>
              </div>
              <div className="fg" style={{marginBottom:0}}>
                <label className="fl">% Agua corporal</label>
                <input className="fi" type="number" step="0.1" placeholder="55.2" value={form.porcentaje_agua} onChange={e=>setForm(f=>({...f,porcentaje_agua:e.target.value}))}/>
              </div>
            </div>
            <button className="btn btn-p btn-sm" style={{marginTop:12}} disabled={!form.fecha} onClick={save}>
              ✓ Guardar medición
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── PATIENT DETAIL ────────────────────────────────────────────────────── */
function PatientDetail({ patient, questions, recipes, weekTemplates, onClose, onEdit, onDelete, onAddCheckin, onAssignTemplate, onUpdate, onSaveTemplate, showToast }) {
  const [tab, setTab] = useState("overview");
  const [checkInOpen, setCheckInOpen] = useState(false);

  const bmr = calcHarrisBenedict(patient.sex, patient.weight, patient.height, patient.age);
  const tdee = calcTDEE(bmr, patient.activityLevel);
  const target = calcTarget(tdee, patient.goal);
  const goalObj = GOALS.find(g=>g.id===patient.goal);
  const actObj = ACTIVITY_LEVELS.find(a=>a.id===patient.activityLevel);

  const history = patient.history || [];
  const lastEntry = history.slice(-1)[0];
  const assignedTpl = weekTemplates.find(t=>t.id===patient.assignedTemplateId);

  const edadMostrar = calcEdad(patient.birthdate) ?? patient.age;

  // Weight progress for chart
  const chartData = history.slice(-10).map(h=>({ date:h.date, w:h.weight }));
  const maxW = Math.max(...chartData.map(d=>d.w), patient.weight||0) + 2;
  const minW = Math.min(...chartData.map(d=>d.w), patient.weight||0) - 2;
  const range = maxW - minW || 1;

  // Toggle revisado
  const toggleRevisado = () => onUpdate && onUpdate({ ...patient, revisado: !patient.revisado });

  return (
    <div className="mb" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo" style={{maxWidth:900}}>
        {/* Header */}
        <div style={{display:"flex",gap:16,alignItems:"flex-start",marginBottom:20}}>
          {patient.photo || patient.genero
            ? <img src={patient.photo || getDefaultAvatar(patient.genero||patient.sex)} style={{width:70,height:70,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
            : <div style={{width:70,height:70,borderRadius:"50%",background:"linear-gradient(135deg,#2a4a7a,#3a7ab5)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:26,color:"#fff"}}>👤</div>}
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:4}}>
              <h3 style={{fontSize:22,margin:0}}>{patient.name}</h3>
              {/* Revisado badge */}
              <span
                className={"badge-revisado "+(patient.revisado?"ok":"pending")}
                style={{cursor:"pointer"}}
                title={patient.revisado?"Marcar como pendiente":"Marcar como revisado"}
                onClick={toggleRevisado}
              >
                {patient.revisado?"✓ Revisado":"⏳ Pendiente"}
              </span>
            </div>
            <div style={{display:"flex",gap:12,flexWrap:"wrap",fontSize:12,color:"var(--mid)"}}>
              {patient.birthdate && <span>🎂 {fmtFecha(patient.birthdate)}{edadMostrar?" ("+edadMostrar+" años)":""}</span>}
              {!patient.birthdate && patient.age && <span>🎂 {patient.age} años</span>}
              {patient.weight && <span>⚖️ {patient.weight} kg</span>}
              {patient.height && <span>📏 {patient.height} cm</span>}
              {patient.phone && <span>📱 {patient.phone}</span>}
              {actObj && <span>🏃 {actObj.label}</span>}
              {patient.email && <span>✉️ {patient.email}</span>}
              {patient.contrato && <span style={{background:"rgba(124,92,191,.12)",color:"var(--purple)",padding:"1px 8px",borderRadius:20,fontWeight:600}}>📄 {patient.contrato}</span>}
            </div>
            {target>0 && <div style={{marginTop:6,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:24,fontWeight:700,fontFamily:"Playfair Display,serif",color:goalObj?.color||"var(--sage-dk)"}}>{target}</span>
              <span style={{fontSize:11,color:"var(--mid)"}}>kcal/día objetivo<br/><b style={{color:goalObj?.color}}>{goalObj?.label}</b></span>
            </div>}
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            <button className="btn btn-g btn-sm" onClick={()=>setCheckInOpen(true)}>+ Registro</button>
            <button className="btn btn-o btn-sm" onClick={()=>onEdit(patient)}>✏️ Editar</button>
            <button className="btn btn-d btn-sm" onClick={()=>{if(window.confirm("¿Eliminar paciente?"))onDelete(patient.id);}}>🗑</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          {[["overview","📊 Resumen"],["history","📈 Historial"],["interview","📝 Entrevista"],["plan","🗓 Plan asignado"]].map(([id,lbl])=>(
            <button key={id} className={"tab-btn"+(tab===id?" active":"")} onClick={()=>setTab(id)}>{lbl}</button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab==="overview" && <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
            <div className="card-sm"><div style={{fontSize:11,color:"var(--mid)",marginBottom:4}}>GEB (Basal)</div><div className="kcal-big" style={{color:"var(--mid)",fontSize:22}}>{bmr}</div><div className="kcal-label">kcal</div></div>
            <div className="card-sm"><div style={{fontSize:11,color:"var(--mid)",marginBottom:4}}>TDEE (Mantenimiento)</div><div className="kcal-big" style={{color:"var(--sage-dk)",fontSize:22}}>{tdee}</div><div className="kcal-label">kcal</div></div>
            <div className="card-sm" style={{border:"2px solid "+(goalObj?.color||"var(--sage-dk)")}}><div style={{fontSize:11,color:"var(--mid)",marginBottom:4}}>Objetivo — {goalObj?.label}</div><div className="kcal-big" style={{color:goalObj?.color||"var(--sage-dk)",fontSize:22}}>{target}</div><div className="kcal-label">kcal/día</div></div>
          </div>

          {/* Harris-Benedict explanation */}
          <div style={{background:"var(--cream)",borderRadius:8,padding:14,marginBottom:20,fontSize:12,color:"var(--mid)",lineHeight:1.7}}>
            <b style={{color:"var(--char)"}}>Fórmula Harris-Benedict ({patient.sex==="M"?"hombre":"mujer"}):</b><br/>
            {patient.sex==="M"
              ? `GEB = 66.5 + (13.75 × ${patient.weight}) + (5.003 × ${patient.height}) − (6.755 × ${patient.age}) = ${bmr} kcal`
              : `GEB = 655.1 + (9.563 × ${patient.weight}) + (1.850 × ${patient.height}) − (4.676 × ${patient.age}) = ${bmr} kcal`}
            <br/>TDEE = {bmr} × {actObj?.factor} ({actObj?.label}) = <b>{tdee} kcal</b>
            {goalObj?.adj!==0 && <><br/>Objetivo = {tdee} {goalObj?.adj>0?"+":""}{goalObj?.adj} = <b style={{color:goalObj?.color}}>{target} kcal</b></>}
          </div>

          {/* Weight chart */}
          {chartData.length > 1 && <div style={{marginBottom:20}}>
            <h4 className="st" style={{fontSize:13}}>📈 Evolución del peso</h4>
            <div style={{background:"var(--cream)",borderRadius:"var(--rs)",padding:"14px 10px 22px"}}>
              <WeightLineChart data={chartData}/>
            </div>
          </div>}

          {/* Anthropometric section */}
          <AntroSection patient={patient} onUpdate={onUpdate}/>

          {patient.notes && <div style={{background:"var(--cream)",borderRadius:8,padding:14}}><b style={{fontSize:12}}>📋 Notas:</b><p style={{fontSize:12,color:"var(--mid)",marginTop:4,lineHeight:1.6}}>{patient.notes}</p></div>}
        </div>}

        {/* HISTORY TAB */}
        {tab==="history" && <div>
          <div className="f jb ac mb16">
            <h4 className="st" style={{marginBottom:0}}>Registros de seguimiento ({history.length})</h4>
            <button className="btn btn-p btn-sm" onClick={()=>setCheckInOpen(true)}>+ Nuevo registro</button>
          </div>
          {history.length===0
            ? <div className="es"><div className="ei">📈</div><p>Sin registros aún. Añade el primer pesaje.</p></div>
            : <div>{[...history].reverse().map((h,i)=>{
                const prev = history[history.length - 1 - i - 1];
                const diff = prev ? (h.weight - prev.weight).toFixed(1) : null;
                return(<div key={h.id} className="hist-row">
                  <span className="hist-date">{new Date(h.date).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'2-digit'})}</span>
                  <span className="hist-val">⚖️ {h.weight} kg</span>
                  {diff && <span className={"hist-delta "+(Number(diff)<0?"delta-down":Number(diff)>0?"delta-up":"delta-same")}>{Number(diff)>0?"+":""}{diff} kg</span>}
                  {h.notes && <span style={{fontSize:11,color:"var(--mid)",flex:1,fontStyle:"italic"}}>{h.notes}</span>}
                </div>);
              })}</div>}
        </div>}

        {/* INTERVIEW TAB */}
        {tab==="interview" && <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h4 className="st" style={{fontSize:13,marginBottom:0}}>Respuestas del cuestionario inicial</h4>
            {patient.updatedAt && (
              <span className="date-chip">📅 Última actualización: {fmtFecha(patient.updatedAt)}</span>
            )}
          </div>
          {questions.length===0 && <p style={{fontSize:13,color:"var(--mid)"}}>No hay preguntas configuradas.</p>}
          {questions.map(q=>(
            <div key={q.id} style={{marginBottom:14,paddingBottom:14,borderBottom:"1px solid var(--cream-dk)"}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--sage-dk)",marginBottom:4}}>{q.text}</div>
              <div style={{fontSize:13,color:patient.answers?.[q.id]?"var(--char)":"var(--mid)"}}>
                {patient.answers?.[q.id]||<span style={{fontStyle:"italic"}}>Sin respuesta</span>}
              </div>
            </div>
          ))}
        </div>}

        {/* PLAN TAB */}
        {tab==="plan" && <div>

          {/* ─ Saved personal plan summary ─ */}
          {patient.personalWeek && (() => {
            const tRecipes = Object.values(patient.personalWeek).reduce((a,d)=>a+Object.values(d).reduce((b,m)=>b+(m||[]).length,0),0);
            const sl = buildShoppingList(patient.personalWeek, recipes, 1.2);
            if (tRecipes === 0) return null;
            return (
              <div style={{background:"linear-gradient(90deg,rgba(58,92,58,.06),rgba(58,122,181,.06))",border:"1.5px solid var(--sage-lt)",borderRadius:"var(--r)",padding:14,marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,flexWrap:"wrap"}}>
                  <span style={{fontWeight:700,fontSize:13,color:"var(--sage-dk)"}}>✅ Plan personalizado activo</span>
                  {patient.fecha_asignacion && <span className="date-chip">📅 Asignado: {fmtFecha(patient.fecha_asignacion)}</span>}
                  {patient.fecha_lista_compra && <span className="date-chip">🛒 Lista: {fmtFecha(patient.fecha_lista_compra)}</span>}
                </div>
                <div style={{fontSize:12,color:"var(--mid)",marginBottom:12}}>
                  {tRecipes} recetas · {sl.length} ingredientes en lista de compra
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <button className="btn btn-t btn-sm" onClick={()=>{
                    const ok = openPrintWindow(buildMenuPDF(patient.personalWeek,recipes,{}));
                    if(ok)showToast("PDF menú — Ctrl+P para guardar","info");
                    else showToast("Activa ventanas emergentes","error");
                  }}>🖨️ PDF Menú + Recetas</button>
                  <button className="btn btn-p btn-sm" onClick={()=>{
                    onUpdate && onUpdate({...patient, fecha_lista_compra:new Date().toISOString()});
                    const ok = openPrintWindow(buildShopPDF(sl,true,patient.personalWeek,recipes,{}));
                    if(ok)showToast("PDF lista de compra — Ctrl+P","info");
                    else showToast("Activa ventanas emergentes","error");
                  }}>🛒 PDF Lista Compra</button>
                </div>
              </div>
            );
          })()}

          {/* ─ Plan editor ─ */}
          <PatientPlanEditor
            patient={patient}
            recipes={recipes}
            weekTemplates={weekTemplates}
            onUpdate={onUpdate}
            onSaveTemplate={onSaveTemplate}
            profile={{}}
            showToast={showToast}
          />

          {/* ─ Assign from existing templates ─ */}
          <div style={{marginTop:20}}>
            <h4 className="st" style={{fontSize:13}}>📚 O asignar plantilla existente</h4>
            {assignedTpl && (
              <div style={{background:"var(--cream)",borderRadius:8,padding:14,marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:6}}>
                  <div style={{fontWeight:700,fontSize:14,color:"var(--info)"}}>{assignedTpl.name}</div>
                  {assignedTpl.es_plantilla && <span className="badge bg" style={{fontSize:10}}>📋 Plantilla</span>}
                </div>
                {assignedTpl.description && <div style={{fontSize:12,color:"var(--mid)",marginBottom:8}}>{assignedTpl.description}</div>}
                <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:11,marginBottom:10}}>
                  {patient.fecha_asignacion && <span>📅 <b>Asignada:</b> {fmtFecha(patient.fecha_asignacion)}</span>}
                  {patient.fecha_lista_compra && <span>🛒 <b>Lista compra:</b> {fmtFecha(patient.fecha_lista_compra)}</span>}
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <button className="btn btn-t btn-sm" onClick={()=>{
                    const ok=openPrintWindow(buildMenuPDF(assignedTpl.week,recipes,{}));
                    if(ok)showToast("PDF menú — Ctrl+P","info");else showToast("Activa ventanas emergentes","error");
                  }}>🖨️ PDF Menú</button>
                  <button className="btn btn-p btn-sm" onClick={()=>{
                    const sl=buildShoppingList(assignedTpl.week,recipes,1.2);
                    onUpdate&&onUpdate({...patient,fecha_lista_compra:new Date().toISOString()});
                    const ok=openPrintWindow(buildShopPDF(sl,true,assignedTpl.week,recipes,{}));
                    if(ok)showToast("PDF lista compra — Ctrl+P","info");else showToast("Activa ventanas emergentes","error");
                  }}>🛒 PDF Lista</button>
                  <button className="btn btn-g btn-sm" onClick={()=>onAssignTemplate(patient.id,null)}>✕ Quitar plantilla</button>
                </div>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:10}}>
              {weekTemplates.map(tpl=>(
                <div key={tpl.id} className={"plan-tpl-card"+(patient.assignedTemplateId===tpl.id?" selected":"")}
                  onClick={()=>{
                    onAssignTemplate(patient.id,tpl.id);
                    onUpdate&&onUpdate({...patient,assignedTemplateId:tpl.id,fecha_asignacion:new Date().toISOString()});
                  }}>
                  <div style={{fontWeight:700,fontSize:13,color:"var(--info)",marginBottom:3}}>{tpl.name}</div>
                  {tpl.es_plantilla&&<span className="badge bg" style={{fontSize:9,marginBottom:4,display:"inline-block"}}>📋 Plantilla</span>}
                  {tpl.description&&<div style={{fontSize:11,color:"var(--mid)"}}>{tpl.description}</div>}
                  <div style={{fontSize:10,color:"var(--sage-dk)",marginTop:5}}>
                    {Object.values(tpl.week||{}).reduce((a,day)=>a+Object.values(day||{}).reduce((b,m)=>b+(m||[]).length,0),0)} recetas
                  </div>
                  {tpl.createdAt&&<div style={{fontSize:9,color:"var(--mid)",marginTop:2}}>Creada: {fmtFecha(tpl.createdAt)}</div>}
                </div>
              ))}
              {weekTemplates.length===0&&<p style={{fontSize:12,color:"var(--mid)"}}>Crea plantillas en el Planificador o diseña arriba el plan personalizado.</p>}
            </div>
          </div>
        </div>}
      </div>
      {checkInOpen && <CheckInModal patient={patient} onSave={entry=>onAddCheckin(patient.id,entry)} onClose={()=>setCheckInOpen(false)}/>}
    </div>
  );
}

/* ─── PATIENTS VIEW ─────────────────────────────────────────────────────── */
function PatientsView({ patients, questions, recipes, weekTemplates, subscriptions, onAdd, onUpdate, onDelete, onAddCheckin, onAssignTemplate, onSaveTemplate, showToast }) {
  const [form, setForm] = useState(false);
  const [edit, setEdit] = useState(null);
  const [detail, setDetail] = useState(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [localQuestions, setLocalQuestions] = useState(questions);
  const [q, setQ] = useState("");
  const [filterRevisado, setFilterRevisado] = useState("all"); // "all"|"revisado"|"pendiente"

  // Keep local questions in sync
  useEffect(()=>setLocalQuestions(questions),[questions]);

  const filtered = patients.filter(p => {
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (filterRevisado === "revisado" && !p.revisado) return false;
    if (filterRevisado === "pendiente" && p.revisado) return false;
    return true;
  });

  const nRevisados = patients.filter(p=>p.revisado).length;
  const nPendientes = patients.filter(p=>!p.revisado).length;

  return (
    <div>
      <PatientStyles/>
      <div className="ph f ac jb">
        <div><h2>Pacientes</h2><p>{patients.length} pacientes registrados</p></div>
        <div className="f g8">
          <button className="btn btn-o btn-sm" onClick={()=>setBuilderOpen(true)}>📝 Cuestionario</button>
          <button className="btn btn-i" onClick={()=>setForm(true)}>+ Nuevo paciente</button>
        </div>
      </div>

      <div className="filter-bar">
        <input className="fi" style={{maxWidth:260}} placeholder="🔍 Buscar paciente..." value={q} onChange={e=>setQ(e.target.value)}/>
        <span className={"filter-chip"+(filterRevisado==="all"?" on":"")} onClick={()=>setFilterRevisado("all")}>Todos ({patients.length})</span>
        <span className={"filter-chip"+(filterRevisado==="revisado"?" on":"")} onClick={()=>setFilterRevisado("revisado")} style={filterRevisado==="revisado"?{background:"var(--sage-dk)",color:"#fff",borderColor:"var(--sage-dk)"}:{}}>✓ Revisados ({nRevisados})</span>
        <span className={"filter-chip"+(filterRevisado==="pendiente"?" on":"")} onClick={()=>setFilterRevisado("pendiente")} style={filterRevisado==="pendiente"?{background:"var(--terra)",color:"#fff",borderColor:"var(--terra)"}:{}}>⏳ Pendientes ({nPendientes})</span>
      </div>

      {filtered.length===0
        ? <div className="es"><div className="ei">👥</div><p>{q?"Sin resultados":"¡Registra tu primer paciente!"}</p>{!q&&<button className="btn btn-i" style={{marginTop:14}} onClick={()=>setForm(true)}>+ Nuevo paciente</button>}</div>
        : <div className="pt-grid">
            {filtered.map(p => {
              const bmr2 = calcHarrisBenedict(p.sex, p.weight, p.height, p.age);
              const tdee2 = calcTDEE(bmr2, p.activityLevel);
              const target2 = calcTarget(tdee2, p.goal);
              const goalObj2 = GOALS.find(g=>g.id===p.goal);
              const lastH = p.history?.slice(-1)[0];
              const prevH = p.history?.slice(-2,-1)[0];
              const diff = lastH && prevH ? (lastH.weight - prevH.weight).toFixed(1) : null;
              return (
                <div className="pt-card" key={p.id} onClick={()=>setDetail(p)}>
                  <div className="pt-head">
                    <div style={{display:"flex",gap:12,alignItems:"center"}}>
                      <img
                        src={p.photo || getDefaultAvatar(p.genero||p.sex)}
                        style={{width:44,height:44,borderRadius:"50%",objectFit:"cover",flexShrink:0}}
                      />
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                          <h3 style={{margin:0}}>{p.name}</h3>
                          <span className={"badge-revisado "+(p.revisado?"ok":"pending")} style={{fontSize:9}}>
                            {p.revisado?"✓":"⏳"}
                          </span>
                        </div>
                        <div className="pt-sub">
                          {[
                            (calcEdad(p.birthdate)??p.age) && ((calcEdad(p.birthdate)??p.age)+"a"),
                            p.sex==="M"?"Hombre":"Mujer",
                            p.weight && p.weight+"kg"
                          ].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-body">
                    {target2>0 && <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:10}}>
                      <span className="kcal-big" style={{color:goalObj2?.color||"var(--sage-dk)",fontSize:24}}>{target2}</span>
                      <div><span className="kcal-label">kcal/día</span><br/><span style={{fontSize:10,color:goalObj2?.color||"var(--mid)",fontWeight:600}}>{goalObj2?.label}</span></div>
                    </div>}
                    {p.birthdate && <div className="pt-stat">🎂 <b>{fmtFecha(p.birthdate)}</b>{(calcEdad(p.birthdate))!==null && <span style={{color:"var(--mid)",marginLeft:4}}>({calcEdad(p.birthdate)} años)</span>}</div>}
                    {p.phone && <div className="pt-stat">📱 <b>{p.phone}</b></div>}
                    {p.contrato && <div className="pt-stat">📄 <b style={{color:"var(--purple)"}}>{p.contrato}</b></div>}
                    {lastH && <div className="pt-stat">⚖️ Último registro: <b>{lastH.weight} kg</b>
                      {diff && <span className={"hist-delta "+(Number(diff)<0?"delta-down":Number(diff)>0?"delta-up":"delta-same")} style={{marginLeft:4}}>{Number(diff)>0?"+":""}{diff} kg</span>}
                    </div>}
                    <div className="pt-stat" style={{fontSize:11}}>
                      📋 {p.history?.length||0} registros · {weekTemplates.find(t=>t.id===p.assignedTemplateId)
                        ? <span style={{color:"var(--info)"}}>Plan: {weekTemplates.find(t=>t.id===p.assignedTemplateId).name}</span>
                        : "Sin plan asignado"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>}

      {(form||edit) && <PatientForm patient={edit} questions={localQuestions} subscriptions={subscriptions||[]}
        onSave={p=>{edit?onUpdate(p):onAdd(p);showToast(edit?"Paciente actualizado ✓":"Paciente registrado ✓");setForm(false);setEdit(null);}}
        onClose={()=>{setForm(false);setEdit(null);}}/> }

      {detail && <PatientDetail
        patient={patients.find(p=>p.id===detail.id)||detail}
        questions={localQuestions} recipes={recipes} weekTemplates={weekTemplates}
        onClose={()=>setDetail(null)}
        onEdit={p=>{setDetail(null);setEdit(p);}}
        onDelete={id=>{onDelete(id);setDetail(null);showToast("Paciente eliminado");}}
        onAddCheckin={onAddCheckin}
        onAssignTemplate={onAssignTemplate}
        onSaveTemplate={onSaveTemplate}
        showToast={showToast}
        onUpdate={p=>{onUpdate(p);showToast("Paciente actualizado ✓");}}/>}

      {builderOpen && <InterviewBuilder questions={localQuestions}
        onSave={qs=>{setLocalQuestions(qs);/* propagate up via showToast */showToast("Cuestionario guardado ✓");}}
        onClose={()=>setBuilderOpen(false)}/>}
    </div>
  );
}



/* ─── WEEK TEMPLATES (PLANTILLAS) ───────────────────────────────────────── */
function SaveTemplateModal({ week, recipes, onSave, onClose }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [esPlantilla, setEsPlantilla] = useState(false);
  const usedCount = Object.values(week).reduce((a,d)=>a+Object.values(d).reduce((b,m)=>b+(m||[]).length,0),0);
  return (
    <div className="mb" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo" style={{maxWidth:420}}>
        <div className="mo-hd"><h3>💾 Guardar como plantilla</h3><button className="mo-x" onClick={onClose}>✕</button></div>
        <p style={{fontSize:12,color:"var(--mid)",marginBottom:16}}>{usedCount} recetas asignadas en el planificador actual.</p>
        <div className="fg"><label className="fl">Nombre de la plantilla *</label><input className="fi" autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Plan Mediterráneo semana 1"/></div>
        <div className="fg"><label className="fl">Descripción (opcional)</label><textarea className="fta" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Plan de 1800 kcal, alta proteína..."/></div>
        <div className="fg">
          <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13}}>
            <input type="checkbox" checked={esPlantilla} onChange={e=>setEsPlantilla(e.target.checked)} style={{width:16,height:16,accentColor:"var(--sage-dk)"}}/>
            <div>
              <b>Marcar como plantilla reutilizable</b>
              <div style={{fontSize:11,color:"var(--mid)",marginTop:1}}>Se mostrará como plantilla base al asignar planes a pacientes</div>
            </div>
          </label>
        </div>
        <div className="f g8" style={{justifyContent:"flex-end"}}>
          <button className="btn btn-g" onClick={onClose}>Cancelar</button>
          <button className="btn btn-p" disabled={!name.trim()} onClick={()=>{
            onSave({
              id: Date.now(), name, description: desc,
              week: JSON.parse(JSON.stringify(week)),
              es_plantilla: esPlantilla,
              createdAt: new Date().toISOString(),
            });
            onClose();
          }}>💾 Guardar{esPlantilla?" plantilla":" semana"}</button>
        </div>
      </div>
    </div>
  );
}


const SEED=[
  {id:1,name:"Tortilla de avena con fruta",portions:1,categoria:"Omnivora",origen:"Espanola",dificultad:"Facil",image:"",
   instructions:"Mezclar avena con huevos. Cocinar en sarten. Servir con fruta.",
   ingredients:[{id:11,name:"Avena copos",qty:60,unit:"g",kcal:228,prot:8,carbs:39,fat:4,_auto:false,_k100:null,_p100:null,_c100:null,_f100:null},{id:12,name:"Huevo entero",qty:2,unit:"ud",kcal:140,prot:12,carbs:1,fat:10,_auto:false,_k100:null,_p100:null,_c100:null,_f100:null},{id:13,name:"Platano",qty:100,unit:"g",kcal:89,prot:1,carbs:23,fat:0,_auto:false,_k100:null,_p100:null,_c100:null,_f100:null}]},
  {id:2,name:"Pollo al horno con verduras",portions:4,categoria:"Omnivora",origen:"Espanola",dificultad:"Media",image:"",
   instructions:"Adobar el pollo. Hornear a 180C 45 min con verduras.",
   ingredients:[{id:21,name:"Pechuga de pollo (plancha)",qty:800,unit:"g",kcal:880,prot:184,carbs:0,fat:16,_auto:false,_k100:null,_p100:null,_c100:null,_f100:null},{id:22,name:"Brocoli",qty:300,unit:"g",kcal:90,prot:9,carbs:15,fat:1,_auto:false,_k100:null,_p100:null,_c100:null,_f100:null},{id:23,name:"Aceite oliva virgen",qty:20,unit:"ml",kcal:177,prot:0,carbs:0,fat:20,_auto:false,_k100:null,_p100:null,_c100:null,_f100:null}]},
  {id:3,name:"Pisto con huevo poche",portions:2,categoria:"Vegetariana",origen:"Espanola",dificultad:"Media",image:"",
   instructions:"Pica la cebolla, pimiento y calabacin en dados pequeños. Sofrie la cebolla con AOVE. Añade el pimiento y calabacin, rehoga 8-10 min. Incorpora el tomate triturado, salpimenta y cocina 10-15 min a fuego suave. Para el huevo poche: lleva agua a ebullicion suave, envuelve el huevo en film con un chorrito de aceite, cierra con una pinza y cocina 2.5-3 min. Coloca el pisto caliente y encima el huevo poche. Rompe la yema justo antes de comer.",
   ingredients:[{id:31,name:"Cebolla",qty:50,unit:"g",kcal:20,prot:0.5,carbs:4.5,fat:0,_auto:false,_k100:null,_p100:null,_c100:null,_f100:null},{id:32,name:"Calabacin",qty:75,unit:"g",kcal:13,prot:0.9,carbs:2.3,fat:0,_auto:false,_k100:null,_p100:null,_c100:null,_f100:null},{id:33,name:"Pimiento verde",qty:75,unit:"g",kcal:15,prot:0.7,carbs:3.5,fat:0,_auto:false,_k100:null,_p100:null,_c100:null,_f100:null},{id:34,name:"Tomate triturado",qty:80,unit:"g",kcal:26,prot:1.3,carbs:4.6,fat:0,_auto:false,_k100:null,_p100:null,_c100:null,_f100:null},{id:35,name:"Aceite de oliva",qty:12,unit:"ml",kcal:106,prot:0,carbs:0,fat:12,_auto:false,_k100:null,_p100:null,_c100:null,_f100:null},{id:36,name:"Huevo entero",qty:2,unit:"ud",kcal:140,prot:12,carbs:1,fat:10,_auto:false,_k100:null,_p100:null,_c100:null,_f100:null}]}
];

const mkWeek=()=>{const w={};DAYS.forEach(d=>{w[d]={};MEALS.forEach(m=>{w[d][m]=[];})});return w;};
const sumM=ings=>ings.reduce((a,i)=>({kcal:a.kcal+(+i.kcal||0),prot:a.prot+(+i.prot||0),carbs:a.carbs+(+i.carbs||0),fat:a.fat+(+i.fat||0)}),{kcal:0,prot:0,carbs:0,fat:0});
const perP=(m,p)=>({kcal:Math.round(m.kcal/p),prot:Math.round(m.prot/p),carbs:Math.round(m.carbs/p),fat:Math.round(m.fat/p)});
const dayM=(week,day,recs)=>{let t={kcal:0,prot:0,carbs:0,fat:0};MEALS.forEach(m=>(week[day]?.[m]||[]).forEach(id=>{const r=recs.find(x=>x.id===id);if(!r)return;const v=perP(sumM(r.ingredients),r.portions);Object.keys(t).forEach(k=>t[k]+=v[k]);}));return t;};
const weekM=(week,recs)=>{let t={kcal:0,prot:0,carbs:0,fat:0};DAYS.forEach(d=>{const m=dayM(week,d,recs);Object.keys(t).forEach(k=>t[k]+=m[k]);});return t;};
const buildShoppingList=(week,recs,margin=1.2)=>{const map={};DAYS.forEach(day=>MEALS.forEach(meal=>{(week[day]?.[meal]||[]).forEach(id=>{const r=recs.find(x=>x.id===id);if(!r)return;r.ingredients.forEach(ing=>{const key=ing.name.toLowerCase().trim()+'||'+ing.unit;const qty=Number(ing.qty)||0;if(map[key])map[key].qty+=qty;else map[key]={name:ing.name,qty,unit:ing.unit};});});}));return Object.values(map).map(item=>({...item,qtyFinal:Math.ceil(item.qty*margin)})).sort((a,b)=>a.name.localeCompare(b.name));};
/* ─── INGREDIENT PARSER (versión mejorada) ──────────────────────────────── */
const ES_NUMS = { un:1,una:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,nueve:9,diez:10,media:0.5,medio:0.5,cuarto:0.25 };
const UNIT_MAP = {
  g:'g',gr:'g',gramo:'g',gramos:'g',
  kg:'kg',kilogramo:'kg',kilogramos:'kg',
  ml:'ml',mililitro:'ml',mililitros:'ml',
  l:'l',litro:'l',litros:'l',
  cucharada:'cucharada',cucharadas:'cucharada',
  cucharadita:'cucharadita',cucharaditas:'cucharadita',
  taza:'taza',tazas:'taza',
  unidad:'ud',unidades:'ud',pieza:'ud',piezas:'ud',ud:'ud',
  lata:'ud',bote:'ud',sobre:'ud',bolsa:'ud',
  ralladura:'ud',pizca:'ud',puñado:'ud',diente:'ud',dientes:'ud',
};
// Words to strip from names so matching is cleaner
const STRIP_WORDS = ['fresco','fresca','natural','crudo','cruda','cocido','cocida','hervido','hervida','asado','asada','picado','picada','troceado','grande','pequeño','pequeña','mediano','mediana'];

const parsePasted = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return lines.map((line, i) => {
    // Strip bullets: *, -, •, ·, numbers with . or )
    let raw = line.replace(/^[\*\-•·]\s*/, '').replace(/^\d+[\.\)]\s*/, '').trim();

    // Regex: optional_qty  optional_unit  optional_"de"  rest_of_name
    // Handles "125 g de harina de trigo", "2 huevos", "1 cucharada de aceite", "Ralladura de un limón"
    const rx = /^([\d]+(?:[.,]\d+)?|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|media|medio|cuarto)?\s*(g|gr|gramos?|kg|kilogramos?|ml|mililitros?|l|litros?|cucharadas?|cucharaditas?|tazas?|unidades?|piezas?|ud|lata|bote|sobre|bolsa|dientes?|pizcas?|puñados?|ralladuras?)\s*(?:de\s+)?(.+)$/i;
    const rx2 = /^([\d]+(?:[.,]\d+)?|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|media|medio|cuarto)\s+(?:de\s+)?(.+)$/i;

    let qty = 1, unit = 'g', name = raw;

    const m = raw.match(rx);
    const m2 = !m && raw.match(rx2);

    if (m) {
      const rawQ = m[1]; const rawU = m[2]; const rawN = m[3];
      if (rawQ) qty = (ES_NUMS[rawQ.toLowerCase()] ?? parseFloat(rawQ.replace(',', '.'))) || 1;
      if (rawU) unit = UNIT_MAP[rawU.toLowerCase()] || 'ud';
      if (rawN) name = rawN.trim();
    } else if (m2) {
      const rawQ = m2[1]; const rawN = m2[2];
      if (rawQ) qty = (ES_NUMS[rawQ.toLowerCase()] ?? parseFloat(rawQ.replace(',', '.'))) || 1;
      name = rawN.trim();
      // Guess unit from quantity
      unit = (qty <= 12) ? 'ud' : 'g';
    }

    // Clean name: remove trailing commas/periods, parenthetical notes, adjectives
    name = name
      .replace(/[,.]$/, '')
      .replace(/\s*\(.*?\)\s*$/, '')   // remove "(anisetes)", "(opcional)", etc.
      .trim();

    // Clean name for FOOD_DB lookup (strip descriptive adjectives)
    const searchName = STRIP_WORDS.reduce((n, w) => n.replace(new RegExp('\\b' + w + '\\b', 'i'), ''), name).trim();

    // Auto-lookup in FOOD_DB
    const matches = searchLocal(searchName);
    const best = matches[0];

    const unitW = { 'cucharada': 15, 'cucharadita': 5, 'taza': 240, 'kg': 1000, 'l': 1000, 'ml': 1, 'ud': 100, 'g': 1 }[unit] || 1;
    const factor = (qty * unitW) / 100;

    if (best) {
      return {
        id: Date.now() + i + Math.random(),
        name, qty, unit,
        kcal:  Math.round(best.kcal100  * factor),
        prot:  Math.round(best.prot100  * factor * 10) / 10,
        carbs: Math.round(best.carbs100 * factor * 10) / 10,
        fat:   Math.round(best.fat100   * factor * 10) / 10,
        _auto: true,
        _k100: best.kcal100, _p100: best.prot100, _c100: best.carbs100, _f100: best.fat100,
        _dbName: best.name,   // for the "matched as" indicator
      };
    }

    return {
      id: Date.now() + i + Math.random(),
      name, qty, unit,
      kcal:'', prot:'', carbs:'', fat:'',
      _auto: false,
      _k100: null, _p100: null, _c100: null, _f100: null,
    };
  });
};
const importURL=async(url)=>{const proxy='https://api.allorigins.win/get?url='+encodeURIComponent(url);const res=await fetch(proxy,{signal:AbortSignal.timeout(12000)});const data=await res.json();const html=data.contents||'';const ldBlocks=html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)||[];for(const block of ldBlocks){try{const inner=block.replace(/<script[^>]*>/i,'').replace(/<\/script>/i,'');const json=JSON.parse(inner);const schemas=Array.isArray(json)?json:[json];for(const s of schemas){const recipe=s['@type']==='Recipe'?s:s['@graph']?.find(x=>x['@type']==='Recipe');if(recipe?.recipeIngredient?.length){return{title:recipe.name||'',ingredients:recipe.recipeIngredient.map((line,i)=>({...parsePasted(line)[0],id:Date.now()+i+Math.random()}))};} }}catch{}}throw new Error('No se encontraron ingredientes. Pega la lista manualmente.');};

/* ─── DOWNLOAD ────────────────────────────────────────────────────────────── */
const dlData=(content,filename,mime)=>{const a=Object.assign(document.createElement('a'),{href:'data:'+mime+','+encodeURIComponent(content),download:filename});document.body.appendChild(a);a.click();setTimeout(()=>document.body.removeChild(a),100);};
const openPrintWindow=(html)=>{const win=window.open("","_blank","width=960,height=800");if(!win)return false;win.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>NutriPlanner Pro</title></head><body>'+html+'<scr'+'ipt>window.onload=function(){window.print();}</'+'script></body></html>');win.document.close();return true;};

/* ─── ESC HTML ────────────────────────────────────────────────────────────── */
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* ─── PDF: MENU + RECETAS (sin macros, con foto) ──────────────────────────── */
const buildMenuPDF=(week,recs,profile)=>{
  const menuRows=MEALS.map(meal=>'<tr><td class="ml">'+MICON[meal]+' '+meal+'</td>'+DAYS.map(day=>'<td>'+(week[day]?.[meal]||[]).map(id=>esc(recs.find(r=>r.id===id)?.name||'')).join('<br>')||'—'+'</td>').join('')+'</tr>').join('');

  // Unique recipes used in planner
  const usedIds=new Set();
  DAYS.forEach(d=>MEALS.forEach(m=>(week[d]?.[m]||[]).forEach(id=>usedIds.add(id))));
  const usedRecs=recs.filter(r=>usedIds.has(r.id));

  const recCards=usedRecs.map((rec)=>{
    const ingList=rec.ingredients.map(i=>`<li>${esc(i.name)}: ${i.qty} ${i.unit}</li>`).join('');
    const imgTag=rec.image?`<img src="${rec.image}" style="width:260px;height:200px;object-fit:cover;border-radius:8pt;float:right;margin:0 0 10pt 18pt;" />`:'';
    return `<div class="rcard">
      <div class="rhead">${esc(rec.name)}<span class="rport">${rec.portions} racion${rec.portions>1?'es':''}</span></div>
      ${imgTag}
      <div style="overflow:hidden">
        <h4 style="font-size:9pt;color:#3a5c3a;margin:0 0 5pt;font-family:Georgia,serif">Ingredientes:</h4>
        <ul style="margin:0 0 10pt 14pt;font-size:9pt;line-height:1.7">${ingList}</ul>
        ${rec.instructions?`<h4 style="font-size:9pt;color:#3a5c3a;margin:0 0 5pt;font-family:Georgia,serif">Elaboraci&oacute;n:</h4><p style="font-size:9pt;line-height:1.7;color:#333">${esc(rec.instructions)}</p>`:''}
      </div>
      <div style="clear:both"></div>
    </div>`;
  }).join('');

  // Cover page
  const coverHTML=profile.name||profile.clinic?`
    <div class="cover">
      ${profile.logo?`<img src="${profile.logo}" class="cover-logo"/>`:'<div class="cover-icon">🌿</div>'}
      <div class="cover-name">${esc(profile.name||profile.clinic)}</div>
      ${profile.clinic&&profile.name?`<div class="cover-clinic">${esc(profile.clinic)}</div>`:''}
      ${profile.tagline?`<div class="cover-tagline">${esc(profile.tagline)}</div>`:''}
      <div class="cover-title">Plan Nutricional Semanal</div>
      <div class="cover-date">${new Date().toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
      ${profile.email||profile.phone||profile.web?`<div class="cover-contact">${[profile.email,profile.phone,profile.web].filter(Boolean).join(' · ')}</div>`:''}
    </div><div class="page-break"></div>`
  :`<div class="cover cover-default">
    <div class="cover-icon">🌿</div>
    <div class="cover-title">Plan Nutricional Semanal</div>
    <div class="cover-date">${new Date().toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
  </div><div class="page-break"></div>`;

  return `<style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;font-size:9pt;color:#222}
    .cover{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:60pt;background:linear-gradient(160deg,#f8f4ed 60%,#e8f0e8 100%)}
    .cover-default{background:linear-gradient(160deg,#f8f4ed 60%,#e8f0e8 100%)}
    .cover-logo{max-height:120pt;max-width:260pt;object-fit:contain;margin-bottom:28pt}
    .cover-icon{font-size:60pt;margin-bottom:20pt}
    .cover-name{font-family:Georgia,serif;font-size:26pt;font-weight:700;color:#3a5c3a;margin-bottom:6pt}
    .cover-clinic{font-size:14pt;color:#5c7a5c;margin-bottom:4pt;font-style:italic}
    .cover-tagline{font-size:11pt;color:#888;margin-bottom:32pt;font-style:italic}
    .cover-title{font-family:Georgia,serif;font-size:18pt;color:#2a2a2a;margin-top:24pt;margin-bottom:12pt;border-top:2pt solid #5c7a5c;padding-top:20pt}
    .cover-date{font-size:10pt;color:#888;margin-bottom:16pt}
    .cover-contact{font-size:9pt;color:#aaa;margin-top:32pt;padding-top:12pt;border-top:1pt solid #ddd}
    .page-break{page-break-after:always}
    h2{font-size:11pt;color:#3a5c3a;margin:14pt 0 6pt;border-bottom:1.5pt solid #5c7a5c;padding-bottom:3pt;font-family:Georgia,serif}
    table{width:100%;border-collapse:collapse;margin-bottom:12pt;font-size:8pt}
    th{background:#3a5c3a;color:#fff;padding:4pt 5pt;text-align:left;font-size:8pt}
    td{padding:3pt 5pt;border:.5pt solid #ddd;vertical-align:top}
    tr:nth-child(even) td{background:#f7f7f5}
    .ml{background:#e8f0e8;font-weight:600;color:#3a5c3a;white-space:nowrap;font-size:8pt}
    .rcard{border:1pt solid #e0e0e0;border-radius:6pt;padding:14pt;margin-bottom:14pt;page-break-inside:avoid;background:#fff}
    .rhead{font-size:12pt;font-weight:700;color:#3a5c3a;margin-bottom:8pt;font-family:Georgia,serif;border-bottom:1pt solid #e8f0e8;padding-bottom:6pt}
    .rport{font-size:8pt;color:#888;font-weight:400;margin-left:8pt}
    @media print{@page{size:A4;margin:14mm}body{font-size:9pt}.cover{min-height:auto;height:calc(297mm - 28mm)}}
  </style>
  ${coverHTML}
  <h2>📅 Menú Semanal</h2>
  <table><thead><tr><th>Comida</th>${DAYS.map(d=>'<th>'+d+'</th>').join('')}</tr></thead>
  <tbody>${menuRows}</tbody></table>
  <div class="page-break"></div>
  <h2>🍽️ Recetas</h2>
  ${recCards||'<p style="color:#888;font-style:italic">No hay recetas asignadas al menú.</p>'}`;
};

/* ─── PDF: LISTA DE COMPRA (documento separado) ───────────────────────────── */
const buildShopPDF=(shopList,margin,week,recs,profile)=>{
  const rows=shopList.map(item=>`
    <tr>
      <td class="check"><div class="cb"></div></td>
      <td class="iname">${esc(item.name)}</td>
      <td class="qty">${item.qtyFinal} <span class="unit">${item.unit}</span></td>
      ${margin?`<td class="base">(base: ${Math.round(item.qty)} ${item.unit})</td>`:'<td></td>'}
    </tr>`).join('');

  const profHeader=profile.name||profile.clinic?`<div class="prof">${esc(profile.name||profile.clinic)}</div>`:'';

  return `<style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;background:#fff;color:#222;padding:20pt 24pt}
    .header{border-bottom:3pt solid #3a5c3a;padding-bottom:14pt;margin-bottom:18pt;display:flex;align-items:center;justify-content:space-between}
    .header h1{font-family:Georgia,serif;font-size:20pt;color:#3a5c3a}
    .header .sub{font-size:9pt;color:#888;margin-top:3pt}
    .prof{font-size:9pt;color:#5c7a5c;font-weight:600;text-align:right}
    .date{font-size:8pt;color:#aaa;text-align:right}
    .note{background:#f0f6f0;border-left:3pt solid #5c7a5c;padding:8pt 12pt;font-size:8.5pt;color:#555;margin-bottom:14pt;border-radius:0 4pt 4pt 0}
    table{width:100%;border-collapse:collapse;font-size:10pt}
    tr{border-bottom:1pt solid #eee}
    tr:last-child{border-bottom:2pt solid #5c7a5c}
    td{padding:7pt 6pt;vertical-align:middle}
    .check{width:22pt}.cb{width:14pt;height:14pt;border:1.5pt solid #bbb;border-radius:3pt;display:inline-block}
    .iname{font-size:11pt;font-weight:500;color:#222}
    .qty{font-size:12pt;font-weight:700;color:#3a5c3a;text-align:right;white-space:nowrap}
    .unit{font-size:9pt;font-weight:400;color:#888}
    .base{font-size:8pt;color:#bbb;text-align:right;white-space:nowrap;width:80pt}
    tr:nth-child(even) td{background:#fafaf8}
    .footer{margin-top:18pt;font-size:8pt;color:#bbb;text-align:center;border-top:1pt solid #eee;padding-top:10pt}
    @media print{@page{size:A4;margin:16mm}}
  </style>
  <div class="header">
    <div>
      <h1>🛒 Lista de Compra</h1>
      <div class="sub">${shopList.length} ingredientes · ${margin?'Con +20% de margen':'Sin margen extra'}</div>
    </div>
    <div>${profHeader}<div class="date">${new Date().toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div></div>
  </div>
  <div class="note">Generada automáticamente a partir del menú semanal planificado.${margin?' Se ha aplicado un <strong>20% extra</strong> de margen de seguridad.':''}</div>
  <table>
    <thead><tr style="border-bottom:2pt solid #3a5c3a"><th style="width:22pt"></th><th style="text-align:left;font-size:9pt;color:#3a5c3a;padding:6pt">Ingrediente</th><th style="text-align:right;font-size:9pt;color:#3a5c3a;padding:6pt">Cantidad</th><th style="text-align:right;font-size:9pt;color:#bbb;padding:6pt">${margin?'Base':''}</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">NutriPlanner Pro · Generado el ${new Date().toLocaleDateString('es-ES')}</div>`;
};

/* ─── CSV ─────────────────────────────────────────────────────────────────── */
const buildCSV=(week,recs,shopList)=>{const wt=weekM(week,recs);const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const rows=[];rows.push(['NUTRIPLANNER PRO']);rows.push(['Generado: '+new Date().toLocaleDateString('es-ES')]);rows.push([]);rows.push(['MENU SEMANAL',...DAYS]);MEALS.forEach(meal=>rows.push([MICON[meal]+' '+meal,...DAYS.map(day=>(week[day]?.[meal]||[]).map(id=>recs.find(r=>r.id===id)?.name||'').join(' + ')||'')]));rows.push([]);rows.push(['RECETAS','Categoria','Origen','Dificultad','Raciones','Kcal/racion','Prot','HC','Grasa']);recs.forEach(rec=>{const t=sumM(rec.ingredients);const p=perP(t,rec.portions);rows.push([rec.name,rec.categoria||'',rec.origen||'',rec.dificultad||'',rec.portions,p.kcal,p.prot,p.carbs,p.fat]);});rows.push([]);rows.push(['LISTA DE COMPRA (+20% margen)','Cantidad','Unidad','Base']);shopList.forEach(item=>rows.push([item.name,item.qtyFinal,item.unit,Math.round(item.qty)]));return rows.map(r=>r.map(q).join(',')).join('\n');};

/* ─── TOAST ───────────────────────────────────────────────────────────────── */
function Toast({msg,type,onHide}){useEffect(()=>{const t=setTimeout(onHide,3400);return()=>clearTimeout(t);},[]);return<div className={`toast ${type}`}>{{success:"✅",error:"❌",info:"ℹ️"}[type]} {msg}</div>;}

/* ─── BARCODE SCANNER ─────────────────────────────────────────────────────── */
function BarcodeScanner({onDetect,onClose}){const vidRef=useRef(null);const doneRef=useRef(false);const[msg,setMsg]=useState("Iniciando camara...");const[err,setErr]=useState(null);useEffect(()=>{let stream=null,raf=null,det=null;const tick=async()=>{if(doneRef.current||!vidRef.current)return;try{const found=await det.detect(vidRef.current);if(found.length&&!doneRef.current){doneRef.current=true;if(stream)stream.getTracks().forEach(t=>t.stop());setTimeout(()=>onDetect(found[0].rawValue),350);return;}}catch{}raf=requestAnimationFrame(tick);};(async()=>{if(!("BarcodeDetector"in window)){setErr("BarcodeDetector no disponible.\nUsa Chrome 83+ o Edge 83+.");return;}try{const fmts=await BarcodeDetector.getSupportedFormats();const want=["ean_13","ean_8","upc_a","upc_e","code_128"].filter(f=>fmts.includes(f));det=new BarcodeDetector({formats:want.length?want:["ean_13"]});stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}}});vidRef.current.srcObject=stream;await vidRef.current.play();setMsg("Apunta al codigo de barras");raf=requestAnimationFrame(tick);}catch(e){setErr(e.name==="NotAllowedError"?"Permiso de camara denegado.":"Error: "+e.message);}})();return()=>{if(stream)stream.getTracks().forEach(t=>t.stop());if(raf)cancelAnimationFrame(raf);};},[]);return(<div className="sc-bg" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="sc-box"><button className="sc-x" onClick={onClose}>✕</button><video ref={vidRef} className="sc-vid" playsInline muted/>{!err&&<div className="sc-aim"><div className="sc-frame"><div className="sc-line"/></div></div>}</div><div className="sc-cap">{err?<span style={{whiteSpace:"pre-line",color:"#ff9999",fontSize:12}}>{err}</span>:<span>{msg}</span>}</div><button className="btn btn-g" style={{color:"rgba(255,255,255,.65)",marginTop:4}} onClick={onClose}>Cancelar</button></div>);}

/* ─── FOOD SEARCH ─────────────────────────────────────────────────────────── */
function FoodSearch({onSelect,onClose}){const[q,setQ]=useState("");const[results,setRes]=useState([]);const[scanOn,setScan]=useState(false);const[status,setSt]=useState("Escribe el nombre de un alimento");const[scMsg,setScMsg]=useState("");const[scLoad,setScLd]=useState(false);const timer=useRef(null);
const doSearch=async query=>{
  if(!query||query.length<2){setRes([]);setSt("Escribe al menos 2 letras");return;}
  setScLd(true);
  const foundLocal=searchLocal(query);
  let best=[...foundLocal];
  setRes(best);
  try{
    const r=await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=15`);
    const d=await r.json();
    if(d.products){
      const off=d.products.map(p=>{
        const n=p.nutriments||{}; const k=n["energy-kcal_100g"]||(n.energy_100g?n.energy_100g/4.184:0);
        if(k<=0)return null;
        return{name:(p.product_name_es||p.product_name||p.brands||"Producto").trim(),kcal100:Math.round(k),prot100:Math.round((n.proteins_100g||0)*10)/10,carbs100:Math.round((n.carbohydrates_100g||0)*10)/10,fat100:Math.round((n.fat_100g||0)*10)/10,_off:true};
      }).filter(Boolean);
      const seen=new Set(best.map(x=>x.name.toLowerCase()));
      off.forEach(i=>{if(!seen.has(i.name.toLowerCase())){best.push(i);seen.add(i.name.toLowerCase());}});
    }
  }catch(e){}
  setRes(best);setSt(best.length?best.length+" resultado(s):":"Sin resultados.");setScLd(false);
};
  const handleInput=v=>{setQ(v);clearTimeout(timer.current);timer.current=setTimeout(()=>doSearch(v),400);};
  const handleBarcode=async code=>{if(!code)return;setScan(false);setScLd(true);setScMsg("Buscando "+code+"...");try{const r=await fetch("https://world.openfoodfacts.org/api/v2/product/"+code+".json?fields=product_name,nutriments");const d=await r.json();if(d.status===1&&d.product){const n=d.product.nutriments||{};const kcal=n["energy-kcal_100g"]||(n.energy_100g?n.energy_100g/4.184:0);if(kcal>0){const food={name:(d.product.product_name||"Producto").trim(),kcal100:Math.round(kcal),prot100:Math.round((n.proteins_100g||0)*10)/10,carbs100:Math.round((n.carbohydrates_100g||0)*10)/10,fat100:Math.round((n.fat_100g||0)*10)/10};setRes([food]);setQ(food.name);setScMsg("Producto encontrado");setSt("Clic para seleccionar:");}else setScMsg("Sin datos nutricionales.");}else setScMsg("Codigo no encontrado.");}catch{setScMsg("Sin conexion. Busca por nombre.");}setScLd(false);};
  const [bcode, setBcode] = useState("");
  return(<>{scanOn&&<BarcodeScanner onDetect={handleBarcode} onClose={()=>setScan(false)}/>}<div className="sp" onClick={e=>e.stopPropagation()}><div className="f g8 ac mb16" style={{flexWrap:"wrap"}}><input className="fi" autoFocus style={{flex:1,minWidth:140,padding:"8px 12px",fontSize:13}} placeholder="Buscar alimento (ej: Garbanzos)..." value={q} onChange={e=>handleInput(e.target.value)}/><div style={{display:"flex",gap:4}}><input className="fi" style={{width: 130, padding:"8px 12px", fontSize:13}} placeholder="Cód. Barras" value={bcode} onChange={e=>setBcode(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")handleBarcode(bcode);}}/><button className="btn btn-o btn-sm" onClick={()=>handleBarcode(bcode)}>🔍 Cód.</button></div><button className="btn btn-i btn-sm" onClick={()=>setScan(true)}>📷 Escanear</button><a href="https://es.openfoodfacts.org" target="_blank" rel="noreferrer" className="btn btn-i btn-sm" style={{textDecoration:"none",display:"inline-flex",alignItems:"center"}}>🌐 Ir a web OpenFood</a><button className="btn btn-g btn-sm" onClick={onClose}>✕ Cerrar</button></div>{scMsg&&<p style={{fontSize:12,fontWeight:600,marginBottom:8,color:"var(--sage-dk)"}}>{scMsg}</p>}{scLoad&&<div className="f ac g8 ts tm"><div className="sp2 sp2-dk"/>Buscando...</div>}<p style={{fontSize:11,color:"var(--mid)",marginBottom:6}}>{status}</p>{results.length>0&&<div className="fl-list">{results.map((f,i)=><div key={i} className="fl-item" onClick={()=>onSelect(f)}><div style={{flex:1}}><div className="fl-name">{f.name}{f._off&&<span style={{fontSize:9,color:"#fff",background:"var(--terra)",padding:"2px 6px",borderRadius:10,marginLeft:8}}>OpenFoodFacts</span>}</div><div style={{fontSize:10,color:"var(--mid)"}}>por 100g</div></div><div className="fl-macros"><span><b>{f.kcal100}</b>kcal</span><span><b>{f.prot100}g</b>P</span><span><b>{f.carbs100}g</b>HC</span><span><b>{f.fat100}g</b>G</span></div></div>)}</div>}</div></>);

/* ─── ING ROW (con autocompletado inline) ───────────────────────────────── */
const blankIng=()=>({id:Date.now()+Math.random(),name:"",qty:"",unit:"g",kcal:"",prot:"",carbs:"",fat:"",_auto:false,_k100:null,_p100:null,_c100:null,_f100:null});

function IngRow({ing,idx,onChange,onRemove}){
  const [open, setOpen] = useState(false);          // full FoodSearch panel
  const [flash, setFlash] = useState(false);
  const [sugg, setSugg] = useState([]);              // inline suggestions
  const [showSugg, setShowSugg] = useState(false);
  const [acIdx, setAcIdx] = useState(-1);            // keyboard nav
  const blurTimer = useRef(null);

  const set = (k,v) => onChange(idx, k, v);

  const handleQty = v => {
    set("qty", v);
    if (ing._k100 != null) onChange(idx, "__recalc", {qty: Number(v)||0, unit: ing.unit});
  };

  const handleSelect = food => {
    setOpen(false);
    const qty = Number(ing.qty) || 100;
    onChange(idx, "__fill", { food, qty, unitForm: ing.unit });
    setFlash(true); setTimeout(() => setFlash(false), 900);
  };

  // Inline autocomplete on name change
  const handleNameChange = v => {
    set("name", v);
    if (v.length >= 2) {
      const found = searchLocal(v);
      setSugg(found.slice(0, 6));
      setShowSugg(found.length > 0);
      setAcIdx(-1);
    } else {
      setSugg([]); setShowSugg(false);
    }
  };

  const pickSugg = (food) => {
    setShowSugg(false); setSugg([]);
    const qty = Number(ing.qty) || 100;
    onChange(idx, "__fill", { food, qty, unitForm: ing.unit });
    setFlash(true); setTimeout(() => setFlash(false), 900);
  };

  const handleKeyDown = e => {
    if (!showSugg) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setAcIdx(i => Math.min(i+1, sugg.length-1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setAcIdx(i => Math.max(i-1, -1)); }
    else if (e.key === "Enter" && acIdx >= 0) { e.preventDefault(); pickSugg(sugg[acIdx]); }
    else if (e.key === "Escape") { setShowSugg(false); }
  };

  const onBlur = () => { blurTimer.current = setTimeout(() => setShowSugg(false), 150); };
  const onFocus = () => { clearTimeout(blurTimer.current); if (ing.name.length >= 2 && sugg.length) setShowSugg(true); };

  return (
    <>
      {open && (
        <tr><td colSpan={9} style={{padding:"4px 0 10px"}}>
          <FoodSearch onSelect={handleSelect} onClose={()=>setOpen(false)}/>
        </td></tr>
      )}
      <tr className={flash ? "flash-row" : ""}>
        <td style={{minWidth:180, position:"relative"}}>
          <div className="f g8 ac">
            <div className="ac-wrap">
              <input
                className={"ii" + (ing._auto ? " auto" : "")}
                style={{width:"100%"}}
                value={ing.name}
                placeholder="Ingrediente"
                onChange={e => handleNameChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              {showSugg && sugg.length > 0 && (
                <div className="ac-drop">
                  {sugg.map((f, si) => (
                    <div
                      key={si}
                      className={"ac-item" + (acIdx === si ? " active" : "")}
                      onMouseDown={e => { e.preventDefault(); pickSugg(f); }}
                    >
                      <div className="ac-name">{f.name}</div>
                      <div className="ac-macros">
                        <span><b>{f.kcal100}</b>kcal</span>
                        <span><b>{f.prot100}g</b>P</span>
                        <span><b>{f.carbs100}g</b>HC</span>
                        <span><b>{f.fat100}g</b>G</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setOpen(o => !o)}
              style={{background:open?"var(--sage-dk)":"var(--info)",color:"#fff",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer",fontSize:11,flexShrink:0,fontWeight:700}}
              title="Búsqueda avanzada + escáner"
            >{open ? "✕" : "🔍"}</button>
          </div>
          {ing._dbName && !showSugg && (
            <div style={{fontSize:9,color:"var(--sage-dk)",marginTop:2,paddingLeft:2}}>
              ✓ {ing._dbName}
            </div>
          )}
        </td>
        <td style={{width:"auto",minWidth:70}}>
          <input className="ii" type="number" value={ing.qty} placeholder="100" onChange={e=>handleQty(e.target.value)}/>
        </td>
        <td style={{width:"auto",minWidth:85}}>
          <select className="ii" value={ing.unit} onChange={e=>{
            set("unit",e.target.value);
            if(ing._k100!=null)onChange(idx,"__recalc",{qty:Number(ing.qty)||0,unit:e.target.value});
          }}>
            <option value="g">g</option>
            <option value="ml">ml</option>
            <option value="ud">ud</option>
            <option value="cucharada">cuch.</option>
            <option value="cucharadita">cuch.ta</option>
            <option value="taza">taza</option>
            <option value="kg">kg</option>
            <option value="l">l</option>
          </select>
        </td>
        {["kcal","prot","carbs","fat"].map(k=>(
          <td key={k} style={{width:"auto",minWidth:70}}>
            <input className={"ii"+(ing._auto?" auto":"")} type="number" value={ing[k]} placeholder="0"
              style={{width:"100%"}}
              onChange={e=>{set(k,e.target.value);set("_auto",false);set("_k100",null);}}/>
          </td>
        ))}
        <td style={{width:26,textAlign:"center"}}>
          {ing._auto
            ? <span style={{fontSize:13,color:"var(--sage-dk)"}} title="Macros calculados automáticamente">✓</span>
            : <span style={{color:"#ddd"}}>—</span>}
        </td>
        <td style={{width:28}}>
          <button style={{background:"none",border:"none",color:"var(--danger)",cursor:"pointer",fontSize:13,padding:"3px"}} onClick={()=>onRemove(idx)}>🗑</button>
        </td>
      </tr>
    </>
  );
}

/* ─── IMAGE UPLOAD ────────────────────────────────────────────────────────── */
function ImgUpload({value,onChange,label="Imagen del plato"}){
  const ref=useRef();
  const handleFile=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=ev=>onChange(ev.target.result);r.readAsDataURL(file);};
  return(<div className="fg">
    <label className="fl">{label}</label>
    <div className={"img-upload-box"+(value?" has-img":"")} onClick={()=>ref.current.click()}>
      {value?<><img src={value} alt="preview"/><div className="overlay" style={{color:"#fff",flexDirection:"column",gap:6,fontSize:13,fontWeight:600}}><span style={{fontSize:22}}>📷</span>Cambiar imagen</div></>
      :<div style={{padding:"20px 0",color:"var(--mid)"}}><div style={{fontSize:32,marginBottom:8}}>📷</div><div style={{fontWeight:600,fontSize:13,marginBottom:4}}>Clic para subir imagen</div><div style={{fontSize:11}}>JPG, PNG — se incluirá en el PDF</div></div>}
    </div>
    <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/>
    {value&&<button className="btn btn-g btn-xs" style={{alignSelf:"flex-start"}} onClick={e=>{e.stopPropagation();onChange("");}}>✕ Quitar imagen</button>}
  </div>);}

/* ─── RECIPE FORM ─────────────────────────────────────────────────────────── */
function RecipeForm({recipe,onSave,onClose,showToast}){
  const[form,setForm]=useState(()=>{
    if(recipe) return {...recipe,ingredients:recipe.ingredients.map(i=>({...blankIng(),...i}))};
    const draft = localStorage.getItem("recipe_draft_v2");
    if(draft){ try { return JSON.parse(draft); } catch(e){} }
    return {name:"",portions:1,categoria:"",origen:"",dificultad:"",instructions:"",image:"",ingredients:[blankIng()]}
  });
  const[ingMode,setIngMode]=useState("search"); // "search" | "paste"
  const[pasteText,setPasteText]=useState("");

  useEffect(() => {
    if (!recipe) localStorage.setItem("recipe_draft_v2", JSON.stringify(form));
  }, [form, recipe]);

  const sf=(k,v)=>setForm(f=>({...f,[k]:v}));

  const onChange=(idx,key,val)=>{setForm(f=>{
    const ings=[...f.ingredients];
    if(key==="__fill"){
      const{food,qty,unitForm}=val; const unit = unitForm || ings[idx].unit || "g";
      const wt = { 'cucharada': 15, 'cucharadita': 5, 'taza': 240, 'kg': 1000, 'l': 1000, 'ml': 1, 'ud': 100, 'g': 1 }[unit] || 1;
      const r=(qty*wt)/100;
      ings[idx]={...ings[idx],name:food.name,qty,unit,
        kcal:Math.round(food.kcal100*r),
        prot:Math.round((food.prot100*r)*10)/10,
        carbs:Math.round((food.carbs100*r)*10)/10,
        fat:Math.round((food.fat100*r)*10)/10,
        _auto:true,_k100:food.kcal100,_p100:food.prot100,_c100:food.carbs100,_f100:food.fat100,
        _dbName:food.name};
    } else if(key==="__recalc"){
      const qt=val.qty; const un=val.unit; if(ings[idx]._k100==null)return f;
      const wt = { 'cucharada': 15, 'cucharadita': 5, 'taza': 240, 'kg': 1000, 'l': 1000, 'ml': 1, 'ud': 100, 'g': 1 }[un] || 1;
      const r=(qt*wt)/100;
      ings[idx]={...ings[idx],qty:qt,unit:un,
        kcal:Math.round(ings[idx]._k100*r),
        prot:Math.round((ings[idx]._p100*r)*10)/10,
        carbs:Math.round((ings[idx]._c100*r)*10)/10,
        fat:Math.round((ings[idx]._f100*r)*10)/10};
    } else {
      ings[idx]={...ings[idx],[key]:val};
    }
    return{...f,ingredients:ings};
  });};

  // Live parse preview from paste text
  const pastePreview = useMemo(() => {
    if (!pasteText.trim()) return [];
    return parsePasted(pasteText);
  }, [pasteText]);

  const matchedCount = pastePreview.filter(p=>p._auto).length;
  const unmatchedCount = pastePreview.length - matchedCount;

  const applyPaste = () => {
    if (!pastePreview.length) return;
    setForm(f=>({...f, ingredients:[...f.ingredients.filter(i=>i.name.trim()), ...pastePreview]}));
    setPasteText("");
    setIngMode("search");
    showToast(`${pastePreview.length} ingredientes añadidos · ${matchedCount} con macros ✓`);
  };

  const totals=sumM(form.ingredients.map(i=>({kcal:+i.kcal||0,prot:+i.prot||0,carbs:+i.carbs||0,fat:+i.fat||0})));
  const por=perP(totals,+form.portions||1);
  const save=()=>{if(!form.name.trim())return showToast("Añade un nombre","error");onSave({...form,id:form.id||Date.now(),portions:+form.portions||1});if(!recipe)localStorage.removeItem("recipe_draft_v2");};
  const saveDraft=()=>{onSave({...form,id:form.id||Date.now(),name:form.name.trim()||"Receta Borrador",portions:+form.portions||1,categoria:form.categoria||"Dieta estándar"});if(!recipe)localStorage.removeItem("recipe_draft_v2");};

  return(
    <div className="mb" onClick={e=>e.stopPropagation()}>
    <div className="mo" onClick={e=>e.stopPropagation()}>
      <div className="mo-hd"><h3>{recipe?"✏️ Editar receta":"✨ Nueva receta"}</h3><button className="mo-x" title="Cerrar sin guardar" onClick={onClose}>✕</button></div>

      <div className="f2 mb20">
        <div>
          <div className="fg" style={{marginBottom:12}}><label className="fl">Nombre *</label>
            <input className="fi" value={form.name} onChange={e=>sf("name",e.target.value)} placeholder="Nombre de la receta"/>
          </div>
          <div className="f3">
            <div className="fg"><label className="fl">Raciones</label><input className="fi" type="number" min="1" value={form.portions} onChange={e=>sf("portions",e.target.value)}/></div>
            <div className="fg"><label className="fl">Tipo de dieta</label><select className="fs" value={form.categoria||""} onChange={e=>sf("categoria",e.target.value)}><option value="">— Elegir —</option>{DIETS.map(d=><option key={d}>{d}</option>)}</select></div>
            <div className="fg"><label className="fl">Dificultad</label><select className="fs" value={form.dificultad||""} onChange={e=>sf("dificultad",e.target.value)}><option value="">— Elegir —</option>{DIFFS.map(d=><option key={d}>{d}</option>)}</select></div>
          </div>
          <div className="fg"><label className="fl">Origen culinario</label><select className="fs" style={{maxWidth:240}} value={form.origen||""} onChange={e=>sf("origen",e.target.value)}><option value="">— Elegir —</option>{ORIGINS.map(o=><option key={o}>{o}</option>)}</select></div>
        </div>
        <ImgUpload value={form.image} onChange={v=>sf("image",v)}/>
      </div>

      {/* ── Ingredient mode tabs (2 tabs only) ── */}
      <div className="f ac jb mb16">
        <h4 style={{fontSize:14}}>🥕 Ingredientes</h4>
        <div style={{fontSize:11,color:"var(--mid)"}}>
          {form.ingredients.filter(i=>i.name.trim()).length} ingrediente(s) · {Math.round(totals.kcal)} kcal totales
        </div>
      </div>
      <div className="mode-tabs" style={{maxWidth:360}}>
        <button className={"mode-tab"+(ingMode==="search"?" active":"")} onClick={()=>setIngMode("search")}>✏️ Uno a uno</button>
        <button className={"mode-tab"+(ingMode==="paste"?" active":"")} onClick={()=>setIngMode("paste")}>📋 Pegar lista</button>
      </div>

      {/* ── PASTE MODE ── */}
      {ingMode==="paste" && (
        <div style={{marginBottom:20,background:"var(--cream)",borderRadius:"var(--rs)",padding:16}}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--char)",marginBottom:8}}>
            📋 Pega tu lista de ingredientes
          </div>
          <div style={{fontSize:11,color:"var(--mid)",marginBottom:10,lineHeight:1.7}}>
            Acepta cualquier formato: <code style={{background:"#fff",padding:"1px 5px",borderRadius:4}}>125 g de harina</code> · <code style={{background:"#fff",padding:"1px 5px",borderRadius:4}}>* 2 huevos</code> · <code style={{background:"#fff",padding:"1px 5px",borderRadius:4}}>1 cucharada de aceite</code><br/>
            Los macros se rellenan automáticamente si el alimento está en nuestra base de datos.
          </div>
          <textarea
            className="fta"
            style={{minHeight:120,fontFamily:"monospace",fontSize:12,marginBottom:10}}
            value={pasteText}
            onChange={e=>setPasteText(e.target.value)}
            placeholder={"125 g de harina de trigo\n* 1 huevo\n* 10 g de semillas de matalauva\n* 35 ml de licor de anís\n* 25 g de manteca de cerdo\n* 60 g de azúcar\n* Ralladura de un limón"}
            autoFocus
          />

          {/* Live preview */}
          {pastePreview.length > 0 && (
            <>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8,fontSize:11,flexWrap:"wrap"}}>
                <span style={{fontWeight:700,color:"var(--char)"}}>Vista previa — {pastePreview.length} ingrediente(s)</span>
                {matchedCount > 0 && <span style={{color:"var(--sage-dk)",fontWeight:600}}>✓ {matchedCount} con macros</span>}
                {unmatchedCount > 0 && <span style={{color:"var(--terra)",fontWeight:600}}>⚠ {unmatchedCount} sin datos (añade manualmente)</span>}
              </div>
              <div className="paste-preview">
                {pastePreview.map((p,i) => (
                  <div key={i} className={"paste-prev-row " + (p._auto ? "matched" : "unmatched")}>
                    <div className={"paste-dot " + (p._auto ? "ok" : "warn")}/>
                    <span className="paste-ing-name">{p.name}</span>
                    <span className="paste-ing-qty">{p.qty} {p.unit}</span>
                    {p._auto
                      ? <span className="paste-ing-db">↳ {p._dbName} · {p.kcal}kcal</span>
                      : <span style={{fontSize:10,color:"var(--terra)",marginLeft:"auto",fontStyle:"italic"}}>sin datos</span>}
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="f g8" style={{marginTop:12}}>
            <button className="btn btn-p btn-sm" disabled={!pastePreview.length} onClick={applyPaste}>
              ✓ Añadir {pastePreview.length > 0 ? pastePreview.length + " ingredientes" : ""}
            </button>
            <button className="btn btn-g btn-sm" onClick={()=>{setPasteText("");setIngMode("search");}}>Cancelar</button>
          </div>
        </div>
      )}

      {/* ── Ingredients table (always visible) ── */}
      <div style={{overflowX:"auto",marginTop:ingMode==="paste"?0:8}}>
        <table className="it" style={{minWidth:680}}>
          <thead>
            <tr>
              <th>Ingrediente <span style={{fontWeight:400,color:"var(--sage-lt)",fontSize:9}}>↓ escribe para buscar</span></th>
              <th>Cant.</th><th>Unidad</th><th>Kcal</th><th>Prot(g)</th><th>HC(g)</th><th>Grasa(g)</th>
              <th style={{fontSize:9}}>BD</th><th></th>
            </tr>
          </thead>
          <tbody>
            {form.ingredients.map((ing,i)=>(
              <IngRow key={ing.id} ing={ing} idx={i} onChange={onChange}
                onRemove={i=>setForm(f=>({...f,ingredients:f.ingredients.filter((_,j)=>j!==i)}))}/>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>Total receta</td>
              <td>{Math.round(totals.kcal)} kcal</td><td>{Math.round(totals.prot)}g</td>
              <td>{Math.round(totals.carbs)}g</td><td>{Math.round(totals.fat)}g</td><td colSpan={2}></td>
            </tr>
            <tr>
              <td colSpan={3} style={{color:"var(--mid)",fontWeight:500}}>Por ración</td>
              <td style={{color:"var(--mid)"}}>{por.kcal} kcal</td>
              <td style={{color:"var(--mid)"}}>{por.prot}g</td>
              <td style={{color:"var(--mid)"}}>{por.carbs}g</td>
              <td style={{color:"var(--mid)"}}>{por.fat}g</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <button className="btn btn-o btn-sm mt10" onClick={()=>setForm(f=>({...f,ingredients:[...f.ingredients,blankIng()]}))}>+ Añadir fila</button>

      <div className="div"/>
      <div className="fg">
        <label className="fl">Elaboración / Instrucciones</label>
        <textarea className="fta" style={{minHeight:100}} value={form.instructions} onChange={e=>sf("instructions",e.target.value)} placeholder="Describe los pasos de preparación..."/>
      </div>
      <div className="f g8" style={{justifyContent:"space-between", flexWrap: "wrap", marginTop: 16}}>
        <button className="btn btn-i" onClick={()=>{saveDraft();showToast("Guardado como borrador");onClose();}}>📦 Guardar como Borrador</button>
        <div className="f g8">
          <button className="btn btn-g" onClick={onClose}>Cancelar</button>
          <button className="btn btn-p" onClick={save}>💾 Guardar receta final</button>
        </div>
      </div>
    </div>
    </div>
  );
}

/* ─── RECIPE DETAIL ───────────────────────────────────────────────────────── */
function RecipeDetail({recipe,onClose,onEdit,onDelete}){
  const t=sumM(recipe.ingredients);const p=perP(t,recipe.portions);
  const MC=({label,v,u="g"})=><div className="mc"><span className="val">{v}</span><span className="lbl">{u==="kcal"?"kcal":label+"(g)"}</span></div>;
  return(<div className="mb" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="mo" style={{maxWidth:720}}>
    <div className="mo-hd"><h3>{recipe.name}</h3><button className="mo-x" onClick={onClose}>✕</button></div>
    {recipe.image&&<img src={recipe.image} alt={recipe.name} style={{width:"100%",height:240,objectFit:"cover",borderRadius:"var(--rs)",marginBottom:18}}/>}
    <div className="f g8 ac mb16" style={{flexWrap:"wrap"}}>
      <span className="badge bg">🍽 {recipe.portions} {recipe.portions===1?"ración":"raciones"}</span>
      <CatBadge cat={recipe.categoria} type="diet"/><CatBadge cat={recipe.origen} type="origin"/><CatBadge cat={recipe.dificultad} type="diff"/>
    </div>
    <div className="f2">
      <div>
        <h4 className="st">Ingredientes</h4>
        <ul style={{paddingLeft:18,lineHeight:1.9,fontSize:13}}>
          {recipe.ingredients.map((ing,i)=><li key={i}><b>{ing.name}</b>: {ing.qty} {ing.unit}</li>)}
        </ul>
      </div>
      <div>
        <h4 className="st">Macros por ración</h4>
        <div className="mg mb16"><MC label="Calorías" v={p.kcal} u="kcal"/><MC label="Proteínas" v={p.prot}/><MC label="HC" v={p.carbs}/><MC label="Grasas" v={p.fat}/></div>
        <h4 className="st">Totales</h4>
        <div className="mg"><MC label="Calorías" v={Math.round(t.kcal)} u="kcal"/><MC label="Proteínas" v={Math.round(t.prot)}/><MC label="HC" v={Math.round(t.carbs)}/><MC label="Grasas" v={Math.round(t.fat)}/></div>
      </div>
    </div>
    {recipe.instructions&&<><div className="div"/><h4 className="st">Elaboración</h4><p style={{fontSize:13,color:"var(--mid)",lineHeight:1.8}}>{recipe.instructions}</p></>}
    <div className="f g8 mt10" style={{justifyContent:"flex-end"}}><button className="btn btn-d btn-sm" onClick={()=>{onDelete(recipe.id);onClose();}}>🗑 Eliminar</button><button className="btn btn-o btn-sm" onClick={()=>{onEdit(recipe);onClose();}}>✏️ Editar</button></div>
  </div></div>);}

/* ─── RECIPES VIEW ────────────────────────────────────────────────────────── */
function RecipesView({recipes,onAdd,onUpdate,onDelete,showToast}){
  const[form,setForm]=useState(false);const[edit,setEdit]=useState(null);const[view,setView]=useState(null);
  const[q,setQ]=useState("");const[fDiet,setFDiet]=useState("");const[fDiff,setFDiff]=useState("");
  const filtered=recipes.filter(r=>{if(q&&!r.name.toLowerCase().includes(q.toLowerCase()))return false;if(fDiet&&r.categoria!==fDiet)return false;if(fDiff&&r.dificultad!==fDiff)return false;return true;});
  const FC=({label,val,set,cur})=><button className={"filter-chip"+(cur===val?" on":"")} onClick={()=>set(cur===val?"":val)}>{label}</button>;
  return(<div>
    <div className="ph f ac jb"><div><h2>Mis Recetas</h2><p>{recipes.length} recetas guardadas</p></div><button className="btn btn-p" onClick={()=>setForm(true)}>+ Nueva receta</button></div>
    <div className="filter-bar"><input className="fi" style={{maxWidth:220}} placeholder="🔍 Buscar..." value={q} onChange={e=>setQ(e.target.value)}/><span style={{fontSize:11,color:"var(--mid)",fontWeight:600}}>Dieta:</span>{DIETS.slice(0,5).map(d=><FC key={d} label={d} val={d} set={setFDiet} cur={fDiet}/>)}<span style={{fontSize:11,color:"var(--mid)",fontWeight:600,marginLeft:4}}>Dificultad:</span>{DIFFS.map(d=><FC key={d} label={d} val={d} set={setFDiff} cur={fDiff}/>)}</div>
    {filtered.length===0?<div className="es"><div className="ei">📋</div><p>{q||fDiet||fDiff?"Sin resultados":"¡Añade tu primera receta!"}</p>{!q&&!fDiet&&!fDiff&&<button className="btn btn-p" style={{marginTop:14}} onClick={()=>setForm(true)}>+ Nueva receta</button>}</div>
    :<div className="rg">{filtered.map(rec=>{const t=sumM(rec.ingredients);const p=perP(t,rec.portions);return(<div className="rc" key={rec.id} onClick={()=>setView(rec)}>
        {rec.image?<img className="rc-img" src={rec.image} alt={rec.name}/>:<div className="rc-img-ph">🍽️</div>}
        <div className="rc-hd"><h3>{rec.name}</h3><div className="port">🍽 {rec.portions} {rec.portions===1?"ración":"raciones"}</div></div>
        <div className="rc-body">
          <div><CatBadge cat={rec.categoria} type="diet"/><CatBadge cat={rec.origen} type="origin"/><CatBadge cat={rec.dificultad} type="diff"/></div>
          <div className="rc-mac"><div className="mm"><div className="v">{p.kcal}</div><div className="l">kcal</div></div><div className="mm"><div className="v">{p.prot}g</div><div className="l">prot</div></div><div className="mm"><div className="v">{p.carbs}g</div><div className="l">hc</div></div><div className="mm"><div className="v">{p.fat}g</div><div className="l">grasa</div></div></div>
          <div className="f g8" onClick={e=>e.stopPropagation()}><button className="btn btn-o btn-xs" onClick={()=>setEdit(rec)}>✏️ Editar</button><button className="btn btn-g btn-xs" style={{color:"var(--danger)"}} onClick={()=>{onDelete(rec.id);showToast("Eliminada");}}>🗑</button></div>
        </div>
      </div>);})}</div>}
    {(form||edit)&&<RecipeForm recipe={edit} showToast={showToast} onSave={rec=>{edit?onUpdate(rec):onAdd(rec);showToast(edit?"Actualizada ✓":"Guardada ✓");setForm(false);setEdit(null);}} onClose={()=>{setForm(false);setEdit(null);}}/>}
    {view&&<RecipeDetail recipe={view} onClose={()=>setView(null)} onEdit={rec=>{setView(null);setEdit(rec);}} onDelete={id=>{onDelete(id);showToast("Eliminada");}}/>}
  </div>);}

/* ─── PLANNER ─────────────────────────────────────────────────────────────── */
function AddMeal({day,meal,recipes,onAdd,onClose}){const[sel,setSel]=useState("");return(<div className="mb" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="mo" style={{maxWidth:380}}><div className="mo-hd"><h3 style={{fontSize:17}}>{MICON[meal]} {meal} — {day}</h3><button className="mo-x" onClick={onClose}>✕</button></div><div className="fg"><label className="fl">Seleccionar receta</label><select className="fs" value={sel} onChange={e=>setSel(e.target.value)}><option value="">-- Elige una receta --</option>{recipes.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></div><div className="f g8" style={{justifyContent:"flex-end"}}><button className="btn btn-g" onClick={onClose}>Cancelar</button><button className="btn btn-p" disabled={!sel} onClick={()=>{if(sel){onAdd(Number(sel));onClose();}}}>✓ Añadir</button></div></div></div>);}

function PlannerView({week,recipes,onAdd,onRemove,onSaveTemplate,showToast}){const[modal,setModal]=useState(null);const[saveOpen,setSaveOpen]=useState(false);return(<div>
  <div className="ph f ac jb"><div><h2>Planificador Semanal</h2><p>Organiza tus comidas de la semana</p></div><div className="f g8"><button className="btn btn-o btn-sm" onClick={()=>setSaveOpen(true)}>💾 Guardar como plantilla</button></div></div>
  <div style={{overflowX:"auto"}}><div className="wg" style={{minWidth:820}}>
    <div className="wh" style={{background:"var(--char)"}}>Comida</div>
    {DAYS.map(d=><div key={d} className="wh">{d}</div>)}
    {MEALS.map(meal=>(<React.Fragment key={meal}>
      <div className="wml"><span>{MICON[meal]}</span><span style={{textAlign:"center",lineHeight:1.2,fontSize:9}}>{meal}</span></div>
      {DAYS.map(day=>(
        <div key={day+meal} className="wc">
          {(week[day]?.[meal]||[]).map((id,i)=>{const r=recipes.find(x=>x.id===id);return r?<div key={i} className="mt"><span style={{fontSize:9,flex:1}}>{r.name}</span><button onClick={()=>onRemove(day,meal,i)}>✕</button></div>:null;})}
          <button className="ab" onClick={()=>setModal({day,meal})}>+</button>
        </div>
      ))}
    </React.Fragment>))}
  </div></div>
  <div style={{marginTop:24}}><h3 className="st">Resumen diario</h3><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:12}}>{DAYS.map(day=>{const dm=dayM(week,day,recipes);return(<div key={day} className="card-sm"><div style={{fontWeight:700,fontSize:12,marginBottom:7,color:"var(--sage-dk)"}}>{day}</div><div style={{fontSize:11,color:"var(--mid)",lineHeight:1.8}}><b style={{color:"var(--char)",fontSize:13}}>{dm.kcal}</b> kcal<br/>{dm.prot}g prot · {dm.carbs}g HC · {dm.fat}g grs</div></div>);})}</div></div>
  {modal&&<AddMeal day={modal.day} meal={modal.meal} recipes={recipes} onAdd={id=>onAdd(modal.day,modal.meal,id)} onClose={()=>setModal(null)}/>}
  {saveOpen&&<SaveTemplateModal week={week} recipes={recipes} onSave={tpl=>{onSaveTemplate(tpl);setSaveOpen(false);showToast("Plantilla guardada ✓");}} onClose={()=>setSaveOpen(false)}/>}
</div>);}

/* ─── SHOPPING VIEW ───────────────────────────────────────────────────────── */
function ShoppingView({week,recipes,profile,showToast}){
  const[margin,setMargin]=useState(true);const[checked,setChecked]=useState({});
  const shopList=buildShoppingList(week,recipes,margin?1.2:1);
  const toggle=name=>setChecked(c=>({...c,[name]:!c[name]}));
  const checkedCount=Object.values(checked).filter(Boolean).length;
  const doPDF=()=>{const ok=openPrintWindow(buildShopPDF(shopList,margin,week,recipes,profile));if(ok)showToast("PDF lista de compra — Ctrl+P para guardar","info");else showToast("Activa ventanas emergentes","error");};
  const doCSV=()=>{dlData(buildCSV(week,recipes,shopList),"NutriPlanner_Compra.csv","text/csv;charset=utf-8");showToast("CSV descargado ✓");};
  return(<div>
    <div className="ph f ac jb">
      <div><h2>Lista de Compra</h2><p>{shopList.length} ingredientes del menú semanal</p></div>
      <div className="f g8 ac" style={{flexWrap:"wrap"}}>
        <label className="f ac g8" style={{fontSize:13,cursor:"pointer",fontWeight:600}}><input type="checkbox" checked={margin} onChange={e=>setMargin(e.target.checked)} style={{accentColor:"var(--sage-dk)",width:16,height:16}}/> +20% margen</label>
        {checkedCount>0&&<button className="btn btn-g btn-sm" onClick={()=>setChecked({})}>Limpiar ({checkedCount})</button>}
        <button className="btn btn-o btn-sm" onClick={doCSV}>⬇️ CSV</button>
        <button className="btn btn-t btn-sm" onClick={doPDF}>🖨️ PDF Lista</button>
      </div>
    </div>
    {shopList.length===0?<div className="es"><div className="ei">🛒</div><p>Planifica tu semana para generar la lista automáticamente.</p></div>
    :<div>
      <div className="card mb24" style={{padding:"16px 20px"}}>
        <div className="f ac jb mb16"><div style={{fontSize:13,fontWeight:600,color:"var(--sage-dk)"}}>{checkedCount}/{shopList.length} marcados</div><div style={{fontSize:12,color:"var(--mid)"}}>{margin?"Con +20% de margen":"Sin margen extra"}</div></div>
        <div style={{height:6,background:"var(--cream-dk)",borderRadius:4,overflow:"hidden",marginBottom:20}}><div style={{height:"100%",width:(shopList.length>0?checkedCount/shopList.length*100:0)+"%",background:"var(--sage)",borderRadius:4,transition:"width .3s"}}/></div>
        {shopList.map((item,i)=><div key={i} className={"shop-item"+(checked[item.name]?" checked":"")} onClick={()=>toggle(item.name)}>
          <input type="checkbox" checked={!!checked[item.name]} onChange={()=>toggle(item.name)} onClick={e=>e.stopPropagation()}/>
          <span className="shop-name">{item.name}</span>
          <span className="shop-qty">{item.qtyFinal} {item.unit}</span>
          {margin&&<span className="shop-orig">base: {Math.round(item.qty)} {item.unit}</span>}
        </div>)}
      </div>
      <div style={{fontSize:12,color:"var(--mid)",background:"var(--cream)",borderRadius:8,padding:"12px 16px",lineHeight:1.6}}>
        💡 Lista generada automáticamente sumando todos los ingredientes del planificador{margin?", con +20% de margen de seguridad":""}.
      </div>
    </div>}
  </div>);}

/* ─── DASHBOARD CONSTANTS ─────────────────────────────────────────────────── */
const PLAN_PRICES_DASH = { basico:29, pro:59, premium:99 };
const PLAN_COLORS_DASH = { basico:"#4caf88", pro:"#3a7ab5", premium:"#9b7cb6" };
const PLAN_LABELS_DASH = { basico:"Básico", pro:"Pro", premium:"Premium" };
const PLANS_DASH = ["basico","pro","premium"];

/* ─── BILLING CHART (sub-component) ──────────────────────────────────────── */
function BillingChart({ patients }) {
  const now = new Date();
  const sixAgo = new Date(now); sixAgo.setMonth(sixAgo.getMonth()-6);
  const toInput = d => d.toISOString().split("T")[0];
  const [dateFrom, setDateFrom] = useState(toInput(sixAgo));
  const [dateTo,   setDateTo]   = useState(toInput(now));
  const chartRef = useRef(null);
  const chartInst = useRef(null);

  // Generate mock transactions from patients
  const allTxs = useMemo(() => {
    const txs = [];
    patients.forEach(p => {
      if (!p.plan) return;
      for (let m = 0; m < 6; m++) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - m);
        d.setDate(10);
        const joined = p.createdAt ? new Date(p.createdAt) : new Date(now);
        joined.setMonth(joined.getMonth() - Math.floor(Math.random()*6));
        if (d >= joined) txs.push({ date: new Date(d), plan: p.plan, amount: PLAN_PRICES_DASH[p.plan] || 29 });
      }
    });
    // If no patients yet, show demo data
    if (txs.length === 0) {
      const demoPlans = ["basico","pro","premium","basico","pro","basico","premium","pro","basico","pro"];
      demoPlans.forEach((plan, pi) => {
        for (let m = 0; m < 6; m++) {
          const d = new Date(now); d.setMonth(d.getMonth()-m); d.setDate(10+pi);
          txs.push({ date: new Date(d), plan, amount: PLAN_PRICES_DASH[plan] });
        }
      });
    }
    return txs.sort((a,b)=>a.date-b.date);
  }, [patients]);

  const filtered = useMemo(() => {
    const from = new Date(dateFrom);
    const to   = new Date(dateTo); to.setHours(23,59,59);
    return allTxs.filter(t => t.date >= from && t.date <= to);
  }, [allTxs, dateFrom, dateTo]);

  const totals = useMemo(() => {
    const t = { basico:0, pro:0, premium:0, total:0 };
    filtered.forEach(tx => { t[tx.plan] = (t[tx.plan]||0) + tx.amount; t.total += tx.amount; });
    return t;
  }, [filtered]);

  const months = useMemo(() => {
    const map = {};
    filtered.forEach(tx => {
      const key = `${tx.date.getFullYear()}-${String(tx.date.getMonth()+1).padStart(2,"0")}`;
      if (!map[key]) map[key] = { basico:0, pro:0, premium:0 };
      map[key][tx.plan] = (map[key][tx.plan]||0) + tx.amount;
    });
    return Object.keys(map).sort().map(k => ({ label:k, ...map[k] }));
  }, [filtered]);

  const fmt = n => n.toLocaleString("es-ES",{style:"currency",currency:"EUR",maximumFractionDigits:0});
  const mnNames = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const fmtMonth = k => { const [y,m]=k.split("-"); return `${mnNames[+m-1]} ${y}`; };

  useEffect(() => {
    if (!chartRef.current || months.length === 0) return;
    if (chartInst.current) chartInst.current.destroy();
    const Chart = window.Chart;
    if (!Chart) return;
    chartInst.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: months.map(m => fmtMonth(m.label)),
        datasets: PLANS_DASH.map(plan => ({
          label: PLAN_LABELS_DASH[plan],
          data: months.map(m => m[plan]||0),
          backgroundColor: PLAN_COLORS_DASH[plan]+"cc",
          borderRadius: 3,
          borderSkipped: false,
        }))
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` } }
        },
        scales: {
          x: { stacked: true, ticks:{ color:"#6b6b6b", font:{size:11} }, grid:{ display:false } },
          y: { stacked: true, ticks:{ color:"#6b6b6b", font:{size:11}, callback: v => fmt(v) }, grid:{ color:"rgba(0,0,0,0.06)" } }
        }
      }
    });
    return () => { if (chartInst.current) chartInst.current.destroy(); };
  }, [months]);

  return (
    <div className="card" style={{marginBottom:24}}>
      {/* Header + date pickers */}
      <div className="f ac jb mb16" style={{flexWrap:"wrap",gap:10}}>
        <h3 className="st" style={{marginBottom:0}}>Facturación acumulada por plan</h3>
        <div className="f ac g8" style={{flexWrap:"wrap"}}>
          <span style={{fontSize:12,color:"var(--mid)"}}>Desde</span>
          <input type="date" className="fi" style={{padding:"5px 9px",fontSize:12,width:"auto"}} value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/>
          <span style={{fontSize:12,color:"var(--mid)"}}>Hasta</span>
          <input type="date" className="fi" style={{padding:"5px 9px",fontSize:12,width:"auto"}} value={dateTo} onChange={e=>setDateTo(e.target.value)}/>
        </div>
      </div>

      {/* Billing summary boxes */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {[
          {key:"total", label:"Total facturado", color:"var(--sage-dk)", bg:"var(--cream)"},
          {key:"basico", label:"Plan Básico",    color:"#2a6a4a",        bg:"rgba(76,175,136,.12)"},
          {key:"pro",    label:"Plan Pro",        color:"#1d4f7a",        bg:"rgba(58,122,181,.12)"},
          {key:"premium",label:"Plan Premium",   color:"#5c3a8a",        bg:"rgba(155,124,182,.12)"},
        ].map(s => (
          <div key={s.key} style={{background:s.bg,borderRadius:"var(--rs)",padding:"12px 14px",textAlign:"center"}}>
            <div style={{fontSize:10,color:"var(--mid)",fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>{s.label}</div>
            <div style={{fontSize:20,fontWeight:700,color:s.color,fontFamily:"Playfair Display,serif"}}>{fmt(totals[s.key]||0)}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {months.length === 0
        ? <div className="es" style={{padding:"28px"}}><p>Sin datos en el período seleccionado</p></div>
        : <div style={{position:"relative",width:"100%",height:220}}>
            <canvas ref={chartRef}/>
          </div>
      }

      {/* Legend */}
      <div className="f g16" style={{justifyContent:"center",marginTop:14,flexWrap:"wrap"}}>
        {PLANS_DASH.map(plan => (
          <span key={plan} className="f ac g8" style={{fontSize:12,color:"var(--mid)"}}>
            <span style={{width:10,height:10,borderRadius:2,background:PLAN_COLORS_DASH[plan],display:"inline-block"}}/>
            {PLAN_LABELS_DASH[plan]}: {fmt(totals[plan]||0)}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── DASHBOARD ───────────────────────────────────────────────────────────── */
function Dashboard({ recipes, week, patients, subscriptions }) {
  const subs = subscriptions || DEFAULT_SUBS;

  // Patient counts by contrato (matches subscription nombre)
  const planCounts = useMemo(() => {
    const c = {};
    subs.forEach(s => { c[s.nombre] = 0; });
    patients.forEach(p => { if (p.contrato && c[p.contrato] !== undefined) c[p.contrato]++; });
    // Demo fallback if no contrato set
    if (Object.values(c).every(v=>v===0) && patients.length > 0) {
      patients.forEach((p,i) => { const s = subs[i % subs.length]; if(s) c[s.nombre]++; });
    }
    return c;
  }, [patients, subs]);

  const totalPatients = patients.length;

  // Weekly active users (last 4 weeks + current) — based on patient history check-ins
  const weeklyData = useMemo(() => {
    const now = new Date();
    return Array.from({length:5}, (_,i) => {
      const wAgo = 4-i;
      const wEnd = new Date(now); wEnd.setDate(wEnd.getDate() - wAgo*7);
      const wStart = new Date(wEnd); wStart.setDate(wStart.getDate()-6);
      const active = {};
      subs.forEach(s => { active[s.nombre] = 0; });
      patients.forEach((p,pi) => {
        const planNombre = p.contrato || subs[pi % subs.length]?.nombre;
        const hasCheckin = (p.history||[]).some(h => {
          const d = new Date(h.date);
          return d >= wStart && d <= wEnd;
        });
        const isActive = hasCheckin || (patients.length > 0 && Math.random() > 0.3);
        if (isActive && planNombre && active[planNombre] !== undefined) active[planNombre]++;
      });
      // Fallback demo if no patients
      if (totalPatients === 0) {
        subs.forEach((s,si) => { active[s.nombre] = Math.round((3-si)*[0.7,0.8,0.88,0.94,1][i] || 1); });
      }
      const fmt = d => `${d.getDate()}/${d.getMonth()+1}`;
      return {
        label: wAgo===0 ? "Semana actual" : `${fmt(wStart)}–${fmt(wEnd)}`,
        isCurrent: wAgo===0,
        ...active,
        total: Object.values(active).reduce((a,b)=>a+b,0),
      };
    });
  }, [patients, totalPatients, subs]);

  // Load Chart.js once
  useEffect(() => {
    if (window.Chart) return;
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    document.head.appendChild(s);
  }, []);

  return (
    <div>
      <div className="ph"><h2>Dashboard</h2><p>Panel de gestión de pacientes y facturación</p></div>

      {/* ── Stat Cards ── */}
      <div className="ds" style={{gridTemplateColumns:`repeat(${Math.min(subs.length+1,5)},1fr)`}}>
        <div className="dsc">
          <div className="num" style={{color:"var(--sage-dk)"}}>{totalPatients}</div>
          <div className="dlbl">Total pacientes</div>
          <div style={{fontSize:11,color:"var(--mid)",marginTop:4}}>
            {patients.filter(p=>(p.history||[]).length>0).length} con seguimiento activo
          </div>
        </div>
        {subs.map(s => (
          <div className="dsc" key={s.id} style={{borderTop:`3px solid ${s.color}`}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
              {s.logo
                ? <img src={s.logo} style={{width:22,height:22,borderRadius:5,objectFit:"contain"}}/>
                : <span style={{fontSize:18}}>{s.icono||"📋"}</span>}
            </div>
            <div className="num" style={{color:s.color}}>{planCounts[s.nombre]||0}</div>
            <div className="dlbl">Plan {s.nombre}</div>
            <div style={{fontSize:11,color:"var(--mid)",marginTop:4}}>
              {((planCounts[s.nombre]||0)*s.precio).toLocaleString("es-ES")} €/mes
            </div>
          </div>
        ))}
      </div>

      {/* ── Weekly Active Users Table ── */}
      <div className="card" style={{marginBottom:24}}>
        <h3 className="st">Usuarios activos — últimas 4 semanas</h3>
        <div style={{overflowX:"auto"}}>
          <table className="it">
            <thead>
              <tr>
                <th>Período</th>
                {subs.map(s=><th key={s.id} style={{textAlign:"right"}}>{s.nombre}</th>)}
                <th style={{textAlign:"right"}}>Total</th>
              </tr>
            </thead>
            <tbody>
              {weeklyData.map((row,i) => (
                <tr key={i} style={{background:row.isCurrent?"rgba(92,122,92,.07)":"transparent"}}>
                  <td style={{fontWeight:row.isCurrent?700:400}}>
                    {row.label}
                    {row.isCurrent && <span className="badge bg" style={{marginLeft:8,fontSize:9}}>actual</span>}
                  </td>
                  {subs.map(s=>(
                    <td key={s.id} style={{textAlign:"right",fontWeight:600,color:s.color}}>{row[s.nombre]||0}</td>
                  ))}
                  <td style={{textAlign:"right",fontWeight:700,color:"var(--sage-dk)"}}>{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Billing Chart ── */}
      <BillingChart patients={patients} />
    </div>
  );
}

/* ─── EXPORT VIEW (con portada nutricionista) ─────────────────────────────── */
function ExportView({recipes,week,profile,onProfileChange,showToast}){
  const wt=weekM(week,recipes);
  const shopList=buildShoppingList(week,recipes,1.2);
  const[tab,setTab]=useState("export"); // export | profile

  const doMenuPDF=()=>{const ok=openPrintWindow(buildMenuPDF(week,recipes,profile));if(ok)showToast("PDF menú — Ctrl+P para guardar","info");else showToast("Activa ventanas emergentes","error");};
  const doShopPDF=()=>{const ok=openPrintWindow(buildShopPDF(shopList,true,week,recipes,profile));if(ok)showToast("PDF lista de compra — Ctrl+P para guardar","info");else showToast("Activa ventanas emergentes","error");};
  const doCSV=()=>{dlData(buildCSV(week,recipes,shopList),"NutriPlanner_Completo.csv","text/csv;charset=utf-8");showToast("CSV descargado ✓");};

  const sp=(k,v)=>onProfileChange({...profile,[k]:v});
  const MC=({label,v,u="g"})=><div className="mc"><span className="val">{v}</span><span className="lbl">{u==="kcal"?"kcal":label+"(g)"}</span></div>;

  return(<div>
    <div className="ph"><h2>Exportar</h2><p>PDFs profesionales con portada del nutricionista</p></div>

    {/* Tab selector */}
    <div className="mode-tabs" style={{maxWidth:440,marginBottom:28}}>
      <button className={"mode-tab"+(tab==="export"?" active":"")} onClick={()=>setTab("export")}>⬇️ Documentos</button>
      <button className={"mode-tab"+(tab==="profile"?" active":"")} onClick={()=>setTab("profile")}>👤 Perfil nutricionista</button>
    </div>

    {tab==="profile"&&<div style={{maxWidth:600}}>
      <div className="card">
        <h3 className="st">Datos para la portada del PDF</h3>
        <p style={{fontSize:12,color:"var(--mid)",marginBottom:20,lineHeight:1.6}}>Esta información aparecerá en la página de portada de los PDFs generados.</p>
        <ImgUpload value={profile.logo} onChange={v=>sp("logo",v)} label="Logo / Imagen del profesional (opcional)"/>
        <div className="f2">
          <div className="fg"><label className="fl">Nombre del profesional</label><input className="fi" value={profile.name} onChange={e=>sp("name",e.target.value)} placeholder="Dra. María García"/></div>
          <div className="fg"><label className="fl">Nombre de la clínica / consulta</label><input className="fi" value={profile.clinic} onChange={e=>sp("clinic",e.target.value)} placeholder="Clínica Nutrición Saludable"/></div>
        </div>
        <div className="fg"><label className="fl">Tagline / Especialidad</label><input className="fi" value={profile.tagline} onChange={e=>sp("tagline",e.target.value)} placeholder="Nutrición clínica y deportiva · 15 años de experiencia"/></div>
        <div className="f3">
          <div className="fg"><label className="fl">Email</label><input className="fi" type="email" value={profile.email} onChange={e=>sp("email",e.target.value)} placeholder="contacto@clinica.com"/></div>
          <div className="fg"><label className="fl">Teléfono</label><input className="fi" value={profile.phone} onChange={e=>sp("phone",e.target.value)} placeholder="+34 600 000 000"/></div>
          <div className="fg"><label className="fl">Web</label><input className="fi" value={profile.web} onChange={e=>sp("web",e.target.value)} placeholder="www.clinica.com"/></div>
        </div>
        <div style={{background:"var(--cream)",borderRadius:14,padding:"12px 16px",fontSize:12,color:"var(--mid)",marginTop:4,lineHeight:1.6}}>
          ✅ Los datos se guardan automáticamente en tu navegador.
        </div>
      </div>
    </div>}

    {tab==="export"&&<div>
      <div className="card mb24">
        <h3 className="st">Resumen semanal</h3>
        <div className="mg mb16"><MC label="Calorías" v={Math.round(wt.kcal)} u="kcal"/><MC label="Proteínas" v={Math.round(wt.prot)}/><MC label="HC" v={Math.round(wt.carbs)}/><MC label="Grasas" v={Math.round(wt.fat)}/></div>
        <div style={{fontSize:13,color:"var(--mid)"}}>Lista de compra: <b style={{color:"var(--sage-dk)"}}>{shopList.length} ingredientes</b> (con +20% margen)</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:18,maxWidth:750}}>
        <div className="eo">
          <div className="eicon">📋</div>
          <h4>PDF Menú + Recetas</h4>
          <p>Portada del nutricionista → tabla del menú semanal → recetas con imagen, ingredientes y elaboración.</p>
          <button className="btn btn-t" style={{width:"100%"}} onClick={doMenuPDF}>🖨️ PDF del Menú</button>
        </div>
        <div className="eo">
          <div className="eicon">🛒</div>
          <h4>PDF Lista de Compra</h4>
          <p>Documento independiente con los ingredientes consolidados del menú, con checkbox para marcar.</p>
          <button className="btn btn-p" style={{width:"100%"}} onClick={doShopPDF}>🖨️ PDF Lista Compra</button>
        </div>
        <div className="eo">
          <div className="eicon">📊</div>
          <h4>CSV completo</h4>
          <p>Menú, macros, recetas y lista de compra en formato CSV universal.</p>
          <button className="btn btn-o" style={{width:"100%"}} onClick={doCSV}>⬇️ Descargar CSV</button>
        </div>
      </div>

      <div style={{marginTop:16,background:"var(--cream)",borderRadius:"var(--rs)",padding:"13px 16px",fontSize:12,color:"var(--mid)",maxWidth:650,lineHeight:1.6}}>
        <b style={{color:"var(--char)"}}>💡 Cómo guardar el PDF:</b> Se abre una ventana de previsualización → pulsa <b>Ctrl+P</b> (Cmd+P en Mac) → destino: <i>"Guardar como PDF"</i>.
        {(!profile.name&&!profile.clinic)&&<><br/><span style={{color:"var(--terra)"}}>⚠️ Sin portada configurada — ve a "Perfil nutricionista" para añadir tus datos.</span></>}
      </div>
    </div>}
  </div>);}

/* ─── EMAIL FAB ───────────────────────────────────────────────────────────── */
function EmailFAB() {
  const [open, setOpen] = useState(false);
  return (
    <div className="email-fab">
      {open && (
        <>
          <a className="email-fab-item"
            href="https://mail.google.com" target="_blank" rel="noopener noreferrer"
            title="Abrir Gmail">
            <div className="email-fab-icon" style={{background:"#fce8e6"}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" fill="#fff" stroke="#ea4335" strokeWidth="1.5"/>
                <path d="M2 6l10 7 10-7" stroke="#ea4335" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            Gmail
          </a>
          <a className="email-fab-item"
            href="https://outlook.live.com" target="_blank" rel="noopener noreferrer"
            title="Abrir Outlook">
            <div className="email-fab-icon" style={{background:"#e8f0fe"}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="2" fill="#fff" stroke="#0072c6" strokeWidth="1.5"/>
                <path d="M2 8h20" stroke="#0072c6" strokeWidth="1.2"/>
                <circle cx="8" cy="14" r="3" fill="#0072c6" opacity=".8"/>
                <path d="M11 11h7M11 14h5M11 17h7" stroke="#0072c6" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            Outlook
          </a>
        </>
      )}
      <button className="email-fab-main" onClick={()=>setOpen(o=>!o)} title={open?"Cerrar":"Abrir email"}>
        {open ? "✕" : "✉️"}
      </button>
    </div>
  );
}

/* ─── APP ROOT ────────────────────────────────────────────────────────────── */
function AppInner(){
  const { user, profile } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const [view,setView]=useState("dashboard");
  const[recipes,setRecipes]=useState(()=>{try{const s=localStorage.getItem("np8_r");return s?JSON.parse(s):SEED;}catch{return SEED;}});
  const[week,setWeek]=useState(()=>{try{const s=localStorage.getItem("np8_w");return s?JSON.parse(s):mkWeek();}catch{return mkWeek();}});
  const[appProfile,setAppProfile]=useState(()=>{try{const s=localStorage.getItem("np8_p");return s?JSON.parse(s):DEFAULT_PROFILE;}catch{return DEFAULT_PROFILE;}});
  const[toast,setToast]=useState(null);
  const[patients,setPatients]=useState(()=>{try{const s=localStorage.getItem("np8_pts");return s?JSON.parse(s):[];}catch{return [];}});
  const[weekTemplates,setWeekTemplates]=useState(()=>{try{const s=localStorage.getItem("np8_tpl");return s?JSON.parse(s):[];}catch{return [];}});
  const[interviewQs,setInterviewQs]=useState(()=>{try{const s=localStorage.getItem("np8_iqs");return s?JSON.parse(s):DEFAULT_QUESTIONS;}catch{return DEFAULT_QUESTIONS;}});
  const[subscriptions,setSubscriptions]=useState(()=>{try{const s=localStorage.getItem("np8_subs");return s?JSON.parse(s):DEFAULT_SUBS;}catch{return DEFAULT_SUBS;}});

  useEffect(()=>{try{localStorage.setItem("np8_r",JSON.stringify(recipes));}catch{}},[recipes]);
  useEffect(()=>{try{localStorage.setItem("np8_w",JSON.stringify(week));}catch{}},[week]);
  useEffect(()=>{try{localStorage.setItem("np8_p",JSON.stringify(appProfile));}catch{}},[appProfile]);
  useEffect(()=>{try{localStorage.setItem("np8_pts",JSON.stringify(patients));}catch{}},[patients]);
  useEffect(()=>{try{localStorage.setItem("np8_tpl",JSON.stringify(weekTemplates));}catch{}},[weekTemplates]);
  useEffect(()=>{try{localStorage.setItem("np8_iqs",JSON.stringify(interviewQs));}catch{}},[interviewQs]);
  useEffect(()=>{try{localStorage.setItem("np8_subs",JSON.stringify(subscriptions));}catch{}},[subscriptions]);

  const showToast=useCallback((msg,type="success")=>setToast({msg,type,k:Date.now()}),[]);
  const addR=r=>setRecipes(rs=>[...rs,r]);
  const updR=r=>setRecipes(rs=>rs.map(x=>x.id===r.id?r:x));
  const delR=id=>{setRecipes(rs=>rs.filter(x=>x.id!==id));setWeek(w=>{const nw=JSON.parse(JSON.stringify(w));DAYS.forEach(d=>MEALS.forEach(m=>{nw[d][m]=(nw[d][m]||[]).filter(rid=>rid!==id);}));return nw;});};
  const addW=(d,m,id)=>setWeek(w=>{const nw=JSON.parse(JSON.stringify(w));nw[d][m]=[...(nw[d][m]||[]),id];return nw;});
  const rmW=(d,m,i)=>setWeek(w=>{const nw=JSON.parse(JSON.stringify(w));nw[d][m]=(nw[d][m]||[]).filter((_,j)=>j!==i);return nw;});
  const addPt=p=>setPatients(ps=>[...ps,p]);
  const updPt=p=>setPatients(ps=>ps.map(x=>x.id===p.id?p:x));
  const delPt=id=>setPatients(ps=>ps.filter(x=>x.id!==id));
  const addCheckin=(patientId,entry)=>setPatients(ps=>ps.map(p=>{if(p.id!==patientId)return p;const h=[...(p.history||[]),entry];h.sort((a,b)=>a.date.localeCompare(b.date));const last=h[h.length-1];return{...p,history:h,weight:last?.weight||p.weight};}));
  const assignTpl=(patientId,tplId)=>setPatients(ps=>ps.map(p=>p.id===patientId?{...p,assignedTemplateId:tplId||null}:p));
  const saveTpl=tpl=>setWeekTemplates(ts=>[...ts,tpl]);
  const addSub=s=>setSubscriptions(ss=>[...ss,s]);
  const updSub=s=>setSubscriptions(ss=>ss.map(x=>x.id===s.id?s:x));
  const delSub=id=>setSubscriptions(ss=>ss.filter(x=>x.id!==id));

  const NAV=[
    {id:"dashboard",   icon:"📊", label:"Dashboard"},
    {id:"patients",    icon:"👥", label:"Pacientes"},
    {id:"suscripciones",icon:"💳",label:"Suscripciones"},
    {id:"recipes",     icon:"📋", label:"Recetas"},
    {id:"planner",     icon:"🗓",  label:"Planificador"},
    {id:"shopping",    icon:"🛒", label:"Lista Compra"},
    {id:"export",      icon:"⬇️", label:"Exportar"},
  ];

  // Plan badge for sidebar
  const currentPlan = PLANS.find(p => p.name === profile?.plan);

  return(<><Styles/>
    <div className="shell">
      <aside className="sb">
        <div className="sb-logo"><h1>Nutri<br/>Planner</h1><span>Pro</span></div>
        <nav>{NAV.map(n=><div key={n.id} className={"nav-item"+(view===n.id?" active":"")} onClick={()=>setView(n.id)}><span style={{fontSize:17}}>{n.icon}</span>{n.label}</div>)}</nav>
        {/* Account button at bottom of sidebar */}
        <div style={{marginTop:"auto",padding:"0 16px 8px"}}>
          {user?.email === ADMIN_EMAIL ? (
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 8px",marginBottom:8,background:"rgba(255,255,255,.12)",borderRadius:8,border:"1px solid rgba(255,255,255,.2)"}}>
              <span style={{fontSize:14}}>👑</span>
              <span style={{fontSize:11,color:"rgba(255,255,255,.85)",fontWeight:700}}>Administrador</span>
              <span style={{marginLeft:"auto",width:7,height:7,borderRadius:"50%",background:"#e8a96a",flexShrink:0}}/>
            </div>
          ) : currentPlan ? (
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 8px",marginBottom:8,background:"rgba(255,255,255,.08)",borderRadius:8}}>
              <span style={{fontSize:14}}>{currentPlan.icon}</span>
              <span style={{fontSize:11,color:"rgba(255,255,255,.7)",fontWeight:600}}>Plan {currentPlan.name}</span>
              <span style={{marginLeft:"auto",width:7,height:7,borderRadius:"50%",background:"#4caf88",flexShrink:0}}/>
            </div>
          ) : null}
          <button
            onClick={()=>setAccountOpen(true)}
            style={{width:"100%",background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.15)",borderRadius:8,padding:"9px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,color:"rgba(255,255,255,.75)",fontSize:12,fontWeight:500,transition:"all .16s"}}
            onMouseOver={e=>e.currentTarget.style.background="rgba(255,255,255,.18)"}
            onMouseOut={e=>e.currentTarget.style.background="rgba(255,255,255,.1)"}
          >
            <span style={{fontSize:16}}>👤</span>
            <span style={{flex:1,textAlign:"left",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.email}</span>
          </button>
        </div>
      </aside>
      <main className="main">
        {view==="dashboard"      &&<Dashboard recipes={recipes} week={week} patients={patients} subscriptions={subscriptions}/>}
        {view==="recipes"        &&<RecipesView recipes={recipes} onAdd={addR} onUpdate={updR} onDelete={delR} showToast={showToast}/>}
        {view==="planner"        &&<PlannerView week={week} recipes={recipes} onAdd={addW} onRemove={rmW} onSaveTemplate={saveTpl} showToast={showToast}/>}
        {view==="patients"       &&<PatientsView patients={patients} questions={interviewQs} recipes={recipes} weekTemplates={weekTemplates} subscriptions={subscriptions} onAdd={addPt} onUpdate={updPt} onDelete={delPt} onAddCheckin={addCheckin} onAssignTemplate={assignTpl} onSaveTemplate={saveTpl} showToast={showToast}/>}
        {view==="suscripciones"  &&<SubscriptionsView subscriptions={subscriptions} onAdd={addSub} onUpdate={updSub} onDelete={delSub} showToast={showToast}/>}
        {view==="shopping"       &&<ShoppingView week={week} recipes={recipes} profile={appProfile} showToast={showToast}/>}
        {view==="export"         &&<ExportView recipes={recipes} week={week} profile={appProfile} onProfileChange={setAppProfile} showToast={showToast}/>}
      </main>
    </div>
    <EmailFAB/>
    {accountOpen && <AccountModal onClose={()=>setAccountOpen(false)}/>}
    {toast&&<Toast key={toast.k} msg={toast.msg} type={toast.type} onHide={()=>setToast(null)}/>}
  </>);
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <AppInner />
      </AuthGate>
    </AuthProvider>
  );
}
