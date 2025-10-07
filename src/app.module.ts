import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import CustomZodValidationPipe from './shared/pipes/custom-zod-validation.pipe';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { AuthModule } from './routes/auth/auth.module';
import { AccessTokenGuard } from './shared/guard/access-token.guard';
import { ApiKeyGuard } from './shared/guard/api-key.guard';
import { AuthenticationGuard } from './shared/guard/authentication.guard';
import { RoleModule } from './routes/role/role.module';
import { PermissionModule } from './routes/permission/permission.module';
import { ProductModule } from './routes/product/product.module';
import { CategoryModule } from './routes/category/category.module';
import { WithlistModule } from './routes/withlist/withlist.module';
import { CartModule } from './routes/cart/cart.module';
import { OrderModule } from './routes/order/order.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    RoleModule,
    PermissionModule,
    ProductModule,
    CategoryModule,
    WithlistModule,
    CartModule,
    OrderModule,
  ],
  controllers: [],
  providers: [
    AccessTokenGuard,
    ApiKeyGuard,
    { provide: APP_PIPE, useClass: CustomZodValidationPipe },
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
