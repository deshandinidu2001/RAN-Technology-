import { supabase } from '../lib/supabase';
import { sendSms } from '../utils/sms';
import { sendQuoteEmail } from '../utils/email';

// Send a "your appointment is tomorrow" reminder to every booking whose date
// is the calendar day after today and that hasn't already been reminded.
// Idempotent: stamps reminderSentAt so it never fires twice for the same booking.
const runOnce = async (): Promise<void> => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowIso = tomorrow.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('RepairBooking')
    .select('*')
    .eq('date', tomorrowIso)
    .is('reminderSentAt', null)
    .neq('status', 'cancelled');

  if (error) {
    console.warn('[reminders] query failed:', error.message);
    return;
  }
  if (!data || data.length === 0) return;

  console.log(`[reminders] ${data.length} booking(s) need a reminder for ${tomorrowIso}`);

  for (const row of data as any[]) {
    const refId = row.serialNo ? `REP#${row.serialNo}` : (row.id as string).slice(0, 6);
    const device = `${row.deviceType || 'device'}${row.deviceModel ? ` (${row.deviceModel})` : ''}`;
    const smsBody =
      `RAN Tech Shop reminder: Your ${device} repair appointment is TOMORROW (${row.date}) at ${row.timeSlot}. ` +
      `Please arrive on time. Ref ${refId}.`;

    if (row.customerPhone) {
      sendSms(row.customerPhone, smsBody).catch(() => {});
    }

    // In-app notification
    supabase.from('Notification').insert({
      email: row.customerEmail,
      title: 'Appointment reminder',
      body: `Your repair appointment is tomorrow (${row.date}) at ${row.timeSlot}. Reference ${refId}.`,
      link: `/repair/profile`,
      type: 'reminder',
      refId: row.id,
    }).then(() => {}, () => {});

    if (row.customerEmail) {
      try {
        await sendQuoteEmail({
          to: row.customerEmail,
          customerName: row.customerName || 'Customer',
          type: 'repair',
          items: [{
            name: `Appointment reminder — ${device}`,
            description: `Please bring your device to our shop on ${row.date} at ${row.timeSlot}.`,
            price: 0,
          }],
          subtotal: 0,
          total: 0,
          notes: 'If you can no longer attend, please reply to this email to reschedule.',
          meta: { Reference: refId, Date: row.date, Time: row.timeSlot },
        });
      } catch (e) {
        console.warn('[reminders] email failed for', row.id, (e as Error).message);
      }
    }

    await supabase
      .from('RepairBooking')
      .update({ reminderSentAt: new Date().toISOString() })
      .eq('id', row.id);
  }
};

let intervalHandle: NodeJS.Timeout | null = null;

export const startReminderScheduler = (): void => {
  if (intervalHandle) return;
  // Run on boot, then every hour.
  runOnce().catch(e => console.warn('[reminders] initial run failed:', (e as Error).message));
  intervalHandle = setInterval(() => {
    runOnce().catch(e => console.warn('[reminders] run failed:', (e as Error).message));
  }, 60 * 60 * 1000);
  console.log('[reminders] scheduler started (hourly).');
};
