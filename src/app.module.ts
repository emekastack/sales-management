import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGODB_URI!), AuthModule, ProductsModule, SalesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
