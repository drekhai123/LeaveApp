import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configureSwagger(app: INestApplication): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('LeaveApp API')
    .setDescription('Leave request management API for small companies')
    .setVersion('0.1.0')
    .addTag('health')
    .addTag('employees')
    .addTag('leave-requests')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);
}
