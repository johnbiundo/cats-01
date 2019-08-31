import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  let connections = [];

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const server = app.getHttpServer();

  // server.on('connection', connection => {
  //   connections.push(connection);
  //   console.log(`> connection # ${connections.length} added`);
  //   connection.on('close', () => {
  //     console.log('> connection closed');
  //     connections = connections.filter(curr => curr !== connection);
  //     console.log(`> connections remaining: ${connections.length}`);
  //   });
  // });

  await app.listen(3000);

  process.on('SIGINT', shutDown);

  async function shutDown() {
    console.log('SIGINT received');
    // console.log(
    //   '# active connections before server.close() call: ',
    //   // tslint:disable-next-line: trailing-comma
    //   connections.length
    // );

    console.log('Stopping HTTP server');
    server.close(() => {
      console.log('HTTP server stopped');
      // console.log('# connections after server.close(): ', connections.length);
      app.close();
    });

    // setTimeout(() => {
    //   console.log('connections to be force terminated: ', connections.length);
    //   connections.forEach(conn => {
    //     console.log('closing connection');
    //     conn.end();
    //   });
    // }, 5000);
  }
}
bootstrap();
