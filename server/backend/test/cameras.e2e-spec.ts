import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { CamerasModule } from '../src/cameras/cameras.module';
import { Notification } from '../src/cameras/notification.entity';

const validCameraID = '2cbc5197-65a5-4c8e-966a-bb168d1cfa67';
const validToken = 'valid-bearer-token';
const invalidToken = 'invalid-bearer-token';

describe('Cameras (e2e)', () => {
  let app: INestApplication;
  let notificationRepository;

  beforeAll(async () => {
    /* FIXME: typescript. just define the MockNotificationRepository properly, extend the EntityRepository class */
    notificationRepository = {
      notifications: [new Notification()],
      persist: (notification: Notification) => {
        return;
      },
    };
    console.log(typeof notificationRepository);
    const moduleRef = await Test.createTestingModule({
      imports: [CamerasModule],
    })
      .overrideProvider(getRepositoryToken(Notification))
      .useValue(notificationRepository)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  /* TODO: translate to .feature and BDD tests */
  describe('GET /cameras/:validCamID/notifications', () => {
    const requestURL = `/cameras/${validCameraID}/notifications`;
    it('should not accept unauthenticated requests', () => {
      return request(app.getHttpServer()).get(requestURL).expect(401);
    });

    it('should not accept invalid credentials', () => {
      return request(app.getHttpServer())
        .get(requestURL)
        .auth(invalidToken, { type: 'bearer' })
        .expect(401);
    });

    it('should accept valid credentials and return the list of notifications', () => {
      return request(app.getHttpServer())
        .get(requestURL)
        .auth(validToken, { type: 'bearer' })
        .expect(200)
        .then((res) => {
          expect(res.header['content-type']).toMatch(/^application\/json/);
          expect(res.body).toBe(notificationRepository.notifications);
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
