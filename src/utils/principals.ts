import { Principal } from '@dfinity/principal';
import { getCrc32 } from '@dfinity/principal/lib/esm/utils/getCrc';
import { sha224 } from '@dfinity/principal/lib/esm/utils/sha224';
import { Buffer } from 'buffer';
import { arrayToHexText } from '@/utils/convert';
import { toHexString } from './hex';

export const string2principal = (p: string): Principal => Principal.fromText(p);

export const isPrincipalText = (text: string | undefined): boolean => {
    if (!text) return false;
    try {
        string2principal(text);
        return true;
    } catch (e) {
        return false;
    }
};

export const isCanisterIdText = (text: string | undefined): boolean => {
    if (!text) return false;
    if (text.length !== 27) return false;
    return isPrincipalText(text);
};

export const principalToAccountHex = (principal_hex: string, subaccount?: Uint8Array | number) => {
    const padding = Buffer.from('\x0Aaccount-id');
    const array = new Uint8Array([
        ...padding,
        ...string2principal(principal_hex).toUint8Array(),
        ...getSubAccountArray(subaccount),
    ]);

    const hash = sha224(array);
    const checksum = to32bits(getCrc32(hash));
    const array2 = new Uint8Array([...checksum, ...hash]);
    return arrayToHexText(Array.from(array2));
};

const getSubAccountArray = (subaccount: Uint8Array | number | undefined): Uint8Array => {
    if (Array.isArray(subaccount)) {
        return new Uint8Array(subaccount.concat(Array(32 - subaccount.length).fill(0)));
    } else {
        // 32 bit number only
        return new Uint8Array(
            Array(28)
                .fill(0)
                .concat(
                    Array.from(to32bits(subaccount !== undefined ? (subaccount as number) : 0)),
                ),
        );
    }
};
const to32bits = (n: number): Uint8Array => {
    const buffer = new ArrayBuffer(4);
    new DataView(buffer).setUint32(0, n);
    return new Uint8Array(buffer);
};

export const principalToAccountIdentifier = (p: string, s: number) => {
    const padding = Buffer.from('\x0Aaccount-id');
    const array = new Uint8Array([
        ...padding,
        ...Principal.fromText(p).toUint8Array(),
        ...getSubAccountArray(s),
    ]);
    const hash = sha224(array);
    const checksum = to32bits(getCrc32(hash));
    const array2 = new Uint8Array([...checksum, ...hash]);
    return toHexString(array2);
};

export const principalToAccountIdentifierArray = (p: string, s: number) => {
    const padding = Buffer.from('\x0Aaccount-id');
    const array = new Uint8Array([
        ...padding,
        ...Principal.fromText(p).toUint8Array(),
        ...getSubAccountArray(s),
    ]);
    const hash = sha224(array);
    const checksum = to32bits(getCrc32(hash));
    const array2 = new Uint8Array([...checksum, ...hash]);
    return Array.from(array2);
};
