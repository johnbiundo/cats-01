import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const server = app.getHttpServer();

  await app.listen(3000);

  process.on('SIGINT', shutDown);

  async function shutDown() {
    console.log('SIGINT received');
    console.log('Stopping HTTP server');
    server.close(() => {
      console.log('HTTP server stopped');
      app.close();
    });
  }
}
bootstrap();
