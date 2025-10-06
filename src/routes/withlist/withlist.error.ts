import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

export const ProductNotFoundForWishlistException = new NotFoundException({
  message: 'Error.ProductNotFound',
  path: 'wishlist',
});

export const InternalToggleWishlistErrorException = new InternalServerErrorException({
  message: 'Error.InternalToggleWishlistError',
  path: 'wishlist',
});

export const InternalRetrieveWishlistErrorException = new InternalServerErrorException({
  message: 'Error.InternalRetrieveWishlistError',
  path: 'wishlist',
});