// ============================================================
//  SSCU CASHBOOK — FULL PRODUCTION APP (FIXED)
//  Built with React + Firebase (Auth + Firestore)
//
//  🔧 SETUP CHECKLIST:
//  1. npm install firebase lucide-react
//  2. npm install -D tailwindcss postcss autoprefixer
//  3. npx tailwindcss init -p
//  4. Add Tailwind directives to your index.css (see below)
//  5. Configure tailwind.config.js content to include "./src/**/*.{js,jsx}"
//  6. Fill in YOUR_* values in FIREBASE CONFIG (or use .env)
// ============================================================

import React, { useState, useMemo, useEffect, useRef } from 'react';

// ── FIREBASE IMPORTS ─────────────────────────────────────────
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  enableIndexedDbPersistence,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

// ── LUCIDE ICONS ─────────────────────────────────────────────
import {
  LayoutDashboard, PlusCircle, MinusCircle, BookOpen, Settings,
  Search, ArrowUpRight, ArrowDownLeft, ChevronRight, Trash2,
  Edit3, CheckCircle2, Circle, ArrowLeft, UserPlus, History,
  Building2, FileDown, Settings2, MoreHorizontal, X, PieChart,
  Palette, ShieldCheck, Database, BellRing, Languages,
  BadgeDollarSign, Sun, Moon, Copyright, LogIn, PhoneCall,
  Mail, Eye, EyeOff, Loader2, AlertCircle, CheckCircle,
} from 'lucide-react';

// ╔══════════════════════════════════════════════════════════╗
// ║            🔑  FIREBASE CONFIG — MOVE TO .env            ║
// ╚══════════════════════════════════════════════════════════╝
const firebaseConfig = {
  apiKey: "AIzaSyCp3RCIIlZpDgZvH7YF6vqzzA5shYymO24",
  authDomain: "sscu-cashbook.firebaseapp.com",
  projectId: "sscu-cashbook",
  storageBucket: "sscu-cashbook.firebasestorage.app",
  messagingSenderId: "616298686903",
  appId: "1:616298686903:web:01396d5f1af5c0eb40a032",
  measurementId: "G-73H1ZPJ9H4"
};

// ──────────────────────────────────────────────────────────────

// ── FIREBASE INITIALISATION ───────────────────────────────────
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Enable offline support
enableIndexedDbPersistence(db).catch((err) => {
  console.warn("Offline persistence failed:", err);
});

// ── HELPERS ───────────────────────────────────────────────────
const formatCurrency = (val) =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(val || 0);

const userBooksRef = (uid) => collection(db, `users/${uid}/books`);
const userTxRef = (uid) => collection(db, `users/${uid}/transactions`);
const bookDocRef = (uid, id) => doc(db, `users/${uid}/books/${id}`);
const txDocRef = (uid, id) => doc(db, `users/${uid}/transactions/${id}`);

// ════════════════════════════════════════════════════════════
//  AUTH SCREEN  (Login / Register with Email or Phone)
// ════════════════════════════════════════════════════════════
const AuthScreen = () => {
  const [mode, setMode] = useState('login');   // 'login' | 'register' | 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [confirmResult, setConfirmResult] = useState(null);
  const recaptchaRef = useRef(null);
  const otpInputRef = useRef(null);

  // Cleanup reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        delete window.recaptchaVerifier;
      }
    };
  }, []);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (mode === 'register') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        await sendEmailVerification(cred.user);
        setInfo('Account created! Check your email to verify your address.');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(.*\)/, '').trim());
    }
    setLoading(false);
  };

  const handleSendOTP = async () => {
    setLoading(true); setError('');
    try {
      // Clean up previous verifier
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmResult(result);
      setInfo('OTP sent to ' + phone);
      // Auto-focus OTP input
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(.*\)/, '').trim());
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setLoading(true); setError('');
    try {
      await confirmResult.confirm(otp);
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
      <div id="recaptcha-container" ref={recaptchaRef}></div>

      <div className="bg-slate-800 rounded-3xl p-8 w-full max-w-md border border-slate-700 shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Building2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">SSCU Terminal</h1>
          <p className="text-slate-400 text-xs font-bold">Secure Credit Union System</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6">
          {[['login', 'Login'], ['register', 'Register'], ['phone', 'Phone OTP']].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setError(''); setInfo(''); }}
              className={`flex-1 py-2 rounded-xl font-bold text-xs transition-colors ${
                mode === m ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Error / Info banners */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 flex gap-2 text-red-300 text-sm">
            <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
          </div>
        )}
        {info && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-4 flex gap-2 text-green-300 text-sm">
            <CheckCircle size={16} className="shrink-0 mt-0.5" /> {info}
          </div>
        )}

        {/* EMAIL / REGISTER FORM */}
        {(mode === 'login' || mode === 'register') && (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'register' && (
              <AuthInput icon={<UserPlus size={16} />} placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
            )}
            <AuthInput icon={<Mail size={16} />} type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
            <div className="relative">
              <AuthInput icon={<ShieldCheck size={16} />} type={showPw ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50">
              {loading ? <Loader2 size={18} className="animate-spin" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>
        )}

        {/* PHONE OTP FORM */}
        {mode === 'phone' && (
          <div className="space-y-4">
            <AuthInput icon={<PhoneCall size={16} />} type="tel" placeholder="+233 XX XXX XXXX" value={phone} onChange={e => setPhone(e.target.value)} />
            <button onClick={handleSendOTP} disabled={loading || !phone} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send OTP'}
            </button>
            {confirmResult && (
              <>
                <AuthInput icon={<ShieldCheck size={16} />} placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} inputRef={otpInputRef} />
                <button onClick={handleVerifyOTP} disabled={loading || otp.length < 6} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify OTP'}
                </button>
              </>
            )}
          </div>
        )}

        <p className="text-center text-slate-500 text-[10px] font-bold mt-6">Secured by Firebase Authentication</p>
      </div>
    </div>
  );
};

// Enhanced AuthInput with ref support
const AuthInput = React.forwardRef(({ icon, ...props }, ref) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
    <input ref={ref} {...props} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
  </div>
));

// ════════════════════════════════════════════════════════════
//  MAIN APP  (shown after login)
// ════════════════════════════════════════════════════════════
const MainApp = ({ user }) => {
  const uid = user.uid;

  // ── REALTIME DATA from Firestore ───────────────────────────
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    // Books listener with error handling
    const unsubBooks = onSnapshot(
      userBooksRef(uid),
      (snap) => {
        setBooks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoadingData(false);
      },
      (err) => {
        console.error("Books listener error:", err);
        setLoadingData(false);
      }
    );

    // Transactions listener
    const unsubTx = onSnapshot(
      userTxRef(uid),
      (snap) => {
        setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      (err) => console.error("Transactions listener error:", err)
    );

    return () => { unsubBooks(); unsubTx(); };
  }, [uid]);

  // ── UI STATE ───────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [viewingBookId, setViewingBookId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookModal, setBookModal] = useState(null);
  const [txModal, setTxModal] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const [selectedBookIds, setSelectedBookIds] = useState([]);
  const [deductionAmount, setDeductionAmount] = useState('');
  const [deductionDesc, setDeductionDesc] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [batchError, setBatchError] = useState('');

  // ── COMPUTED ───────────────────────────────────────────────
  const globalStats = useMemo(() => {
    const totalIn = transactions.filter(t => t.type === 'IN').reduce((a, t) => a + t.amount, 0);
    const totalOut = transactions.filter(t => t.type === 'OUT').reduce((a, t) => a + t.amount, 0);
    return { totalIn, totalOut, totalBalance: totalIn - totalOut };
  }, [transactions]);

  const filteredBooks = useMemo(() =>
    books.filter(b =>
      b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.accountNumber?.includes(searchQuery)
    ), [books, searchQuery]);

  const activeBook = useMemo(() => books.find(b => b.id === viewingBookId), [books, viewingBookId]);
  const activeBookTxs = useMemo(() => transactions.filter(t => t.bookId === viewingBookId), [transactions, viewingBookId]);
  const activeBookBalance = useMemo(() =>
    activeBookTxs.reduce((sum, t) => sum + (t.type === 'IN' ? t.amount : -t.amount), 0),
    [activeBookTxs]);

  // ── FIRESTORE CRUD (with batch delete for books) ───────────
  const saveBook = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.target);
    const data = { name: fd.get('name'), accountNumber: fd.get('accountNumber') };

    try {
      if (bookModal.mode === 'add') {
        await addDoc(userBooksRef(uid), { ...data, createdAt: serverTimestamp() });
      } else {
        await updateDoc(bookDocRef(uid, bookModal.book.id), data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save member. Check console.");
    } finally {
      setSaving(false);
      setBookModal(null);
    }
  };

  const deleteBook = async (bookId) => {
    if (!window.confirm("Delete this member and ALL their transactions? This cannot be undone.")) return;
    setSaving(true);
    try {
      const batch = writeBatch(db);
      // Delete all transactions for this book
      const txQuery = query(userTxRef(uid), where("bookId", "==", bookId));
      const txSnap = await getDocs(txQuery);
      txSnap.forEach(docSnap => batch.delete(docSnap.ref));
      // Delete the book itself
      batch.delete(bookDocRef(uid, bookId));
      await batch.commit();
      setViewingBookId(null);
    } catch (err) {
      console.error("Delete book error:", err);
      alert("Failed to delete member. Check permissions or try again.");
    } finally {
      setSaving(false);
    }
  };

  const saveTransaction = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.target);
    const data = {
      amount: parseFloat(fd.get('amount')),
      desc: fd.get('desc'),
      type: txModal.type,
      bookId: txModal.bookId,
      date: serverTimestamp(),
    };

    try {
      if (txModal.mode === 'add') {
        await addDoc(userTxRef(uid), data);
      } else {
        await updateDoc(txDocRef(uid, txModal.tx.id), data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save transaction.");
    } finally {
      setSaving(false);
      setTxModal(null);
      setSelectedTx(null);
    }
  };

  const deleteTransaction = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await deleteDoc(txDocRef(uid, id));
      setSelectedTx(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete transaction.");
    }
  };

  const applyBatchDeduction = async () => {
    if (!deductionAmount || selectedBookIds.length === 0) return;
    setSaving(true);
    setBatchError('');
    const amt = parseFloat(deductionAmount);
    try {
      await Promise.all(selectedBookIds.map(id =>
        addDoc(userTxRef(uid), {
          bookId: id, type: 'OUT', amount: amt,
          desc: deductionDesc.trim() || 'Monthly Membership Deduction',
          date: serverTimestamp(),
        })
      ));
      setSelectedBookIds([]);
      setDeductionAmount('');
      setDeductionDesc('');
      setActiveTab('dashboard');
    } catch (err) {
      console.error("Batch deduction error:", err);
      setBatchError("Batch failed. Check console or network.");
    } finally {
      setSaving(false);
    }
  };

  const exportData = () => {
    const exportObj = {
      books,
      transactions,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(exportObj, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sscu_export_${uid}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── THEME (Tailwind classes) ──────────────────────────────
  const D = isDarkMode;
  const themeBg = D ? 'bg-slate-950' : 'bg-slate-50';
  const themeCard = D ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900';
  const themeTextMuted = D ? 'text-slate-400' : 'text-slate-500';
  const themeHeader = D ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const themeInput = D ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-900';

  const NavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cashbooks', label: 'Cashbooks', icon: BookOpen },
    { id: 'deductions', label: 'Deductions', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loadingData) return (
    <div className={`min-h-screen ${themeBg} flex items-center justify-center`}>
      <Loader2 className="text-blue-500 animate-spin" size={40} />
    </div>
  );

  return (
    <div className={`flex flex-col h-screen ${themeBg} font-sans overflow-hidden transition-colors duration-300`}>

      {/* HEADER */}
      <header className={`${themeHeader} border-b px-6 py-4 flex items-center justify-between sticky top-0 z-30`}>
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md"><Building2 size={20} /></div>
          <h1 className="font-black text-lg lg:text-xl truncate tracking-tight uppercase">
            {viewingBookId ? 'Member Detail' : NavItems.find(n => n.id === activeTab)?.label}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsDarkMode(!D)} className={`p-2 rounded-xl ${D ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}>
            {D ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${D ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
            {user.displayName || user.email?.split('@')[0] || 'Member'}
          </div>
          <div className="hidden sm:flex items-center gap-2 text-green-600 font-bold text-[10px] uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> LIVE
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-32">
        <div className="max-w-6xl mx-auto">

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-5"><BadgeDollarSign size={140} /></div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  <div className="space-y-1">
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Current Balance</p>
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tighter truncate">{formatCurrency(globalStats.totalBalance)}</h2>
                  </div>
                  <div className="h-full border-l border-slate-800 hidden md:block" />
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-500/20 p-2 rounded-xl text-green-400"><ArrowUpRight size={20} /></div>
                      <div><p className="text-slate-400 text-[10px] font-black uppercase">Gross Deposits</p><p className="text-lg font-black">{formatCurrency(globalStats.totalIn)}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-red-500/20 p-2 rounded-xl text-red-400"><ArrowDownLeft size={20} /></div>
                      <div><p className="text-slate-400 text-[10px] font-black uppercase">Gross Withdrawals</p><p className="text-lg font-black">{formatCurrency(globalStats.totalOut)}</p></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => setActiveTab('cashbooks')} className={`${themeCard} p-8 rounded-[2rem] border-2 flex items-center justify-between hover:scale-[1.01] transition-all shadow-sm group`}>
                  <div className="flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-blue-600 text-white"><BookOpen size={28} /></div>
                    <div className="text-left">
                      <h4 className="font-black text-xl">Member Directory</h4>
                      <p className={`${themeTextMuted} text-sm font-bold tracking-wide uppercase`}>{books.length} Active Accounts</p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => setActiveTab('deductions')} className={`${themeCard} p-8 rounded-[2rem] border-2 flex items-center justify-between hover:scale-[1.01] transition-all shadow-sm group`}>
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl ${D ? 'bg-slate-700' : 'bg-slate-900'} text-white`}><PieChart size={28} /></div>
                    <div className="text-left">
                      <h4 className="font-black text-xl">Batch Deductions</h4>
                      <p className={`${themeTextMuted} text-sm font-bold tracking-wide uppercase`}>Process Monthly Charges</p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* CASHBOOKS */}
          {activeTab === 'cashbooks' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {!viewingBookId ? (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        type="text" placeholder="Search by name or SSCU-ID..."
                        className={`w-full pl-12 pr-4 py-3 ${themeInput} rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all`} />
                    </div>
                    <button onClick={() => setBookModal({ mode: 'add' })}
                      className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-colors">
                      <UserPlus size={20} /> Add Member
                    </button>
                  </div>

                  <div className={`${themeCard} rounded-[2.5rem] border overflow-hidden shadow-sm`}>
                    <div className={`grid grid-cols-12 gap-4 px-8 py-4 ${D ? 'bg-slate-800/50' : 'bg-slate-50'} border-b ${D ? 'border-slate-800' : 'border-slate-100'} text-[10px] font-black uppercase tracking-widest text-slate-400`}>
                      <div className="col-span-3">ID Number</div>
                      <div className="col-span-5">Member Name</div>
                      <div className="col-span-3 text-right">Balance</div>
                      <div className="col-span-1"></div>
                    </div>
                    <div className={`divide-y ${D ? 'divide-slate-800' : 'divide-slate-50'}`}>
                      {filteredBooks.length === 0 && (
                        <div className="px-8 py-12 text-center">
                          <p className={`${themeTextMuted} font-bold`}>No members yet. Add your first member above.</p>
                        </div>
                      )}
                      {filteredBooks.map(book => {
                        const bal = transactions.filter(t => t.bookId === book.id)
                          .reduce((sum, t) => sum + (t.type === 'IN' ? t.amount : -t.amount), 0);
                        return (
                          <div key={book.id} onClick={() => setViewingBookId(book.id)}
                            className={`grid grid-cols-12 gap-4 px-8 py-6 items-center cursor-pointer transition-colors group hover:bg-blue-50/5`}>
                            <div className={`col-span-3 font-bold ${themeTextMuted} tracking-tight`}>{book.accountNumber}</div>
                            <div className="col-span-5 flex items-center gap-4">
                              <div className={`w-10 h-10 ${D ? 'bg-slate-800' : 'bg-slate-100'} rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all`}>
                                <Building2 size={18} />
                              </div>
                              <span className="font-black">{book.name}</span>
                            </div>
                            <div className="col-span-3 text-right">
                              <span className={`font-black text-lg ${bal >= 0 ? 'text-inherit' : 'text-red-500'}`}>{formatCurrency(bal)}</span>
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <ChevronRight className="text-slate-400 group-hover:text-blue-600" size={20} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center justify-between">
                    <button onClick={() => setViewingBookId(null)} className={`flex items-center gap-2 ${themeTextMuted} font-bold`}>
                      <ArrowLeft size={18} /> Back to Directory
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => setBookModal({ mode: 'edit', book: activeBook })} className={`${themeCard} flex items-center gap-2 px-4 py-2 border rounded-xl font-black text-xs hover:border-blue-500 transition-all`}>
                        <Settings2 size={16} /> Settings
                      </button>
                      <button onClick={() => deleteBook(activeBook.id)} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-black text-xs shadow-md hover:bg-red-700 transition-colors disabled:opacity-50">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className={`${themeCard} lg:col-span-2 p-8 rounded-[2.5rem] border shadow-sm flex flex-col md:flex-row justify-between items-center gap-6`}>
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Building2 size={32} /></div>
                        <div>
                          <h2 className="text-2xl font-black">{activeBook?.name}</h2>
                          <p className={`${themeTextMuted} font-bold tracking-widest uppercase text-xs`}>{activeBook?.accountNumber}</p>
                        </div>
                      </div>
                      <div className="text-center md:text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Savings</p>
                        <p className="text-3xl font-black text-blue-500">{formatCurrency(activeBookBalance)}</p>
                      </div>
                    </div>
                    <div className={`${themeCard} p-6 rounded-[2.5rem] border shadow-sm flex flex-col justify-center gap-3`}>
                      <button onClick={() => setTxModal({ mode: 'add', type: 'IN', bookId: activeBook.id })} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg hover:bg-green-700 transition-colors">
                        <PlusCircle size={20} /> Cash In
                      </button>
                      <button onClick={() => setTxModal({ mode: 'add', type: 'OUT', bookId: activeBook.id })} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg hover:bg-red-700 transition-colors">
                        <MinusCircle size={20} /> Cash Out
                      </button>
                    </div>
                  </div>

                  <div className={`${themeCard} rounded-[2.5rem] border shadow-sm overflow-hidden mb-12`}>
                    <div className={`p-6 border-b ${D ? 'border-slate-800' : 'border-slate-50'} flex items-center justify-between`}>
                      <h3 className="font-black text-lg flex items-center gap-2"><History size={20} className="text-slate-400" /> Ledger Entry</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className={`${D ? 'bg-slate-800/50' : 'bg-slate-50'} text-[10px] font-black text-slate-400 uppercase`}>
                          <tr>
                            <th className="px-8 py-4">Date</th>
                            <th className="px-8 py-4">Description</th>
                            <th className="px-8 py-4 text-right">In</th>
                            <th className="px-8 py-4 text-right">Out</th>
                            <th className="px-8 py-4"></th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${D ? 'divide-slate-800' : 'divide-slate-50'}`}>
                          {activeBookTxs.length === 0 && (
                            <tr><td colSpan={5} className="px-8 py-10 text-center"><p className={`${themeTextMuted} font-bold`}>No transactions yet.</p></td></tr>
                          )}
                          {[...activeBookTxs].reverse().map(tx => (
                            <tr key={tx.id} onClick={() => setSelectedTx(tx)} className="cursor-pointer group transition-colors hover:bg-blue-50/5">
                              <td className={`px-8 py-5 text-xs font-bold ${themeTextMuted}`}>{tx.date?.toDate ? tx.date.toDate().toLocaleDateString() : 'Just now'}</td>
                              <td className="px-8 py-5 font-bold">{tx.desc}</td>
                              <td className="px-8 py-5 text-right font-black text-green-500">{tx.type === 'IN' ? formatCurrency(tx.amount) : '—'}</td>
                              <td className="px-8 py-5 text-right font-black text-red-500">{tx.type === 'OUT' ? formatCurrency(tx.amount) : '—'}</td>
                              <td className="px-8 py-5 text-right"><MoreHorizontal className="text-slate-400 group-hover:text-blue-500" size={18} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DEDUCTIONS */}
          {activeTab === 'deductions' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className={`${themeCard} p-8 rounded-[2.5rem] border shadow-sm space-y-6`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black">Batch Member Charges</h3>
                  <button onClick={() => setSelectedBookIds(selectedBookIds.length === books.length ? [] : books.map(b => b.id))}
                    className={`${D ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'} px-4 py-2 rounded-xl text-xs font-black`}>
                    {selectedBookIds.length === books.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                {batchError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm flex gap-2">
                    <AlertCircle size={16} /> {batchError}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {books.map(book => (
                      <button key={book.id}
                        onClick={() => setSelectedBookIds(prev => prev.includes(book.id) ? prev.filter(id => id !== book.id) : [...prev, book.id])}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedBookIds.includes(book.id) ? 'border-blue-600 bg-blue-500/10' : D ? 'border-slate-800' : 'border-slate-100'}`}>
                        <div className="text-left font-black">{book.name}</div>
                        {selectedBookIds.includes(book.id) ? <CheckCircle2 className="text-blue-500" size={20} /> : <Circle className="text-slate-400" size={20} />}
                      </button>
                    ))}
                  </div>
                  <div className={`${D ? 'bg-slate-800/50' : 'bg-slate-50'} p-6 rounded-[2rem] space-y-4`}>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Charge Amount (GHS)</label>
                      <input value={deductionAmount} onChange={e => setDeductionAmount(e.target.value)} type="number" placeholder="0.00"
                        className={`w-full ${themeInput} border-2 rounded-2xl py-4 px-6 text-xl font-black outline-none focus:ring-2 focus:ring-blue-500`} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Charge Narrative</label>
                      <input value={deductionDesc} onChange={e => setDeductionDesc(e.target.value)} type="text" placeholder="Monthly Fee, etc."
                        className={`w-full ${themeInput} border-2 rounded-2xl py-4 px-6 font-bold outline-none focus:ring-2 focus:ring-blue-500`} />
                    </div>
                    <button onClick={applyBatchDeduction} disabled={selectedBookIds.length === 0 || !deductionAmount || saving}
                      className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-lg disabled:opacity-50 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      {saving ? <Loader2 size={18} className="animate-spin" /> : null}
                      Process Batch ({selectedBookIds.length} members)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
              <section className={`${themeCard} p-8 rounded-[2.5rem] border shadow-sm`}>
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck size={20} className="text-blue-500" />
                  <h3 className="text-xl font-black">Signed In Account</h3>
                </div>
                <div className={`${D ? 'bg-slate-800/50' : 'bg-slate-50'} p-4 rounded-2xl`}>
                  <p className="font-black">{user.displayName || 'User'}</p>
                  <p className={`${themeTextMuted} text-sm font-bold`}>{user.email || user.phoneNumber}</p>
                  <p className={`text-[10px] mt-1 ${user.emailVerified ? 'text-green-500' : 'text-yellow-500'} font-black uppercase`}>
                    {user.emailVerified ? '✓ Email Verified' : '⚠ Email not verified'}
                  </p>
                </div>
              </section>

              <section className={`${themeCard} p-8 rounded-[2.5rem] border shadow-sm`}>
                <div className="flex items-center gap-3 mb-6">
                  <Palette size={20} className="text-blue-500" />
                  <h3 className="text-xl font-black">Visual Preference</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setIsDarkMode(false)} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${!D ? 'border-blue-600 bg-blue-500/10' : D ? 'border-slate-800 bg-slate-800/50' : 'border-transparent bg-slate-50'}`}>
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600"><Sun size={20} /></div>
                    <span className="font-black uppercase text-xs">Light</span>
                  </button>
                  <button onClick={() => setIsDarkMode(true)} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${D ? 'border-blue-600 bg-blue-500/10' : 'border-transparent bg-slate-100'}`}>
                    <div className="w-10 h-10 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center text-yellow-400"><Moon size={20} /></div>
                    <span className="font-black uppercase text-xs">Dark</span>
                  </button>
                </div>
              </section>

              <section className={`${themeCard} p-8 rounded-[2.5rem] border shadow-sm`}>
                <div className="flex items-center gap-3 mb-6">
                  <BadgeDollarSign size={20} className="text-blue-500" />
                  <h3 className="text-xl font-black">Regional Config</h3>
                </div>
                <div className="space-y-4">
                  <div className={`flex items-center justify-between p-4 ${D ? 'bg-slate-800/50' : 'bg-slate-50'} rounded-2xl`}>
                    <div className="flex items-center gap-3 font-bold"><Languages size={18} className="text-slate-400" /> Operational Currency</div>
                    <span className="font-black text-blue-500">GHS (GH₵)</span>
                  </div>
                  <div className={`flex items-center justify-between p-4 ${D ? 'bg-slate-800/50' : 'bg-slate-50'} rounded-2xl`}>
                    <div className="flex items-center gap-3 font-bold"><BellRing size={18} className="text-slate-400" /> Notifications</div>
                    <button onClick={() => setNotifications(!notifications)} className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-green-500' : 'bg-slate-600'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </section>

              <section className={`${themeCard} p-8 rounded-[2.5rem] border shadow-sm`}>
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck size={20} className="text-blue-500" />
                  <h3 className="text-xl font-black">System Security</h3>
                </div>
                <div className="space-y-4">
                  <button onClick={() => signOut(auth)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all">
                    <LogIn size={18} /> Sign Out
                  </button>
                  <button onClick={exportData} className={`w-full py-4 border-2 ${D ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'} rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-500 hover:text-white transition-all`}>
                    <Database size={18} /> Export Data (.json)
                  </button>
                </div>
              </section>

              <footer className="pt-8 flex flex-col items-center gap-2 opacity-60">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest"><Copyright size={14} /> 2024 SSCU Systems</div>
                <p className="text-[10px] font-bold text-center">Made by <span className="text-blue-500">Jizzy Blay Solutions</span></p>
              </footer>
            </div>
          )}

        </div>
      </main>

      {/* BOTTOM NAV */}
      <nav className={`fixed bottom-0 left-0 right-0 ${themeHeader} border-t z-40 px-4 py-3 flex justify-around`}>
        {NavItems.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setViewingBookId(null); }}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${active ? 'text-blue-500' : themeTextMuted}`}>
              <Icon size={22} />
              <span className="text-[10px] font-black uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* MODALS (same as before, unchanged except minor error handling) */}
      {bookModal && (
        <>
          <div onClick={() => setBookModal(null)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]" />
          <div className={`fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md ${themeCard} z-[70] rounded-[2rem] p-8 border shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black">{bookModal.mode === 'add' ? 'Add Member' : 'Edit Member'}</h3>
              <button onClick={() => setBookModal(null)} className={`p-2 ${D ? 'bg-slate-800' : 'bg-slate-100'} rounded-xl`}><X size={20} /></button>
            </div>
            <form onSubmit={saveBook} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Full Name</label>
                <input name="name" defaultValue={bookModal.book?.name} required className={`w-full ${themeInput} border-2 rounded-2xl py-3 px-5 font-bold outline-none focus:ring-2 focus:ring-blue-500`} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Account Number</label>
                <input name="accountNumber" defaultValue={bookModal.book?.accountNumber || `SSCU-${Date.now()}`} required className={`w-full ${themeInput} border-2 rounded-2xl py-3 px-5 font-bold outline-none focus:ring-2 focus:ring-blue-500`} />
              </div>
              <button type="submit" disabled={saving} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg disabled:opacity-50 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                {saving && <Loader2 size={18} className="animate-spin" />}
                {bookModal.mode === 'add' ? 'Add Member' : 'Save Changes'}
              </button>
            </form>
          </div>
        </>
      )}

      {txModal && (
        <>
          <div onClick={() => setTxModal(null)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]" />
          <div className={`fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md ${themeCard} z-[70] rounded-[2rem] p-8 border shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-black ${txModal.type === 'IN' ? 'text-green-500' : 'text-red-500'}`}>
                {txModal.type === 'IN' ? '↑ Cash In' : '↓ Cash Out'}
              </h3>
              <button onClick={() => setTxModal(null)} className={`p-2 ${D ? 'bg-slate-800' : 'bg-slate-100'} rounded-xl`}><X size={20} /></button>
            </div>
            <form onSubmit={saveTransaction} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Amount (GHS)</label>
                <input name="amount" type="number" step="0.01" min="0.01" defaultValue={txModal.tx?.amount} required className={`w-full ${themeInput} border-2 rounded-2xl py-4 px-6 text-2xl font-black outline-none focus:ring-2 focus:ring-blue-500`} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Description</label>
                <input name="desc" defaultValue={txModal.tx?.desc} required className={`w-full ${themeInput} border-2 rounded-2xl py-3 px-5 font-bold outline-none focus:ring-2 focus:ring-blue-500`} />
              </div>
              <button type="submit" disabled={saving} className={`w-full py-4 ${txModal.type === 'IN' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-2xl font-black shadow-lg disabled:opacity-50 transition-colors flex items-center justify-center gap-2`}>
                {saving && <Loader2 size={18} className="animate-spin" />}
                Confirm {txModal.type === 'IN' ? 'Deposit' : 'Withdrawal'}
              </button>
            </form>
          </div>
        </>
      )}

      {selectedTx && (
        <>
          <div onClick={() => setSelectedTx(null)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]" />
          <div className={`fixed top-0 right-0 h-full w-full max-w-sm ${themeCard} z-[70] shadow-2xl p-8 flex flex-col border-l`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black uppercase">Transaction Detail</h3>
              <button onClick={() => setSelectedTx(null)} className={`p-2 ${D ? 'bg-slate-800' : 'bg-slate-100'} rounded-xl`}><X size={20} /></button>
            </div>
            <div className={`${D ? 'bg-slate-800' : 'bg-slate-50'} p-6 rounded-3xl mb-6`}>
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Value</p>
              <h4 className={`text-3xl font-black ${selectedTx.type === 'IN' ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(selectedTx.amount)}</h4>
              <p className="font-bold mt-2">{selectedTx.desc}</p>
              <p className={`text-xs ${themeTextMuted} font-bold mt-1`}>
                {selectedTx.date?.toDate ? selectedTx.date.toDate().toLocaleString() : 'Just now'}
              </p>
            </div>
            <div className="mt-auto space-y-3">
              <button onClick={() => { setTxModal({ mode: 'edit', type: selectedTx.type, bookId: selectedTx.bookId, tx: selectedTx }); setSelectedTx(null); }} className={`w-full py-4 border-2 ${D ? 'border-slate-700' : 'border-slate-200'} rounded-2xl font-black flex items-center justify-center gap-2 hover:border-blue-500 transition-all`}>
                <Edit3 size={18} /> Edit
              </button>
              <button onClick={() => deleteTransaction(selectedTx.id)} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-red-700 transition-colors">
                <Trash2 size={18} /> Delete Entry
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

// ════════════════════════════════════════════════════════════
//  ROOT — watches Firebase auth state
// ════════════════════════════════════════════════════════════
const App = () => {
  const [user, setUser] = useState(undefined);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setChecking(false);
    });
    return unsub;
  }, []);

  if (checking) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center flex-col gap-4">
      <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center">
        <Building2 size={28} className="text-white" />
      </div>
      <Loader2 size={28} className="text-blue-500 animate-spin" />
    </div>
  );

  if (!user) return <AuthScreen />;
  return <MainApp user={user} />;
};

export default App;
