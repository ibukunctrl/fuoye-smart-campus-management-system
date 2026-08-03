import { Request, Response, NextFunction } from 'express';
import { FacilityService } from '../services/facility.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { SpaceType } from '@prisma/client';

export class FacilityController {
  public static async getAllHostels(req: Request, res: Response, next: NextFunction) {
    try {
      const typeParam = req.query.type as string;
      let filterType: SpaceType | undefined;
      if (typeParam === 'school') filterType = SpaceType.SCHOOL_HOSTEL;
      if (typeParam === 'private') filterType = SpaceType.PRIVATE_HOSTEL;

      const hostels = await FacilityService.getFacilities(filterType || undefined);
      // Filter out non-hostel types if no type parameter specified
      const onlyHostels = hostels.filter((f) => f.type === SpaceType.SCHOOL_HOSTEL || f.type === SpaceType.PRIVATE_HOSTEL);

      return sendSuccess(res, 200, onlyHostels, 'Hostels retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  public static async getAgentFacilities(req: Request, res: Response, next: NextFunction) {
    try {
      const facilities = await FacilityService.getAgentFacilities(req.user!.userId);
      return sendSuccess(res, 200, facilities, 'Agent facilities retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  public static async getAllClassrooms(_req: Request, res: Response, next: NextFunction) {
    try {
      const classrooms = await FacilityService.getFacilities(SpaceType.CLASSROOM);
      return sendSuccess(res, 200, classrooms, 'Classrooms and lecture halls retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  public static async getFacilityDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const facility = await FacilityService.getFacilityBySlug(slug as string);
      return sendSuccess(res, 200, facility, 'Facility details and rooms retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  public static async getRoomSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const schedule = await FacilityService.getRoomSchedule(roomId as string);
      return sendSuccess(res, 200, schedule, 'Room booking schedule retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  public static async createFacility(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      if (req.user?.role === 'AGENT') {
        data.agentId = req.user.userId;
      }
      const facility = await FacilityService.createFacility(data);
      return sendSuccess(res, 201, facility, 'Facility created successfully');
    } catch (err) {
      return next(err);
    }
  }

  public static async updateFacility(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body;
      const facility = await FacilityService.updateFacility(id as string, data);
      return sendSuccess(res, 200, facility, 'Facility updated successfully');
    } catch (err) {
      return next(err);
    }
  }

  public static async deleteFacility(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await FacilityService.deleteFacility(id as string);
      return sendSuccess(res, 200, null, 'Facility deleted successfully');
    } catch (err) {
      return next(err);
    }
  }
}
