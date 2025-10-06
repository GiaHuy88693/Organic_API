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
import { ZodSerializerDto } from 'nestjs-zod';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/shared/decorator/auth.decorator';
import { AuthTypes } from 'src/shared/constants/auth.constant';
import { ActiveUser } from 'src/shared/decorator/active-user.decorator';
import { RequireClientRole } from 'src/shared/decorator/role.decorator';
import { CategoryService } from './category.service';
import { MessageResDTO } from 'src/routes/auth/dto/auth.dto';
import {
  CreateCategoryBodyDTO,
  CreateCategoryResDTO,
  GetAllCategoriesResDTO,
  GetCategoriesResDTO,
  GetCategoryDetailResDTO,
  GetCategoryQueryDTO,
  UpdateCategoryBodyDTO,
  UpdateCategoryResDTO,
} from './dto/category.dto';
import { ParseObjectIdPipe } from 'src/shared/pipes/objectid.pipe';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  @Auth([AuthTypes.BEARER])
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create category' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Category created successfully',
    type: CreateCategoryResDTO,
  })
  @ZodSerializerDto(CreateCategoryResDTO)
  async create(
    @Body() body: CreateCategoryBodyDTO,
    @ActiveUser('userId', ParseObjectIdPipe) userId: string,
  ) {
    return this.service.create({ data: body, createdById: userId });
  }

  @Auth([AuthTypes.BEARER])
  @Patch(':categoryId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category updated successfully',
    type: UpdateCategoryResDTO,
  })
  @ZodSerializerDto(UpdateCategoryResDTO)
  async update(
    @Param('categoryId', ParseObjectIdPipe) categoryId: string,
    @Body() body: UpdateCategoryBodyDTO,
    @ActiveUser('userId') userId: string,
  ) {
    return this.service.update({
      id: categoryId,
      data: body,
      updatedById: userId,
    });
  }

  @Auth([AuthTypes.BEARER])
  @Delete(':categoryId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete category (soft delete)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category deleted successfully',
    type: MessageResDTO,
  })
  @ZodSerializerDto(MessageResDTO)
  async delete(@Param('categoryId', ParseObjectIdPipe) categoryId: string) {
    return this.service.delete({ id: categoryId });
  }

  @Auth([AuthTypes.BEARER])
  @Get('pagination')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List categories (paginated)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categories fetched (paginated)',
    type: GetCategoriesResDTO,
  })
  @ZodSerializerDto(GetCategoriesResDTO)
  async findAll(@Query() query: GetCategoryQueryDTO) {
    return this.service.findAll(query);
  }

  @Auth([AuthTypes.BEARER])
  @Get(':categoryId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category fetched',
    type: GetCategoryDetailResDTO,
  })
  @ZodSerializerDto(GetCategoryDetailResDTO)
  async findOne(@Param('categoryId', ParseObjectIdPipe) categoryId: string) {
    return this.service.findOne(categoryId);
  }

  @Auth([AuthTypes.BEARER])
  @Get()
  @RequireClientRole()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all categories (non-paginated)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All categories fetched',
    type: GetAllCategoriesResDTO,
  })
  @ZodSerializerDto(GetAllCategoriesResDTO)
  async getAll() {
    return this.service.getAll();
  }
}
