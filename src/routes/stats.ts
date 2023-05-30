import { Request, Response } from 'express';
import { ExpressRouteFunc } from '../common/interfaces';
import TrackerService from '../services/track.service';

export function getTrackersStats(
  trackerService: TrackerService
): ExpressRouteFunc {
  return async function (req: Request, res: Response): Promise<any> {
    const { from, to } = req.query;
    const stats = await trackerService.getTrackersStats({
      from,
      to,
    } as any);
    return res.json(stats);
  };
}

export default getTrackersStats;
