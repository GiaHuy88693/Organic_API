import { HttpException, Injectable } from '@nestjs/common';
import {
  InvalidQuantityException,
  ProductNotFoundForCartException,
  CartItemNotFoundException,
  InternalCartRetrieveErrorException,
  InternalCartUpsertErrorException,
} from './cart.error';
import { CartRepository } from './cart.repo';
import {
  AddToCartBodyType,
  CartListResType,
  GetCartQueryType,
  UpdateCartItemBodyType,
} from './cart.model';

@Injectable()
export class CartService {
  constructor(private readonly repo: CartRepository) {}

  async add({ userId, data }: { userId: string; data: AddToCartBodyType }) {
    try {
      const ok = await this.repo.productExists(data.productId);
      if (!ok) throw ProductNotFoundForCartException;

      const existed = await this.repo.findItem(userId, data.productId);
      if (existed) {
        const newQty = existed.quantity + (data.quantity ?? 1);
        if (newQty <= 0) throw InvalidQuantityException;
        await this.repo.updateQuantity(existed.id, newQty);
        return { id: existed.id, productId: data.productId, quantity: newQty };
      }
      const created = await this.repo.create(
        userId,
        data.productId,
        data.quantity ?? 1,
      );
      return {
        id: created.id,
        productId: data.productId,
        quantity: created.quantity,
      };
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw InternalCartUpsertErrorException;
    }
  }

  async update({
    userId,
    cartItemId,
    data,
  }: {
    userId: string;
    cartItemId: string;
    data: UpdateCartItemBodyType;
  }) {
    try {
      const item = await this.repo.findItemById(userId, cartItemId);
      if (!item) throw CartItemNotFoundException;

      if (data.quantity === 0) {
        await this.repo.deleteById(cartItemId);
        return { message: 'Cart item removed.' };
      }
      if ((data.quantity as number) < 0) throw InvalidQuantityException;

      const updated = await this.repo.updateQuantity(
        cartItemId,
        data.quantity as number,
      );
      return {
        id: updated.id,
        productId: updated.productId,
        quantity: updated.quantity,
      };
    } catch (e) {
      console.log(e);
      if (e instanceof HttpException) throw e;
      throw InternalCartUpsertErrorException;
    }
  }

  private async getProductIdByCartItem(
    cartItemId: string,
  ): Promise<string | null> {
    return null;
  }

  async remove({ cartItemId }: { cartItemId: string }) {
    await this.repo.deleteById(cartItemId);
    return { message: 'Cart item deleted.' };
  }

  async clear({ userId }: { userId: string }) {
    await this.repo.clearByUser(userId);
    return { message: 'Cart cleared.' };
  }

  async list({
    userId,
    query,
  }: {
    userId: string;
    query: GetCartQueryType;
  }): Promise<CartListResType> {
    try {
      return (await this.repo.listOfUser(userId, query)) as CartListResType;
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw InternalCartRetrieveErrorException;
    }
  }
}
