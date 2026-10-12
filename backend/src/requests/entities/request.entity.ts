import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity.js';
import { Area } from '../../areas/entities/area.entity.js';
import { RequestPriority } from '../dto/create-request.dto.js';

export enum RequestStatus {
    OPEN = 'OPEN',
    IN_ANALYSIS = 'IN_ANALYSIS',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

@Entity({ name: 'requests' })
export class Request {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'varchar',
        length: 150,
    })
    title!: string;

    @Column({
        type: 'text',
    })
    description!: string;

    @Column({
        name: 'requester_id',
        type: 'uuid',
    })
    requesterId!: string;

    @ManyToOne(() => User, {
        nullable: false,
    })
    @JoinColumn({
        name: 'requester_id',
    })
    requester!: User;

    @Column({
        name: 'target_area_id',
        type: 'uuid',
    })
    targetAreaId!: string;

    @ManyToOne(() => Area, {
        nullable: false,
    })
    @JoinColumn({
        name: 'target_area_id',
    })
    targetArea!: Area;

    @Column({
        type: 'enum',
        enum: RequestPriority,
        enumName: 'request_priority_enum',
    })
    priority!: RequestPriority;

    @Column({
        type: 'enum',
        enum: RequestStatus,
        enumName: 'request_status_enum',
        default: RequestStatus.OPEN,
    })
    status!: RequestStatus;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamptz',
    })
    createdAt!: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'timestamptz',
    })
    updatedAt!: Date;

    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        nullable: true,
    })
    deletedAt!: Date | null;
}

