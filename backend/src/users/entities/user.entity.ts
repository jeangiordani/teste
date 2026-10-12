
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Area } from '../../areas/entities/area.entity.js';

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 100 })
    name!: string;

    @Column({ type: 'varchar', length: 150, unique: true })
    email!: string;

    @Column({
        name: 'password_hash',
        type: 'varchar',
        length: 255,
        select: false,
    })
    passwordHash!: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        enumName: 'user_role_enum',
        default: UserRole.USER,
    })
    role!: UserRole;

    @Column({ name: 'area_id', type: 'uuid' })
    areaId!: string;

    @ManyToOne(() => Area, { nullable: true })
    @JoinColumn({ name: 'area_id' })
    area!: Area;

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
}