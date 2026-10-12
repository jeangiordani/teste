import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('logs')
export class Log {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        name: 'user_id',
        type: 'uuid',
        nullable: true,
    })
    userId!: string | null;

    @Column({
        type: 'varchar',
        length: 100,
    })
    action!: string;

    @Column({
        type: 'text',
    })
    description!: string;

    @Column({
        type: 'jsonb',
        nullable: true,
    })
    metadata!: Record<string, unknown> | null;

    @Column({
        name: 'ip_address',
        type: 'varchar',
        length: 45,
        nullable: true,
    })
    ipAddress!: string | null;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamp',
    })
    createdAt!: Date;
}