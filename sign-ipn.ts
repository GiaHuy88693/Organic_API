// sign-ipn.ts
import * as crypto from 'crypto';
import { envConfig } from './src/shared/config';

// === ĐIỀN KEY THẬT CỦA BẠN TẠI ĐÂY ===
const secretKey = envConfig.momoSecretKey;
const accessKey = envConfig.momoAccessKey;
const partnerCode = envConfig.momoPartnerCode;

// === BODY IPN (giống phần 1), CHỈ KHÁC signature sẽ tính sau ===
const body = {
  partnerCode,
  accessKey,
  orderId: '1759907973175',
  requestId: '50073bc3-64a8-401c-ba33-ad57e7f9c24b',
  amount: '10000',
  orderInfo: 'Payment with MoMo',
  orderType: 'momo_wallet',
  transId: '3211234567',
  resultCode: 0,
  message: 'Successful.',
  payType: 'wallet',
  responseTime: 1759908000000,
  extraData: ''
};

// build raw theo thứ tự y như service của bạn
const raw =
  `accessKey=${body.accessKey}` +
  `&amount=${body.amount}` +
  `&extraData=${body.extraData}` +
  `&message=${body.message}` +
  `&orderId=${body.orderId}` +
  `&orderInfo=${body.orderInfo}` +
  `&orderType=${body.orderType}` +
  `&partnerCode=${body.partnerCode}` +
  `&payType=${body.payType}` +
  `&requestId=${body.requestId}` +
  `&responseTime=${body.responseTime}` +
  `&resultCode=${body.resultCode}` +
  `&transId=${body.transId}`;

const signature = crypto.createHmac('sha256', secretKey).update(raw).digest('hex');
console.log('signature=', signature);
console.log(JSON.stringify({ ...body, signature }, null, 2));
