
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'areas' })
export class Area {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'varchar',
        length: 100,
        unique: true,
    })
    name!: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    description!: string | null;

    @Column({
        name: 'is_active',
        type: 'boolean',
        default: true,
    })
    isActive!: boolean;

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