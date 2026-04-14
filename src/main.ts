import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    // Permitimos específicamente el puerto de tu frontend (Vite)
    origin: 'http://localhost:5173', 
    
    // Métodos que permitimos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    
    // Permitimos que se envíen headers de autorización (JWT)
    allowedHeaders: 'Content-Type, Accept, Authorization',
    
    // IMPORTANTE: Esto permite que el navegador acepte la respuesta 
    // cuando enviamos el token
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
