import { Router, Request, Response } from 'express';
import UserService from "../services/user.service";
import path from "path";

declare const __dirname: string;

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    try {
        if (!(req as any).session.user) {
            const accessDeniedPath = path.join(__dirname, '../views', 'accessDenied.ejs');
            (res as any).render(accessDeniedPath);
        }

        const service = new UserService();
        const users = await service.getUsers();

        const userListPath = path.join(__dirname, '../views', 'userList.ejs');
        (res as any).render(userListPath, { users });
    } catch (error) {
        console.error(error);
        const errorPath = path.join(__dirname, '../views', 'error.ejs');
        (res as any).render(errorPath);
    }
});


router.get('/register', (req: Request, res: Response) => {
    let errorMessage = '';
    const registerPath = path.join(__dirname, '../views', 'registration.ejs');
    (res as any).render(registerPath, { errorMessage });
});

router.get('/login', (req: Request, res: Response) => {
    let errorMessage = '';
    const loginPath = path.join(__dirname, '../views', 'login.ejs');
    (res as any).render(loginPath, { errorMessage });
});

router.post('/register', async (req: Request, res: Response) => {
    try {
        const registrationPath = path.join(__dirname, '../views', 'registration.ejs');
        const successPath = path.join(__dirname, '../views', 'success.ejs');
        const { email } = (req as any).body;
        const service = new UserService();
        
        const existingUser = await service.getUserByEmail(email);
        if (existingUser) {
            const errorMessage = 'User with this email already exists';
            (res as any).render(registrationPath, { errorMessage });
        } else {
            await service.createUser((req as any).body);
            (req as any).session.user = { email };
            const message = 'successfully registered';
            (res as any).render(successPath, { email, message });
        }
    } catch (error) {
        console.error('Error during registration:', error);
        const errorPath = path.join(__dirname, '../views', 'error.ejs');
        (res as any).render(errorPath);
    }
});
  
router.post('/login', async (req: Request, res: Response) => {
    try {
        const loginPath = path.join(__dirname, '../views', 'login.ejs');
        const successPath = path.join(__dirname, '../views', 'success.ejs');
        const { email, password } = (req as any).body;
        const service = new UserService();
  
        const user = await service.getUserByEmailAndPassword(email, password);
        if (user) {
            (req as any).session.user = { email };
            const message = 'logged in';
            (res as any).render(successPath, { email, message });
        } else {
            const errorMessage = 'Invalid email or password';
            (res as any).render(loginPath, { errorMessage });
        }
    } catch (error) {
        console.error('Error during login:', error);
        const errorPath = path.join(__dirname, '../views', 'error.ejs');
        (res as any).render(errorPath);
    }
});  

export default router;