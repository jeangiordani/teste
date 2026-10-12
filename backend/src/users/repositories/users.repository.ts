
import { CreateUserDto } from '../dto/create-user.dto.js';
import { User } from '../entities/user.entity.js';


export abstract class UsersRepository {
    abstract findByEmail(email: string): Promise<User | null>;

    abstract findById(id: string): Promise<User | null>;

    abstract create(data: CreateUserDto): Promise<User>;

    abstract findByIdWithArea(id: string): Promise<User | null>;
}