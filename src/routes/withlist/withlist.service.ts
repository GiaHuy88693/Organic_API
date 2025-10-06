import { HttpException, Injectable } from '@nestjs/common';
import {
  InternalRetrieveWishlistErrorException,
  InternalToggleWishlistErrorException,
  ProductNotFoundForWishlistException,
} from './withlist.error';
import { GetWishlistQueryType, GetWishlistResType } from './withlist.model';
import { WishlistRepository } from './withlist.repo';

@Injectable()
export class WishlistService {
  constructor(private readonly repo: WishlistRepository) {}

  async toggle({
    userId,
    productId,
  }: {
    userId: string;
    productId: string;
  }): Promise<{ liked: boolean }> {
    try {
      const ok = await this.repo.productExists(productId);
      if (!ok) throw ProductNotFoundForWishlistException;

      const existed = await this.repo.findItem(userId, productId);

      if (existed) {
        await this.repo.deleteBy(userId, productId);
        return { liked: false };
      }

      await this.repo.create(userId, productId);
      return { liked: true };
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw InternalToggleWishlistErrorException;
    }
  }

  async listOfUser({
    userId,
    query,
  }: {
    userId: string;
    query: GetWishlistQueryType;
  }): Promise<GetWishlistResType> {
    try {
      const res = await this.repo.listOfUser(userId, query);
      return res as GetWishlistResType;
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw InternalRetrieveWishlistErrorException;
    }
  }
}
