import { getAnonymousActorCreatorByAgent } from '../../components/connect/creator';
import { idlFactory } from './canistore_platform.did';
import type { _SERVICE } from './canistore_platform.did.d';
import { MusicChannel, Result_1 } from './canistore_platform.did.d';

const canisterId = 'tfajn-gyaaa-aaaas-akjnq-cai';

export const getChannelList = async (): Promise<MusicChannel[]> => {
    try {
        const creator = getAnonymousActorCreatorByAgent();

        const actor: _SERVICE = await creator(idlFactory, canisterId);

        const res: MusicChannel[] = await actor.get_channel_list();

        return res;
    } catch (err) {
        console.error(err);
        return [];
    }
};

export const getChannelInfo = async (id): Promise<MusicChannel | undefined> => {
    try {
        const creator = getAnonymousActorCreatorByAgent();

        const actor: _SERVICE = await creator(idlFactory, canisterId);

        const res: Result_1 = await actor.get_channel_info(id);

        if ('Ok' in res) {
            return res.Ok;
        } else {
            return undefined;
        }
    } catch (err) {
        console.error(err);
        return undefined;
    }
};
