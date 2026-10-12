
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import {
    Request,
    RequestStatus,
} from './request.entity.js';

import { User } from '../../users/entities/user.entity.js';

@Entity({ name: 'request_history' })
export class RequestHistory {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        name: 'request_id',
        type: 'uuid',
    })
    requestId!: string;

    @ManyToOne(() => Request, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'request_id' })
    request!: Request;

    @Column({
        name: 'changed_by_user_id',
        type: 'uuid',
    })
    changedByUserId!: string;

    @ManyToOne(() => User, {
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'changed_by_user_id' })
    changedByUser!: User;

    @Column({
        name: 'previous_status',
        type: 'enum',
        enum: RequestStatus,
    })
    previousStatus!: RequestStatus;

    @Column({
        name: 'new_status',
        type: 'enum',
        enum: RequestStatus,
    })
    newStatus!: RequestStatus;

    @Column({
        type: 'varchar',
        length: 500,
        nullable: true,
    })
    comment!: string | null;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamptz',
    })
    createdAt!: Date;
}
