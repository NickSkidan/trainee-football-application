import { Router, Request, Response } from 'express';
import path from "path";

declare const __dirname: string;

const router = Router();

router.get('/', (req: Request, res: Response) => {
    const user = (req as any).session.user;
    
    const indexPath = path.join(__dirname, '../views', 'index.ejs');
    (res as any).render(indexPath, { user });
});

router.get('/logout', (req: Request, res: Response) => {
    (req as any).session.destroy((err: any) => {
        if (err) {
            console.error('Error destroying session:', err);
            const errorPath = path.join(__dirname, '../views', 'error.ejs');
            (res as any).render(errorPath);
        }
        
        const logoutPath = path.join(__dirname, '../views', 'logout.ejs');
        (res as any).render(logoutPath);
    });
});

export default router;