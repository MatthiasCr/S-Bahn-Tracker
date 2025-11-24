declare module 'hafas-client' {
    export type BoundingBox = {
        north: number;
        west: number;
        south: number;
        east: number;
    };

    export type ProductSelection = Record<string, boolean>;

    export type RadarOptions = {
        results?: number;
        products?: ProductSelection;
    };

    export type RadarMovement = Record<string, unknown>;

    export type RadarResponse = {
        movements: RadarMovement[];
        realtimeDataUpdatedAt?: number | null;
    };

    export interface HafasClient {
        radar(bbox: BoundingBox, opt?: RadarOptions): Promise<RadarResponse>;
    }

    export type Profile = {
        request: (...args: any[]) => Promise<unknown>;
        [key: string]: unknown;
    };

    export function createClient(
        profile: Profile,
        userAgent: string,
        opt?: Record<string, unknown>,
    ): HafasClient;
}

declare module 'hafas-client/p/bvg/index.js' {
    import type { Profile } from 'hafas-client';
    export const profile: Profile;
}
