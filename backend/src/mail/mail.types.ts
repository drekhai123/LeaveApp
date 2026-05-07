export type MailMessage = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
};
