import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { message, Skeleton, Slider, Tooltip } from 'antd';
import { useConnect } from '@connect2ic/react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { v4 as uuidv4 } from 'uuid';
import { dealPid } from '@/utils/common';
import { base64Encrypt } from '@/utils/crypto';
import { createRoom } from '@/api/index';
import closeSvg from '@/assets/images/close2.svg';
import coverDefaultSvg from '@/assets/images/cover-default.svg';
import dianSvg from '@/assets/images/dian.svg';
import info2Svg from '@/assets/images/info2.svg';
import infoSvg from '@/assets/images/info.svg';
import infoHoverSvg from '@/assets/images/infoHover.svg';
import licensingProtocolBgImg from '@/assets/images/licensingProtocolBg.png';
import liveBgSvg from '@/assets/images/liveBg.svg';
import liveBgMSvg from '@/assets/images/liveBgM.svg';
import loadingSvg from '@/assets/images/loading.svg';
import moreSvg from '@/assets/images/more.svg';
import moreHoverSvg from '@/assets/images/moreHover.svg';
import nextSvg from '@/assets/images/next.svg';
import pause2Svg from '@/assets/images/pause2.svg';
import pauseSvg from '@/assets/images/pause.svg';
import playSvg from '@/assets/images/play.svg';
import scrollSvg from '@/assets/images/scroll.svg';
import sendSvg from '@/assets/images/send.svg';
import volumeSvg from '@/assets/images/volume.svg';
import { cn } from '@/lib/utils';
import { useStoresStore } from '@/stores/stores';
import { getChannelInfo } from '../../canisters/canistore_platform';
import { TrackInfo } from '../../canisters/canistore_platform/canistore_platform.did.d';
import { play } from './AudioChunkPlayer';

const wsBaseUrl = 'wss://api.thebots.fun';

type ChattingListItem = {
    create_time: string;
    message: string;
    token: string;
};

interface MarqueeTextProps {
    text: string;
    maxWidth?: number;
}

const MarqueeText: React.FC<MarqueeTextProps> = ({ text, maxWidth = 95 }) => {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (textRef.current) {
            const textWidth = textRef.current.scrollWidth;
            setIsOverflowing(textWidth > maxWidth);
        }
    }, [text, maxWidth]);

    return (
        <div className="relative overflow-hidden" style={{ maxWidth: `${maxWidth}px` }}>
            <div
                ref={textRef}
                className={`whitespace-nowrap ${isOverflowing ? 'animate-marquee' : ''}`}
                style={{ display: 'inline-block' }}
            >
                {text}
            </div>
        </div>
    );
};

const formatDuration = (durationInSeconds: number): string => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);

    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return `${formattedMinutes}:${formattedSeconds}`;
};

const Room = () => {
    const { activeProvider } = useConnect();
    const location = useLocation();
    const { pathname } = useLocation();

    const mode = ~location.pathname.indexOf('play') ? 'play' : 'live';

    const setRoomInfo = useStoresStore((s) => s.setRoomInfo);
    const setIsPlaying = useStoresStore((s) => s.setIsPlaying);
    const isPlaying = useStoresStore((s) => s.isPlaying);
    const roomInfo = useStoresStore((s) => s.roomInfo);

    const id = useParams();
    const roomId = Number(Object.values(id)[0]?.split('/')[1]);

    const uuid = base64Encrypt(uuidv4());

    const audioRef = useRef<HTMLAudioElement>(null);
    const isPlay = useRef<boolean>(false);
    const [volume, setVolume] = useState<number>(70);

    const musicList = useRef<TrackInfo[]>([]);
    const musicPlay = useRef<TrackInfo>();

    const chattingWs = `${wsBaseUrl}/v1/chat/${roomId ? roomId : isPlaying}?token=${uuid}`;

    const chattingSocket = useRef<ReconnectingWebSocket>();

    const [chattingText, setChattingText] = useState<string>();

    const [chattingList, setChattingList] = useState<ChattingListItem[]>([]);

    const [infoShow, setInfoShow] = useState<boolean>(false);

    const [handover, setHandover] = useState<1 | 2>(1);

    const playIndex = useRef<number>(0);

    const audioSrc = useRef<string>('');

    const playObj = useRef<any>();

    const modeIsPlayPlaying = (item: TrackInfo, idx) => {
        const dom = audioRef.current;
        if (!dom) {
            return;
        }
        musicPlay.current = item;
        dom.src = item.audio_url;
        audioSrc.current = item.audio_url;
        playIndex.current = idx;

        setTimeout(() => {
            playChange();
        }, 100);
    };

    const playChange = () => {
        if (playObj.current) {
            playObj.current.pause();
            playObj.current = undefined;
        }

        if (audioSrc.current) {
            const player = play(audioSrc.current, 0);
            playObj.current = player;
            setIsPlaying(roomId);
            isPlay.current = true;
            console.log(player);
            player.addEventListener('timeupdate', (e) => {
                const currentTime = e.detail.currentTime;
                setCurrentTime(currentTime);
                const duration = musicPlay.current?.duration
                    ? Number(musicPlay.current?.duration)
                    : 0;
                setProgress(currentTime / duration);
                if (mode === 'live') {
                    setIsCanplayChange(true);
                }
            });

            player.addEventListener('ended', () => {
                pauseChange();
                setTimeout(() => {
                    nextChange();
                }, 100);
            });

            return;
        }
    };

    const pauseChange = () => {
        console.log('pauseChange');

        playObj.current.pause();
        playObj.current = undefined;
        isPlay.current = false;
        setIsCanplayChange(false);
        setIsPlaying(undefined);
    };

    let chattingSocketTimeOut: NodeJS.Timer;

    const chattingSocketClose = () => {
        clearInterval(chattingSocketTimeOut);
    };

    const chattingSocketMessage = (data) => {
        if (data.event === 'list') {
            if (data.content) {
                setChattingList(data.content.reverse());
            } else {
                setChattingList([]);
            }
        }

        if (data.event === 'message') {
            getChattingList();
            setChattingText('');
        }
    };

    const getChattingList = () => {
        if (!chattingSocket.current) {
            return;
        }

        chattingSocket.current.send(
            JSON.stringify({
                event: 'list',
            }),
        );
    };

    const chattingInit = () => {
        const chattingSocketInit = new ReconnectingWebSocket(chattingWs);
        chattingSocket.current = chattingSocketInit;

        chattingSocketInit.addEventListener('open', () => {
            chattingSocketTimeOut = setInterval(() => {
                chattingSocket.current!.send(
                    JSON.stringify({
                        event: 'ping',
                    }),
                );
            }, 5000);
            getChattingList();
        });

        chattingSocketInit.addEventListener('message', (event) => {
            chattingSocketMessage(JSON.parse(event.data));
        });

        chattingSocketInit.addEventListener('close', () => {
            chattingSocketClose();
        });
    };

    const submitChatting = () => {
        if (!chattingText) {
            return;
        }

        if (!chattingSocket.current) {
            return;
        }
        const pid = activeProvider?.principal;

        if (!pid) {
            message.error('Sign in Required');
            return;
        }

        chattingSocket.current.send(
            JSON.stringify({
                event: 'message',
                content: chattingText,
                token: pid,
            }),
        );
    };

    const setVolumeChange = (e) => {
        setVolume(e);

        if (!audioRef.current) {
            return;
        }
        audioRef.current.volume = e / 100;
    };

    useEffect(() => {
        if (!audioRef.current) {
            return;
        }
        audioRef.current.volume = 0.7;
    }, [audioRef.current]);

    const socketKill = () => {
        chattingSocket.current?.close();
    };

    const musicListInit = () => {
        getChannelInfo(roomId).then((res) => {
            setRoomInfo(res);
            musicList.current = res?.tracks || [];

            if (!isPlaying && res?.tracks?.length) {
                musicPlay.current = res?.tracks[0];
                playIndex.current = 0;

                const dom = audioRef.current;
                if (!dom) {
                    return;
                }
                dom.src = musicPlay.current.audio_url;
                audioSrc.current = musicPlay.current.audio_url;
            }

            if (!res?.tracks?.length) {
                message.error('This room is empty');
            }
        });
    };

    useEffect(() => {
        createRoom({ id: roomId.toString() })
            .then(() => {
                if (!roomId) {
                    if (!isPlaying) {
                        socketKill();
                        musicList.current = [];
                        setChattingList([]);
                        musicPlay.current = undefined;
                    }
                    return;
                }

                if (!isPlaying) {
                    chattingInit();
                    musicListInit();
                    musicPlay.current = undefined;
                }

                if (isPlaying && roomId !== isPlaying) {
                    musicPlay.current = undefined;
                    socketKill();

                    musicList.current = [];
                    setChattingList([]);
                    pauseChange();

                    chattingInit();
                    musicListInit();

                    const dom = audioRef.current;
                    if (!dom) {
                        return;
                    }
                    dom.src = '';
                    audioSrc.current = '';
                }

                if (isPlaying && roomId === isPlaying) {
                    console.log('Back to Room');
                }
            })
            .catch((err) => {
                console.error(err);

                message.error('Create Chat Room Not Found');
            });
    }, [roomId]);

    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const handleTimeUpdate = () => {
        const audioElement = audioRef.current;

        if (!audioElement) return;

        const currentTime = audioElement.currentTime;
        setCurrentTime(currentTime);
        const duration = audioElement.duration;

        if (!duration) {
            setProgress(0);
        } else {
            setProgress(currentTime / duration);
        }
    };

    const nextChange = () => {
        let item = musicList.current[playIndex.current + 1];

        if (!item) {
            item = musicList.current[0];
            modeIsPlayPlaying(item, 0);
        } else {
            modeIsPlayPlaying(item, playIndex.current + 1);
        }
    };

    const [isCanplayChange, setIsCanplayChange] = useState(false);
    const audioCanplayChange = (e) => {
        if (isPlay.current) {
            setIsCanplayChange(true);
        } else {
            setIsCanplayChange(false);
        }
    };

    useEffect(() => {
        const audioElement = audioRef.current;

        if (audioElement) {
            audioElement.addEventListener('timeupdate', handleTimeUpdate);
            audioElement.addEventListener('ended', nextChange);
            audioElement.addEventListener('canplay', audioCanplayChange);
            return () => {
                audioElement.removeEventListener('timeupdate', handleTimeUpdate);
                audioElement.removeEventListener('ended', nextChange);
                audioElement.removeEventListener('canplay', audioCanplayChange);
            };
        }
    }, []);

    const caniStoreChange = (item) => {
        console.log('caniStoreChange', roomInfo?.owner);

        window.open(
            `https://canistore.app/#/itemInfo?canistoreId=${item.oss_file_info[0]
                ?.space_canister_id}&userId=${roomInfo?.owner.toString()}`,
            '_blank',
        );
    };

    const donateChange = () => {
        console.log('donateChange');
    };

    const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (mode === 'live') {
            return;
        }

        const audioElement = audioRef.current;

        if (!audioElement || !audioElement.duration) {
            console.error('Audio element is not ready or duration is unavailable.');
            return;
        }

        const rect = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const width = rect.width;

        const clickProgress = clickX / width;
        console.log('Click Progress Percentage:', clickProgress);

        const newTime = clickProgress * audioElement.duration;
        audioElement.currentTime = newTime;

        playChange();
        console.log('New Audio Time:', newTime);
    };

    return (
        <>
            <div className="relative mt-5 flex h-[calc(100vh-250px)] w-full flex-col overflow-hidden md:h-[calc(100vh-250px)] md:pb-[0px]">
                <div className="relative z-10 flex h-full w-full">
                    <div className="flex w-full flex-col items-start px-[0px] md:mt-[50px] md:flex-row md:px-[32px]">
                        {roomInfo && (pathname.includes('/play') || pathname.includes('/live')) && (
                            <div className="mb-[10px] ml-[20px] mt-[15px] flex w-full flex-shrink-0 items-center md:ml-[30px] md:hidden">
                                <div className="relative flex h-[40px] w-[40px] items-center justify-center overflow-hidden rounded-[8px]">
                                    {roomInfo.image[0] && roomInfo.image[0].includes('http') ? (
                                        <img src={roomInfo.image[0]} className="h-full w-full" />
                                    ) : (
                                        <img src={coverDefaultSvg} className="h-full w-full" />
                                    )}
                                    {isPlaying && (
                                        <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black/50">
                                            <div className="loading relative top-[5px] !hidden md:!flex"></div>
                                            <div className="loading2 relative top-[5px] !flex md:!hidden"></div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center">
                                    <div className="ml-[12px] font-['Inter-new'] text-[20px] font-bold leading-[28px] text-[#50d955]">
                                        {roomInfo.name}
                                    </div>
                                </div>
                            </div>
                        )}

                        <img
                            className={`absolute bottom-0 left-0 flex h-full w-full object-cover md:hidden ${
                                pathname.includes('/play') && 'hidden'
                            }`}
                            src={liveBgMSvg}
                            alt=""
                        />

                        <div
                            className={`animate__animated relative z-[2] mt-[10px] w-full flex-col items-center px-[15px] ${
                                handover === 2
                                    ? 'animate__slideInDown flex'
                                    : 'animate__slideOutUp hidden'
                            }`}
                        >
                            <div
                                onClick={() => setHandover(1)}
                                className="flex h-5 w-[101px] items-center justify-center rounded-lg bg-[rgba(255,255,255,.10)]"
                            >
                                <img className="h-2 rotate-180" src={scrollSvg} alt="" />
                                <div className="ml-[6px] text-center font-['Inter-new'] text-[11px] font-normal leading-[11px] text-[#50D955]">
                                    playlist
                                </div>
                            </div>
                        </div>

                        {/* music list */}
                        <div
                            className={`animate__animated b-tran relative ml-4 w-[calc(100%-32px)] flex-1 flex-shrink-0 overflow-hidden rounded-[22px] md:mx-0 md:w-auto ${
                                handover === 1
                                    ? 'animate__slideInDown flex'
                                    : 'animate__slideOutUp hidden'
                            } ${pathname.includes('/live') && 'b-tran2 !ml-0 w-full'}`}
                        >
                            <div
                                className={`relative z-10 flex h-full w-full flex-col rounded-[18px] bg-[#001509] ${
                                    pathname.includes('/live') && 'bg-transparent'
                                } aaa`}
                            >
                                <img
                                    className={`absolute left-0 top-0  flex h-full w-full object-cover ${
                                        pathname.includes('/live') && 'hidden'
                                    } bbb`}
                                    src={licensingProtocolBgImg}
                                    alt=""
                                />
                                <div
                                    className={`bg-music absolute left-0 top-0 h-full w-full ${
                                        pathname.includes('/live') && 'hidden'
                                    } ccc`}
                                ></div>

                                {/* <div className="z-50 bg-red-500 text-white">{mode}</div> */}

                                {mode === 'play' && (
                                    <>
                                        <div className="ml-[16px] mt-[16px] font-['Inter-new'] text-[16px] font-bold text-[#50d955] opacity-60 md:ml-[32px] md:mt-[32px] md:text-2xl">
                                            Music in Channel
                                        </div>

                                        <div className="scroll relative z-10  mt-[16px] flex h-[calc(100%)] max-h-[calc(100vh-320px)] w-full flex-col overflow-y-scroll md:mt-[32px] md:max-h-[calc(100vh-450px)]">
                                            {musicList.current.length ? (
                                                <>
                                                    {musicList.current.map((item, index) => (
                                                        <div
                                                            className={cn(
                                                                'flex h-[60px] flex-shrink-0 cursor-pointer items-center duration-200 md:h-[80px] md:px-[32px]',
                                                                index === playIndex.current &&
                                                                    `custom-gradient2`,
                                                            )}
                                                            key={index}
                                                        >
                                                            <div
                                                                onClick={() => {
                                                                    modeIsPlayPlaying(item, index);
                                                                }}
                                                                className="flex flex-1 items-center"
                                                            >
                                                                <div className="ml-[22px] font-['Inter-new'] text-[13px] font-medium text-zinc-200 md:ml-0">
                                                                    {index < 9
                                                                        ? `0${index + 1}`
                                                                        : index + 1}
                                                                </div>
                                                                <div className="ml-[10px] h-[48px] w-[48px] flex-shrink-0 overflow-hidden rounded-full md:ml-[36px] md:h-[50px] md:w-[50px]">
                                                                    {item.image.includes('http') ? (
                                                                        <img
                                                                            className="h-full w-full object-cover"
                                                                            src={item.image}
                                                                            alt={item.image}
                                                                        />
                                                                    ) : (
                                                                        <img
                                                                            className="h-full w-full"
                                                                            src={coverDefaultSvg}
                                                                            alt="Cover"
                                                                        />
                                                                    )}
                                                                </div>
                                                                <div className="ml-[10px] flex flex-1 flex-col md:ml-[19px] md:flex-row">
                                                                    <div className="flex max-w-[95px] flex-shrink-0 overflow-hidden truncate font-['Inter-new'] text-[14px] font-medium text-[#E2E7E9] md:hidden md:w-[150px] md:max-w-none md:text-[20px] md:text-white">
                                                                        <MarqueeText
                                                                            text={item.name}
                                                                            maxWidth={80}
                                                                        />
                                                                    </div>
                                                                    <div className="hidden w-[150px] max-w-none flex-shrink-0 overflow-hidden truncate font-['Inter-new'] text-[20px] font-medium text-white md:flex">
                                                                        <MarqueeText
                                                                            text={item.name}
                                                                            maxWidth={150}
                                                                        />
                                                                    </div>
                                                                    <div className="ml-0 max-w-[95px] truncate font-['Inter-new'] text-[14px] font-normal text-[#B7B7B7] md:ml-[32px] md:w-[230px] md:max-w-none md:text-[16px] md:text-zinc-200">
                                                                        {item.artist_name}
                                                                    </div>
                                                                </div>
                                                                <div className="font-['Inter-new'] text-[14px] font-medium text-zinc-200 md:text-[16px]">
                                                                    {formatDuration(
                                                                        Number(item.duration),
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <Tooltip
                                                                placement="left"
                                                                title={
                                                                    <div className="flex flex-col">
                                                                        <div className="text-right font-['Inter-new'] text-xs font-normal text-white">
                                                                            Stream Source:
                                                                            <br />
                                                                            {item.oss_file_info[0]?.oss_canister_id.toString() ||
                                                                                ''}
                                                                        </div>
                                                                        {/* <div className="text-right opacity-60">
                                                                            <span className="font-['Inter-new'] text-[10px] font-normal text-white">
                                                                                Canistore -{' '}
                                                                                {item.oss_file_info[0]?.space_canister_id.toString() ||
                                                                                    ''}
                                                                            </span>
                                                                        </div> */}
                                                                    </div>
                                                                }
                                                            >
                                                                <div className="group ml-[12px] cursor-pointer md:ml-[32px]">
                                                                    <img
                                                                        className="flex group-hover:hidden"
                                                                        src={infoSvg}
                                                                        alt=""
                                                                    />
                                                                    <img
                                                                        className="hidden group-hover:flex"
                                                                        src={infoHoverSvg}
                                                                        alt=""
                                                                    />
                                                                </div>
                                                            </Tooltip>

                                                            <Tooltip
                                                                placement="bottom"
                                                                title={
                                                                    <div className=" flex flex-col px-[10px] py-[5px]">
                                                                        <p
                                                                            onClick={() => {
                                                                                caniStoreChange(
                                                                                    item,
                                                                                );
                                                                            }}
                                                                            className="cursor-pointer text-[16px] font-medium text-white duration-150 hover:text-[#50D955]"
                                                                        >
                                                                            CaniStore
                                                                        </p>
                                                                        <p
                                                                            onClick={donateChange}
                                                                            className="mt-[10px] cursor-pointer text-[16px] font-medium text-white duration-150 hover:text-[#50D955]"
                                                                        >
                                                                            Donate
                                                                        </p>
                                                                    </div>
                                                                }
                                                            >
                                                                <div className="group ml-[15px] mr-[15px] inline-flex h-[37px] cursor-pointer items-center justify-center md:ml-[32px] md:mr-0">
                                                                    <img
                                                                        className="flex group-hover:hidden"
                                                                        src={moreSvg}
                                                                        alt=""
                                                                    />
                                                                    <img
                                                                        className="hidden group-hover:flex"
                                                                        src={moreHoverSvg}
                                                                        alt=""
                                                                    />
                                                                </div>
                                                            </Tooltip>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                Array.from({ length: 10 }).map((_, index) => (
                                                    <div
                                                        className="flex h-[60px] flex-shrink-0 items-center duration-200"
                                                        key={index}
                                                    >
                                                        <div className="ml-[10px] font-['Inter-new'] text-[13px] font-medium text-zinc-200 md:ml-[32px]">
                                                            {index < 9
                                                                ? `0${index + 1}`
                                                                : index + 1}
                                                        </div>
                                                        <div className="ml-[10px] h-[46px] w-[46px] flex-shrink-0 overflow-hidden rounded-full md:ml-[36px] md:h-[50px] md:w-[50px]">
                                                            <Skeleton.Button
                                                                className="!h-full !w-full"
                                                                active
                                                            />
                                                        </div>
                                                        <div className="ml-[13px] flex-1 truncate font-['Inter-new'] text-sm font-medium text-white md:ml-[19px] md:mr-[30px]">
                                                            <Skeleton.Input
                                                                active
                                                                className="!w-full !min-w-0"
                                                            />
                                                        </div>
                                                        <div className="ml-[13px] flex-1 truncate font-['Inter-new'] text-sm font-normal text-zinc-200 md:ml-0 md:mr-[30px] md:w-[215px] md:flex-none">
                                                            <Skeleton.Input
                                                                active
                                                                className="!w-full !min-w-0"
                                                            />
                                                        </div>
                                                        <div className="ml-[13px] flex-1 font-['Inter-new'] text-sm font-medium text-zinc-200 md:ml-0 md:w-[215px] md:flex-none">
                                                            <Skeleton.Input
                                                                className="!w-full !min-w-0"
                                                                active
                                                            />
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}

                                {mode === 'live' && (
                                    <>
                                        <div className="absolute bottom-0 left-0 hidden w-full items-end md:flex md:h-[100%]">
                                            <img
                                                className="absolute top-[15%] h-[100%] w-full object-cover"
                                                src={liveBgSvg}
                                                alt=""
                                            />
                                        </div>

                                        <div className="relative flex  h-[calc(100vh-350px)] flex-col md:h-[calc(100vh-352px)]">
                                            <div className="relative z-10 mt-[16px] flex w-full justify-between md:mt-[32px] ">
                                                <div className="ml-[16px] hidden font-['Inter-new'] text-[16px] font-bold text-[#50d955] opacity-60 md:ml-[32px] md:flex md:text-2xl">
                                                    Title
                                                </div>

                                                {musicPlay.current && (
                                                    <div className="relative mr-[16px] hidden h-[32px] w-[32px] items-center justify-center rounded-full bg-[#50D955]/10 md:mr-[32px] md:flex">
                                                        <Tooltip
                                                            placement="left"
                                                            title={
                                                                <div className="flex flex-col">
                                                                    <div className="text-right font-['Inter-new'] text-xs font-normal text-white">
                                                                        Stream Source:
                                                                        <br />
                                                                        {musicPlay.current.oss_file_info[0]?.oss_canister_id.toString() ||
                                                                            ''}
                                                                    </div>
                                                                    <div className="text-right opacity-60">
                                                                        <span className="font-['Inter-new'] text-[10px] font-normal text-white">
                                                                            Canistore -{' '}
                                                                            {musicPlay.current.oss_file_info[0]?.space_canister_id.toString() ||
                                                                                ''}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            }
                                                        >
                                                            <div className="h-[24px] w-[24px] cursor-pointer">
                                                                <img src={info2Svg} alt="" />
                                                            </div>
                                                        </Tooltip>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center md:top-[-32px]">
                                                {musicPlay.current && (
                                                    <>
                                                        <div className="flex h-[270px] w-[270px] flex-shrink-0 items-center justify-center rounded-full bg-[#50D955]/10 md:h-[33vh] md:w-[33vh]">
                                                            <div
                                                                className={`relative flex h-[240px] w-[240px] items-center justify-center overflow-hidden rounded-full bg-[#001509] md:h-[31vh] md:w-[31vh] ${
                                                                    isCanplayChange &&
                                                                    isPlay.current &&
                                                                    'animate-spin duration-5000'
                                                                }`}
                                                            >
                                                                {musicPlay.current.image.includes(
                                                                    'http',
                                                                ) ? (
                                                                    <img
                                                                        className="h-full w-full"
                                                                        src={
                                                                            musicPlay.current.image
                                                                        }
                                                                        alt=""
                                                                    />
                                                                ) : (
                                                                    <div className="relative flex h-full w-full items-center justify-center">
                                                                        <i className="absolute left-[30px] h-2 w-2 flex-shrink-0 rounded-full bg-[#50D955]"></i>
                                                                        <img
                                                                            className="h-[100%] w-[100%] flex-shrink-[1]"
                                                                            src={coverDefaultSvg}
                                                                            alt=""
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* <div className="absolute h-[100px] w-[100px] rounded-full bg-black md:h-[120px] md:w-[120px]"></div>
                                                                <div className="absolute h-[8px] w-[8px] rounded-full bg-[#50D955] md:h-[10px] md:w-[10px]"></div> */}
                                                            </div>
                                                        </div>
                                                        <div className="mt-[24px] flex text-[32px] font-bold text-white md:hidden">
                                                            {musicPlay.current.name}
                                                        </div>
                                                        <div className="flex text-right md:hidden">
                                                            <span className="flex items-center font-['Inter-new'] text-[16px] font-normal text-[#C2CFD6]">
                                                                Canistore -{' '}
                                                                {musicPlay.current.oss_file_info[0]?.space_canister_id.toString() ||
                                                                    ''}
                                                                <div className="hidden md:flex">
                                                                    <Tooltip
                                                                        placement="left"
                                                                        title={
                                                                            <div className="relative flex flex-col">
                                                                                <div className="text-right font-['Inter-new'] text-xs font-normal text-white">
                                                                                    Stream Source:
                                                                                    <br />
                                                                                    {musicPlay.current.oss_file_info[0]?.oss_canister_id.toString() ||
                                                                                        ''}
                                                                                </div>
                                                                                <div className="text-right opacity-60">
                                                                                    <span className="font-['Inter-new'] text-[10px] font-normal text-white">
                                                                                        Canistore -{' '}
                                                                                        {musicPlay.current.oss_file_info[0]?.space_canister_id.toString() ||
                                                                                            ''}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        }
                                                                    >
                                                                        <div className="ml-[10px] h-[18px] w-[18px] cursor-pointer">
                                                                            <img
                                                                                src={info2Svg}
                                                                                alt=""
                                                                            />
                                                                        </div>
                                                                    </Tooltip>
                                                                </div>
                                                                <div className="flex md:hidden">
                                                                    <div
                                                                        onClick={() => {
                                                                            setInfoShow(true);
                                                                        }}
                                                                        className="ml-[10px] h-[18px] w-[18px] cursor-pointer"
                                                                    >
                                                                        <img
                                                                            src={info2Svg}
                                                                            alt=""
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* chart list */}
                        <div
                            className={`animate__animated animate__slideInUp relative z-10 ml-[15px] mt-[15px] hidden w-[calc(100vw-30px)] flex-shrink-0 flex-col md:ml-[24px] md:mt-0 md:!flex md:flex-[0.45] ${
                                handover === 2 ? 'animate__slideInUp !flex' : 'hidden'
                            }`}
                        >
                            <div className="b-tran overflow-hidden rounded-[22px]">
                                <div className="relative z-10 flex h-full w-full flex-col rounded-[16px] bg-[#001509]">
                                    <img
                                        className="absolute left-0 top-0 h-full w-full object-cover"
                                        src={licensingProtocolBgImg}
                                        alt=""
                                    />
                                    <div className="bg-chat absolute left-0 top-0 h-full w-full"></div>

                                    <div className="ml-[16px] mt-[16px] font-['Inter-new'] text-[16px] font-bold text-[#50d955] opacity-60 md:ml-[32px] md:mt-[32px] md:text-2xl">
                                        Chat
                                    </div>

                                    <div className="scroll relative z-10 mb-[10px] mt-[20px] flex h-[calc(100vh-430px)] flex-col overflow-y-scroll px-[20px] md:h-[calc(100vh-547px)] md:px-[32px]">
                                        {chattingList ? (
                                            <>
                                                {chattingList.length ? (
                                                    chattingList.map((item, index) => (
                                                        <div
                                                            className={`mb-[20px] flex w-[80%] flex-col duration-200 ${
                                                                activeProvider?.principal &&
                                                                activeProvider?.principal ===
                                                                    item.token &&
                                                                'ml-auto mr-[15px]'
                                                            }`}
                                                            key={index}
                                                        >
                                                            <div
                                                                className={`flex w-full flex-shrink-0 items-center justify-between`}
                                                            >
                                                                <div
                                                                    className={`order-1 font-['Inter-new'] text-[16px] font-normal text-white ${
                                                                        activeProvider?.principal &&
                                                                        activeProvider?.principal ===
                                                                            item.token &&
                                                                        'order-2'
                                                                    }`}
                                                                >
                                                                    {dealPid(item.token)}
                                                                </div>
                                                                <div
                                                                    className={`order-2 ml-[21px] font-['Inter-new'] text-[12px] font-normal text-white/40  ${
                                                                        activeProvider?.principal &&
                                                                        activeProvider?.principal ===
                                                                            item.token &&
                                                                        'order-1'
                                                                    }`}
                                                                >
                                                                    {item.create_time}
                                                                </div>
                                                            </div>
                                                            <div
                                                                className={`mt-[10px] w-[100%] rounded-[10px] bg-[#476685] px-[20px] py-[10px] text-[14px] text-white duration-200 md:text-[16px] ${
                                                                    activeProvider?.principal &&
                                                                    activeProvider?.principal ===
                                                                        item.token &&
                                                                    '!bg-[#2dd233]'
                                                                }`}
                                                            >
                                                                <p>{item.message}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className='mt-[40%] text-center font-["Inter-new"] text-[18px] font-normal text-zinc-400'>
                                                        No Data
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            Array.from({ length: 5 }).map((_, index) => (
                                                <div
                                                    className={`mb-[20px] flex w-[60%] flex-col duration-200`}
                                                    key={index}
                                                >
                                                    <div className={`flex w-full`}>
                                                        <div className="h-[13px] font-['Inter-new'] text-[13px] font-normal text-white">
                                                            <Skeleton.Input
                                                                active
                                                                className="!h-[13px] min-w-0"
                                                            />
                                                        </div>
                                                        <div className="ml-[21px] h-[13px] font-['Inter-new'] text-[13px] font-normal text-zinc-400">
                                                            <Skeleton.Input
                                                                active
                                                                className="!h-[13px] min-w-0"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`mt-[10px] w-[100%] rounded-[10px] bg-slate-500 px-[20px] py-[10px] duration-200`}
                                                    >
                                                        <Skeleton.Input
                                                            className="!w-full"
                                                            active
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="relative mx-[4px] mt-[16px] flex overflow-hidden rounded-[16px] bg-[#fff]/10 md:mt-[24px]">
                                {!activeProvider?.principal && (
                                    <div
                                        className="absolute left-0 top-0 h-full w-full"
                                        onClick={() => {
                                            if (!activeProvider?.principal) {
                                                message.warning('Please connect');
                                            }
                                        }}
                                    ></div>
                                )}

                                <input
                                    placeholder="little chat here..."
                                    className="h-[50px] flex-1 bg-transparent indent-[30px] font-['Inter-new'] text-sm font-normal text-zinc-200 outline-none duration-200 md:h-[70px]"
                                    onChange={(e) => setChattingText(e.target.value)}
                                    type="text"
                                    disabled={!activeProvider?.principal}
                                />

                                <img
                                    onClick={submitChatting}
                                    className="mr-[24px] w-[24px] md:mr-[32px] md:w-[36px]"
                                    src={sendSvg}
                                    alt=""
                                />
                            </div>
                        </div>

                        <div
                            className={`animate__animated relative z-[2] mb-[15px] mt-[5px] flex w-full flex-col items-center px-[15px] md:hidden ${
                                handover === 1
                                    ? 'animate__slideInUp flex'
                                    : 'animate__slideOutDown hidden'
                            }`}
                        >
                            {/* <div className="flex h-[37px] w-full items-center rounded-xl bg-gradient-to-b from-purple-950 to-blue-900">
                                <img className="ml-[25px] w-[19px]" src={heartSvg} alt="" />
                                <div className="ml-[19px] flex flex-1 font-['Inter-new'] text-[10px] font-normal text-white">
                                    Live stream vibes! Hear a song you love?
                                    <br />
                                    Tap the heart to queue it up next!
                                </div>
                            </div> */}

                            <div
                                onClick={() => setHandover(2)}
                                className="flex h-5 w-[101px] items-center justify-center rounded-lg bg-[#fff]/10"
                            >
                                <img className="h-2" src={scrollSvg} alt="" />
                                <div className="ml-[6px] text-center font-['Inter-new'] text-[11px] font-normal leading-[11px] text-[#50D955]">
                                    chat
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* audio tool */}
            <div className="custom-gradient fixed bottom-0 left-0 z-10 flex h-[72px] w-full md:h-[120px]">
                <div
                    className={`absolute h-[2px] w-full rounded-[4px] bg-[#1EB840]/40 md:hidden ${
                        mode === 'live' && '!hidden'
                    }`}
                >
                    <div
                        className="absolute left-0 top-0 flex h-full items-center justify-center bg-[#1EB840]"
                        style={{ width: `${progress * 100}%` }}
                    ></div>
                    <img
                        className="absolute -top-[10px] -ml-[12px] h-[24px] w-[24px] flex-shrink-0"
                        style={{ left: `${progress * 100}%` }}
                        src={dianSvg}
                        alt=""
                    />
                </div>

                <div className="relative z-10 ml-[8px] flex w-full items-center md:ml-[32px]">
                    {!musicPlay.current ? (
                        <>
                            <div className="flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#516B85] md:h-[60px] md:w-[60px]">
                                <img
                                    className="h-[25px] w-[24px] animate-spin md:h-[45px] md:w-[43px]"
                                    src={loadingSvg}
                                    alt=""
                                />
                            </div>
                            <div className="ml-[21px] font-['Inter-new'] text-2xl font-medium text-white">
                                -- --
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center">
                                <div className="flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#001509] md:h-[60px] md:w-[60px]">
                                    {musicPlay.current.image.includes('http') ? (
                                        <img
                                            className="h-full w-full"
                                            src={musicPlay.current.image}
                                            alt=""
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <img
                                                className="h-[70%] w-[70%] flex-shrink-0 "
                                                src={coverDefaultSvg}
                                                alt=""
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="ml-[21px] hidden font-['Inter-new'] text-2xl font-medium text-white md:flex">
                                    {musicPlay.current.name} - {musicPlay.current.artist_name}
                                </div>
                                <div className="ml-[15px] flex flex-col font-['Inter-new'] font-medium text-white md:hidden">
                                    <span className="font-['Inter-new'] text-[13px] font-medium text-white">
                                        {musicPlay.current.name}
                                    </span>
                                    <span className="font-['Inter-new'] text-[11px] font-medium text-zinc-400">
                                        {musicPlay.current.artist_name}
                                    </span>
                                </div>
                            </div>
                            <div className="ml-auto mr-[15px] flex items-center md:mr-[32px]">
                                {mode === 'play' && (
                                    <div className="flex">
                                        {!isPlay.current ? (
                                            <img
                                                onClick={playChange}
                                                className="h-[42px] w-[42px] cursor-pointer"
                                                src={playSvg}
                                                alt=""
                                            />
                                        ) : (
                                            <div className="relative flex items-center justify-center">
                                                <img
                                                    onClick={pauseChange}
                                                    className="relative z-10 h-[42px] w-[42px] cursor-pointer"
                                                    src={pauseSvg}
                                                    alt=""
                                                />
                                                {/* <div className="circle-breath absolute"></div> */}
                                            </div>
                                        )}

                                        <img
                                            onClick={nextChange}
                                            className="ml-[20px] h-[42px] w-[42px] cursor-pointer"
                                            src={nextSvg}
                                            alt=""
                                        />
                                    </div>
                                )}

                                {mode === 'live' && (
                                    <div className="flex">
                                        {!isPlay.current ? (
                                            <img
                                                onClick={playChange}
                                                className="h-[42px] w-[42px] cursor-pointer"
                                                src={playSvg}
                                                alt=""
                                            />
                                        ) : (
                                            <div className="relative flex items-center justify-center">
                                                {isCanplayChange ? (
                                                    <div>
                                                        <img
                                                            onClick={pauseChange}
                                                            className={`!isCanplayChange && 'animate-spin' relative z-10  h-[42px] w-[42px] cursor-pointer`}
                                                            src={pauseSvg}
                                                            alt=""
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center">
                                                        <img
                                                            onClick={pauseChange}
                                                            className={`!isCanplayChange && 'animate-spin' relative z-10  h-[42px] w-[42px] cursor-pointer`}
                                                            src={pause2Svg}
                                                            alt=""
                                                        />
                                                    </div>
                                                )}

                                                {/* <div className="circle-breath absolute"></div> */}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {mode === 'live' && (
                                    <>
                                        {!isPlay.current ? (
                                            <div className="ml-[10px] text-[12px] text-[#C2CFD6] md:ml-[20px] md:mr-[10px] md:text-[16px]">
                                                No Stream
                                            </div>
                                        ) : isCanplayChange ? (
                                            <div className="ml-[10px] flex flex-col md:ml-[20px]">
                                                <div className="flex items-center">
                                                    <div className="h-2 w-2 rounded-full bg-red-600" />
                                                    <div className="ml-[9px] flex flex-col font-['Inter-new'] text-[14px] font-normal text-zinc-200 md:text-[16px]">
                                                        LIVE
                                                    </div>
                                                </div>
                                                <div className="font-['Inter-new'] text-[12px] font-normal text-[#c2cfd6] md:text-[14px]">
                                                    Connected
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="ml-[10px] text-[12px] text-[#C2CFD6] md:ml-[20px] md:mr-[10px] md:text-[16px]">
                                                Buffering...
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="ml-[20px] hidden items-center md:flex">
                                    {mode === 'play' && (
                                        <div className="w-[42px] font-['Inter-new'] text-base font-light text-[#e2e6e8]">
                                            {formatDuration(currentTime)}
                                        </div>
                                    )}
                                    <div
                                        className="relative mx-[21px] h-[4px] w-[303px] rounded-[4px] bg-[#1EB840]/40"
                                        onClick={handleClick}
                                    >
                                        <div
                                            className="absolute left-0 top-0 flex h-full items-center justify-center bg-[#1EB840]"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                        <img
                                            className="absolute -top-[10px] -ml-[12px] h-[24px] w-[24px] flex-shrink-0"
                                            style={{ left: `${progress}%` }}
                                            src={dianSvg}
                                            alt=""
                                        />
                                    </div>
                                    {mode === 'play' && (
                                        <div className="font-['Inter-new'] text-base font-light text-[#e2e6e8]">
                                            {formatDuration(
                                                Number(musicPlay.current.duration[0]) || 0,
                                            )}
                                        </div>
                                    )}
                                    {mode === 'live' && (
                                        <div className="flex items-center justify-end">
                                            <div className="text-center font-['Inter-new'] text-[16px] font-normal leading-[16px] text-zinc-200">
                                                Stream <br />
                                                Connected
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="ml-[137px] hidden items-center md:flex">
                                    <img
                                        onClick={playChange}
                                        className="mr-[16px] h-[32px] w-[32px]"
                                        src={volumeSvg}
                                        alt=""
                                    />
                                    <Slider
                                        className="slider-volume w-[100px]"
                                        onChange={(e) => setVolumeChange(e)}
                                        value={volume}
                                    />
                                    <div className="ml-[15px] w-[50px] text-right font-['Inter-new'] text-base font-light text-zinc-200">
                                        {volume}%
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="hidden">
                <audio controls id="audioRef" ref={audioRef}></audio>
            </div>

            {infoShow && musicPlay.current && (
                <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center ">
                    <div className="relative flex h-[130px] w-[260px] flex-col items-center justify-center  rounded-2xl bg-gradient-to-b from-[#50d955] to-white shadow">
                        <img
                            onClick={() => {
                                setInfoShow(false);
                            }}
                            className="absolute right-[12px] top-[12px]"
                            src={closeSvg}
                            alt=""
                        />
                        <div className="text-center font-['Inter-new'] text-base font-bold text-black">
                            Stream Source
                        </div>
                        <div className="mt-2 text-center font-['Inter-new'] text-sm font-normal text-black">
                            {musicPlay.current.oss_file_info[0]?.oss_canister_id.toString() || ''}
                        </div>
                        <div className="mt-1 text-center font-['Inter-new'] text-xs font-normal text-black opacity-60">
                            Canistore -{' '}
                            {musicPlay.current.oss_file_info[0]?.space_canister_id.toString() || ''}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Room;
