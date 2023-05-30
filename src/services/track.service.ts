import ClickhouseService from './clickhouse.service';
import PostgresService, { IPostgresService } from './postgres.service';

export interface ITrackerService {
  getTrackerById: (id: string) => Promise<any>;
  getTrackersStats: (filters: getTrackersStatsFilters) => Promise<any>;
}

type getTrackersStatsFilters = {
  from: string;
  to: string;
};

export class TrackerService implements ITrackerService {
  pgService: IPostgresService;
  clickhouseService: ClickhouseService;

  constructor(
    postgresService: PostgresService,
    clickhouseService: ClickhouseService
  ) {
    this.pgService = postgresService;
    this.clickhouseService = clickhouseService;
  }
  async getTrackerById(trackerId: string) {
    try {
      const tracker = await this.pgService.query(
        'SELECT * FROM trackers WHERE uuid = $1',
        [trackerId]
      );

      return tracker;
    } catch (err) {
      throw err;
    }
  }

  async getTrackersStats({ from, to }: getTrackersStatsFilters) {
    try {
      const stats = await this.clickhouseService.query({
        query: `
        SELECT *
        FROM tracking_events
        WHERE DATE(date_time) BETWEEN '${from}' AND '${to}'
        `,
        format: 'JSONEachRow',
      });

      return stats;
    } catch (err) {
      console.log('Error', err);
      throw err;
    }
  }
}

export default TrackerService;
