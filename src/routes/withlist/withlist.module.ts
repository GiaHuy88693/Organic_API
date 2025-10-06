import { Module } from '@nestjs/common';
import { WishlistController } from './withlist.controller';
import { WishlistService } from './withlist.service';
import { WishlistRepository } from './withlist.repo';

@Module({
  controllers: [WishlistController],
  providers: [WishlistService, WishlistRepository],
})
export class WithlistModule {}
