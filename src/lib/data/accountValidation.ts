export interface ProfileInput { username: string; robloxUsername: string; bio: string; }
export interface AppraisalInput { itemId: string; value: string; demand: string; reason: string; }
export function validateProfileInput(input: ProfileInput): string | null {
  if (!/^[a-z0-9_]{3,20}$/.test(input.username)) return 'Choose a username with 3–20 lowercase letters, numbers or underscores.';
  if (input.robloxUsername && !/^[A-Za-z0-9_]{3,20}$/.test(input.robloxUsername)) return 'Enter a Roblox username with 3–20 letters, numbers or underscores.';
  if (input.bio.length > 280) return 'Keep your bio to 280 characters.';
  return null;
}
export function parseAppraisal(input: AppraisalInput): { value: number | null; demand: number | null; reason: string } | null {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.itemId)) return null;
  if (input.value !== '' && (!/^\d+$/.test(input.value) || !Number.isSafeInteger(Number(input.value)))) return null;
  if (input.demand !== '' && !/^[1-5]$/.test(input.demand)) return null;
  const reason = input.reason.trim();
  if (!reason || reason.length > 280) return null;
  return { value: input.value === '' ? null : Number(input.value), demand: input.demand === '' ? null : Number(input.demand), reason };
}
