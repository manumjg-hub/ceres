import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

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
const parsePasted=(text)=>{const lines=text.split('\n').map(l=>l.trim()).filter(Boolean);return lines.map((line,i)=>{const m=line.match(/^(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l|taza|cucharada|cucharadita|ud|pieza)?\s+(.+)$/i);const name=m?m[3].trim():line;const qty=m?parseFloat(m[1].replace(',','.')):1;const unit=m&&m[2]?m[2].toLowerCase():'ud';return{id:Date.now()+i+Math.random(),name,qty,unit,kcal:'',prot:'',carbs:'',fat:'',_auto:false,_k100:null,_p100:null,_c100:null,_f100:null};});};
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
function FoodSearch({onSelect,onClose}){const[q,setQ]=useState("");const[results,setRes]=useState([]);const[scanOn,setScan]=useState(false);const[status,setSt]=useState("Escribe el nombre de un alimento");const[scMsg,setScMsg]=useState("");const[scLoad,setScLd]=useState(false);const timer=useRef(null);const doSearch=query=>{if(!query||query.length<2){setRes([]);setSt("Escribe al menos 2 letras");return;}const found=searchLocal(query);setRes(found);setSt(found.length?found.length+" resultado(s):":"Sin resultados.");};const handleInput=v=>{setQ(v);clearTimeout(timer.current);timer.current=setTimeout(()=>doSearch(v),200);};const handleBarcode=async code=>{setScan(false);setScLd(true);setScMsg("Buscando "+code+"...");try{const r=await fetch("https://world.openfoodfacts.org/api/v2/product/"+code+".json?fields=product_name,nutriments");const d=await r.json();if(d.status===1&&d.product){const n=d.product.nutriments||{};const kcal=n["energy-kcal_100g"]||(n.energy_100g?n.energy_100g/4.184:0);if(kcal>0){const food={name:(d.product.product_name||"Producto").trim(),kcal100:Math.round(kcal),prot100:Math.round((n.proteins_100g||0)*10)/10,carbs100:Math.round((n.carbohydrates_100g||0)*10)/10,fat100:Math.round((n.fat_100g||0)*10)/10};setRes([food]);setQ(food.name);setScMsg("Producto encontrado");setSt("Clic para seleccionar:");}else setScMsg("Sin datos nutricionales.");}else setScMsg("Codigo no encontrado.");}catch{setScMsg("Sin conexion. Busca por nombre.");}setScLd(false);};return(<>{scanOn&&<BarcodeScanner onDetect={handleBarcode} onClose={()=>setScan(false)}/>}<div className="sp"><div className="f g8 ac mb16" style={{flexWrap:"wrap"}}><input className="fi" autoFocus style={{flex:1,minWidth:180,padding:"8px 12px",fontSize:13}} placeholder="Buscar alimento..." value={q} onChange={e=>handleInput(e.target.value)}/><button className="btn btn-i btn-sm" onClick={()=>setScan(true)}>📷 Escanear</button><button className="btn btn-g btn-sm" onClick={onClose}>✕ Cerrar</button></div>{scMsg&&<p style={{fontSize:12,fontWeight:600,marginBottom:8,color:"var(--sage-dk)"}}>{scMsg}</p>}{scLoad&&<div className="f ac g8 ts tm"><div className="sp2 sp2-dk"/>Buscando...</div>}<p style={{fontSize:11,color:"var(--mid)",marginBottom:6}}>{status}</p>{results.length>0&&<div className="fl-list">{results.map((f,i)=><div key={i} className="fl-item" onClick={()=>onSelect(f)}><div style={{flex:1}}><div className="fl-name">{f.name}</div><div style={{fontSize:10,color:"var(--mid)"}}>por 100g</div></div><div className="fl-macros"><span><b>{f.kcal100}</b>kcal</span><span><b>{f.prot100}g</b>prot</span><span><b>{f.carbs100}g</b>HC</span><span><b>{f.fat100}g</b>grs</span></div></div>)}</div>}</div></>);}

/* ─── ING ROW ─────────────────────────────────────────────────────────────── */
const blankIng=()=>({id:Date.now()+Math.random(),name:"",qty:"",unit:"g",kcal:"",prot:"",carbs:"",fat:"",_auto:false,_k100:null,_p100:null,_c100:null,_f100:null});
function IngRow({ing,idx,onChange,onRemove}){const[open,setOpen]=useState(false);const[flash,setFlash]=useState(false);const set=(k,v)=>onChange(idx,k,v);const handleQty=v=>{set("qty",v);if(ing._k100!=null&&v)onChange(idx,"__recalc",Number(v)/100);};const handleSelect=food=>{setOpen(false);const qty=Number(ing.qty)||100;onChange(idx,"__fill",{food,qty});setFlash(true);setTimeout(()=>setFlash(false),900);};return(<>{open&&<tr><td colSpan={9} style={{padding:"4px 0 10px"}}><FoodSearch onSelect={handleSelect} onClose={()=>setOpen(false)}/></td></tr>}<tr className={flash?"flash-row":""}><td style={{minWidth:160}}><div className="f g8 ac"><input className={"ii"+(ing._auto?" auto":"")} style={{flex:1}} value={ing.name} placeholder="Ingrediente" onChange={e=>set("name",e.target.value)}/><button onClick={()=>setOpen(o=>!o)} style={{background:open?"var(--sage-dk)":"var(--info)",color:"#fff",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer",fontSize:11,flexShrink:0,fontWeight:700}} title="Buscar en base de datos">{open?"✕":"🔍"}</button></div></td><td style={{width:62}}><input className="ii" type="number" value={ing.qty} placeholder="100" onChange={e=>handleQty(e.target.value)}/></td><td style={{width:76}}><select className="ii" value={ing.unit} onChange={e=>set("unit",e.target.value)}><option>g</option><option>ml</option><option>ud</option><option>cucharada</option><option>taza</option></select></td>{["kcal","prot","carbs","fat"].map(k=><td key={k} style={{width:58}}><input className={"ii"+(ing._auto?" auto":"")} type="number" value={ing[k]} placeholder="0" onChange={e=>{set(k,e.target.value);set("_auto",false);set("_k100",null);}}/></td>)}<td style={{width:26,textAlign:"center"}}>{ing._auto?<span style={{fontSize:11,color:"var(--sage-dk)"}}>✓</span>:<span style={{color:"#ddd"}}>—</span>}</td><td style={{width:28}}><button style={{background:"none",border:"none",color:"var(--danger)",cursor:"pointer",fontSize:13,padding:"3px"}} onClick={()=>onRemove(idx)}>🗑</button></td></tr></>);}

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
  const[form,setForm]=useState(()=>recipe?{...recipe,ingredients:recipe.ingredients.map(i=>({...blankIng(),...i}))}:{name:"",portions:1,categoria:"",origen:"",dificultad:"",instructions:"",image:"",ingredients:[blankIng()]});
  const[ingMode,setIngMode]=useState("search");
  const[pasteText,setPasteText]=useState("");const[urlInput,setUrlInput]=useState("");const[urlLoading,setUrlLoad]=useState(false);
  const sf=(k,v)=>setForm(f=>({...f,[k]:v}));
  const onChange=(idx,key,val)=>{setForm(f=>{const ings=[...f.ingredients];if(key==="__fill"){const{food,qty}=val;const r=qty/100;ings[idx]={...ings[idx],name:food.name,qty,unit:"g",kcal:Math.round(food.kcal100*r),prot:Math.round(food.prot100*r*10)/10,carbs:Math.round(food.carbs100*r*10)/10,fat:Math.round(food.fat100*r*10)/10,_auto:true,_k100:food.kcal100,_p100:food.prot100,_c100:food.carbs100,_f100:food.fat100};}else if(key==="__recalc"){const r=val;if(ings[idx]._k100==null)return f;ings[idx]={...ings[idx],kcal:Math.round(ings[idx]._k100*r),prot:Math.round(ings[idx]._p100*r*10)/10,carbs:Math.round(ings[idx]._c100*r*10)/10,fat:Math.round(ings[idx]._f100*r*10)/10};}else{ings[idx]={...ings[idx],[key]:val};}return{...f,ingredients:ings};});};
  const applyPaste=()=>{if(!pasteText.trim())return;const parsed=parsePasted(pasteText);setForm(f=>({...f,ingredients:[...f.ingredients.filter(i=>i.name.trim()),...parsed]}));setPasteText("");showToast(parsed.length+" ingredientes añadidos");setIngMode("search");};
  const applyURL=async()=>{if(!urlInput.trim())return;setUrlLoad(true);try{const result=await importURL(urlInput);if(result.ingredients.length){setForm(f=>({...f,name:f.name||result.title,ingredients:[...f.ingredients.filter(i=>i.name.trim()),...result.ingredients]}));showToast(result.ingredients.length+" ingredientes importados");setUrlInput("");setIngMode("search");}else showToast("No se encontraron ingredientes","error");}catch(e){showToast(e.message||"Error","error");}setUrlLoad(false);};
  const totals=sumM(form.ingredients.map(i=>({kcal:+i.kcal||0,prot:+i.prot||0,carbs:+i.carbs||0,fat:+i.fat||0})));
  const por=perP(totals,+form.portions||1);
  const save=()=>{if(!form.name.trim())return showToast("Añade un nombre","error");onSave({...form,id:form.id||Date.now(),portions:+form.portions||1});};
  return(<div className="mb" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="mo">
    <div className="mo-hd"><h3>{recipe?"✏️ Editar receta":"✨ Nueva receta"}</h3><button className="mo-x" onClick={onClose}>✕</button></div>

    <div className="f2 mb20">
      <div>
        <div className="fg" style={{marginBottom:12}}><label className="fl">Nombre *</label><input className="fi" value={form.name} onChange={e=>sf("name",e.target.value)} placeholder="Nombre de la receta"/></div>
        <div className="f3">
          <div className="fg"><label className="fl">Raciones</label><input className="fi" type="number" min="1" value={form.portions} onChange={e=>sf("portions",e.target.value)}/></div>
          <div className="fg"><label className="fl">Tipo de dieta</label><select className="fs" value={form.categoria||""} onChange={e=>sf("categoria",e.target.value)}><option value="">— Elegir —</option>{DIETS.map(d=><option key={d}>{d}</option>)}</select></div>
          <div className="fg"><label className="fl">Dificultad</label><select className="fs" value={form.dificultad||""} onChange={e=>sf("dificultad",e.target.value)}><option value="">— Elegir —</option>{DIFFS.map(d=><option key={d}>{d}</option>)}</select></div>
        </div>
        <div className="fg"><label className="fl">Origen culinario</label><select className="fs" style={{maxWidth:240}} value={form.origen||""} onChange={e=>sf("origen",e.target.value)}><option value="">— Elegir —</option>{ORIGINS.map(o=><option key={o}>{o}</option>)}</select></div>
      </div>
      <ImgUpload value={form.image} onChange={v=>sf("image",v)}/>
    </div>

    <div className="f ac jb mb16"><h4 style={{fontSize:14}}>🥕 Ingredientes</h4></div>
    <div className="mode-tabs">
      <button className={"mode-tab"+(ingMode==="search"?" active":"")} onClick={()=>setIngMode("search")}>🔍 Buscar uno a uno</button>
      <button className={"mode-tab"+(ingMode==="paste"?" active":"")} onClick={()=>setIngMode("paste")}>📋 Pegar lista</button>
      <button className={"mode-tab"+(ingMode==="url"?" active":"")} onClick={()=>setIngMode("url")}>🌐 Importar URL</button>
    </div>
    {ingMode==="paste"&&<div style={{marginBottom:16}}><div className="fg"><label className="fl">Pega tu lista (una línea por ingrediente)</label><textarea className="fta" style={{minHeight:110,fontFamily:"monospace",fontSize:12}} value={pasteText} onChange={e=>setPasteText(e.target.value)} placeholder={"200g pechuga de pollo\n2 huevos\n100 ml leche\n1 cucharada de aceite"}/></div><div style={{fontSize:11,color:"var(--mid)",marginBottom:10}}>Formatos: "200g pollo", "2 huevos", "100 ml leche"</div><div className="f g8"><button className="btn btn-p btn-sm" onClick={applyPaste} disabled={!pasteText.trim()}>✓ Añadir</button><button className="btn btn-g btn-sm" onClick={()=>setIngMode("search")}>Cancelar</button></div></div>}
    {ingMode==="url"&&<div style={{marginBottom:16}}><div className="fg"><label className="fl">URL de la receta</label><input className="fi" value={urlInput} onChange={e=>setUrlInput(e.target.value)} placeholder="https://www.recetasgratis.net/..."/></div><div style={{fontSize:11,color:"var(--mid)",marginBottom:10}}>Funciona con RecetasGratis, Directo al Paladar, Allrecipes y otros sitios con formato estándar.</div><div className="f g8 ac"><button className="btn btn-u btn-sm" onClick={applyURL} disabled={!urlInput.trim()||urlLoading}>{urlLoading?<><div className="sp2"/>Importando...</>:"🌐 Importar"}</button><button className="btn btn-g btn-sm" onClick={()=>setIngMode("search")}>Cancelar</button></div></div>}

    <div style={{overflowX:"auto",marginTop:8}}>
      <table className="it" style={{minWidth:580}}>
        <thead><tr><th>Ingrediente</th><th>Cant.</th><th>Unidad</th><th>Kcal</th><th>Prot(g)</th><th>HC(g)</th><th>Grasa(g)</th><th></th><th></th></tr></thead>
        <tbody>{form.ingredients.map((ing,i)=><IngRow key={ing.id} ing={ing} idx={i} onChange={onChange} onRemove={i=>setForm(f=>({...f,ingredients:f.ingredients.filter((_,j)=>j!==i)}))}/>)}</tbody>
        <tfoot><tr><td colSpan={3}>Total receta</td><td>{Math.round(totals.kcal)} kcal</td><td>{Math.round(totals.prot)}g</td><td>{Math.round(totals.carbs)}g</td><td>{Math.round(totals.fat)}g</td><td colSpan={2}></td></tr><tr><td colSpan={3} style={{color:"var(--mid)",fontWeight:500}}>Por ración</td><td style={{color:"var(--mid)"}}>{por.kcal} kcal</td><td style={{color:"var(--mid)"}}>{por.prot}g</td><td style={{color:"var(--mid)"}}>{por.carbs}g</td><td style={{color:"var(--mid)"}}>{por.fat}g</td><td colSpan={2}></td></tr></tfoot>
      </table>
    </div>
    <button className="btn btn-o btn-sm mt10" onClick={()=>setForm(f=>({...f,ingredients:[...f.ingredients,blankIng()]}))}>+ Añadir fila</button>
    <div className="div"/>
    <div className="fg"><label className="fl">Elaboración / Instrucciones</label><textarea className="fta" style={{minHeight:100}} value={form.instructions} onChange={e=>sf("instructions",e.target.value)} placeholder="Describe los pasos de preparación..."/></div>
    <div className="f g8" style={{justifyContent:"flex-end"}}><button className="btn btn-g" onClick={onClose}>Cancelar</button><button className="btn btn-p" onClick={save}>💾 Guardar receta</button></div>
  </div></div>);}

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
export default function App(){
  const[view,setView]=useState("dashboard");
  const[recipes,setRecipes]=useState(()=>{try{const s=localStorage.getItem("np8_r");return s?JSON.parse(s):SEED;}catch{return SEED;}});
  const[week,setWeek]=useState(()=>{try{const s=localStorage.getItem("np8_w");return s?JSON.parse(s):mkWeek();}catch{return mkWeek();}});
  const[profile,setProfile]=useState(()=>{try{const s=localStorage.getItem("np8_p");return s?JSON.parse(s):DEFAULT_PROFILE;}catch{return DEFAULT_PROFILE;}});
  const[toast,setToast]=useState(null);
  const[patients,setPatients]=useState(()=>{try{const s=localStorage.getItem("np8_pts");return s?JSON.parse(s):[];}catch{return [];}});
  const[weekTemplates,setWeekTemplates]=useState(()=>{try{const s=localStorage.getItem("np8_tpl");return s?JSON.parse(s):[];}catch{return [];}});
  const[interviewQs,setInterviewQs]=useState(()=>{try{const s=localStorage.getItem("np8_iqs");return s?JSON.parse(s):DEFAULT_QUESTIONS;}catch{return DEFAULT_QUESTIONS;}});
  const[subscriptions,setSubscriptions]=useState(()=>{try{const s=localStorage.getItem("np8_subs");return s?JSON.parse(s):DEFAULT_SUBS;}catch{return DEFAULT_SUBS;}});

  useEffect(()=>{try{localStorage.setItem("np8_r",JSON.stringify(recipes));}catch{}},[recipes]);
  useEffect(()=>{try{localStorage.setItem("np8_w",JSON.stringify(week));}catch{}},[week]);
  useEffect(()=>{try{localStorage.setItem("np8_p",JSON.stringify(profile));}catch{}},[profile]);
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
  return(<><Styles/>
    <div className="shell">
      <aside className="sb">
        <div className="sb-logo"><h1>Nutri<br/>Planner</h1><span>Pro</span></div>
        <nav>{NAV.map(n=><div key={n.id} className={"nav-item"+(view===n.id?" active":"")} onClick={()=>setView(n.id)}><span style={{fontSize:17}}>{n.icon}</span>{n.label}</div>)}</nav>
        <div style={{marginTop:"auto",padding:"0 24px"}}><div style={{fontSize:10,color:"rgba(255,255,255,.3)",lineHeight:2}}>👥 Pacientes + historial<br/>📊 Harris-Benedict<br/>📝 Cuestionario personalizable<br/>💾 Plantillas semanales</div></div>
      </aside>
      <main className="main">
        {view==="dashboard"      &&<Dashboard recipes={recipes} week={week} patients={patients} subscriptions={subscriptions}/>}
        {view==="recipes"        &&<RecipesView recipes={recipes} onAdd={addR} onUpdate={updR} onDelete={delR} showToast={showToast}/>}
        {view==="planner"        &&<PlannerView week={week} recipes={recipes} onAdd={addW} onRemove={rmW} onSaveTemplate={saveTpl} showToast={showToast}/>}
        {view==="patients"       &&<PatientsView patients={patients} questions={interviewQs} recipes={recipes} weekTemplates={weekTemplates} subscriptions={subscriptions} onAdd={addPt} onUpdate={updPt} onDelete={delPt} onAddCheckin={addCheckin} onAssignTemplate={assignTpl} onSaveTemplate={saveTpl} showToast={showToast}/>}
        {view==="suscripciones"  &&<SubscriptionsView subscriptions={subscriptions} onAdd={addSub} onUpdate={updSub} onDelete={delSub} showToast={showToast}/>}
        {view==="shopping"       &&<ShoppingView week={week} recipes={recipes} profile={profile} showToast={showToast}/>}
        {view==="export"         &&<ExportView recipes={recipes} week={week} profile={profile} onProfileChange={setProfile} showToast={showToast}/>}
      </main>
    </div>
    <EmailFAB/>
    {toast&&<Toast key={toast.k} msg={toast.msg} type={toast.type} onHide={()=>setToast(null)}/>}
  </>);
}
