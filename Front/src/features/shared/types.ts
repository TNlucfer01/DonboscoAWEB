// ─── Shared Types ────────────────────────────────────────────────────────────
// Single source of truth. Import from here — never re-declare locally.

export interface User {
    role: string;
    name: string;
}

/** Props that every page-level component receives */
export interface PageProps {
    user: User;
    onLogout: () => void;
}
