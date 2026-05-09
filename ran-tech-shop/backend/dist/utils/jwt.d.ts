export interface JWTPayload {
    userId: string;
    email: string;
}
/**
 * Generate a JWT token for a user
 */
export declare const generateToken: (payload: JWTPayload) => string;
/**
 * Verify and decode a JWT token
 */
export declare const verifyToken: (token: string) => JWTPayload | null;
/**
 * Decode a token without verifying (useful for debugging)
 */
export declare const decodeToken: (token: string) => JWTPayload | null;
//# sourceMappingURL=jwt.d.ts.map