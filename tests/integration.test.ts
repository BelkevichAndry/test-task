import { getTracker } from '../src/routes/tracker';
import { getTrackersStats } from '../src/routes/stats';
import { KafkaService } from '../src/services/kafka.service';
import ClickhouseService from '../src/services/clickhouse.service';
import PostgresService from '../src/services/postgres.service';
import TrackerService from '../src/services/track.service';
import pool from '../src/db/postgres/connection';
import clickhouseClient from '../src/db/clickhouse/connection';
import express from 'express';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import cleandb from './cleandb';
import { faker } from '@faker-js/faker';
import moment from 'moment';

let app: express.Application;
let trackerService: TrackerService;

afterEach(async () => {
  await cleandb();
});

beforeAll(async () => {
  const postgresConnection = await pool.connect();
  const chClient = clickhouseClient;

  const kafkaService = new KafkaService();
  const postgresService = new PostgresService(postgresConnection);
  const clickhouseService = new ClickhouseService(chClient);

  trackerService = new TrackerService(postgresService, clickhouseService);

  app = express();
  app.use(cookieParser());

  app.use('/track', getTracker(kafkaService, trackerService));
  app.use('/stats', getTrackersStats(trackerService));
});

describe('testing-server-routes', () => {
  it('should write data to clickhouse', async () => {
    const userAgent = faker.internet.userAgent();
    const host = faker.internet.domainName();
    const userId = faker.string.uuid();

    const res = await request(app)
      .get('/track?id=value-1')
      .set('Host', host)
      .set('User-Agent', userAgent)
      .set('Cookie', `user_id=${userId}`);

    //this is a bad solution, but I don't know how to fix it in short time
    //I have added a delay to make sure that the data is written to the database
    await new Promise((r) => setTimeout(r, 10000));

    const today = moment.utc(new Date()).format('YYYY-MM-DD');

    const trackerStats = (await trackerService.getTrackersStats({
      from: today,
      to: today,
    } as any)) as any[];

    expect(res.status).toEqual(204);
    expect(trackerStats.length).toEqual(1);
    expect(trackerStats[0].user_agent).toEqual(userAgent);
    expect(trackerStats[0].user_id).toEqual(userId);
    expect(trackerStats[0].event_id).not.toBeNull();
  });

  it('Should return 404 if tracker id is not found', async () => {
    const res = await request(app).get('/track?id=unknown');

    //this is a bad solution, but I don't know how to fix it in short time
    //I have added a delay to make sure that the data is written to the database
    await new Promise((r) => setTimeout(r, 10000));

    const today = moment.utc(new Date()).format('YYYY-MM-DD');

    const trackerStats = (await trackerService.getTrackersStats({
      from: today,
      to: today,
    } as any)) as any[];

    expect(res.status).toEqual(404);
    expect(trackerStats.length).toEqual(0);
  });
});
