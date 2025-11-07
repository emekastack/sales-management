import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI')!,
        // Connection options to improve connection speed
        // serverSelectionTimeoutMS: 5000, // How long to try selecting a server
        // socketTimeoutMS: 45000, // How long to wait for a socket to be established
        // connectTimeoutMS: 10000, // How long to wait for initial connection
        // maxPoolSize: 10, // Maximum number of connections in the pool
        // minPoolSize: 2, // Minimum number of connections in the pool
        // retryWrites: true, // Retry writes on network errors
        // retryReads: true, // Retry reads on network errors
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ProductsModule,
    SalesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
