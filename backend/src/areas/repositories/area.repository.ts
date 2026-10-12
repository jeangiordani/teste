import { Area } from '../entities/area.entity.js';

export abstract class AreaRepository {

    abstract findAll(): Promise<Area[]>;

    abstract findById(id: string): Promise<Area | null>;

    abstract findByName(name: string): Promise<Area | null>;

    abstract remove(area: Area): Promise<void>;

    abstract existsById(id: string): Promise<boolean>;
}