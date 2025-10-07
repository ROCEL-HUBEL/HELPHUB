export function isEmail(v=''){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
export function sanitize(str=''){ return String(str).trim(); }
