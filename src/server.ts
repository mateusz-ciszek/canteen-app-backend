import { Server, createServer } from 'http';
import { app } from './app';

const port: number = process.env.PORT ? +process.env.PORT : 3000;

const server: Server = createServer(app);

server.listen(port);
console.log('Server is running...');
console.log('http://localhost:' + port);
