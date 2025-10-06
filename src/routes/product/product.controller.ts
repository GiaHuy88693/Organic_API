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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from 'src/shared/decorator/auth.decorator';
import { AuthTypes } from 'src/shared/constants/auth.constant';
import { ActiveUser } from 'src/shared/decorator/active-user.decorator';
import { RequireClientRole } from 'src/shared/decorator/role.decorator';
import { ProductService } from './product.service';
import { MessageResDTO } from '../auth/dto/auth.dto';
import {
  CreateProductBodyDTO,
  CreateProductResDTO,
  GetAllProductsResDTO,
  GetProductDetailResDTO,
  GetProductQueryDTO,
  GetProductsResDTO,
  UpdateProductBodyDTO,
  UpdateProductResDTO,
} from './dto/product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Auth([AuthTypes.BEARER])
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create product' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product created successfully',
    type: CreateProductResDTO,
  })
  @ZodSerializerDto(CreateProductResDTO)
  async create(
    @Body() body: CreateProductBodyDTO,
    @ActiveUser('userId') userId: string,
  ) {
    return this.service.create({ data: body, createdById: userId });
  }

  @Auth([AuthTypes.BEARER])
  @Patch(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product updated successfully',
    type: UpdateProductResDTO,
  })
  @ZodSerializerDto(UpdateProductResDTO)
  async update(
    @Param('productId') productId: string,
    @Body() body: UpdateProductBodyDTO,
    @ActiveUser('userId') userId: string,
  ) {
    return this.service.update({
      id: productId,
      data: body,
      updatedById: userId,
    });
  }

  @Auth([AuthTypes.BEARER])
  @Delete(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete product (soft delete)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product deleted successfully',
    type: MessageResDTO,
  })
  @ZodSerializerDto(MessageResDTO)
  async delete(@Param('productId') productId: string) {
    return this.service.delete({ id: productId });
  }

  @Auth([AuthTypes.BEARER])
  @Get('pagination')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List products (paginated)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products fetched (paginated)',
    type: GetProductsResDTO,
  })
  @ZodSerializerDto(GetProductsResDTO)
  async findAll(@Query() query: GetProductQueryDTO) {
    return this.service.findAll(query);
  }

  @Auth([AuthTypes.BEARER])
  @Get(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product fetched',
    type: GetProductDetailResDTO,
  })
  @ZodSerializerDto(GetProductDetailResDTO)
  async findOne(@Param('productId') productId: string) {
    return this.service.findOne(productId);
  }

  @Auth([AuthTypes.BEARER])
  @Get()
  @RequireClientRole()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all products (non-paginated)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All products fetched',
    type: GetAllProductsResDTO,
  })
  @ZodSerializerDto(GetAllProductsResDTO)
  async getAll() {
    return this.service.getAll();
  }

  @Auth([AuthTypes.BEARER])
  @Post(':productId/images')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload product images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
      required: ['images'],
    },
  })
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadImages(
    @Param('productId') productId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @ActiveUser('userId') userId: string,
  ) {
    return this.service.uploadImages({ productId, files, createdById: userId });
  }

  @Auth([AuthTypes.BEARER])
  @Get(':productId/images')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List product images' })
  async listImages(@Param('productId') productId: string) {
    return this.service.listImages(productId);
  }

  @Auth([AuthTypes.BEARER])
  @Patch(':productId/images/:imageId/primary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set primary product image' })
  async setPrimaryImage(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
    @ActiveUser('userId') userId: string,
  ) {
    return this.service.setPrimaryImage({
      productId,
      imageId,
      updatedById: userId,
    });
  }

  @Auth([AuthTypes.BEARER])
  @Delete(':productId/images/:imageId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete product image' })
  async deleteImage(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.service.deleteImage({ productId, imageId });
  }
}
