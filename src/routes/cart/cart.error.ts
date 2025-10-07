import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

export const ProductNotFoundForCartException = new NotFoundException({
  message: 'Error.ProductNotFound',
  path: 'cart',
});

export const CartItemNotFoundException = new NotFoundException({
  message: 'Error.CartItemNotFound',
  path: 'cart',
});

export const InternalCartUpsertErrorException = new InternalServerErrorException({
  message: 'Error.InternalCartUpsertError',
  path: 'cart',
});

export const InternalCartRetrieveErrorException = new InternalServerErrorException({
  message: 'Error.InternalCartRetrieveError',
  path: 'cart',
});

export const InvalidQuantityException = new BadRequestException({
  message: 'Error.InvalidQuantity',
  path: 'cart',
});
