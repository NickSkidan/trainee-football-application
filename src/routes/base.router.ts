import { Router, Request, Response } from 'express';
import path from "path";

declare const __dirname: string;

const router = Router();

router.get('/', (req: Request, res: Response) => {
    console.log('Received GET request:', (req as any).url);
    
    const indexPath = path.join(__dirname, '../views', 'index.ejs');
    (res as any).render(indexPath);
});

export default router;