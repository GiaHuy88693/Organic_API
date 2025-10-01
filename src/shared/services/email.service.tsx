import { Injectable } from '@nestjs/common';
import { envConfig } from '../config';
import * as nodemailer from 'nodemailer';
import OTPEmail from 'emails/otp';
import { render } from '@react-email/components';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: envConfig.emailHost,
      port: envConfig.emailPort,
      secure: true,
      auth: {
        user: envConfig.otpEmail,
        pass: envConfig.otpEmailPassword,
      },
      tls: { rejectUnauthorized: false },
    });
  }

  async sendOtpEmail(payload: { email: string; code: string }) {
    const subject = 'Organic - Xác thực Email';

    const htmlContent = await render(
      <OTPEmail code={payload.code} title={subject} />,
    );

    const mailOptions = {
      from: {
        name: envConfig.otpEmailName,
        address: envConfig.otpEmail,
      },
      to: payload.email,
      subject,
      html: htmlContent,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendOrderConfirmationEmail(args: {
    to: string;
    customerName: string;
    orderCode: string;
    orderDate: string;
    items: { name: string; qty: number; price: number }[];
    total: number;
    startUrl: string;
  }) {
    const subject = `Organic Store - Xác nhận đơn hàng ${args.orderCode}`;
    const brand = '#16a34a';

    const currencyVND = (n: number) =>
      new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(n);

    const itemsHtml = args.items
      .map(
        (it) => `
        <tr>
          <td style="padding:8px 0;font-size:14px;color:#111827">${it.name} × ${it.qty}</td>
          <td align="right" style="padding:8px 0;font-size:14px">${currencyVND(it.price)}</td>
        </tr>
      `,
      )
      .join('');

    const html = `
    <!doctype html>
    <html lang="vi">
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { background:#f6f7fb; margin:0; font-family:Arial,Helvetica,sans-serif; color:#111827; }
        a { text-decoration:none; }
        .container { width:100%; max-width:640px; margin:24px auto; }
        .card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,.06); }
        .header { background:${brand}; color:#fff; text-align:center; padding:18px 16px; font-weight:700; letter-spacing:.3px; }
        .body { padding:24px 20px; }
        h1 { font-size:20px; margin:0 0 10px; line-height:1.35; }
        p { font-size:14px; line-height:1.7; margin:0 0 12px; color:#374151; }
        .hr { height:1px; background:#eef0f4; border:none; margin:16px 0; }
        .footer { text-align:center; font-size:12px; color:#9ca3af; padding:14px 10px 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">Organic Store</div>
          <div class="body">
            <h1>Cảm ơn bạn đã đặt hàng!</h1>
            <p>Xin chào <b>${args.customerName}</b>,</p>
            <p>Đơn hàng <b>${args.orderCode}</b> ngày ${args.orderDate} của bạn đã được xác nhận.</p>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;border-collapse:collapse">
              <thead>
                <tr>
                  <th align="left" style="border-bottom:1px solid #e5e7eb;padding:8px 0;font-size:14px;color:#6b7280">Sản phẩm</th>
                  <th align="right" style="border-bottom:1px solid #e5e7eb;padding:8px 0;font-size:14px;color:#6b7280">Giá</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr>
                  <td style="padding:10px 0;font-size:14px;font-weight:700">Tổng cộng</td>
                  <td align="right" style="padding:10px 0;font-size:14px;font-weight:700">${currencyVND(args.total)}</td>
                </tr>
              </tbody>
            </table>

            <!-- CTA button -->
            <div style="text-align:center;margin:24px 0;">
              <a href="${args.startUrl}"
                 target="_blank"
                 style="display:inline-block;background:${brand};color:#fff;font-weight:700;
                        font-size:14px;line-height:44px;padding:0 24px;border-radius:12px;">
                Xem chi tiết đơn hàng
              </a>
            </div>

            <hr class="hr"/>
            <p style="font-size:12px;color:#6b7280;">
              Nếu bạn không thực hiện giao dịch này, vui lòng bỏ qua email. 
              Mọi thắc mắc vui lòng phản hồi email để được hỗ trợ.
            </p>
          </div>
        </div>
        <div class="footer">© ${new Date().getFullYear()} Organic Store. All rights reserved.</div>
      </div>
    </body>
    </html>
    `;

    return this.transporter.sendMail({
      from: {
        name: envConfig.otpEmailName,
        address: envConfig.otpEmail,
      },
      to: args.to,
      subject,
      html,
    });
  }
}
