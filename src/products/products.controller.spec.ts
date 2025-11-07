import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
} from './dto/product.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: ProductsService;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    productsService = module.get<ProductsService>(ProductsService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createProductDto: CreateProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      stock: 10,
    };

    const expectedResponse = {
      _id: '507f1f77bcf86cd799439011',
      ...createProductDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should call productsService.create with correct DTO', async () => {
      mockProductsService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createProductDto);

      expect(productsService.create).toHaveBeenCalledWith(createProductDto);
      expect(productsService.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should return the result from productsService.create', async () => {
      mockProductsService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createProductDto);

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findAll', () => {
    const query: QueryProductDto = { page: 1, limit: 10 };
    const expectedResponse = {
      data: [
        {
          _id: '507f1f77bcf86cd799439011',
          name: 'Product 1',
          description: 'Description 1',
          price: 10,
          stock: 5,
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    };

    it('should call productsService.findAll with query parameters', async () => {
      mockProductsService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(query);

      expect(productsService.findAll).toHaveBeenCalledWith(query);
      expect(productsService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should return the result from productsService.findAll', async () => {
      mockProductsService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResponse);
    });

    it('should work with empty query parameters', async () => {
      const emptyQuery: QueryProductDto = {};
      mockProductsService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(emptyQuery);

      expect(productsService.findAll).toHaveBeenCalledWith(emptyQuery);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findOne', () => {
    const productId = '507f1f77bcf86cd799439011';
    const expectedResponse = {
      _id: productId,
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      stock: 10,
    };

    it('should call productsService.findOne with correct id', async () => {
      mockProductsService.findOne.mockResolvedValue(expectedResponse);

      const result = await controller.findOne(productId);

      expect(productsService.findOne).toHaveBeenCalledWith(productId);
      expect(productsService.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should return the result from productsService.findOne', async () => {
      mockProductsService.findOne.mockResolvedValue(expectedResponse);

      const result = await controller.findOne(productId);

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('update', () => {
    const productId = '507f1f77bcf86cd799439011';
    const updateProductDto: UpdateProductDto = {
      name: 'Updated Product',
      price: 149.99,
    };

    const expectedResponse = {
      _id: productId,
      name: 'Updated Product',
      description: 'Test Description',
      price: 149.99,
      stock: 10,
    };

    it('should call productsService.update with correct id and DTO', async () => {
      mockProductsService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(productId, updateProductDto);

      expect(productsService.update).toHaveBeenCalledWith(
        productId,
        updateProductDto,
      );
      expect(productsService.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should return the result from productsService.update', async () => {
      mockProductsService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(productId, updateProductDto);

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('delete', () => {
    const productId = '507f1f77bcf86cd799439011';
    const expectedResponse = { message: 'Product deleted successfully' };

    it('should call productsService.delete with correct id', async () => {
      mockProductsService.delete.mockResolvedValue(expectedResponse);

      const result = await controller.delete(productId);

      expect(productsService.delete).toHaveBeenCalledWith(productId);
      expect(productsService.delete).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should return the result from productsService.delete', async () => {
      mockProductsService.delete.mockResolvedValue(expectedResponse);

      const result = await controller.delete(productId);

      expect(result).toEqual(expectedResponse);
    });
  });
});
