import { ceil } from 'lodash';
import moment from 'moment';

export const getAmount = (num: number, interception: number = 4) => {
    return ceil(Number(num / 10 ** 8), interception);
};

export const getAmount2Bigint = (num: number) => {
    return Math.trunc(num * 10 ** 8);
};

export const formatDate = (t: number): string => {
    return moment(t).format('DD/MM/YYYY');
};

export const bytesToMB = (bytes: number): string => {
    const kb = bytes / 1024;
    const mb = kb / 1024;
    return mb.toFixed(2);
};

export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const handleTime = (record_time: Date) => {
    let displayDateTime = '';
    let detailTime = +new Date() - +new Date(record_time);
    if (detailTime) {
        if (detailTime < 1000) {
            detailTime = 1000;
        }
        if (detailTime < 60 * 1000) {
            const _second = Math.floor(detailTime / 1000);
            displayDateTime = _second + (_second > 1 ? ' seconds ago' : ' second ago');
        } else if (detailTime >= 60 * 1000 && detailTime < 60 * 60 * 1000) {
            const _min = Math.floor(detailTime / 1000 / 60);
            displayDateTime = _min + (_min > 1 ? ' minutes ago' : ' minute ago');
        } else if (detailTime >= 60 * 60 * 1000 && detailTime < 24 * 60 * 60 * 1000) {
            const _hour = Math.floor(detailTime / 1000 / 60 / 60);
            displayDateTime = _hour + (_hour > 1 ? ' hours ago' : ' hour ago');
        } else if (detailTime >= 24 * 60 * 60 * 1000 && detailTime < 7 * 24 * 60 * 60 * 1000) {
            const _day = Math.floor(detailTime / 1000 / 60 / 60 / 24);
            displayDateTime = _day + (_day > 1 ? ' days ago' : ' day ago');
        } else if (detailTime >= 7 * 24 * 60 * 60 * 1000 && detailTime < 30 * 24 * 60 * 60 * 1000) {
            const _week = Math.floor(detailTime / 1000 / 60 / 60 / 24 / 7);
            displayDateTime = _week + (_week > 1 ? ' weeks ago' : ' week ago');
        } else if (
            detailTime >= 30 * 24 * 60 * 60 * 1000 &&
            detailTime < 365 * 24 * 60 * 60 * 1000
        ) {
            const _month = Math.floor(detailTime / 1000 / 60 / 60 / 24 / 30);
            displayDateTime = _month + ' month ago';
        } else if (
            detailTime >= 365 * 24 * 60 * 60 * 1000 &&
            detailTime < 2 * 365 * 24 * 60 * 60 * 1000
        ) {
            displayDateTime = '1 year ago';
        } else if (detailTime >= 2 * 365 * 24 * 60 * 60 * 1000) {
            const _year = Math.floor(detailTime / 1000 / 60 / 60 / 24 / 365);
            displayDateTime = _year + ' years ago';
        }
    }
    return displayDateTime;
};

export type runtimeType = {
    day: number;
    hours: number;
};
export const getRuntime = (num: bigint): runtimeType => {
    let time: number = Date.now() - Number(num);
    time = time / 1000 / 100 / (3600 * 24);
    const day: number = Math.floor(time);
    const hours = Math.floor((time - day) * 24);
    return {
        day,
        hours,
    };
};

export const cyclesToTrillionth = (num: number): string => {
    const trillionth = (num / 1000000000000).toFixed(4);
    return trillionth;
};

export const arrayToHexText = (value: number[]): string => {
    return value.map((v) => v.toString(16).padStart(2, '0')).join('');
};

export const getExpired = (subType: string = '', expireTime: bigint) => {
    const time = moment(Number(expireTime)).format('MMM Do YYYY');
    if (subType === 'Free' || subType == 'Permanent') {
        return subType;
    } else {
        return time;
    }
};
