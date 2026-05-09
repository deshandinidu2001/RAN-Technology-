import { Request, Response } from 'express';
export declare const getAvailability: (req: Request, res: Response) => Promise<void>;
export declare const createBooking: (req: Request, res: Response) => Promise<void>;
export declare const getAllBookings: (req: Request, res: Response) => Promise<void>;
export declare const getBookingById: (req: Request, res: Response) => Promise<void>;
export declare const getBookingsByEmail: (req: Request, res: Response) => Promise<void>;
export declare const updateBookingStatus: (req: Request, res: Response) => Promise<void>;
export declare const cancelBooking: (req: Request, res: Response) => Promise<void>;
export declare const setAvailability: (req: Request, res: Response) => Promise<void>;
export declare const getStatistics: (_req: Request, res: Response) => Promise<void>;
export declare const getRepairReviews: (req: Request, res: Response) => Promise<void>;
export declare const createRepairReview: (req: Request, res: Response) => Promise<void>;
export declare const getRepairServices: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=repairController.d.ts.map