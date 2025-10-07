import { InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';

export const CartEmptyException = new BadRequestException({
  message: 'Error.CartEmpty',
  path: 'orders',
});

export const OrderNotFoundException = new NotFoundException({
  message: 'Error.OrderNotFound',
  path: 'orders',
});

export const InternalCheckoutErrorException = new InternalServerErrorException({
  message: 'Error.InternalCheckoutError',
  path: 'orders',
});

export const InternalRetrieveOrderErrorException = new InternalServerErrorException({
  message: 'Error.InternalRetrieveOrderError',
  path: 'orders',
});
