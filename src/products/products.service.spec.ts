import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './schemas/product.schema';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
} from './dto/product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: any;

  const mockProductModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productModel = module.get(getModelToken(Product.name));

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createProductDto: CreateProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      stock: 10,
    };

    const mockProduct = {
      _id: '507f1f77bcf86cd799439011',
      ...createProductDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully create a product', async () => {
      mockProductModel.create.mockResolvedValue(mockProduct);

      const result = await service.create(createProductDto);

      expect(productModel.create).toHaveBeenCalledWith(createProductDto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    const mockProducts = [
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'Product 1',
        description: 'Description 1',
        price: 10,
        stock: 5,
      },
      {
        _id: '507f1f77bcf86cd799439012',
        name: 'Product 2',
        description: 'Description 2',
        price: 20,
        stock: 10,
      },
    ];

    const mockQuery = {
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    it('should return paginated products with default pagination', async () => {
      const query: QueryProductDto = {};
      mockProductModel.find.mockReturnValue(mockQuery);
      mockQuery.exec.mockResolvedValue(mockProducts);
      mockProductModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });

      const result = await service.findAll(query);

      expect(productModel.find).toHaveBeenCalled();
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        data: mockProducts,
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('should return paginated products with custom pagination', async () => {
      const query: QueryProductDto = { page: 2, limit: 5 };
      mockProductModel.find.mockReturnValue(mockQuery);
      mockQuery.exec.mockResolvedValue(mockProducts);
      mockProductModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(12),
      });

      const result = await service.findAll(query);

      expect(mockQuery.skip).toHaveBeenCalledWith(5);
      expect(mockQuery.limit).toHaveBeenCalledWith(5);
      expect(result).toEqual({
        data: mockProducts,
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
    const productId = '507f1f77bcf86cd799439011';
    const mockProduct = {
      _id: productId,
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      stock: 10,
    };

    it('should return a product when found', async () => {
      mockProductModel.findById.mockResolvedValue(mockProduct);

      const result = await service.findOne(productId);

      expect(productModel.findById).toHaveBeenCalledWith(productId);
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductModel.findById.mockResolvedValue(null);

      await expect(service.findOne(productId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(productId)).rejects.toThrow(
        'Product not found',
      );

      expect(productModel.findById).toHaveBeenCalledWith(productId);
    });
  });

  describe('update', () => {
    const productId = '507f1f77bcf86cd799439011';
    const updateProductDto: UpdateProductDto = {
      name: 'Updated Product',
      price: 149.99,
    };

    const mockUpdatedProduct = {
      _id: productId,
      name: 'Updated Product',
      description: 'Test Description',
      price: 149.99,
      stock: 10,
    };

    it('should successfully update a product', async () => {
      mockProductModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedProduct);

      const result = await service.update(productId, updateProductDto);

      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
        productId,
        updateProductDto,
        { new: true, runValidators: true },
      );
      expect(result).toEqual(mockUpdatedProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.update(productId, updateProductDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(productId, updateProductDto)).rejects.toThrow(
        'Product not found',
      );

      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
        productId,
        updateProductDto,
        { new: true, runValidators: true },
      );
    });
  });

  describe('delete', () => {
    const productId = '507f1f77bcf86cd799439011';
    const mockProduct = {
      _id: productId,
      name: 'Test Product',
    };

    it('should successfully delete a product', async () => {
      mockProductModel.findByIdAndDelete.mockResolvedValue(mockProduct);

      const result = await service.delete(productId);

      expect(productModel.findByIdAndDelete).toHaveBeenCalledWith(productId);
      expect(result).toEqual({ message: 'Product deleted successfully' });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.delete(productId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.delete(productId)).rejects.toThrow(
        'Product not found',
      );

      expect(productModel.findByIdAndDelete).toHaveBeenCalledWith(productId);
    });
  });

  describe('updateStock', () => {
    const productId = '507f1f77bcf86cd799439011';
    const mockProduct = {
      _id: productId,
      name: 'Test Product',
      stock: 10,
    };

    const mockUpdatedProduct = {
      _id: productId,
      name: 'Test Product',
      stock: 5,
    };

    it('should successfully update stock', async () => {
      const quantity = 5;
      mockProductModel.findById.mockResolvedValue(mockProduct);
      mockProductModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedProduct);

      const result = await service.updateStock(productId, quantity);

      expect(productModel.findById).toHaveBeenCalledWith(productId);
      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
        productId,
        { $inc: { stock: -quantity } },
        { new: true, runValidators: true },
      );
      expect(result).toEqual(mockUpdatedProduct);
    });

    it('should throw BadRequestException when quantity is 0', async () => {
      await expect(service.updateStock(productId, 0)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updateStock(productId, 0)).rejects.toThrow(
        'Quantity must be greater than 0',
      );

      expect(productModel.findById).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when quantity is negative', async () => {
      await expect(service.updateStock(productId, -5)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updateStock(productId, -5)).rejects.toThrow(
        'Quantity must be greater than 0',
      );

      expect(productModel.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when product not found', async () => {
      const quantity = 5;
      mockProductModel.findById.mockResolvedValue(null);

      await expect(service.updateStock(productId, quantity)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.updateStock(productId, quantity)).rejects.toThrow(
        'Product not found',
      );

      expect(productModel.findById).toHaveBeenCalledWith(productId);
      expect(productModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when insufficient stock', async () => {
      const quantity = 15;
      mockProductModel.findById.mockResolvedValue(mockProduct);

      await expect(service.updateStock(productId, quantity)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updateStock(productId, quantity)).rejects.toThrow(
        'Insufficient stock. Available: 10, Requested: 15',
      );

      expect(productModel.findById).toHaveBeenCalledWith(productId);
      expect(productModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });
});
