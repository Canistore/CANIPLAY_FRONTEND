import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
import type { Principal } from '@dfinity/principal';

export interface Attribute {
    key: string;
    value: string;
}
export type CanisterArgs = { Upgrade: PlatformUpgradeArgs } | { Init: PlatformInitArgs };
export type ChannelCategory = { Playlist: null } | { Radio: null } | { Other: null };
export type MusicCategory =
    | { Emo: null }
    | { Ska: null }
    | { SoulMusic: null }
    | { Britpop: null }
    | { CountryMusic: null }
    | { PopularMusic: null }
    | { Singing: null }
    | { EasyListening: null }
    | { MusicOfLatinAmerica: null }
    | { ElectronicDanceMusic: null }
    | { HeavyMetal: null }
    | { Funk: null }
    | { Jazz: null }
    | { KPop: null }
    | { Reggae: null }
    | { Rock: null }
    | { HardRock: null }
    | { ChristianMusic: null }
    | { SynthPop: null }
    | { ProgressiveRock: null }
    | { Blues: null }
    | { IndieRock: null }
    | { PopMusic: null }
    | { Grunge: null }
    | { HouseMusic: null }
    | { Disco: null }
    | { FolkMusic: null }
    | { WorldMusic: null }
    | { NewAgeMusic: null }
    | { TranceMusic: null }
    | { IndianClassicalMusic: null }
    | { ExperimentalMusic: null }
    | { SwingMusic: null }
    | { Dubstep: null }
    | { ElectronicMusic: null }
    | { Metal: null }
    | { MusicOfAfrica: null }
    | { LatinMusic: null }
    | { PunkRock: null }
    | { DanceMusic: null }
    | { RhythmAndBlues: null }
    | { VocalMusic: null }
    | { ClassicalMusic: null }
    | { Bachata: null }
    | { Other: null }
    | { NewWave: null }
    | { Modernism: null }
    | { HipHopMusic: null }
    | { AlternativeRock: null }
    | { Flamenco: null }
    | { Techno: null };
export interface MusicChannel {
    id: bigint;
    total_likes: bigint;
    created: bigint;
    sorted: boolean;
    owner: Principal;
    tracks: Array<TrackInfo>;
    name: string;
    total_plays: bigint;
    music_type: MusicType;
    updated: bigint;
    category: [] | [ChannelCategory];
    image: [] | [string];
}
export type MusicType =
    | { Pop: null }
    | { Jazz: null }
    | { Reggae: null }
    | { Rock: null }
    | { Blues: null }
    | { HipHop: null }
    | { Classical: null }
    | { Electronic: null }
    | { Other: null }
    | { Country: null };
export interface OssFileInfo {
    oss_canister_id: Principal;
    track_id: bigint;
    space_canister_id: Principal;
    file_id: number;
}
export interface PlatformInitArgs {
    ecdsa_key_name: string;
    owner: Principal;
    name: string;
    token_expiration: bigint;
    init_channel: boolean;
}
export interface PlatformUpgradeArgs {
    owner: [] | [Principal];
    token_expiration: [] | [bigint];
}
export type Result = { Ok: Uint8Array | number[] } | { Err: string };
export type Result_1 = { Ok: null } | { Err: string };
export type Result_2 = { Ok: MusicChannel } | { Err: string };
export type Result_3 = { Ok: State } | { Err: string };
export interface State {
    ecdsa_token_public_key: string;
    next_channel_id: bigint;
    ecdsa_key_name: string;
    owner: Principal;
    name: string;
    token_expiration: bigint;
    space_count: bigint;
}
export interface Token {
    subject: Principal;
    audience: Principal;
    policies: string;
}
export interface TrackInfo {
    duration: [] | [bigint];
    external_url: string;
    animation_url: string;
    name: string;
    album_name: [] | [string];
    description: string;
    created_at: bigint;
    oss_file_info: [] | [OssFileInfo];
    audio_url: string;
    likes: bigint;
    artist_name: string;
    attributes: Array<Attribute>;
    release_at: [] | [bigint];
    category: [] | [MusicCategory];
    image: string;
    plays: bigint;
    position: bigint;
}
export interface WalletReceiveResult {
    accepted: bigint;
}
export interface _SERVICE {
    __get_candid_interface_tmp_hack: ActorMethod<[], string>;
    access_token: ActorMethod<[Principal], Result>;
    add_track_to_channel: ActorMethod<[bigint, TrackInfo], Result_1>;
    batch_add_tracks_to_channel: ActorMethod<[bigint, Array<TrackInfo>], Result_1>;
    delete_track_from_channel: ActorMethod<[bigint, bigint], Result_1>;
    delete_track_from_channel_by_share: ActorMethod<[bigint, Principal, bigint], Result_1>;
    get_channel_info: ActorMethod<[bigint], Result_2>;
    get_channel_list: ActorMethod<[], Array<MusicChannel>>;
    get_platform_info: ActorMethod<[], Result_3>;
    sign_access_token: ActorMethod<[Token], Result>;
    wallet_balance: ActorMethod<[], bigint>;
    wallet_receive: ActorMethod<[], WalletReceiveResult>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
