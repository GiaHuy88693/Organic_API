import * as crypto from 'crypto';

export function hmacSHA256(raw: string, secretKey: string) {
  return crypto.createHmac('sha256', secretKey).update(raw).digest('hex');
}

// Build raw signature cho request "create" (v2)
export function buildCreateRawSignature(p: {
  accessKey: string;
  amount: string;
  extraData: string;
  ipnUrl: string;
  orderId: string;
  orderInfo: string;
  partnerCode: string;
  redirectUrl: string;
  requestId: string;
  requestType: string;
}) {
  const {
    accessKey,
    amount,
    extraData,
    ipnUrl,
    orderId,
    orderInfo,
    partnerCode,
    redirectUrl,
    requestId,
    requestType,
  } = p;

  // THỨ TỰ THAM SỐ PHẢI CHÍNH XÁC
  return (
    `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}` +
    `&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}` +
    `&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}` +
    `&requestId=${requestId}&requestType=${requestType}`
  );
}

// Build raw signature để VERIFY IPN/RETURN (thứ tự phía MoMo quy định)
export function buildIpnRawSignature(p: Record<string, string | number>) {
  // theo spec IPN v2 (giữ nguyên thứ tự khoá được MoMo yêu cầu)
  const {
    accessKey,
    amount,
    extraData,
    message,
    orderId,
    orderInfo,
    orderType,
    partnerCode,
    payType,
    requestId,
    responseTime,
    resultCode,
    transId,
  } = p as any;

  return (
    `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}` +
    `&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}` +
    `&orderType=${orderType}&partnerCode=${partnerCode}` +
    `&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}` +
    `&resultCode=${resultCode}&transId=${transId}`
  );
}
