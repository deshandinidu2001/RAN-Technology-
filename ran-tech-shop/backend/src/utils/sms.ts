// Notify.lk SMS helper.
// Docs: https://docs.notify.lk/ — GET https://app.notify.lk/api/v1/send
// Requires env: NOTIFYLK_USER_ID, NOTIFYLK_API_KEY, NOTIFYLK_SENDER_ID
//
// We don't fail the calling request if SMS isn't configured or the
// gateway errors — SMS is best-effort, the booking still succeeds.

const normalizePhone = (raw: string): string | null => {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  // Notify.lk expects digits starting with 94 (no +). Accept 0XXXXXXXXX or +94XXXXXXXXX.
  if (digits.startsWith('94') && digits.length === 11) return digits;
  if (digits.startsWith('0') && digits.length === 10) return '94' + digits.slice(1);
  if (digits.length === 9) return '94' + digits; // bare 7XXXXXXXX
  return digits;
};

export const sendSms = async (toRaw: string, message: string): Promise<{ ok: boolean; error?: string }> => {
  const userId = process.env.NOTIFYLK_USER_ID;
  const apiKey = process.env.NOTIFYLK_API_KEY;
  const senderId = process.env.NOTIFYLK_SENDER_ID || 'NotifyDEMO';

  if (!userId || !apiKey) {
    console.warn('[sms] Notify.lk not configured (NOTIFYLK_USER_ID/API_KEY); skipping. Would send:', { to: toRaw, message });
    return { ok: false, error: 'SMS not configured' };
  }

  const to = normalizePhone(toRaw);
  if (!to) return { ok: false, error: 'Invalid phone number' };

  const url = new URL('https://app.notify.lk/api/v1/send');
  url.searchParams.set('user_id', userId);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('sender_id', senderId);
  url.searchParams.set('to', to);
  url.searchParams.set('message', message.slice(0, 320));

  try {
    const res = await fetch(url.toString());
    const data: any = await res.json().catch(() => ({}));
    if (!res.ok || data?.status === 'error') {
      console.warn('[sms] Notify.lk error', res.status, data);
      return { ok: false, error: data?.message || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err: any) {
    console.warn('[sms] Notify.lk fetch failed:', err?.message);
    return { ok: false, error: err?.message || 'Send failed' };
  }
};
