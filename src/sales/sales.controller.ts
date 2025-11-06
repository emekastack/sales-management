import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/sale.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Post()
  create(@Body() createSaleDto: CreateSaleDto, @Request() req) {
    return this.salesService.create(createSaleDto, req.user._id);
  }

  @Get()
  findAll() {
    return this.salesService.findAll();
  }

  @Get('report')
  getReport() {
    return this.salesService.getSalesReport();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }
}
