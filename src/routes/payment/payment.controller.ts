import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PaymentService } from './payment.service';

@Controller('payments/momo')
export class PaymentController {
  constructor(private readonly momo: PaymentService) {}

  // Tạo thanh toán → client redirect tới payUrl
  @Post('create')
  async create(@Body() dto: { amount: number; orderInfo?: string }) {
    const { amount, orderInfo } = dto;
    const result = await this.momo.createPayment(amount, orderInfo);
    return result;
  }

  // IPN (server-to-server) – MoMo sẽ POST vào đây
  @Post('ipn')
  async ipn(@Body() body: any) {
    const result = await this.momo.handleIpn(body);
    return result;
  }

  // Return URL (user được redirect về đây) – tuỳ ý hiển thị kết quả
  @Get('return')
  async return(@Query() q: any, @Res() res: Response) {
    // q có thể gồm orderId, requestId, resultCode, message, signature ...
    const verify = this.momo.verifyIpn(q);
    // Render trang kết quả đơn giản
    return res.send(
      `<h3>Thanh toán MoMo: ${q.resultCode == 0 ? 'THÀNH CÔNG' : 'THẤT BẠI'}</h3>
       <div>orderId: ${q.orderId}</div>
       <div>requestId: ${q.requestId}</div>
       <div>message: ${q.message}</div>
       <div>verify: ${verify.valid ? 'OK' : 'INVALID SIGN'}</div>`,
    );
  }
}
