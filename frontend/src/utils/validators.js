// Input rules shared by Register, Profile and Forgot password. They mirror backend/validators/common.js.
import petOptions from '../data/petOptions.json';

export const PET_OPTIONS = petOptions;

// ---------- full name ----------
const NAME_TOKEN = /^[\p{L}\p{M}]+(?:['’.-][\p{L}\p{M}]+)*\.?$/u;
const NAME_PARTICLES = new Set(['ma', 'de', 'del', 'dela', 'delos', 'la', 'las', 'los', 'di', 'da', 'van', 'von', 'bin', 'bint', 'al', 'el', 'y', 'jr', 'sr', 'ii', 'iii', 'iv']);
const VOWEL = /[aeiouyáéíóúàèìòùäëïöüâêîôû]/i;

// While typing: only letters, spaces, . ' ’ - ; never two spaces in a row; no leading space.
export const cleanFullName = (v) => v.replace(/[^\p{L}\p{M} .'’-]/gu, '').replace(/\s{2,}/g, ' ').replace(/^\s+/, '').slice(0, 50);

// Returns the problem in plain words, or '' when the name is fine.
export function fullNameProblem(value) {
  const name = String(value ?? '').trim();
  if (name.length < 5 || name.length > 50) return 'Full name must be between 5 and 50 characters.';
  if (/\s{2,}/.test(name)) return 'Full name cannot contain double spaces.';
  const tokens = name.split(' ');
  if (tokens.some((t) => !NAME_TOKEN.test(t))) return 'Full name can only contain letters, spaces, periods, hyphens and apostrophes.';
  const middleInitials = tokens
    .map((token, index) => ({ token, index }))
    .filter(({ token, index }) => index > 0 && index < tokens.length - 1 && /^[\p{L}\p{M}]\.?$/u.test(token));
  if (middleInitials.length > 1) return 'Enter only one middle initial.';
  const middleInitialIndexes = new Set(middleInitials.map(({ index }) => index));
  const core = tokens.filter((t, index) => !middleInitialIndexes.has(index) && !NAME_PARTICLES.has(t.toLowerCase().replace(/\./g, '')));
  if (core.length < 2) return 'Enter your first name and last name, not initials (e.g. Ilana Deana).';
  const letters = (t) => t.replace(/[^\p{L}\p{M}]/gu, '');
  if (letters(core[0]).length < 3) return 'Your first name needs at least 3 letters. Initials are not accepted.';
  if (core.some((t) => letters(t).length < 2 || !VOWEL.test(t) || /(\p{L})\1{2,}/iu.test(t))) return 'Enter a real first and last name, not initials or random letters.';
  return '';
}

// ---------- phone (Philippines, +63 then 10 digits starting with 9) ----------
export const cleanPhone = (value) => {
  let digits = String(value).replace(/\D/g, '');
  if (digits.startsWith('63')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, 10);
};
export const phoneProblem = (tenDigits) => (/^9\d{9}$/.test(tenDigits) ? '' : 'Enter a Philippine mobile number: 10 digits after +63, starting with 9.');
export const toLocalPhone = (tenDigits) => `0${tenDigits}`; // what the server stores
export const fromLocalPhone = (stored = '') => cleanPhone(stored); // 09171234567 -> 9171234567

// ---------- password ----------
export const PASSWORD_MAX = 64;
export const cleanPassword = (v) => v.replace(/\s/g, '').slice(0, PASSWORD_MAX); // spaces are never allowed
export const passwordChecks = (pw) => [
  { ok: pw.length >= 8, label: 'At least 8 characters' },
  { ok: /[a-z]/.test(pw), label: 'A lowercase letter' },
  { ok: /[A-Z]/.test(pw), label: 'An uppercase letter' },
  { ok: /[0-9]/.test(pw), label: 'A number' },
];
export const passwordProblem = (pw) => {
  if (/\s/.test(pw)) return 'Password cannot contain spaces.';
  if (passwordChecks(pw).some((c) => !c.ok)) return 'Password must have at least 8 characters, including an uppercase letter, a lowercase letter and a number.';
  return '';
};

// ---------- post fields ----------
export const cleanPetName = (v) => v.replace(/[^\p{L}\p{M} ]/gu, '').replace(/\s{2,}/g, ' ').replace(/^\s+/, '').slice(0, 30);
export const petNameProblem = (v) => {
  const t = v.trim();
  if (t.length < 2 || t.length > 30) return 'Pet name must be 2 to 30 letters.';
  return /^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)*$/u.test(t) ? '' : 'Pet name can only contain letters and single spaces.';
};
// Colour / markings: letters, spaces, commas, hyphens.
export const cleanMarkings = (v) => v.replace(/[^\p{L}\p{M} ,-]/gu, '').replace(/\s{2,}/g, ' ').replace(/^[\s,-]+/, '').slice(0, 100);
export const markingsProblem = (v) => {
  const t = v.trim();
  if (!t) return '';
  if (t.length < 3) return 'Color / markings must be at least 3 letters.';
  return /^[\p{L}\p{M}]+(?:[ ,-]+[\p{L}\p{M}]+)*$/u.test(t) ? '' : 'Use letters, spaces, commas and hyphens only.';
};
// Street / landmark: letters, numbers, spaces, comma, period, hyphen.
export const cleanLandmark = (v) => v.replace(/[^\p{L}\p{M}0-9 ,.-]/gu, '').replace(/\s{2,}/g, ' ').replace(/^[\s,.-]+/, '').slice(0, 100);
export const landmarkProblem = (v) => {
  const t = v.trim();
  if (!t) return '';
  return t.length < 3 ? 'Street or landmark must be at least 3 characters.' : '';
};
