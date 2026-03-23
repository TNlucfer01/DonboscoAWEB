// ─── Landing Page — DBCAMS ────────────────────────────────────────────────────
// On Login click:
//   • Landing panel shrinks to LEFT (flex-basis 100% → 42%)
//   • Login panel reveals from TOP → BOTTOM via clip-path (from button position)
//   • Both happen simultaneously — pure CSS transitions, no JS timers.

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import Login from './Login';
import logo from '../../assest/logo.png';
import '../../styles/transitions.css';

interface LandingPageProps {
	onLogin: (role: string, name: string) => void;
}

// ─── Icons ───────────────────────────────────────────────────────────────────
const GradCap = ({ size = 44 }: { size?: number; color?: string }) => (
	<img src={logo} alt="College Logo" style={{ width: size, height: size, objectFit: 'contain' }} />
);

const ArrowRight = () => (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
		stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
		<path d="M5 12h14M12 5l7 7-7 7" />
	</svg>
);

// ─── Font loader ──────────────────────────────────────────────────────────────
const FontStyle = () => (
	<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;0,700;1,400&family=Manrope:wght@400;500;600;700&display=swap');

        /* Landing panel slides left + compresses */
        .dbcams-landing-panel {
            flex-shrink: 0;
            position: relative;
            overflow: hidden;
            transition: flex-basis 0.7s cubic-bezier(0.76, 0, 0.24, 1);
        }
        .dbcams-landing-panel.full  { flex-basis: 100%; }
        .dbcams-landing-panel.split { flex-basis: 62%; }

        /* Login panel reveals from top → bottom (clip-path wipe) */
        .dbcams-login-panel {
            flex: 1;
            overflow: hidden;
            position: relative;
            /* clip-path animates: inset(top right bottom left) */
            transition: clip-path 0.7s cubic-bezier(0.76, 0, 0.24, 1);
        }
        .dbcams-login-panel.hidden  { clip-path: inset(0 0 100% 0); }
        .dbcams-login-panel.visible { clip-path: inset(0 0 0 0); }

        /* Hero image compresses with the panel */
        .dbcams-hero-img {
            position: absolute; inset: 0;
            background-image: url('/Abstract_Nature.jpg');
            background-size: cover;
            background-position: center;
            transition: filter 0.7s ease;
        }
        .dbcams-hero-img.dimmed {
            filter: brightness(0.55);
        }

        /* Leaf decorations */
        .dbcams-leaf {
            position: absolute;
            opacity: 0.10;
            pointer-events: none;
        }
    `}</style>
);

export default function LandingPage({ onLogin }: LandingPageProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const [loginOpen, setLoginOpen] = useState(location.search.includes('login=true'));

	const handleBack = () => {
		setLoginOpen(false);
		if (location.search.includes('login=true')) {
			navigate('/', { replace: true });
		}
	};

	return (
		<div style={{
			position: 'fixed', inset: 0,
			display: 'flex',           // ← flex row: landing (left) + login (right)
			overflow: 'hidden',
			background: '#E3E8DC',
			fontFamily: 'Manrope, system-ui, sans-serif',
		}}>
			<FontStyle />

			{/* ═══════════════════════════════════════════════════════════════
                LEFT PANEL — Landing Page
                Starts at 100% width, shrinks to 42% when login opens.
            ════════════════════════════════════════════════════════════════ */}
			<div className={`dbcams-landing-panel ${loginOpen ? 'split' : 'full'}`}>

				{/* Background hero image */}
				<div className={`dbcams-hero-img${loginOpen ? ' dimmed' : ''}`} />

				{/* Dark gradient overlay */}
				<div style={{
					position: 'absolute', inset: 0,
					background: 'linear-gradient(170deg, rgba(20,45,8,0.40) 0%, rgba(8,22,3,0.78) 100%)',
				}} />

				{/* ── Header ─────────────────────────────────────────────── */}
				<header style={{
					position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
					display: 'flex', alignItems: 'center',
					justifyContent: 'space-between',
					padding: '0 36px', height: 80,
					background: '#F7F3EA',
					borderBottom: '2px solid #9CAF88',
					boxShadow: '0 2px 12px rgba(26,54,8,0.20)',
				}}>
					{/* Logo */}
					<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
						<GradCap size={48} />
						<div style={{ minWidth: 0 }}>
							<p style={{
								margin: 0, fontSize: 12, fontWeight: 700,
								letterSpacing: '0.22em', textTransform: 'uppercase',
								color: '#D6A75E',
								whiteSpace: 'nowrap',
							}}>DBCAMS</p>
							<p style={{
								margin: 0, fontSize: 11, color: '#8B5E3C',
								whiteSpace: 'nowrap', overflow: 'hidden',
								textOverflow: 'ellipsis',
							}}>Don Bosco College of Agriculture</p>
						</div>
					</div>

					{/* Login button — always visible */}
					<button
						onClick={() => setLoginOpen(true)}
						style={{
							padding: '9px 22px',
							borderRadius: 50,
							border: 'none',
							background: '#9CAF88',
							color: '#F7F3EA',
							fontSize: 13, fontWeight: 600,
							cursor: 'pointer',
							boxShadow: '0 2px 10px rgba(156,175,136,0.4)',
							transition: 'all 0.2s ease',
							display: 'flex', alignItems: 'center', gap: 6,
							flexShrink: 0,
						}}
						onMouseEnter={e => {
							e.currentTarget.style.background = '#8B5E3C';
							e.currentTarget.style.boxShadow = '0 4px 14px rgba(139,94,60,0.35)';
						}}
						onMouseLeave={e => {
							e.currentTarget.style.background = '#9CAF88';
							e.currentTarget.style.boxShadow = '0 2px 10px rgba(156,175,136,0.4)';
						}}
					>
						Login <ArrowRight />
					</button>
				</header>

				{/* ── Hero Content ────────────────────────────────────────── */}
				<div style={{
					position: 'absolute', inset: 0, zIndex: 5,
					display: 'flex', flexDirection: 'column',
					alignItems: 'center', justifyContent: 'center',
					textAlign: 'center',
					padding: '100px 32px 48px',
					transition: 'opacity 0.5s ease, transform 0.7s cubic-bezier(0.76, 0, 0.24, 1)',
					// Gently shift content leftward when panel splits
					transform: loginOpen ? 'translateX(-10px)' : 'translateX(0)',
					opacity: loginOpen ? 0.65 : 1,
				}}>

					{/* Crest badge */}
					<div style={{
						marginBottom: 24,
						transition: 'transform 0.7s ease',
						transform: loginOpen ? 'scale(0.85)' : 'scale(1)',
						display: 'flex', alignItems: 'center', justifyContent: 'center'
					}}>
						<GradCap size={110} />
					</div>

					{/* College name */}
					<h1 style={{
						fontFamily: 'Newsreader, Georgia, serif',
						fontSize: 'clamp(1.6rem, 3.5vw, 3rem)',
						fontWeight: 700, color: 'white',
						lineHeight: 1.2, marginBottom: 14,
						textShadow: '0 2px 16px rgba(0,0,0,0.4)',
						transition: 'font-size 0.5s ease',
					}}>
						Don Bosco College<br />of Agriculture
					</h1>

					{/* Gold divider */}
					<div style={{
						width: 52, height: 2, borderRadius: 2,
						background: '#D6A75E', margin: '0 auto 12px',
					}} />

					<p style={{
						color: '#D6A75E', fontSize: 11, fontWeight: 700,
						letterSpacing: '0.30em', textTransform: 'uppercase', marginBottom: 6,
					}}>DBCAMS</p>

					<p style={{
						color: 'rgba(255,255,255,0.72)', fontSize: 14,
						marginBottom: loginOpen ? 20 : 36,
						transition: 'margin 0.4s ease',
					}}>
						Attendance Management System
					</p>

					{/* Quote — hides when split to save space */}
					<p style={{
						color: 'rgba(255,255,255,0.48)', fontSize: 12.5,
						maxWidth: 380, lineHeight: 1.75, fontStyle: 'italic',
						marginBottom: loginOpen ? 20 : 40,
						transition: 'opacity 0.4s ease, max-height 0.5s ease',
						opacity: loginOpen ? 0 : 1,
						maxHeight: loginOpen ? '0' : '200px',
						overflow: 'hidden',
					}}>
						"Empowering educators with smarter attendance tracking —
						one roll call at a time."
					</p>

					{/* CTA — only when not split */}
					{!loginOpen && (
						<button
							onClick={() => setLoginOpen(true)}
							style={{
								padding: '13px 44px', borderRadius: 50, border: 'none',
								background: '#9CAF88', color: '#F7F3EA',
								fontSize: 14, fontWeight: 600, cursor: 'pointer',
								boxShadow: '0 6px 20px rgba(156,175,136,0.4)',
								transition: 'all 0.2s ease',
								display: 'flex', alignItems: 'center', gap: 8,
							}}
							onMouseEnter={e => {
								e.currentTarget.style.background = '#8B5E3C';
								e.currentTarget.style.transform = 'translateY(-2px)';
								e.currentTarget.style.boxShadow = '0 10px 28px rgba(139,94,60,0.35)';
							}}
							onMouseLeave={e => {
								e.currentTarget.style.background = '#9CAF88';
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 6px 20px rgba(156,175,136,0.4)';
							}}
						>
							Get Started <ArrowRight />
						</button>
					)}
				</div>

				{/* Footer */}
				<p style={{
					position: 'absolute', bottom: 14, left: 0, right: 0,
					textAlign: 'center', zIndex: 5,
					color: 'rgba(214,202,186,0.40)', fontSize: 10,
				}}>
					© {new Date().getFullYear()} Don Bosco College of Agriculture
				</p>
			</div>

			{/* ═══════════════════════════════════════════════════════════════
                RIGHT PANEL — Login Form
                Clips from top → bottom (wipes in downward from button position).
                flex: 1 fills the remaining space after landing shrinks.
            ════════════════════════════════════════════════════════════════ */}
			<div className={`dbcams-login-panel ${loginOpen ? 'visible' : 'hidden'}`}
				style={{
					borderLeft: loginOpen ? '2px solid #9CAF88' : 'none',
				}}>
				{/* Pass onBack so Login renders its own back button top-right */}
				<Login onLogin={onLogin} onBack={handleBack} />
			</div>
		</div>
	);
}
