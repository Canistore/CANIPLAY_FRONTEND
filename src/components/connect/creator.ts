import { IConnector } from '@connect2ic/core';
import { Actor, ActorSubclass, HttpAgent } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { ActorCreator, ConnectedIdentity } from '@/types/identity';
import { getConnectHost } from '../../utils/env';

export const getActorCreatorByAgent = (agent: HttpAgent): ActorCreator => {
    return async <T>(idlFactory: IDL.InterfaceFactory, canisterId: string) => {
        return Actor.createActor<T>(idlFactory, { agent, canisterId });
    };
};

export const getActorCreatorByActiveProvider = (activeProvider: IConnector): ActorCreator => {
    return async <T>(idlFactory: IDL.InterfaceFactory, canisterId: string) => {
        const result = await activeProvider.createActor<ActorSubclass<T>>(
            canisterId,
            idlFactory as any,
        );
        if (result.isOk()) return result.value;
        throw new Error(result.error.message);
    };
};

export const getAnonymousActorCreatorByAgent = (): ActorCreator => {
    return async <T>(idlFactory: IDL.InterfaceFactory, canisterId: string) => {
        const agent = new HttpAgent({ host: getConnectHost() });

        return Actor.createActor<T>(idlFactory, { agent, canisterId });
    };
};

export const anonymousIdentity: ConnectedIdentity = {
    connectType: 'ii',
    principal: '2vxsx-fae',
    creator: getAnonymousActorCreatorByAgent(),
};
