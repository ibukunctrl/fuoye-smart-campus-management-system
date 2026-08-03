import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';
import { prisma } from '../config/database.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

// ── Multer: store in memory, max 10 MB raw ──────────────────────────────────
export const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(_req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// ── Compression config ───────────────────────────────────────────────────────
// Sharp resizes to max 1200 px wide and converts to WebP before sending to
// Cloudinary. Cloudinary then applies `q_auto` and `f_auto` at delivery time
// for further per-browser optimisation.
const MAX_WIDTH  = 1200;
const WEBP_QUALITY = 82;  // good balance: visually lossless vs file size

async function compressImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();
}

// ── Upload a buffer to Cloudinary via a stream ───────────────────────────────
function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  publicId: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        overwrite: true,
        // Delivery-time optimisations (applied when the URL is fetched)
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error('Cloudinary upload failed'));
        resolve(result.secure_url);
      },
    );

    const readable = Readable.from(buffer);
    readable.pipe(stream);
  });
}

// ── Controller ───────────────────────────────────────────────────────────────
export class UploadController {
  /**
   * POST /api/v1/facilities/:id/image
   * Accepts a single `image` field (multipart/form-data).
   * Compresses with Sharp → uploads to Cloudinary → saves URL to DB.
   */
  public static async uploadFacilityImage(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;

      if (!req.file) {
        throw new AppError('No image file provided', 400, ERROR_CODES.VALIDATION_ERROR);
      }

      // Verify facility exists
      const facility = await prisma.facility.findUnique({ where: { id } });
      if (!facility) {
        throw new AppError('Facility not found', 404, ERROR_CODES.NOT_FOUND);
      }

      // 1. Compress with Sharp (WebP, max 1200 px wide, q=82)
      const compressed = await compressImage(req.file.buffer);

      // 2. Upload to Cloudinary
      const publicId   = `fuoye-campus/hostels/${facility.slug}`;
      const imageUrl   = await uploadToCloudinary(compressed, 'fuoye-campus/hostels', publicId);

      // 3. Save URL to DB
      await prisma.facility.update({ where: { id }, data: { imageUrl } });

      return sendSuccess(res, 200, { imageUrl }, 'Image uploaded and saved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/upload/image
   * Generic image upload — returns the Cloudinary URL without touching the DB.
   * Useful for agent profile pictures, etc.
   */
  public static async uploadGenericImage(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.file) {
        throw new AppError('No image file provided', 400, ERROR_CODES.VALIDATION_ERROR);
      }

      const compressed = await compressImage(req.file.buffer);
      const folder     = (req.body?.folder as string) ?? 'fuoye-campus/misc';
      const publicId   = `${Date.now()}-${req.file.originalname.replace(/\.[^.]+$/, '')}`;
      const imageUrl   = await uploadToCloudinary(compressed, folder, publicId);

      return sendSuccess(res, 200, { imageUrl }, 'Image uploaded successfully');
    } catch (err) {
      return next(err);
    }
  }
}
