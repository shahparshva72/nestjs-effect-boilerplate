import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('reports health', async () => {
    await request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('ok');
      });
  });

  it('runs the CRUD flow', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/items')
      .send({ name: 'Example', description: 'Created in e2e test' })
      .expect(201);

    const id = createResponse.body.id as string;

    await request(app.getHttpServer())
      .get('/api/items/' + id)
      .expect(200)
      .expect(({ body }) => {
        expect(body.name).toBe('Example');
      });

    await request(app.getHttpServer())
      .patch('/api/items/' + id)
      .send({ name: 'Updated' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.name).toBe('Updated');
      });

    await request(app.getHttpServer()).delete('/api/items/' + id).expect(204);
    await request(app.getHttpServer()).get('/api/items/' + id).expect(404);
  });
});
