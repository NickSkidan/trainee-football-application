import { User } from "../entities/user.entity"

import {
    getUsers,
    createUser,
    getUserById,
    getUserByEmail,
    getUserByEmailAndPassword
} from "../repositories/user.repository";
  
export default class UserService {
    public async getUsers(): Promise<Array<User>> {
        return getUsers();
    }
    
    public async createUser(body: User): Promise<User> {
        return createUser(body);
    }
  
    public async getUserById(id: string): Promise<User | null> {
        return getUserById(String(id));
    }

    public async getUserByEmail(email: string): Promise<User | null> {
        return getUserByEmail(String(email));
    }

    public async getUserByEmailAndPassword(email: string, password: string): Promise<User | null> {
        return getUserByEmailAndPassword(String(email), String(password));
    }
  }