import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { decrypt, encrypt } from '@/utils/crypto';

export const baseUrl = 'https://api.thebots.fun';
const apiConfig = {
    roomList: '/v1/room/list',
    roomInfo: '/v1/room/info',
    createRoom: '/v1/room/create',
};

const axiosInstance: AxiosInstance = axios.create({
    baseURL: baseUrl,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const req = encrypt(JSON.stringify(config.data));
        config.data = req;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        if (response.data.data) {
            const res = decrypt(response.data.data);
            response.data = { data: JSON.parse(res) };
        } else {
            response.data = '';
        }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    },
);

export type RoomListRequest = {
    token?: string;
};
export type RoomListItemResult = {
    count: boolean;
    list: RoomListItem[];
};

export type RoomListItem = {
    room_id: string;
    name: string;
    cover_image: string;
};

export const getRoomList = async (request: RoomListRequest): Promise<RoomListItemResult> => {
    try {
        const response: AxiosResponse<{ data: RoomListItemResult }> = await axiosInstance.post(
            apiConfig.roomList,
            request,
        );
        return response.data.data;
    } catch (err) {
        console.log(err);
        throw new Error('error');
    }
};

export type RoomInfoRequest = {
    id?: string;
};
export type RoomInfoResult = {
    cover_image: string;
    name: string;
    room_id: string;
};

export const getRoomInfo = async (request: RoomInfoRequest): Promise<RoomInfoResult> => {
    try {
        const response: AxiosResponse<{ data: RoomInfoResult }> = await axiosInstance.post(
            apiConfig.roomInfo,
            request,
        );
        return response.data.data;
    } catch (err) {
        console.log(err);
        throw new Error('error');
    }
};

export const createRoom = async (request: { id: string }) => {
    try {
        const response: AxiosResponse<{ data: RoomListItemResult }> = await axiosInstance.post(
            apiConfig.createRoom,
            request,
        );
        return response.data.data;
    } catch (err) {
        console.log(err);
        throw new Error('error');
    }
};
