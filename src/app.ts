import express from 'express';
import { getTrackersStats } from './routes/stats';
import KafkaService from './services/kafka.service';
import pool from './db/postgres/connection';
import TrackerService from './services/track.service';
import { getTracker } from './routes/tracker';
import cookieParser from 'cookie-parser';
import ClickhouseService from './services/clickhouse.service';
import clickhouseClient from './db/clickhouse/connection';
import PostgresService from './services/postgres.service';

const app = express();
const port = 3000;
app.use(cookieParser());

pool
  .connect()
  .then((db) => {
    console.log('Sucessfully connected to Postgres');

    return {
      db,
    };
  })
  .then(({ db }) => {
    const chClient = clickhouseClient;
    console.log('Connected to Clickhouse');

    return {
      db,
      chClient,
    };
  })

  .then(({ db, chClient }) => {
    const kafkaService = new KafkaService();

    const postgresService = new PostgresService(db);
    const clickhouseService = new ClickhouseService(chClient);

    const trackerService = new TrackerService(
      postgresService,
      clickhouseService
    );

    app.use('/track', getTracker(kafkaService, trackerService));
    app.use('/stats', getTrackersStats(trackerService));

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log('Error', err);
  });

export default app;
