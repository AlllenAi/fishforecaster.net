import { Resend } from "resend";

const resend = new Resend(process.env.EMAIL_API_KEY);

const FROM =
  `${process.env.EMAIL_FROM_NAME || "The Fish Forecaster"} <${process.env.EMAIL_FROM_ADDRESS || "forecasts@thefishforecaster.com"}>`;

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; messageId?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[Email] Send failed:", error);
      return { success: false };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error("[Email] Send error:", err);
    return { success: false };
  }
}

export async function sendBatchEmails(
  emails: Array<{ to: string; subject: string; html: string }>
): Promise<void> {
  // Resend supports batch sending up to 100 emails per request
  const batchSize = 100;

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    try {
      await resend.batch.send(
        batch.map((email) => ({
          from: FROM,
          to: email.to,
          subject: email.subject,
          html: email.html,
        }))
      );
    } catch (err) {
      console.error(`[Email] Batch send error (batch ${i / batchSize + 1}):`, err);
    }
  }
}
