import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { GraduationCap, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface LoginProps {
  onLogin: (role: string, username: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mock login logic
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    // Demo credentials
    if (username === 'principal' && password === 'principal123') {
      onLogin('principal', 'Principal');
    } else if (username === 'yc' && password === 'yc123') {
      onLogin('yc', 'Year Coordinator');
    } else if (username === 'staff' && password === 'staff123') {
      onLogin('staff', 'Staff Member');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (forgotStep === 1) {
      if (phoneNumber.length === 10) {
        setForgotStep(2);
        setError('');
      } else {
        setError('Please enter a valid 10-digit phone number');
      }
    } else if (forgotStep === 2) {
      if (otp === '123456') {
        setForgotStep(3);
        setError('');
      } else {
        setError('Invalid OTP');
      }
    } else if (forgotStep === 3) {
      if (newPassword.length >= 6) {
        setShowForgotPassword(false);
        setForgotStep(1);
        setPhoneNumber('');
        setOtp('');
        setNewPassword('');
        setError('');
        alert('Password reset successful! Please login with your new password.');
      } else {
        setError('Password must be at least 6 characters');
      }
    }
  };

  if (showForgotPassword) {
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

          <form onSubmit={handleForgotPassword} className="space-y-4">
            {forgotStep === 1 && (
              <>
                <div>
                  <Label htmlFor="phone" className="text-slate-700">Registered Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                    className="mt-1 border-slate-300"
                  />
                </div>
                <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-800 text-white">
                  Send OTP
                </Button>
              </>
            )}

            {forgotStep === 2 && (
              <>
                <div>
                  <Label htmlFor="otp" className="text-slate-700">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="mt-1 border-slate-300"
                  />
                  <p className="text-sm text-slate-500 mt-1">Demo OTP: 123456</p>
                </div>
                <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-800 text-white">
                  Verify OTP
                </Button>
              </>
            )}

            {forgotStep === 3 && (
              <>
                <div>
                  <Label htmlFor="newPassword" className="text-slate-700">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="mt-1 border-slate-300"
                  />
                </div>
                <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-800 text-white">
                  Reset Password
                </Button>
              </>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full border-slate-300 text-slate-700"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotStep(1);
                setError('');
              }}
            >
              Back to Login
            </Button>
          </form>
        </div>
      </div>
    );
  }

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
            <Label htmlFor="username" className="text-slate-700">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="mt-1 border-slate-300"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-slate-700">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="mt-1 border-slate-300"
            />
          </div>

          <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-800 text-white">
            Login
          </Button>

          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="w-full text-center text-sm text-slate-600 hover:text-slate-800 underline"
          >
            Forgot Password?
          </button>
        </form>

        <div className="mt-6 p-4 bg-slate-100 border border-slate-300 text-xs text-slate-600">
          <p className="mb-2">Demo Credentials:</p>
          <p>Principal: principal / principal123</p>
          <p>YC: yc / yc123</p>
          <p>Staff: staff / staff123</p>
        </div>
      </div>
    </div>
  );
}
