import { BadRequestException, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common'

export const ProductAlreadyExistsException = new UnprocessableEntityException({
  message: 'Error.ProductAlreadyExists',
  path: 'products',
})

export const AtLeastOneProductFieldMustBeProvidedException = new BadRequestException({
  message: 'Error.AtLeastOneProductFieldMustBeProvided',
  path: 'products',
})

export const ProductNotFoundException = new NotFoundException({
  message: 'Error.ProductNotFound',
  path: 'products',
})

export const InternalCreateProductErrorException = new InternalServerErrorException({
  message: 'Error.InternalCreateProductError',
  path: 'products',
})

export const InternalUpdateProductErrorException = new InternalServerErrorException({
  message: 'Error.InternalUpdateProductError',
  path: 'products',
})

export const InternalRetrieveProductErrorException = new InternalServerErrorException({
  message: 'Error.InternalRetrieveProductError',
  path: 'products',
})

export const InternalDeleteProductErrorException = new InternalServerErrorException({
  message: 'Error.InternalDeleteProductError',
  path: 'products',
})
