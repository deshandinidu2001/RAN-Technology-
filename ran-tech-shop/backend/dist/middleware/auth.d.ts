import { Request, Response, NextFunction } from 'express';
import { JWTPayload } from '../utils/jwt';
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}
/**
 * Authentication middleware - requires valid JWT token
 */
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Optional authentication - sets user if valid token exists, but doesn't require it
 */
export declare const optionalAuth: (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map