import { mountStoreDevtool } from 'simple-zustand-devtools';
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { isDevMode } from '@/utils/env';
import { MusicChannel } from '../canisters/canistore_platform/canistore_platform.did.d';

const isDev = isDevMode();

interface StoresState {
    roomInfo: MusicChannel | undefined;
    setRoomInfo: (roomInfo: MusicChannel | undefined) => void;

    isPlaying: number | undefined;
    setIsPlaying: (isPlaying: number | undefined) => void;
}

export const useStoresStore = create<StoresState>()(
    devtools(
        subscribeWithSelector<StoresState>((set) => ({
            // Multi-language
            roomInfo: undefined,
            setRoomInfo: (roomInfo: MusicChannel | undefined) => set({ roomInfo }),
            // Whether playing
            isPlaying: undefined,
            setIsPlaying: (isPlaying: number | undefined) => set({ isPlaying }),
        })),
        {
            enabled: isDev,
            name: 'IdentityStore',
        },
    ),
);

isDev && mountStoreDevtool('AppStore', useStoresStore);
