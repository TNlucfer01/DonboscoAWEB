// ─── Auth: Login — DBCAMS Split-Screen Design ─────────────────────────────────
// Based on Stitch "Terra Sancta" design — Don Bosco College of Agriculture
// Screen ID: 55e1077c4f344c4392e94e05804ed7fe

import { useState } from 'react';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { login as authLogin, forgotPassword, resetPassword, ApiError } from '../../api/auth.api';

// ─── Google Fonts (Newsreader + Manrope) ─────────────────────────────────────
const FontLoader = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;0,700;1,400&family=Manrope:wght@400;500;600;700&display=swap');
        .font-newsreader { font-family: 'Newsreader', Georgia, serif; }
        .font-manrope { font-family: 'Manrope', system-ui, sans-serif; }
    `}</style>
);

// ─── Eye Icons ────────────────────────────────────────────────────────────────
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);
const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

// ─── Graduation Cap SVG ───────────────────────────────────────────────────────
const GradCapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"
        stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
);

// ─── Role types ───────────────────────────────────────────────────────────────
const ROLES = ['Principal', 'Year Coordinator', 'Staff'] as const;
type Role = (typeof ROLES)[number];

interface LoginProps {
    onLogin: (role: string, username: string) => void;
    onBack?: () => void;  // optional — provided by LandingPage to show back button
}

// ─── Forgot Password Flow ─────────────────────────────────────────────────────
function ForgotPassword({ onBack }: { onBack: () => void }) {
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (step === 1) {
                if (phone.length !== 10) { setError('Enter a valid 10-digit phone number'); return; }
                await forgotPassword(phone);
                setStep(2);
            } else if (step === 2) {
                setStep(3);
            } else {
                if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
                await resetPassword(phone, otp, newPassword);
                alert('Password reset successful!');
                onBack();
            }
        } catch (err: any) {
            setError(err instanceof ApiError ? err.message : (err.message || 'Something went wrong.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-manrope" style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}>
            <FontLoader />
            {/* Left Panel */}
            <LeftPanel />
            {/* Right Panel — Reset Password */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-[#fbf9f3]">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-[#1b1c19] mb-2" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                            Reset Password
                        </h1>
                        <p className="text-sm text-[#8B5E3C]" style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}>
                            Follow the steps to regain access to your DBCAMS account
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
                            <span>{error}</span>
                            <button onClick={() => setError('')} className="ml-2 text-red-400 hover:text-red-700">✕</button>
                        </div>
                    )}

                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-8">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${step >= s ? 'bg-[#476500] text-white' : 'bg-[#e4e2dd] text-[#757968]'}`}>{s}</div>
                                {s < 3 && <div className={`h-0.5 w-8 rounded-full transition-all ${step > s ? 'bg-[#476500]' : 'bg-[#e4e2dd]'}`} />}
                            </div>
                        ))}
                        <span className="ml-2 text-xs text-[#757968]">
                            {step === 1 ? 'Phone Number' : step === 2 ? 'Verify OTP' : 'New Password'}
                        </span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {step === 1 && (
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-[#44493a]">Registered Phone Number</Label>
                                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                                    placeholder="Enter 10-digit phone number" maxLength={10}
                                    className="w-full h-12 px-4 rounded-xl bg-[#e4e2dd] border-none outline-none text-[#1b1c19] placeholder-[#757968] focus:ring-2 focus:ring-[#476500]/30 transition-all" />
                            </div>
                        )}
                        {step === 2 && (
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-[#44493a]">Enter OTP</Label>
                                <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                                    placeholder="6-digit OTP" maxLength={6}
                                    className="w-full h-12 px-4 rounded-xl bg-[#e4e2dd] border-none outline-none text-[#1b1c19] placeholder-[#757968] text-center tracking-widest text-lg font-bold focus:ring-2 focus:ring-[#476500]/30 transition-all" />
                            </div>
                        )}
                        {step === 3 && (
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-[#44493a]">New Password</Label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                    placeholder="At least 6 characters"
                                    className="w-full h-12 px-4 rounded-xl bg-[#e4e2dd] border-none outline-none text-[#1b1c19] placeholder-[#757968] focus:ring-2 focus:ring-[#476500]/30 transition-all" />
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full h-12 rounded-xl text-white font-semibold text-sm transition-all hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg, #344b00, #6B8E23)', boxShadow: '0 4px 16px rgba(52,75,0,0.25)' }}>
                            {loading ? 'Processing…' : step === 1 ? 'Send OTP' : step === 2 ? 'Verify OTP' : 'Reset Password'}
                        </button>
                        <button type="button" onClick={onBack}
                            className="w-full h-12 rounded-xl text-[#476500] font-medium text-sm bg-[#e4e2dd] hover:bg-[#dae2c8] transition-all">
                            ← Back to Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ─── Left Panel (shared) ──────────────────────────────────────────────────────
function LeftPanel() {
    return (
        <div className="hidden lg:flex lg:w-[48%] xl:w-1/2 relative flex-col items-center justify-center overflow-hidden">
            {/* Background image */}
            <div className="absolute inset-0"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1200")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }} />
            {/* Dark overlay */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(0,0,0,0.18) 0%, rgba(26,54,8,0.80) 100%)' }} />

            {/* Content */}
            <div className="relative z-10 text-center px-10 max-w-md">
                {/* Crest badge */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8 border-2 border-white/40"
                    style={{ background: 'rgba(71,101,0,0.75)', backdropFilter: 'blur(8px)' }}>
                    <GradCapIcon />
                </div>

                {/* College name */}
                <h1 className="text-white text-3xl xl:text-4xl font-bold leading-tight mb-3"
                    style={{ fontFamily: 'Newsreader, Georgia, serif', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                    Don Bosco College<br />of Agriculture
                </h1>

                {/* Gold divider */}
                <div className="mx-auto mb-4 h-px w-16 rounded-full" style={{ background: '#D6A75E' }} />

                {/* DBCAMS tag */}
                <p className="text-[#D6A75E] text-xs font-semibold tracking-[0.3em] uppercase mb-2"
                    style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}>
                    DBCAMS
                </p>
                <p className="text-white/75 text-sm mb-10"
                    style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}>
                    Attendance Management System
                </p>

                {/* Welcome text */}
                <p className="text-white/55 text-xs leading-relaxed italic"
                    style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}>
                    "Welcome to Don Bosco College of Agriculture Attendance Management System — empowering educators, one roll call at a time."
                </p>
            </div>

            {/* Bottom branding bar */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
                <p className="text-white/40 text-[11px]" style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}>
                    © {new Date().getFullYear()} Don Bosco College of Agriculture
                </p>
            </div>
        </div>
    );
}

// ─── Main Login Form ──────────────────────────────────────────────────────────
export default function Login({ onLogin, onBack }: LoginProps) {
    const [role, setRole] = useState<Role>('Principal');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgot, setShowForgot] = useState(false);

    if (showForgot) return <ForgotPassword onBack={() => setShowForgot(false)} />;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email.trim() || !password) {
            setError('Please enter both email and password');
            return;
        }
        setLoading(true);
        try {
            const user = await authLogin(email.trim(), password);
            onLogin(user.role.toLowerCase(), user.name);
        } catch (err: any) {
            if (err instanceof ApiError && err.code === 'AUTH_FAILED') {
                setError('Invalid email or password. Please try again.');
            } else {
                setError(err.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full min-h-screen flex items-center justify-center relative bg-[#fbf9f3]"
            style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}>
            <FontLoader />

            {/* ── Back button — top-right corner, only when onBack is provided ── */}
            {onBack && (
                <button
                    type="button"
                    onClick={onBack}
                    style={{
                        position: 'absolute', top: 20, right: 24, zIndex: 10,
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 18px', borderRadius: 50,
                        border: '1.5px solid #9CAF88',
                        background: '#F7F3EA',
                        color: '#8B5E3C', fontSize: 13, fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
                        transition: 'all 0.2s ease',
                        fontFamily: 'Manrope, system-ui, sans-serif',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = '#E3E8DC';
                        e.currentTarget.style.borderColor = '#8B5E3C';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = '#F7F3EA';
                        e.currentTarget.style.borderColor = '#9CAF88';
                    }}
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
            )}

            {/* ── Login Form (full width — no left image panel) ── */}
            <div className="w-full max-w-md px-6 sm:px-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#1b1c19] mb-1"
                        style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                        Sign In
                    </h1>
                    <p className="text-sm text-[#8B5E3C]">Access your DBCAMS portal</p>
                </div>

                {/* Role Selector */}
                <div className="mb-8">
                    <p className="text-xs font-semibold text-[#757968] uppercase tracking-wider mb-3">Select your role</p>
                    <div className="flex gap-2">
                        {ROLES.map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setRole(r)}
                                className={`flex-1 py-2.5 px-2 rounded-full text-xs font-semibold transition-all duration-200 ${role === r
                                    ? 'text-white shadow-md'
                                    : 'text-[#476500] hover:bg-[#dae2c8]'
                                    }`}
                                style={role === r
                                    ? { background: 'linear-gradient(135deg, #476500, #6B8E23)', boxShadow: '0 3px 10px rgba(52,75,0,0.3)' }
                                    : { background: '#e1f5ca' }
                                }
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start justify-between gap-2">
                        <span>{error}</span>
                        <button type="button" onClick={() => setError('')}
                            className="text-red-400 hover:text-red-700 flex-shrink-0 mt-0.5">✕</button>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-[#44493a]">
                            Email Address
                        </Label>
                        <input
                            id="email" type="email" value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="name@donbosco.edu.in"
                            autoComplete="email"
                            className="w-full h-12 px-4 rounded-xl bg-[#e4e2dd] border-none outline-none text-[#1b1c19] placeholder-[#757968] focus:ring-2 focus:ring-[#476500]/30 transition-all"
                            style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-semibold text-[#44493a]">
                                Password
                            </Label>
                            <button type="button" onClick={() => setShowForgot(true)}
                                className="text-xs font-medium text-[#8B5E3C] hover:text-[#476500] transition-colors">
                                Forgot password?
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                className="w-full h-12 px-4 pr-12 rounded-xl bg-[#e4e2dd] border-none outline-none text-[#1b1c19] placeholder-[#757968] focus:ring-2 focus:ring-[#476500]/30 transition-all"
                                style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}
                            />
                            <button type="button" onClick={() => setShowPassword(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757968] hover:text-[#44493a] transition-colors p-1"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    {/* Sign In Button */}
                    <button type="submit" disabled={loading}
                        className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                            background: 'linear-gradient(135deg, #476500, #6B8E23)',
                            boxShadow: '0 4px 20px rgba(52,75,0,0.28)',
                            fontFamily: 'Manrope, system-ui, sans-serif',
                        }}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Authenticating…
                            </span>
                        ) : (
                            `Sign In as ${role}`
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="mt-10 text-center text-[11px] text-[#9CAF88]"
                    style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}>
                    &copy; {new Date().getFullYear()} Don Bosco College of Agriculture. All rights reserved.
                </p>
            </div>
        </div>
    );
}