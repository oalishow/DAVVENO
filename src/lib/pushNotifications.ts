/**
 * Helper to send push notifications via server API
 */
export async function sendPushNotification(payload: {
  title: string;
  body: string;
  topic?: 'admin';
  userIds?: string[];
}) {
  try {
    const response = await fetch('/api/send-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to send push notification: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling send-push API:', error);
    return null;
  }
}
