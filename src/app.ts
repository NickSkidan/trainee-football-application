import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { User } from './entities/user.entity';
import { createConnection, getRepository } from 'typeorm';
import config from './config';
import userRouter from './routes/user.router';
import baseRouter from './routes/base.router';
import session from 'express-session';

declare const __dirname: string;

const port = config.port;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

try {
  createConnection({
    type: 'postgres',
    host: config.postgres.host,
    port: parseInt(config.postgres.port),
    username: config.postgres.username,
    password: config.postgres.password,
    database: config.postgres.database,
    entities: [User],
    synchronize: true,
  });
  console.log('Postgresql is connected...')
} catch (e) {
  console.log('Error while database is trying to connect: ')
  console.log(e);
}

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Disable CSRF protection for all routes
app.use((req: Request, res: Response, next: NextFunction) => {
  next();
});

app.use('/users', userRouter);

app.use('/', baseRouter)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});