import { Request, Response } from 'express';
import { ExpressRouteFunc } from '../common/interfaces';
import TrackerService from '../services/track.service';
import KafkaService from '../services/kafka.service';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

interface ITracker {
  id: number;
  uuid: string;
  value: string;
}

export function getTracker(
  kafkaService: KafkaService,
  trackerService: TrackerService
): ExpressRouteFunc {
  return async function (req: Request, res: Response): Promise<any> {
    const { id } = req.query;

    const tracker = (await trackerService.getTrackerById(
      id as string
    )) as ITracker;

    if (!tracker) {
      return res.sendStatus(404);
    }
    const { uuid: tracker_id, value } = tracker;

    let userId = req.cookies['user_id'];

    if (!userId) {
      userId = uuidv4();
    }

    res.cookie('user_id', userId, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    await kafkaService.emit('trackerExists', {
      date: moment.utc(new Date()).format('YYYY-MM-DD'),
      date_time: moment.utc(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      event_id: uuidv4(),
      tracker_id: tracker_id,
      ip: req.ip,
      user_id: userId,
      user_agent: req.get('User-Agent'),
      url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      value,
    });

    return res.sendStatus(204);
  };
}
