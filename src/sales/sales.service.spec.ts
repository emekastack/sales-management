import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { SalesService } from './sales.service';
import { Sale } from './schemas/sale.schema';
import { ProductsService } from '../products/products.service';
import { CreateSaleDto, QuerySaleDto } from './dto/sale.dto';

describe('SalesService', () => {
  let service: SalesService;
  let saleModel: any;
  let productsService: ProductsService;

  const mockSaleModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockProductsService = {
    findOne: jest.fn(),
    updateStock: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: getModelToken(Sale.name),
          useValue: mockSaleModel,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    saleModel = module.get(getModelToken(Sale.name));
    productsService = module.get<ProductsService>(ProductsService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createSaleDto: CreateSaleDto = {
      productId: '507f1f77bcf86cd799439011',
      quantity: 2,
    };

    const userId = '507f1f77bcf86cd799439012';

    const mockProduct = {
      _id: createSaleDto.productId,
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      stock: 10,
    };

    const mockSale = {
      _id: '507f1f77bcf86cd799439013',
      productId: createSaleDto.productId,
      quantity: createSaleDto.quantity,
      unitPrice: mockProduct.price,
      totalPrice: mockProduct.price * createSaleDto.quantity,
      soldBy: userId,
    };

    const mockPopulatedSale = {
      ...mockSale,
      productId: {
        _id: mockProduct._id,
        name: mockProduct.name,
        description: mockProduct.description,
      },
      soldBy: {
        _id: userId,
        email: 'user@example.com',
      },
    };

    const mockQuery = {
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    it('should successfully create a sale', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProduct);
      mockSaleModel.create.mockResolvedValue(mockSale);
      mockProductsService.updateStock.mockResolvedValue({});
      mockSaleModel.findById.mockReturnValue(mockQuery);
      // populate is called twice in a chain, so both calls should return this
      mockQuery.populate.mockReturnThis();
      mockQuery.exec.mockResolvedValue(mockPopulatedSale);

      const result = await service.create(createSaleDto, userId);

      expect(productsService.findOne).toHaveBeenCalledWith(
        createSaleDto.productId,
      );
      expect(saleModel.create).toHaveBeenCalledWith({
        productId: createSaleDto.productId,
        quantity: createSaleDto.quantity,
        unitPrice: mockProduct.price,
        totalPrice: mockProduct.price * createSaleDto.quantity,
        soldBy: userId,
      });
      expect(productsService.updateStock).toHaveBeenCalledWith(
        createSaleDto.productId,
        createSaleDto.quantity,
      );
      expect(saleModel.findById).toHaveBeenCalledWith(mockSale._id);
      expect(mockQuery.populate).toHaveBeenCalledWith(
        'productId',
        'name description',
      );
      expect(mockQuery.populate).toHaveBeenCalledWith('soldBy', 'email');
      expect(mockQuery.populate).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockPopulatedSale);
    });

    it('should throw BadRequestException when insufficient stock', async () => {
      const productWithLowStock = {
        ...mockProduct,
        stock: 1,
      };
      mockProductsService.findOne.mockResolvedValue(productWithLowStock);

      await expect(service.create(createSaleDto, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createSaleDto, userId)).rejects.toThrow(
        'Insufficient stock. Available: 1, Requested: 2',
      );

      expect(productsService.findOne).toHaveBeenCalledWith(
        createSaleDto.productId,
      );
      expect(saleModel.create).not.toHaveBeenCalled();
      expect(productsService.updateStock).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const mockSales = [
      {
        _id: '507f1f77bcf86cd799439011',
        productId: {
          _id: '507f1f77bcf86cd799439020',
          name: 'Product 1',
          description: 'Description 1',
        },
        quantity: 2,
        unitPrice: 10,
        totalPrice: 20,
        createdAt: new Date(),
      },
      {
        _id: '507f1f77bcf86cd799439012',
        productId: {
          _id: '507f1f77bcf86cd799439021',
          name: 'Product 2',
          description: 'Description 2',
        },
        quantity: 3,
        unitPrice: 15,
        totalPrice: 45,
        createdAt: new Date(),
      },
    ];

    const mockQuery = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    it('should return paginated sales with default pagination', async () => {
      const query: QuerySaleDto = {};
      mockSaleModel.find.mockReturnValue(mockQuery);
      mockQuery.exec.mockResolvedValue(mockSales);
      mockSaleModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });

      const result = await service.findAll(query);

      expect(saleModel.find).toHaveBeenCalled();
      expect(mockQuery.populate).toHaveBeenCalledWith(
        'productId',
        'name description',
      );
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockQuery.select).toHaveBeenCalledWith(
        'productId:name productId:description quantity unitPrice totalPrice createdAt',
      );
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        data: mockSales,
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('should return paginated sales with custom pagination', async () => {
      const query: QuerySaleDto = { page: 2, limit: 5 };
      mockSaleModel.find.mockReturnValue(mockQuery);
      mockQuery.exec.mockResolvedValue(mockSales);
      mockSaleModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(12),
      });

      const result = await service.findAll(query);

      expect(mockQuery.skip).toHaveBeenCalledWith(5);
      expect(mockQuery.limit).toHaveBeenCalledWith(5);
      expect(result).toEqual({
        data: mockSales,
        meta: {
          page: 2,
          limit: 5,
          total: 12,
          totalPages: 3,
        },
      });
    });
  });

  describe('findOne', () => {
    const saleId = '507f1f77bcf86cd799439011';
    const mockSale = {
      _id: saleId,
      productId: {
        _id: '507f1f77bcf86cd799439020',
        name: 'Product 1',
        description: 'Description 1',
        price: 10,
      },
      quantity: 2,
      unitPrice: 10,
      totalPrice: 20,
      soldBy: {
        _id: '507f1f77bcf86cd799439012',
        name: 'User Name',
        email: 'user@example.com',
      },
    };

    const mockQuery = {
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    it('should return a sale when found', async () => {
      mockSaleModel.findById.mockReturnValue(mockQuery);
      mockQuery.populate.mockReturnThis();
      mockQuery.exec.mockResolvedValue(mockSale);

      const result = await service.findOne(saleId);

      expect(saleModel.findById).toHaveBeenCalledWith(saleId);
      expect(mockQuery.populate).toHaveBeenCalledWith(
        'productId',
        'name description price',
      );
      expect(mockQuery.populate).toHaveBeenCalledWith('soldBy', 'name email');
      expect(result).toEqual(mockSale);
    });

    it('should throw BadRequestException when sale not found', async () => {
      mockSaleModel.findById.mockReturnValue(mockQuery);
      mockQuery.populate.mockReturnThis();
      mockQuery.exec.mockResolvedValue(null);

      await expect(service.findOne(saleId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findOne(saleId)).rejects.toThrow('Sale not found');

      expect(saleModel.findById).toHaveBeenCalledWith(saleId);
    });
  });

  describe('getSalesReport', () => {
    const mockSales = [
      {
        _id: '507f1f77bcf86cd799439011',
        totalPrice: 20,
      },
      {
        _id: '507f1f77bcf86cd799439012',
        totalPrice: 45,
      },
      {
        _id: '507f1f77bcf86cd799439013',
        totalPrice: 35,
      },
    ];

    const mockQuery = {
      exec: jest.fn(),
    };

    it('should return sales report with correct calculations', async () => {
      mockSaleModel.find.mockReturnValue(mockQuery);
      mockQuery.exec.mockResolvedValue(mockSales);

      const result = await service.getSalesReport();

      expect(saleModel.find).toHaveBeenCalled();
      expect(result).toEqual({
        totalSales: 3,
        totalRevenue: 100,
        averageSaleValue: 100 / 3,
      });
    });

    it('should return zero values when no sales exist', async () => {
      mockSaleModel.find.mockReturnValue(mockQuery);
      mockQuery.exec.mockResolvedValue([]);

      const result = await service.getSalesReport();

      expect(result).toEqual({
        totalSales: 0,
        totalRevenue: 0,
        averageSaleValue: 0,
      });
    });
  });
});
