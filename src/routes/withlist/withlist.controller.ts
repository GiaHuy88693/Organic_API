// src/routes/wishlist/wishlist.controller.ts
import {
  Controller,
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
import {
  GetWishlistQueryDTO,
  GetWishlistResDTO,
  ToggleWishlistResDTO,
} from './dto/withlist.dto';
import { WishlistService } from './withlist.service';

@ApiTags('Wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly service: WishlistService) {}

  @Auth([AuthTypes.BEARER])
  @Post(':productId/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle wishlist for a product' })
  @ApiResponse({ status: HttpStatus.OK, type: ToggleWishlistResDTO })
  @ZodSerializerDto(ToggleWishlistResDTO)
  async toggle(
    @Param('productId', ParseObjectIdPipe) productId: string,
    @ActiveUser('userId') userId: string,
  ) {
    return this.service.toggle({ userId, productId });
  }

  @Auth([AuthTypes.BEARER])
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List my wishlist (paginated)' })
  @ApiResponse({ status: HttpStatus.OK, type: GetWishlistResDTO })
  @ZodSerializerDto(GetWishlistResDTO)
  async listMine(
    @ActiveUser('userId') userId: string,
    @Query() query: GetWishlistQueryDTO,
  ) {
    return this.service.listOfUser({ userId, query });
  }
}
