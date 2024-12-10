import { message } from 'antd';
import ClipboardJS from 'clipboard';

// pid abbreviated display
export const dealPid = (pid: string): string => {
    if (!pid) {
        return '';
    }
    const arr = pid.split('-');
    return arr[0] + '...' + arr[arr.length - 1];
};

// Text abbreviated display
export const truncateString = (str: string): string => {
    const maxLength = 10; // Maximum display length (excluding ellipsis)

    if (str.length <= maxLength) {
        return str;
    }

    const truncated = str.substring(0, 6) + '...' + str.substring(str.length - 4);
    return truncated;
};

// Copy text
export const copyText = (text: string = ''): void => {
    const clipboard = new ClipboardJS(document.body, {
        text: () => text,
    });

    clipboard.on('success', () => {
        message.success('Copy Success');
        clipboard.destroy();
    });

    clipboard.on('error', () => {
        message.error('Copy Error');
        clipboard.destroy();
    });
};
