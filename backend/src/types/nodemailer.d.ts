declare module 'nodemailer' {
  export interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
  }

  export interface MailOptions {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }

  export interface Transporter {
    sendMail(options: MailOptions): Promise<any>;
  }

  export interface TestAccount {
    user: string;
    pass: string;
    smtp: {
      host: string;
      port: number;
      secure: boolean;
    };
  }

  export function createTransport(options: TransportOptions): Transporter;
  export function createTestAccount(): Promise<TestAccount>;
  export function getTestMessageUrl(info: any): string | false;
}
