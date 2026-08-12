// notificationService.js - Stub pour fonctionner sans backend

export async function notifyMessageReceived({ receiverEmail, senderName, senderEmail, conversationId, preview }) {
  // No backend - silent no-op
  console.log('[Notification] Message sent to', receiverEmail);
  return { ok: true };
}

export async function notifyBookingCreated({ proEmail, clientName, serviceName, date }) {
  console.log('[Notification] Booking created for', proEmail);
  return { ok: true };
}

export async function notifyBookingCancelled({ proEmail, clientName, serviceName }) {
  console.log('[Notification] Booking cancelled for', proEmail);
  return { ok: true };
}
