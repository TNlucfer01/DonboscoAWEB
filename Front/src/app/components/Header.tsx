import { GraduationCap } from 'lucide-react';

interface HeaderProps {
  userName?: string;
}

export function Header({ userName }: HeaderProps) {
  return (
    <header className="bg-[#1e3a8a] text-white px-6 py-4 shadow-md">
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3">
          <GraduationCap size={32} />
          <h1 className="text-xl md:text-2xl font-semibold">
            Attendance Management System
          </h1>
        </div>
        {userName && (
          <div className="text-sm md:text-base">
            Welcome, <span className="font-semibold">{userName}</span>
          </div>
        )}
      </div>
    </header>
  );
}
