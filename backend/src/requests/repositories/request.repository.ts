import { Request, RequestStatus } from '../entities/request.entity.js';
import { FindRequestsQueryDto } from '../dto/find-requests-query.dto.js';
import { RequestPriority } from '../dto/create-request.dto.js';

export interface PriorityCount {
    priority: RequestPriority | null;
    count: number;
}

export abstract class RequestRepository {
    abstract create(data: Partial<Request>): Request;

    abstract save(request: Request): Promise<Request>;

    abstract findAll(
        filters: FindRequestsQueryDto,
    ): Promise<[Request[], number]>;

    abstract findById(
        id: string,
    ): Promise<Request | null>;

    abstract findByIdWithRelations(
        id: string,
    ): Promise<Request | null>;

    abstract softRemove(request: Request): Promise<Request>;

    abstract count(): Promise<number>;

    abstract countByStatus(status: RequestStatus): Promise<number>;

    abstract countGroupByPriority(): Promise<Record<RequestPriority, number>>;
}