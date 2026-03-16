// ─── Shared Select Option Constants ─────────────────────────────────────────
// Used by SelectField and any component that renders dropdowns.
// Change here → updates everywhere automatically.

export interface SelectOption {
    value: string;
    label: string;
}

export const YEAR_OPTIONS: SelectOption[] = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
];

export const LAB_BATCH_OPTIONS: SelectOption[] = [
    { value: '1', label: 'Batch A' },
    { value: '2', label: 'Batch B' },
    { value: '3', label: 'Batch C' },
    { value: '4', label: 'Batch D' },
];
export const THEORY_BATCH_OPTIONS: SelectOption[] = [
    { value: '1', label: 'Batch A' },
    { value: '2', label: 'Batch B' },
];

export const PERIOD_OPTIONS: SelectOption[] = [
    { value: '1', label: 'Period 1' },
    { value: '2', label: 'Period 2' },
    { value: '3', label: 'Period 3' },
    { value: '4', label: 'Period 4' },
    { value: '5', label: 'Period 5' },
];



export const SEMESTER_OPTIONS: SelectOption[] = [
    { value: 'odd', label: 'Odd' },
    { value: 'even', label: 'Even' },
];

export const ATTENDANCE_STATUS_OPTIONS: SelectOption[] = [
    { value: 'PRESENT', label: 'P' },
    { value: 'ABSENT', label: 'A' },
    { value: 'OD', label: 'OD' },
    { value: 'INFORMED_LEAVE', label: 'IL' },
];
export const YC_ATTENDANCE_STATUS_OPTIONS: SelectOption[] = [
    { value: 'OD', label: 'OD' },
    { value: 'INFORMED_LEAVE', label: 'IL' },
];


export const GENDER_OPTIONS: SelectOption[] = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
];

