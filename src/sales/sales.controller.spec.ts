import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { CreateSaleDto, QuerySaleDto } from './dto/sale.dto';

describe('SalesController', () => {
  let controller: SalesController;
  let salesService: SalesService;

  const mockSalesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getSalesReport: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [
        {
          provide: SalesService,
          useValue: mockSalesService,
        },
      ],
    }).compile();

    controller = module.get<SalesController>(SalesController);
    salesService = module.get<SalesService>(SalesService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createSaleDto: CreateSaleDto = {
      productId: '507f1f77bcf86cd799439011',
      quantity: 2,
    };

    const mockRequest = {
      user: {
        _id: '507f1f77bcf86cd799439012',
      },
    };

    const expectedResponse = {
      _id: '507f1f77bcf86cd799439013',
      productId: {
        _id: createSaleDto.productId,
        name: 'Test Product',
        description: 'Test Description',
      },
      quantity: createSaleDto.quantity,
      unitPrice: 99.99,
      totalPrice: 199.98,
      soldBy: {
        _id: mockRequest.user._id,
        email: 'user@example.com',
      },
    };

    it('should call salesService.create with correct DTO and user ID', async () => {
      mockSalesService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createSaleDto, mockRequest);

      expect(salesService.create).toHaveBeenCalledWith(
        createSaleDto,
        mockRequest.user._id,
      );
      expect(salesService.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should return the result from salesService.create', async () => {
      mockSalesService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createSaleDto, mockRequest);

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findAll', () => {
    const query: QuerySaleDto = { page: 1, limit: 10 };
    const expectedResponse = {
      data: [
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
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    };

    it('should call salesService.findAll with query parameters', async () => {
      mockSalesService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(query);

      expect(salesService.findAll).toHaveBeenCalledWith(query);
      expect(salesService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should return the result from salesService.findAll', async () => {
      mockSalesService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResponse);
    });

    it('should work with empty query parameters', async () => {
      const emptyQuery: QuerySaleDto = {};
      mockSalesService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(emptyQuery);

      expect(salesService.findAll).toHaveBeenCalledWith(emptyQuery);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getReport', () => {
    const expectedResponse = {
      totalSales: 10,
      totalRevenue: 1000,
      averageSaleValue: 100,
    };

    it('should call salesService.getSalesReport', async () => {
      mockSalesService.getSalesReport.mockResolvedValue(expectedResponse);

      const result = await controller.getReport();

      expect(salesService.getSalesReport).toHaveBeenCalled();
      expect(salesService.getSalesReport).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should return the result from salesService.getSalesReport', async () => {
      mockSalesService.getSalesReport.mockResolvedValue(expectedResponse);

      const result = await controller.getReport();

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findOne', () => {
    const saleId = '507f1f77bcf86cd799439011';
    const expectedResponse = {
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

    it('should call salesService.findOne with correct id', async () => {
      mockSalesService.findOne.mockResolvedValue(expectedResponse);

      const result = await controller.findOne(saleId);

      expect(salesService.findOne).toHaveBeenCalledWith(saleId);
      expect(salesService.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should return the result from salesService.findOne', async () => {
      mockSalesService.findOne.mockResolvedValue(expectedResponse);

      const result = await controller.findOne(saleId);

      expect(result).toEqual(expectedResponse);
    });
  });
});
