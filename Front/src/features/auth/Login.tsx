// ─── Auth: Login ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { GraduationCap, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../app/components/ui/alert';
import { login as authLogin, forgotPassword, resetPassword, ApiError } from '../../api/auth.api';

interface LoginProps {
    onLogin: (role: string, username: string) => void;
}

// ─── Forgot Password Flow ─────────────────────────────────────────────────────
interface ForgotPasswordProps {
    onBack: () => void;
}

function ForgotPassword({ onBack }: ForgotPasswordProps) {
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
                if (phone.length !== 10) {
                    setError('Please enter a valid 10-digit phone number');
                    return;
                }
                await forgotPassword(phone);
                setStep(2);
            } else if (step === 2) {
                setStep(3);
            } else {
                if (newPassword.length < 6) {
                    setError('Password must be at least 6 characters');
                    return;
                }
                await resetPassword(phone, otp, newPassword);
                alert('Password reset successful! Please login with your new password.');
                onBack();
            }
        } catch (err: any) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError(err.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: 'linear-gradient(135deg, #6B8E23, #9CAF88)' }}>
            <div className="absolute inset-0" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&q=80")', opacity: 0.08, filter: 'blur(4px)', backgroundSize: 'cover', backgroundPosition: 'center', pointerEvents: 'none' }} />
            
            <div className="w-full max-w-[420px] bg-[#FFFDF7] rounded-[16px] p-6 sm:p-10 relative z-10" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-[#F7F3EA] rounded-full shadow-inner">
                            <GraduationCap className="w-10 h-10 text-[#6B8E23]" />
                        </div>
                    </div>
                    <div className="mb-2">
                        <span className="text-[#5C3D2E] font-semibold tracking-[0.1em]" style={{ fontVariant: 'small-caps', fontSize: '13px' }}>
                            Agricultural Attendance System
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-[#2E2E2E]">Reset Password</h1>
                    <p className="text-[#6B6B6B] mt-1 text-sm">Follow the steps to recover access</p>
                </div>

                {/* BUG-022: Dismissible error alert */}
                {error && (
                    <Alert className="mb-6 bg-red-50 border-red-200 text-red-800 relative">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                        <button
                            onClick={() => setError('')}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors"
                            aria-label="Dismiss error"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {step === 1 && (
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-semibold text-[#2E2E2E]">Registered Phone Number</Label>
                            <Input
                                id="phone" type="tel" value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter 10-digit phone number"
                                maxLength={10} 
                                className="bg-[#F7F3EA] border-none h-12 px-4 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6A75E] transition-all"
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-2">
                            <Label htmlFor="otp" className="text-sm font-semibold text-[#2E2E2E]">Enter OTP</Label>
                            <Input
                                id="otp" type="text" value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                                className="bg-[#F7F3EA] border-none h-12 px-4 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6A75E] transition-all"
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-sm font-semibold text-[#2E2E2E]">New Password</Label>
                            <Input
                                id="newPassword" type="password" value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="bg-[#F7F3EA] border-none h-12 px-4 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6A75E] transition-all"
                            />
                        </div>
                    )}

                    <Button
                        type="submit" disabled={loading}
                        className="w-full h-12 bg-[#6B8E23] hover:bg-[#5A7A1D] text-white font-medium rounded-xl shadow-lg shadow-[#5C3D2E]/10 transition-transform hover:-translate-y-[2px]"
                    >
                        {loading ? 'Processing...' : step === 1 ? 'Send OTP' : step === 2 ? 'Verify OTP' : 'Reset Password'}
                    </Button>

                    <Button
                        type="button" variant="ghost"
                        className="w-full text-[#6B6B6B] hover:text-[#2E2E2E] hover:bg-[#F7F3EA] rounded-xl"
                        onClick={onBack}
                    >
                        Back to Login
                    </Button>
                </form>
            </div>
        </div>
    );
}

// ─── Main Login Form ──────────────────────────────────────────────────────────
// BUG-004: Eye icon helpers (inline SVG — no extra import needed)
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

export default function Login({ onLogin }: LoginProps) {
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
                setError('Invalid email or password');
            } else {
                setError(err.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: 'linear-gradient(135deg, #6B8E23, #9CAF88)' }}>
            {/* Soft, blurred farm/leaf image overlay per instructions */}
            <div className="absolute inset-0" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&q=80")', opacity: 0.08, filter: 'blur(4px)', backgroundSize: 'cover', backgroundPosition: 'center', pointerEvents: 'none' }} />
            
            {/* Main Form Centerpiece */}
            <div className="w-full max-w-[420px] bg-[#FFFDF7] rounded-[16px] p-6 sm:p-10 relative z-10" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                {/* Subtle Decorative Element */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#9CAF88]/10 rounded-full blur-2xl" />
                
                <div className="text-center mb-8 relative">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-[#F7F3EA] rounded-full shadow-inner">
                            <GraduationCap className="w-10 h-10 text-[#6B8E23]" />
                        </div>
                    </div>
                    <div className="mb-2">
                        <span className="text-[#5C3D2E] font-semibold tracking-[0.15em] block leading-tight" style={{ fontVariant: 'small-caps', fontSize: '13px' }}>
                            Welcome to Agricultural<br />Attendance System
                        </span>
                    </div>
                    <p className="text-[#6B6B6B] mt-2 text-sm">Sign in to your account</p>
                </div>

                {/* BUG-022: Dismissible error alert */}
                {error && (
                    <Alert className="mb-6 bg-red-50 border-red-200 text-red-800 relative">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                        <button
                            type="button"
                            onClick={() => setError('')}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors"
                            aria-label="Dismiss error"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </Alert>
                )}

                <form onSubmit={handleLogin} className="space-y-5 relative">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-[#2E2E2E] ml-1">
                            Email Address
                        </Label>
                        <Input
                            id="email" type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="bg-[#F7F3EA] border-none h-12 px-4 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6A75E] transition-all"
                            autoComplete="email"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <Label htmlFor="password" className="text-sm font-semibold text-[#2E2E2E]">
                                Password
                            </Label>
                            <button
                                type="button"
                                onClick={() => setShowForgot(true)}
                                className="text-xs text-[#5C3D2E] hover:text-[#6B8E23] font-medium transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>
                        {/* BUG-004: Password toggle (show/hide) */}
                        <div className="relative">
                            <Input
                                id="password" type={showPassword ? 'text' : 'password'} value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="bg-[#F7F3EA] border-none h-12 px-4 pr-12 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6A75E] transition-all"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B8B8B] hover:text-[#5C3D2E] transition-colors p-1"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>
                    <Button
                        type="submit" disabled={loading}
                        className="w-full h-12 bg-[#6B8E23] hover:bg-[#5A7A1D] text-white font-medium rounded-xl shadow-lg shadow-[#5C3D2E]/10 transition-transform active:scale-[0.98] hover:-translate-y-[2px]"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-[#F7F3EA] text-center">
                    <p className="text-xs text-[#6B6B6B]">
                        &copy; {new Date().getFullYear()} Don Bosco Agricultural Institute.<br />All rights reserved.
                    </p>
                </div>
                {/* BUG-001: Removed admin credential hint — security fix */}
            </div>
        </div>
    );
}