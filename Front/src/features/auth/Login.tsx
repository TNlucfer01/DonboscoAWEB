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
                // OTP verified on next step (backend validates during reset)
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white border-2 border-slate-300 p-8">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <GraduationCap className="w-16 h-16 text-slate-700" />
                    </div>
                    <h1 className="text-2xl text-slate-800 mb-1">College Name</h1>
                    <h2 className="text-lg text-slate-600">Reset Password</h2>
                </div>

                {error && (
                    <Alert className="mb-4 bg-red-50 border-red-300">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {step === 1 && (
                        <>
                            <div>
                                <Label htmlFor="phone" className="text-slate-700">Registered Phone Number</Label>
                                <Input
                                    id="phone" type="tel" value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Enter 10-digit phone number"
                                    maxLength={10} className="mt-1 border-slate-300"
                                />
                            </div>
                            <Button
                                type="submit" disabled={loading}
                                className="w-full bg-slate-700 hover:bg-slate-800 text-white"
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </Button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div>
                                <Label htmlFor="otp" className="text-slate-700">Enter OTP</Label>
                                <Input
                                    id="otp" type="text" value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit OTP"
                                    maxLength={6} className="mt-1 border-slate-300"
                                />
                            </div>
                            <Button
                                type="submit" disabled={loading}
                                className="w-full bg-slate-700 hover:bg-slate-800 text-white"
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </Button>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <div>
                                <Label htmlFor="newPassword" className="text-slate-700">New Password</Label>
                                <Input
                                    id="newPassword" type="password" value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="mt-1 border-slate-300"
                                />
                            </div>
                            <Button
                                type="submit" disabled={loading}
                                className="w-full bg-slate-700 hover:bg-slate-800 text-white"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </>
                    )}

                    <Button
                        type="button" variant="outline"
                        className="w-full border-slate-300 text-slate-700"
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
export default function Login({ onLogin }: LoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            // Use error codes from the standard API format
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white border-2 border-slate-300 p-8">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <GraduationCap className="w-16 h-16 text-slate-700" />
                    </div>
                    <h1 className="text-2xl text-slate-800 mb-1">College Attendance System</h1>
                    <h2 className="text-lg text-slate-600">Login</h2>
                </div>

                {error && (
                    <Alert className="mb-4 bg-red-50 border-red-300">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <Label htmlFor="email" className="text-slate-700">Email</Label>
                        <Input
                            id="email" type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="mt-1 border-slate-300"
                            autoComplete="email"
                        />
                    </div>
                    <div>
                        <Label htmlFor="password" className="text-slate-700">Password</Label>
                        <Input
                            id="password" type="password" value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="mt-1 border-slate-300"
                            autoComplete="current-password"
                        />
                    </div>
                    <Button
                        type="submit" disabled={loading}
                        className="w-full bg-slate-700 hover:bg-slate-800 text-white"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                    <button
                        type="button"
                        onClick={() => setShowForgot(true)}
                        className="w-full text-center text-sm text-slate-600 hover:text-slate-800 underline"
                    >
                        Forgot Password?
                    </button>
                </form>

                <div className="mt-6 p-4 bg-slate-100 border border-slate-300 text-xs text-slate-600">
                    <p className="mb-2 font-medium">Demo Credentials:</p>
                    <p>Principal: principal@donbosco.edu / Password@123</p>
                </div>
            </div>
        </div>
    );
}