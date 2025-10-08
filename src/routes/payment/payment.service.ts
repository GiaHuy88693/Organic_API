import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { envConfig } from 'src/shared/config';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  buildCreateRawSignature,
  buildIpnRawSignature,
  hmacSHA256,
} from 'src/utils/momo.util';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  private get cfg() {
    return {
      partnerCode: envConfig.momoPartnerCode,
      accessKey: envConfig.momoAccessKey,
      secretKey: envConfig.momoSecretKey,
      createUrl: envConfig.momoCreateUrl,
      redirectUrl: envConfig.momoRedirectUrl,
      ipnUrl: envConfig.momoIpnUrl,
    };
  }

  async createPayment(amount: number, orderInfo = 'Payment with MoMo') {
    const {
      partnerCode,
      accessKey,
      secretKey,
      createUrl,
      redirectUrl,
      ipnUrl,
    } = this.cfg;
    const orderId = `${Date.now()}`; // hoặc id đơn hàng của bạn
    const requestId = randomUUID();
    const requestType = 'captureWallet';
    const extraData = '';

    const rawSignature = buildCreateRawSignature({
      accessKey,
      amount: String(amount),
      extraData,
      ipnUrl,
      orderId,
      orderInfo,
      partnerCode,
      redirectUrl,
      requestId,
      requestType,
    });
    const signature = hmacSHA256(rawSignature, secretKey);

    const payload = {
      partnerCode,
      accessKey,
      requestId,
      amount: String(amount),
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      requestType,
      extraData,
      signature,
      lang: 'vi',
    };

    const { data } = await axios.post(createUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    if (data?.resultCode !== 0) {
      throw new BadRequestException(
        `MoMo error ${data?.resultCode}: ${data?.message}`,
      );
    }

    await this.prisma.payment.create({
      data: {
        provider: 'momo',
        orderId,
        requestId,
        amount,
        status: 'PENDING',
        raw: data,
      },
    });

    return {
      orderId,
      requestId,
      payUrl: data.payUrl,
      deeplink: data.deeplink,
      qrCodeUrl: data.qrCodeUrl,
    };
  }

  verifyIpn(q: any) {
    const { secretKey, accessKey, partnerCode } = this.cfg;

    // Ép mọi giá trị về string; nếu null/undefined -> ''
    const S = (v: any) => (v === undefined || v === null ? '' : String(v));

    const amount = S(q.amount);
    const extraData = S(q.extraData);
    const message = S(q.message);
    const orderId = S(q.orderId);
    const orderInfo = S(q.orderInfo); 
    const orderType = S(q.orderType);
    const payType = S(q.payType);
    const requestId = S(q.requestId);
    const responseTime = S(q.responseTime);
    const resultCode = S(q.resultCode);
    const transId = S(q.transId);
    const recvSign = S(q.signature);

    // Build raw theo đúng thứ tự spec (giống util của bạn)
    const raw = [
      `accessKey=${accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `message=${message}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `orderType=${orderType}`,
      `partnerCode=${partnerCode}`,
      `payType=${payType}`,
      `requestId=${requestId}`,
      `responseTime=${responseTime}`,
      `resultCode=${resultCode}`,
      `transId=${transId}`,
    ]
      .map((s) => s.trim())
      .join('&');

    const computed = hmacSHA256(raw, secretKey);
    const valid = computed === recvSign;

    return { valid, raw, signReceived: recvSign, signComputed: computed };
  }

  async handleIpn(body: any) {
    const { valid } = this.verifyIpn(body);
    if (!valid) return { resultCode: 900, message: 'Invalid signature' };

    const status = Number(body.resultCode) === 0 ? 'SUCCESS' : 'FAILED';

    await this.prisma.payment.update({
      where: { orderId: String(body.orderId) },
      data: {
        status,
        transId: String(body.transId ?? ''),
        message: body.message,
        raw: body,
      },
    });

    return { resultCode: 0, message: 'OK' };
  }
}
