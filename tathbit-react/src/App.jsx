import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Check, ChevronRight, Download, FileUp, Home, Leaf, Menu, Plus, Search, Settings, SlidersHorizontal, UserRound, X, ArrowUpDown, PanelLeftClose, PanelLeftOpen, ShieldCheck } from 'lucide-react';

const KEY = 'tathbit-progress-v1';
const initial = () => {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    if (value && Array.isArray(value.pages)) return { pages: value.pages, target: value.target || 50, sort: value.sort || 'asc', onboarded: !!value.onboarded };
  } catch {}
  return { pages: [], target: 50, sort: 'asc', onboarded: false };
};

export default function App() {
  const [data, setData] = useState(initial);
  const [screen, setScreen] = useState(() => initial().onboarded ? 'home' : 'welcome');
  const [sidebar, setSidebar] = useState(true);
  const [accountMode, setAccountMode] = useState('guest');
  const [modal, setModal] = useState(false);
  const [range, setRange] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [targetDraft, setTargetDraft] = useState(String(data.target));
  const [toast, setToast] = useState('');
  const [auth, setAuth] = useState('signup');
  const [email, setEmail] = useState('');
  const [backupInput, setBackupInput] = useState(null);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(data)); }, [data]);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(''), 2600); return () => clearTimeout(id); }, [toast]);

  const shown = useMemo(() => data.pages.filter(p => String(p.number).includes(search.trim())).filter(p => filter === 'all' || (filter === 'done' ? p.count >= p.target : p.count < p.target)).sort((a,b) => data.sort === 'asc' ? a.number-b.number : b.number-a.number), [data, search, filter]);
  const total = data.pages.reduce((s,p) => s+p.count, 0);
  const done = data.pages.filter(p => p.count >= p.target).length;
  const progress = data.pages.length ? Math.round(data.pages.reduce((s,p) => s+Math.min(p.count/p.target,1),0)/data.pages.length*100) : 0;

  function addPages() {
    const m = range.trim().match(/^(\d+)(?:\s*[-–]\s*(\d+))?$/);
    if (!m) return setToast('Enter a page number or range, e.g. 415–430.');
    const start = Number(m[1]), end = Number(m[2] || m[1]);
    if (start < 1 || end > 604 || start > end) return setToast('Pages must be between 1 and 604.');
    setData(old => {
      const existing = new Set(old.pages.map(p => p.number));
      const added = [];
      for (let n=start; n<=end; n++) if (!existing.has(n)) added.push({ number:n, count:0, target:old.target });
      return { ...old, pages:[...old.pages, ...added], onboarded:true };
    });
    setRange(''); setModal(false); setScreen('pages'); setToast('Pages added to your list.');
  }
  function increment(number) { setData(old => ({...old, pages:old.pages.map(p => p.number === number ? {...p,count:p.count+1} : p)})); }
  function saveTarget() {
    const n = Number(targetDraft);
    if (!Number.isInteger(n) || n < 1 || n > 10000) return setToast('Choose a target between 1 and 10,000.');
    setData(old => ({...old,target:n})); setToast('Default target saved. Existing pages are unchanged.');
  }
  function exportData() {
    const blob = new Blob([JSON.stringify({app:'Tathbit',version:1,data},null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='tathbit-backup.json'; a.click(); URL.revokeObjectURL(url); setToast('Backup downloaded.');
  }
  function restore(event) {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { try { const raw=JSON.parse(reader.result); const d=raw.data||raw; if (!Array.isArray(d.pages) || !d.pages.every(p=>Number.isInteger(p.number)&&p.number>=1&&p.number<=604&&Number.isInteger(p.count)&&p.count>=0&&Number.isInteger(p.target)&&p.target>0)) throw Error(); if (!window.confirm('Restore this backup and replace the progress currently on this device?')) return; setData({pages:d.pages,target:d.target||50,sort:d.sort||'asc',onboarded:true}); setScreen('home'); setToast('Backup restored.'); } catch { setToast('This is not a valid Tathbit backup.'); } finally { event.target.value=''; } };
    reader.readAsText(file);
  }
  function enterGuest() { setAccountMode('guest'); setData(old=>({...old,onboarded:true})); setScreen('home'); }
  function enterDemoAccount() { setAccountMode('demo'); setData(old=>({...old,onboarded:true})); setScreen('home'); setToast('You are viewing the local demo account preview.'); }

  if (screen === 'welcome' || screen === 'auth') return <div className="welcome"><header><Brand/></header>{screen==='welcome' ? <section className="welcome-card"><div className="hero-icon"><BookOpen size={31}/></div><span className="eyebrow">A LITTLE, CONSISTENTLY</span><h1>Make your memorisation <em>firm.</em></h1><p>A calm space to track your Qur’an revision, one repetition at a time.</p><button className="primary wide" onClick={enterGuest}>Continue as guest <ChevronRight size={17}/></button><button className="secondary wide" onClick={()=>{setAuth('signup');setScreen('auth')}}>Create an account <UserRound size={17}/></button><small><ShieldCheck size={13}/> Guest progress stays on this device.</small></section> : <section className="auth-card"><button className="back" onClick={()=>setScreen('welcome')}>← Back</button><span className="eyebrow">YOUR TATHBIT SPACE</span><h1>{auth==='signup'?'Create your account':'Welcome back'}</h1><p className="muted">Account screens are a UI preview. Secure authentication and cloud sync must be connected before real account use.</p><div className="tabs"><button className={auth==='signup'?'active':''} onClick={()=>setAuth('signup')}>Create account</button><button className={auth==='signin'?'active':''} onClick={()=>setAuth('signin')}>Sign in</button></div><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label>Password<input type="password" placeholder="At least 6 characters"/></label>{auth==='signup'&&<label>Repetition target<input type="number" defaultValue="50" min="1"/></label>}<button className="primary wide" onClick={()=>setToast('Authentication is not connected yet. Use the demo preview below.')}>{auth==='signup'?'Create account':'Sign in'} <ChevronRight size={17}/></button><button className="secondary wide demo-preview" onClick={enterDemoAccount}>Preview demo account <UserRound size={16}/></button><small>Authentication is not connected. The demo preview uses local device data and does not create an account.</small></section>}<footer>تثبيت · Strength through repetition</footer>{toast&&<Toast text={toast}/>}</div>;

  const nav=[['home','Home',Home],['pages','My pages',BookOpen],['settings','Settings',Settings]];
  return <div className={`app ${sidebar ? 'sidebar-expanded' : 'sidebar-collapsed'}`}><header className="topbar"><div className="top-left"><button className="icon-btn desktop" onClick={()=>setSidebar(!sidebar)} aria-label="Toggle sidebar" aria-expanded={sidebar}>{sidebar?<PanelLeftClose/>:<PanelLeftOpen/>}</button><button className="icon-btn mobile" onClick={()=>setSidebar(!sidebar)} aria-label="Open menu"><Menu/></button><Brand/></div><div className="top-right"><span className="guest"><i/> {accountMode==='demo'?'Demo account':'Guest mode'}</span><button className="avatar" onClick={()=>setScreen('settings')}><UserRound size={17}/></button></div></header>
    <aside className={`sidebar ${sidebar?'open':''}`}><span className="side-label">WORKSPACE</span>{nav.map(([id,label,Icon])=><button key={id} className={`nav-item ${screen===id?'selected':''}`} onClick={()=>{setScreen(id);if(innerWidth<760)setSidebar(false)}}><Icon size={18}/><span>{label}</span></button>)}<div className="side-quote">“And We have certainly made the Qur’an easy for remembrance.”<small>Qur’an 54:17</small></div><div className="version">TATHBIT · VERSION 1.0</div></aside>
    {sidebar&&<button className="scrim" onClick={()=>setSidebar(false)} aria-label="Close menu"/>}
    <main className="content">
      {screen==='home'&&<><PageHeading eyebrow="YOUR REVISION SPACE" title="Assalamu alaykum." subtitle="Keep showing up, one repetition at a time." action={()=>setModal(true)}/><div className="stats"><Stat label="Pages tracked" value={data.pages.length} detail="In your revision list"/><Stat label="Repetitions" value={total.toLocaleString()} detail="Every tap counts"/><Stat label="Completed pages" value={done} detail={`${data.pages.length-done} in progress`}/></div><section className="panel overview"><div className="section-head"><div><span className="eyebrow">YOUR CONSISTENCY</span><h2>Overall progress</h2></div><strong>{progress}%</strong></div><div className="track"><i style={{width:`${progress}%`}}/></div><p>Based on the repetition targets for your tracked pages.</p></section><section><div className="section-head"><div><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>Recently tracked</h2></div><button className="link" onClick={()=>setScreen('pages')}>View all →</button></div>{data.pages.length?<div className="page-list">{[...data.pages].sort((a,b)=>b.number-a.number).slice(0,4).map(p=><PageRow key={p.number} page={p} increment={increment}/>)}</div>:<Empty onAdd={()=>setModal(true)}/>}</section></>}
      {screen==='pages'&&<><PageHeading eyebrow="YOUR REVISION COLLECTION" title="My pages" subtitle="Every page, in one place. Keep building consistency." action={()=>setModal(true)}/><div className="toolbar"><div className="search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search page number..."/><kbd>/</kbd></div><button className="secondary sort" onClick={()=>setData(d=>({...d,sort:d.sort==='asc'?'desc':'asc'}))}><ArrowUpDown size={15}/>{data.sort==='asc'?'Ascending':'Descending'}</button></div><div className="filters">{[['all','All pages'],['progress','In progress'],['done','Completed']].map(([id,label])=><button key={id} className={filter===id?'active':''} onClick={()=>setFilter(id)}>{label}{id==='all'&&<span>{data.pages.length}</span>}</button>)}</div>{shown.length?<div className="page-list">{shown.map(p=><PageRow key={p.number} page={p} increment={increment}/>)}</div>:<Empty onAdd={()=>setModal(true)} search={!!search||filter!=='all'}/>}<p className="footnote">Page range: 1–604 · Progress is saved on this device.</p></>}
      {screen==='settings'&&<><PageHeading eyebrow="MAKE TATHBIT YOURS" title="Settings" subtitle="Manage your preferences and keep your progress safe."/><section className="panel settings"><div className="setting-title"><span className="setting-icon"><SlidersHorizontal/></span><div><h2>Repetition preferences</h2><p>Set the default for pages you add in the future.</p></div></div><label>Default repetition target<div className="target-row"><input type="number" min="1" max="10000" value={targetDraft} onChange={e=>setTargetDraft(e.target.value)}/><span>repetitions per page</span><button className="primary small" onClick={saveTarget}>Save</button></div></label><p className="hint">Changing this target will not affect pages you are already tracking.</p></section><section className="panel settings"><div className="setting-title"><span className="setting-icon"><UserRound/></span><div><h2>Account</h2><p>Your current access and data storage.</p></div></div><div className="account-row"><div><b>{accountMode==='demo'?'Demo account preview':'Guest mode'}</b><p>{accountMode==='demo'?'You are previewing the signed-in experience. No real account exists.':'Your progress is saved locally in this browser.'}</p></div><span className="pill">{accountMode==='demo'?'PREVIEW':'GUEST'}</span></div><p className="hint">Secure sign-in and cross-device cloud sync are not connected in this version. Your progress remains stored locally on this device.</p>{accountMode==='demo'?<button className="link" onClick={()=>{setAccountMode('guest');setScreen('welcome')}}>Exit demo account →</button>:<button className="link" onClick={()=>{setAuth('signup');setScreen('auth')}}>Create an account →</button>}</section><section className="panel settings"><div className="setting-title"><span className="setting-icon"><ShieldCheck/></span><div><h2>Backup & restore</h2><p>Keep a copy of your revision progress.</p></div></div><div className="backup-buttons"><button className="secondary" onClick={exportData}><Download size={16}/>Export backup</button><button className="secondary" onClick={()=>document.getElementById('restore-file').click()}><FileUp size={16}/>Restore backup</button><input id="restore-file" type="file" accept="application/json,.json" hidden onChange={restore}/></div><p className="hint">Restoring a backup replaces current data on this device. You’ll be asked to confirm first.</p></section><div className="about"><span><Leaf/></span><div><b>Tathbit · تثبيت</b><p>Strength through repetition.</p></div><small>VERSION 1.0</small></div></>}
    </main><nav className="bottom-nav">{nav.map(([id,label,Icon])=><button key={id} className={screen===id?'active':''} onClick={()=>setScreen(id)}><Icon size={19}/><span>{label}</span></button>)}</nav>
    {modal&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}}><section className="modal"><div className="modal-head"><div><span className="eyebrow">GROW YOUR REVISION LIST</span><h2>Add Qur’an pages</h2></div><button className="icon-btn" onClick={()=>setModal(false)} aria-label="Close"><X/></button></div><p>Add one page or a range. Pages already on your list will keep their progress.</p><label>Page number or range<input autoFocus value={range} onChange={e=>setRange(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addPages()} placeholder="e.g. 415 or 415–430"/></label><div className="modal-info"><BookOpen size={15}/>Pages 1–604 · Default target: {data.target} repetitions per page</div><div className="modal-actions"><button className="secondary" onClick={()=>setModal(false)}>Cancel</button><button className="primary" onClick={addPages}><Plus size={16}/>Add pages</button></div></section></div>}
    {toast&&<Toast text={toast}/>}
  </div>;
}
function Brand(){return <div className="brand"><span className="brand-mark"><BookOpen size={17}/></span><b>TATHBIT</b><span className="arabic">تثبيت</span></div>}
function PageHeading({eyebrow,title,subtitle,action}){return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>{action&&<button className="primary add-btn" onClick={action}><Plus size={16}/>Add pages</button>}</div>}
function Stat({label,value,detail}){return <article className="stat"><span>{label}</span><strong>{value}</strong><p>{detail}</p></article>}
function PageRow({page,increment}){const pct=Math.min(100,Math.round(page.count/page.target*100));const complete=page.count>=page.target;return <article className="page-row"><div className="page-no"><small>PAGE</small><b>{page.number}</b></div><div className="page-progress"><div className="progress-line"><b>{page.count.toLocaleString()} <span>/ {page.target.toLocaleString()}</span></b>{complete?<em><Check size={12}/>Target reached</em>:<small>{pct}%</small>}</div><div className="mini-track"><i className={complete?'complete':''} style={{width:`${pct}%`}}/></div></div><button className="plus-btn" onClick={()=>increment(page.number)} aria-label={`Add repetition to page ${page.number}`}><Plus size={19}/></button></article>}
function Empty({onAdd,search=false}){return <div className="empty"><span><BookOpen/></span><h3>{search?'No matching pages':'Your list starts here'}</h3><p>{search?'Try another page number or change the filter.':'Add a page or a range to begin tracking your repetitions.'}</p>{!search&&<button className="primary" onClick={onAdd}><Plus size={16}/>Add your first page</button>}</div>}
function Toast({text}){return <div className="toast" role="status"><Check size={15}/>{text}</div>}
