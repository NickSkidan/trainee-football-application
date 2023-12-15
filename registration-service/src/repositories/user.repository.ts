import { User } from "../entities/user.entity";
import bcrypt from 'bcrypt';
import { AppDataSource } from "../helpers/data-source";

const userRepository = AppDataSource.getRepository(User)

export interface IUserPayload {
  id: string;
  username: string;
  email: string;
  password: string;
}

export const getUsers = async (): Promise<Array<User>> => {
    const users = await userRepository
      .createQueryBuilder('user')
      .select(['user.username', 'user.email'])
      .getMany();
  
    return users;
};  

export const createUser = async (payload: User): Promise<User> => {
    const name = payload.username;
    const email = payload.email;
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const user = userRepository.create({ username: name, email: email, password: hashedPassword });
    return userRepository.save(user);
};

export const getUserById = async (id: string): Promise<User | null> => {
  const user = await userRepository.findOne({ where: { id } });
  return user ? user : null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
    const user = await userRepository.findOne({ where: { email } });
    return user ? user : null;
  };

export const getUserByEmailAndPassword = async (email: string, password: string): Promise<User | null> => {
  const user = await userRepository.findOne({ where: { email } });
  if (!user) {
    return null;
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return null;
  }
  
  return user;
};