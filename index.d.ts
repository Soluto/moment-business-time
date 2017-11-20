declare module '@npmsoluto/moment-business-time' {
    import * as base_moment from 'moment';

        interface MomentLanguage {
            holidays?: string[];
            workinghours?: {
                [key: number]: string[];
        };
        }

        module 'moment' {
            interface Moment {
                addWorkingTime(num: number, unit: string): Moment;
                subtractWorkingTime(num: number, unit: string): Moment;
                isBusinessDay(): boolean;
                isWorkingDay(): boolean;
                isWorkingTime(): boolean;
                isHoliday(): boolean;
                lastWorkingDay(): Moment;
                nextWorkingDay(): Moment;
                lastWorkingTime(): Moment;
                nextWorkingTime(): Moment;
                workingDiff(comparator: Moment, unit: string, detail: boolean): number;
            }
        }
    export = base_moment;
}
