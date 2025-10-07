import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';
import { Auth } from 'src/shared/decorator/auth.decorator';
import { AuthTypes } from 'src/shared/constants/auth.constant';
import { ActiveUser } from 'src/shared/decorator/active-user.decorator';
import { ParseObjectIdPipe } from 'src/shared/pipes/objectid.pipe';
import { CartService } from './cart.service';
import {
  AddToCartBodyDTO,
  CartListResDTO,
  GetCartQueryDTO,
  UpdateCartItemBodyDTO,
} from './dto/cart.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly service: CartService) {}

  @Auth([AuthTypes.BEARER])
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add product to cart (upsert/increment)' })
  async add(
    @Body() body: AddToCartBodyDTO,
    @ActiveUser('userId') userId: string,
  ) {
    return this.service.add({ userId, data: body });
  }

  @Auth([AuthTypes.BEARER])
  @Patch(':cartItemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update cart item quantity (0 = remove)' })
  async update(
    @Param('cartItemId', ParseObjectIdPipe) cartItemId: string,
    @Body() body: UpdateCartItemBodyDTO,
    @ActiveUser('userId') userId: string,
  ) {
    return this.service.update({ userId, cartItemId, data: body });
  }

  @Auth([AuthTypes.BEARER])
  @Delete(':cartItemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a cart item' })
  async remove(@Param('cartItemId', ParseObjectIdPipe) cartItemId: string) {
    return this.service.remove({ cartItemId });
  }

  @Auth([AuthTypes.BEARER])
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear my cart' })
  async clear(@ActiveUser('userId') userId: string) {
    return this.service.clear({ userId });
  }

  @Auth([AuthTypes.BEARER])
  @Get('pagination')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, type: CartListResDTO })
  @ZodSerializerDto(CartListResDTO)
  @ApiOperation({ summary: 'List my cart (paginated)' })
  async list(
    @ActiveUser('userId') userId: string,
    @Query() query: GetCartQueryDTO,
  ) {
    return this.service.list({ userId, query });
  }
}
