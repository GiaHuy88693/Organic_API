import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

export const CategoryAlreadyExistsException = new UnprocessableEntityException({
  message: 'Error.CategoryAlreadyExists',
  path: 'categories',
});

export const AtLeastOneCategoryFieldMustBeProvidedException = new BadRequestException({
  message: 'Error.AtLeastOneCategoryFieldMustBeProvided',
  path: 'categories',
});

export const CategoryNotFoundException = new NotFoundException({
  message: 'Error.CategoryNotFound',
  path: 'categories',
});

export const InternalCreateCategoryErrorException = new InternalServerErrorException({
  message: 'Error.InternalCreateCategoryError',
  path: 'categories',
});

export const InternalUpdateCategoryErrorException = new InternalServerErrorException({
  message: 'Error.InternalUpdateCategoryError',
  path: 'categories',
});

export const InternalRetrieveCategoryErrorException = new InternalServerErrorException({
  message: 'Error.InternalRetrieveCategoryError',
  path: 'categories',
});

export const InternalDeleteCategoryErrorException = new InternalServerErrorException({
  message: 'Error.InternalDeleteCategoryError',
  path: 'categories',
});
