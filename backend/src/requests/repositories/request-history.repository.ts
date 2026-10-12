
import { RequestHistory } from '../entities/request-history.entity.js';

export abstract class RequestHistoryRepository {
    abstract create(
        data: Partial<RequestHistory>,
    ): RequestHistory;

    abstract save(
        history: RequestHistory,
    ): Promise<RequestHistory>;

    abstract findByRequestId(
        requestId: string,
    ): Promise<RequestHistory[]>;
}
