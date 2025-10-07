import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';
import { Auth } from 'src/shared/decorator/auth.decorator';
import { AuthTypes } from 'src/shared/constants/auth.constant';
import { ActiveUser } from 'src/shared/decorator/active-user.decorator';
import { ParseObjectIdPipe } from 'src/shared/pipes/objectid.pipe';
import { OrderService } from './order.service';
import {
  CheckoutFromCartResDTO,
  GetOrdersQueryDTO,
  OrderDetailResDTO,
  OrdersListResDTO,
} from './dto/order.dto';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Auth([AuthTypes.BEARER])
  @Post('checkout-from-cart')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create order from current user cart (and clear cart)',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: CheckoutFromCartResDTO })
  @ZodSerializerDto(CheckoutFromCartResDTO)
  async checkout(@ActiveUser('userId') userId: string) {
    return this.service.checkoutFromCart(userId);
  }

  @Auth([AuthTypes.BEARER])
  @Get('pagination')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List my orders (paginated)' })
  @ApiResponse({ status: HttpStatus.OK, type: OrdersListResDTO })
  @ZodSerializerDto(OrdersListResDTO)
  async listMine(
    @ActiveUser('userId') userId: string,
    @Query() query: GetOrdersQueryDTO,
  ) {
    return this.service.listMine(userId, query);
  }

  @Auth([AuthTypes.BEARER])
  @Get(':orderId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Order detail (with items & product info)' })
  @ApiResponse({ status: HttpStatus.OK, type: OrderDetailResDTO })
  @ZodSerializerDto(OrderDetailResDTO)
  async detail(
    @ActiveUser('userId') userId: string,
    @Param('orderId', ParseObjectIdPipe) orderId: string,
  ) {
    return this.service.detail(userId, orderId);
  }

  @Auth([AuthTypes.BEARER])
  @Delete(':orderId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete my order' })
  async delete(
    @ActiveUser('userId') userId: string,
    @Param('orderId', ParseObjectIdPipe) orderId: string,
  ) {
    return this.service.delete(userId, orderId);
  }
}
