export type ConnectType = 'ii' | 'me' | 'infinity' | 'nfid' | 'stoic' | 'plug';

export type ActorCreator = <T>(
    idlFactory: IDL.InterfaceFactory,
    canisterId: string,
) => Promise<ActorSubclass<T>>;

export type ConnectedIdentity = {
    connectType: ConnectType;
    principal: string;
    creator: ActorCreator;
};
