import { prisma } from '../config/database.js';
import { SpaceType } from '@prisma/client';
import { AppError } from '../utils/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export class FacilityService {
  /**
   * Get all facilities filtered by space type (e.g. SCHOOL_HOSTEL, PRIVATE_HOSTEL, CLASSROOM)
   */
  public static async getFacilities(type?: SpaceType) {
    return prisma.facility.findMany({
      where: {
        isActive: true,
        ...(type && { type }),
      },
      include: {
        rooms: {
          select: {
            id: true,
            roomNumber: true,
            floor: true,
            totalBeds: true,
            availableBeds: true,
            pricePerBed: true,
            isOccupied: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
  /**
   * Get all facilities owned by a specific agent
   */
  public static async getAgentFacilities(agentId: string) {
    return prisma.facility.findMany({
      where: {
        agentId,
      },
      include: {
        rooms: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  /**
   * Get facility details by slug or ID with all room occupancy statuses
   */
  public static async getFacilityBySlug(slug: string) {
    const facility = await prisma.facility.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        rooms: {
          orderBy: { roomNumber: 'asc' },
        },
      },
    });

    if (!facility) {
      throw new AppError('Facility not found', 404, ERROR_CODES.NOT_FOUND);
    }

    return facility;
  }

  /**
   * Get real-time occupancy and booking schedule for a specific room or classroom
   */
  public static async getRoomSchedule(roomId: string) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        facility: true,
        bookings: {
          where: {
            status: 'CONFIRMED',
            endTime: { gte: new Date() }, // Future and ongoing bookings
          },
          select: {
            id: true,
            startTime: true,
            endTime: true,
            purpose: true,
            user: {
              select: { fullName: true, department: true },
            },
          },
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!room) {
      throw new AppError('Room or classroom not found', 404, ERROR_CODES.NOT_FOUND);
    }

    return room;
  }

  /**
   * Create a new facility (Admin only)
   */
  public static async createFacility(data: any) {
    // Generate a simple slug from the name if not provided
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Check if slug exists
    const existing = await prisma.facility.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError('A facility with this name or slug already exists', 409, ERROR_CODES.CONFLICT);
    }

    return prisma.facility.create({
      data: {
        name: data.name,
        slug,
        code: data.code,
        type: data.type,
        description: data.description,
        location: data.location || 'Campus',
        capacity: data.capacity || 0,
        price: data.price,
        amenities: data.amenities || [],
        rules: data.rules || [],
        imageUrl: data.imageUrl,
        contact: data.contact,
        availableForInspection: data.availableForInspection ?? true,
        featured: data.featured ?? false,
        verified: data.verified ?? false,
        rating: data.rating,
        reviewCount: data.reviewCount ?? 0,
        isActive: data.isActive ?? true,
        agentId: data.agentId || null,
      },
    });
  }

  /**
   * Update an existing facility (Admin only)
   */
  public static async updateFacility(id: string, data: any) {
    const existing = await prisma.facility.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Facility not found', 404, ERROR_CODES.NOT_FOUND);
    }

    return prisma.facility.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        description: data.description,
        location: data.location,
        capacity: data.capacity,
        price: data.price,
        amenities: data.amenities,
        rules: data.rules,
        imageUrl: data.imageUrl,
        contact: data.contact,
        availableForInspection: data.availableForInspection,
        featured: data.featured,
        verified: data.verified,
        rating: data.rating,
        reviewCount: data.reviewCount,
        isActive: data.isActive,
      },
    });
  }

  /**
   * Delete a facility (Admin only)
   */
  public static async deleteFacility(id: string) {
    const existing = await prisma.facility.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Facility not found', 404, ERROR_CODES.NOT_FOUND);
    }

    return prisma.facility.delete({
      where: { id },
    });
  }
}
