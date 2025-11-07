import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sale } from './schemas/sale.schema';
import { CreateSaleDto, QuerySaleDto } from './dto/sale.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private saleModel: Model<Sale>,
    private productsService: ProductsService,
  ) {}

  async create(createSaleDto: CreateSaleDto, userId: string) {
    const { productId, quantity } = createSaleDto;

    // Get product and check stock
    const product = await this.productsService.findOne(productId);

    if (product.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
      );
    }

    // Calculate total price
    const totalPrice = product.price * quantity;

    // Create sale record
    const sale = await this.saleModel.create({
      productId,
      quantity,
      unitPrice: product.price,
      totalPrice,
      soldBy: userId,
    });

    // Update product stock
    await this.productsService.updateStock(productId, quantity);

    // Populate product details
    return this.saleModel
      .findById(sale._id)
      .populate('productId', 'name description')
      .populate('soldBy', 'email')
      .exec();
  }

  async findAll(query: QuerySaleDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [sales, total] = await Promise.all([
      this.saleModel
        .find()
        .populate('productId', 'name description')
        .sort({ createdAt: -1 })
        .select(
          'productId:name productId:description quantity unitPrice totalPrice createdAt',
        )
        .skip(skip)
        .limit(limit)
        .exec(),
      this.saleModel.countDocuments().exec(),
    ]);

    return {
      data: sales,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const sale = await this.saleModel
      .findById(id)
      .populate('productId', 'name description price')
      .populate('soldBy', 'name email')
      .exec();

    if (!sale) {
      throw new BadRequestException('Sale not found');
    }
    return sale;
  }

  async getSalesReport() {
    const sales = await this.saleModel.find().exec();
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);

    return {
      totalSales,
      totalRevenue,
      averageSaleValue: totalSales > 0 ? totalRevenue / totalSales : 0,
    };
  }
}
