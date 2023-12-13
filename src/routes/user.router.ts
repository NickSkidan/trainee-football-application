import { Router, Request, Response } from 'express';
import UserService from "../services/user.service";
import path from "path";

declare const __dirname: string;

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    const service = new UserService();
    const response = await service.getUsers();
    return (res as any).send(response);
});

router.get('/register', (req: Request, res: Response) => {
    const registerPath = path.join(__dirname, '../views', 'registration.ejs');
    (res as any).render(registerPath);
});

router.get('/login', (req: Request, res: Response) => {
    const loginPath = path.join(__dirname, '../views', 'login.ejs');
    (res as any).render(loginPath);
});

router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, username } = (req as any).body;
        const service = new UserService();
        
        const existingUser = await service.getUserByEmail(email);
        if (existingUser) {
            return (res as any).status(400).send('User with this email already exists');
        }

        const response = await service.createUser((req as any).body);
        return (res as any).send(`Registration successful for ${username}`);
    } catch (error) {
        console.error('Error during registration:', error);
        return (res as any).status(500).send('Internal Server Error');
    }
});
  
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = (req as any).body;
        const service = new UserService();
  
        const user = await service.getUserByEmailAndPassword(email, password);
        if (user) {
            return (res as any).send(`Login successful for ${email}`);
        } else {
            return (res as any).status(401).send('Invalid email or password');
        }
    } catch (error) {
        console.error('Error during login:', error);
      return (res as any).status(500).send('Internal Server Error');
    }
});  

export default router;