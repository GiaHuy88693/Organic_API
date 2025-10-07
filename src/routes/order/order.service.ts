import { HttpException, Injectable } from '@nestjs/common';
import {
  CartEmptyException,
  InternalCheckoutErrorException,
  InternalRetrieveOrderErrorException,
  OrderNotFoundException,
} from './order.error';
import { OrderRepository } from './order.repo';
import { GetOrdersQueryType, OrdersListResType } from './order.model';

@Injectable()
export class OrderService {
  constructor(private readonly repo: OrderRepository) {}

  async checkoutFromCart(userId: string) {
    try {
      const res = await this.repo.checkoutFromCart(userId);
      if (!res) throw CartEmptyException;
      return res;
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw InternalCheckoutErrorException;
    }
  }

  async listMine(userId: string, query: GetOrdersQueryType): Promise<OrdersListResType> {
    try {
      return (await this.repo.listOfUser(userId, query)) as OrdersListResType;
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw InternalRetrieveOrderErrorException;
    }
  }

  async detail(userId: string, orderId: string) {
    try {
      const row = await this.repo.findDetail(orderId, userId);
      if (!row) throw OrderNotFoundException;
      return row;
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw InternalRetrieveOrderErrorException;
    }
  }

  async delete(userId: string, orderId: string) {
    // nếu cần kiểm tra quyền sở hữu
    const row = await this.repo.findDetail(orderId, userId);
    if (!row) throw OrderNotFoundException;
    await this.repo.softDelete(orderId);
    return { message: 'Order deleted.' };
  }
}
