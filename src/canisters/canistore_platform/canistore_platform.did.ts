export const idlFactory = ({ IDL }) => {
    const PlatformUpgradeArgs = IDL.Record({
        owner: IDL.Opt(IDL.Principal),
        token_expiration: IDL.Opt(IDL.Nat64),
    });
    const PlatformInitArgs = IDL.Record({
        ecdsa_key_name: IDL.Text,
        owner: IDL.Principal,
        name: IDL.Text,
        token_expiration: IDL.Nat64,
        init_channel: IDL.Bool,
    });
    const CanisterArgs = IDL.Variant({
        Upgrade: PlatformUpgradeArgs,
        Init: PlatformInitArgs,
    });
    const Result = IDL.Variant({ Ok: IDL.Vec(IDL.Nat8), Err: IDL.Text });
    const OssFileInfo = IDL.Record({
        oss_canister_id: IDL.Principal,
        track_id: IDL.Nat64,
        space_canister_id: IDL.Principal,
        file_id: IDL.Nat32,
    });
    const Attribute = IDL.Record({ key: IDL.Text, value: IDL.Text });
    const MusicCategory = IDL.Variant({
        Emo: IDL.Null,
        Ska: IDL.Null,
        SoulMusic: IDL.Null,
        Britpop: IDL.Null,
        CountryMusic: IDL.Null,
        PopularMusic: IDL.Null,
        Singing: IDL.Null,
        EasyListening: IDL.Null,
        MusicOfLatinAmerica: IDL.Null,
        ElectronicDanceMusic: IDL.Null,
        HeavyMetal: IDL.Null,
        Funk: IDL.Null,
        Jazz: IDL.Null,
        KPop: IDL.Null,
        Reggae: IDL.Null,
        Rock: IDL.Null,
        HardRock: IDL.Null,
        ChristianMusic: IDL.Null,
        SynthPop: IDL.Null,
        ProgressiveRock: IDL.Null,
        Blues: IDL.Null,
        IndieRock: IDL.Null,
        PopMusic: IDL.Null,
        Grunge: IDL.Null,
        HouseMusic: IDL.Null,
        Disco: IDL.Null,
        FolkMusic: IDL.Null,
        WorldMusic: IDL.Null,
        NewAgeMusic: IDL.Null,
        TranceMusic: IDL.Null,
        IndianClassicalMusic: IDL.Null,
        ExperimentalMusic: IDL.Null,
        SwingMusic: IDL.Null,
        Dubstep: IDL.Null,
        ElectronicMusic: IDL.Null,
        Metal: IDL.Null,
        MusicOfAfrica: IDL.Null,
        LatinMusic: IDL.Null,
        PunkRock: IDL.Null,
        DanceMusic: IDL.Null,
        RhythmAndBlues: IDL.Null,
        VocalMusic: IDL.Null,
        ClassicalMusic: IDL.Null,
        Bachata: IDL.Null,
        Other: IDL.Null,
        NewWave: IDL.Null,
        Modernism: IDL.Null,
        HipHopMusic: IDL.Null,
        AlternativeRock: IDL.Null,
        Flamenco: IDL.Null,
        Techno: IDL.Null,
    });
    const TrackInfo = IDL.Record({
        duration: IDL.Opt(IDL.Nat64),
        external_url: IDL.Text,
        animation_url: IDL.Text,
        name: IDL.Text,
        album_name: IDL.Opt(IDL.Text),
        description: IDL.Text,
        created_at: IDL.Nat64,
        oss_file_info: IDL.Opt(OssFileInfo),
        audio_url: IDL.Text,
        likes: IDL.Nat64,
        artist_name: IDL.Text,
        attributes: IDL.Vec(Attribute),
        release_at: IDL.Opt(IDL.Nat64),
        category: IDL.Opt(MusicCategory),
        image: IDL.Text,
        plays: IDL.Nat64,
        position: IDL.Nat64,
    });
    const Result_1 = IDL.Variant({ Ok: IDL.Null, Err: IDL.Text });
    const MusicType = IDL.Variant({
        Pop: IDL.Null,
        Jazz: IDL.Null,
        Reggae: IDL.Null,
        Rock: IDL.Null,
        Blues: IDL.Null,
        HipHop: IDL.Null,
        Classical: IDL.Null,
        Electronic: IDL.Null,
        Other: IDL.Null,
        Country: IDL.Null,
    });
    const ChannelCategory = IDL.Variant({
        Playlist: IDL.Null,
        Radio: IDL.Null,
        Other: IDL.Null,
    });
    const MusicChannel = IDL.Record({
        id: IDL.Nat64,
        total_likes: IDL.Nat64,
        created: IDL.Nat64,
        sorted: IDL.Bool,
        owner: IDL.Principal,
        tracks: IDL.Vec(TrackInfo),
        name: IDL.Text,
        total_plays: IDL.Nat64,
        music_type: MusicType,
        updated: IDL.Nat64,
        category: IDL.Opt(ChannelCategory),
        image: IDL.Opt(IDL.Text),
    });
    const Result_2 = IDL.Variant({ Ok: MusicChannel, Err: IDL.Text });
    const State = IDL.Record({
        ecdsa_token_public_key: IDL.Text,
        next_channel_id: IDL.Nat64,
        ecdsa_key_name: IDL.Text,
        owner: IDL.Principal,
        name: IDL.Text,
        token_expiration: IDL.Nat64,
        space_count: IDL.Nat,
    });
    const Result_3 = IDL.Variant({ Ok: State, Err: IDL.Text });
    const Token = IDL.Record({
        subject: IDL.Principal,
        audience: IDL.Principal,
        policies: IDL.Text,
    });
    const WalletReceiveResult = IDL.Record({ accepted: IDL.Nat64 });
    return IDL.Service({
        __get_candid_interface_tmp_hack: IDL.Func([], [IDL.Text], ['query']),
        access_token: IDL.Func([IDL.Principal], [Result], []),
        add_track_to_channel: IDL.Func([IDL.Nat64, TrackInfo], [Result_1], []),
        batch_add_tracks_to_channel: IDL.Func([IDL.Nat64, IDL.Vec(TrackInfo)], [Result_1], []),
        delete_track_from_channel: IDL.Func([IDL.Nat64, IDL.Nat64], [Result_1], []),
        delete_track_from_channel_by_share: IDL.Func(
            [IDL.Nat64, IDL.Principal, IDL.Nat64],
            [Result_1],
            [],
        ),
        get_channel_info: IDL.Func([IDL.Nat64], [Result_2], ['query']),
        get_channel_list: IDL.Func([], [IDL.Vec(MusicChannel)], ['query']),
        get_platform_info: IDL.Func([], [Result_3], ['query']),
        sign_access_token: IDL.Func([Token], [Result], []),
        wallet_balance: IDL.Func([], [IDL.Nat], ['query']),
        wallet_receive: IDL.Func([], [WalletReceiveResult], []),
    });
};
export const init = ({ IDL }) => {
    const PlatformUpgradeArgs = IDL.Record({
        owner: IDL.Opt(IDL.Principal),
        token_expiration: IDL.Opt(IDL.Nat64),
    });
    const PlatformInitArgs = IDL.Record({
        ecdsa_key_name: IDL.Text,
        owner: IDL.Principal,
        name: IDL.Text,
        token_expiration: IDL.Nat64,
        init_channel: IDL.Bool,
    });
    const CanisterArgs = IDL.Variant({
        Upgrade: PlatformUpgradeArgs,
        Init: PlatformInitArgs,
    });
    return [IDL.Opt(CanisterArgs)];
};
