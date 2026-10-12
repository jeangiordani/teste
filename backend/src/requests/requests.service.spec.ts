import { Test, TestingModule } from '@nestjs/testing';
import { RequestsService } from './requests.service.js';
import { UserRole } from '../users/entities/user.entity.js';
import { vi } from 'vitest';

describe('RequestsService', () => {
  let service: RequestsService;

  // Mock do repositório TypeORM para o teste unitário
  const mockRequestsRepository = {
    createQueryBuilder: vi.fn(() => mockQueryBuilder),
  };

  const mockUsersRepository = {
    findOne: vi.fn(),
  };

  const mockAreasRepository = {
    findOne: vi.fn(),
  };

  // Mock do QueryBuilder retornado pelo repositório
  const mockQueryBuilder = {
    results: [] as any[],

    leftJoinAndSelect: vi.fn(() => mockQueryBuilder),
    andWhere: vi.fn(() => mockQueryBuilder),
    orderBy: vi.fn(() => mockQueryBuilder),
    getMany: async () => mockQueryBuilder.results,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        { provide: 'RequestRepository', useValue: mockRequestsRepository },
        { provide: 'AreaRepository', useValue: mockAreasRepository },
        { provide: 'UserRepository', useValue: mockUsersRepository },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list all requests (admin) ordered by createdAt DESC', async () => {
    const user = { id: 'usr-1', areaId: 'area-1', role: UserRole.ADMIN };
    mockUsersRepository.findOne.mockResolvedValue(user);
    mockQueryBuilder.results = [
      {
        id: 'req-2',
        title: 'Segunda requisicao',
        description: 'Descricao da requisicao 2',
        requesterId: 'usr-1',
        targetAreaId: 'area-1',
        requester: { id: 'usr-1', name: 'Ana', email: 'ana@exemplo.com' },
        targetArea: { id: 'area-1', name: 'Area 1' },
        priority: 'MEDIUM',
        status: 'OPEN',
        createdAt: new Date('2026-01-02'),
        updatedAt: new Date('2026-01-02'),
        deletedAt: null,
      },
    ];

    const result = await service.findAll('usr-1', { order: 'DESC', page: 1, limit: 10 } as any);

    expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'usr-1' },
    });
    expect(mockRequestsRepository.createQueryBuilder).toHaveBeenCalledWith('request');
    expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(2);
    expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenNthCalledWith(
      1,
      'request.requester',
      'requester',
    );
    expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenNthCalledWith(
      2,
      'request.targetArea',
      'targetArea',
    );
    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('request.createdAt', 'DESC');
    expect(result).toEqual([
      expect.objectContaining({ id: 'req-2' }),
      expect.objectContaining({ id: 'req-1' }),
    ]);
  });

});
