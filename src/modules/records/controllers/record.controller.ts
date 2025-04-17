import { Controller, Get, Post, Body, Param, Query, Put } from '@nestjs/common';
import { Record } from '../schemas/record.schema';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CreateRecordRequestDTO } from '../dtos/create-record.request.dto';
import { RecordCategory, RecordFormat } from '../schemas/record.enum';
import { UpdateRecordRequestDTO } from '../dtos/update-record.request.dto';
import { RecordService } from '../services/record.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateOrderRequestDTO } from '../dtos/create-order.request.dto';

@Controller('records')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @MessagePattern({ cmd: 'order:check_availability' })
  async checkRecordAvailability(@Payload() payload: CreateOrderRequestDTO) {
    return this.recordService.checkRecordAvailability(payload);
  }

  @MessagePattern({ cmd: 'order:order_placed' })
  async orderPlaced(@Payload() payload: CreateOrderRequestDTO) {
    const record = await this.recordService.findById(payload.recordId);
    return this.recordService.update(payload.recordId, {
      qty: record.qty - payload.qty,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new record' })
  @ApiResponse({
    status: 201,
    description: 'Record successfully created',
    type: [Record],
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() request: CreateRecordRequestDTO): Promise<Record> {
    return this.recordService.create(request);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing record' })
  @ApiResponse({
    status: 200,
    description: 'Record updated successfully',
    type: [Record],
  })
  @ApiResponse({ status: 500, description: 'Cannot find record to update' })
  async update(
    @Param('id') id: string,
    @Body() updateRecordDto: UpdateRecordRequestDTO,
  ): Promise<Record> {
    return this.recordService.update(id, updateRecordDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all records with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of records',
    type: [Record],
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description:
      'Search query (search across multiple fields like artist, album, category, etc.)',
    type: String,
  })
  @ApiQuery({
    name: 'artist',
    required: false,
    description: 'Filter by artist name',
    type: String,
  })
  @ApiQuery({
    name: 'album',
    required: false,
    description: 'Filter by album name',
    type: String,
  })
  @ApiQuery({
    name: 'format',
    required: false,
    description: 'Filter by record format (Vinyl, CD, etc.)',
    enum: RecordFormat,
    type: String,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by record category (e.g., Rock, Jazz)',
    enum: RecordCategory,
    type: String,
  })
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('q') q?: string,
    @Query('artist') artist?: string,
    @Query('album') album?: string,
    @Query('format') format?: RecordFormat,
    @Query('category') category?: RecordCategory,
  ): Promise<{ data: Record[]; total: number }> {
    return this.recordService.findAll({
      limit,
      offset,
      q,
      artist,
      album,
      format,
      category,
    });
  }
}
