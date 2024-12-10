import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spin } from 'antd';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
// import type { MusicChannel, MusicChannelResult } from '@/api';
import backImg from '@/assets/images/back.svg';
import bannerM1Img from '@/assets/images/banner-m-1.png';
import bannerM2Img from '@/assets/images/banner-m-2.png';
import bannerM3Img from '@/assets/images/banner-m-3.png';
import banner1Img from '@/assets/images/banner-n-1.png';
import banner2Img from '@/assets/images/banner-n-2.png';
import banner3Img from '@/assets/images/banner-n-3.png';
import coverDefaultSvg from '@/assets/images/cover-default.svg';
import licensingImg from '@/assets/images/licensing.png';
import licensingProtocolBgImg from '@/assets/images/licensingProtocolBg.png';
import { useStoresStore } from '@/stores/stores';
import { getChannelList } from '../../canisters/canistore_platform';
import { MusicChannel } from '../../canisters/canistore_platform/canistore_platform.did.d';

const List = () => {
    const isPlaying = useStoresStore((s) => s.isPlaying);

    const [roomList, setRoomList] = useState<MusicChannel[]>([]);
    const [liveList, setLiveList] = useState<MusicChannel[]>([]);
    const [spinning, setSpinning] = useState<boolean>(false);

    const [isLive, setIsLive] = useState<boolean>(false);

    const seeAllLive = () => {
        setIsLive(!isLive);
    };

    const [isRoom, setIsRoom] = useState<boolean>(false);
    const seeAllRoom = () => {
        setIsRoom(!isRoom);
    };

    useEffect(() => {
        setSpinning(true);

        getChannelList()
            .then((res) => {
                const roomList: MusicChannel[] = [];
                const liveList: MusicChannel[] = [];
                res.map((item) => {
                    if (item?.category[0] && Object.keys(item?.category[0])[0] === 'Playlist') {
                        roomList.push(item);
                    }
                    if (item?.category[0] && Object.keys(item?.category[0])[0] === 'Radio') {
                        liveList.push(item);
                    }
                });

                setRoomList(roomList || []);
                setLiveList(liveList || []);
            })
            .finally(() => {
                setSpinning(false);
            });
    }, []);

    const Item = ({
        mode,
        item,
        more = false,
    }: {
        mode: 'play' | 'live';
        item: MusicChannel;
        more: boolean;
    }) => {
        return (
            <Link
                to={`/${mode}/${Number(item.id)}`}
                className={`relative mb-[20px] flex w-[40%] flex-shrink-0 cursor-pointer flex-col items-center justify-center md:mb-[48px] md:w-[23.5%] ${
                    more && '!w-full'
                }`}
                key={Number(item.id)}
            >
                <div className="relative w-full pt-[100%]">
                    <div className="absolute left-0 top-0 h-full w-full">
                        <div
                            className={`absolute left-0 top-0 hidden h-full w-full items-center justify-center bg-[#000]/40 ${
                                isPlaying === Number(item.id) && '!flex'
                            }`}
                        >
                            <div className="loading"></div>
                        </div>
                        <div className="boxShadow flex h-full w-full items-center justify-center overflow-hidden rounded-[16px] bg-[#001509]">
                            {item.image ? (
                                <img className="h-full w-full " src={item.image} alt="" />
                            ) : (
                                <img
                                    className="h-[100px] w-[100px] flex-shrink-[1] md:h-[280px] md:w-[280px]"
                                    src={coverDefaultSvg}
                                    alt=""
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-[9px] flex h-[24px] w-full items-center text-[14px] text-[#C2CFD6] md:mt-[19px] md:justify-center md:text-[20px]">
                    {item.name}
                </div>
            </Link>
        );
    };

    return (
        <>
            {!isLive && !isRoom && (
                <div className="scroll-none mt-[0px] flex w-screen flex-shrink-0 flex-col pl-[15px] pr-[15px] md:mt-[40px] md:max-h-[calc(100vh-152px)] md:w-[calc(100vw-120px)] md:overflow-y-scroll md:pl-[32px] md:pr-[32px]">
                    {/* <div className="mt-[39px] flex w-full flex-shrink-0 items-center px-[15px] md:hidden">
                <img className="w-[120px]" src={logoSvg} alt="" />
                <div className="ml-[25px] flex flex-col">
                    <span className="font-['Inter-new'] text-[15px] font-normal leading-[18px] text-white">
                        The World's First
                    </span>
                    <span className="font-['Inter-new'] text-[13px] font-normal leading-none text-white">
                        Blockchain Broadcast Station
                    </span>
                </div>
            </div> */}
                    <div className="mt-[25px] flex w-full flex-col md:mt-0 md:flex-row">
                        <div className="flex w-full max-w-[100vw] flex-shrink-0 overflow-hidden rounded-[16px] md:h-[250px] md:w-[808px]">
                            <Swiper
                                className="w-full"
                                pagination={{}}
                                modules={[Pagination, Navigation, Autoplay]}
                                spaceBetween={30}
                                autoplay={{ delay: 2500, disableOnInteraction: false }}
                                loop={true}
                            >
                                <SwiperSlide className="w-full">
                                    <Link
                                        to="https://canistore.io"
                                        target="_blank"
                                        className="w-full"
                                    >
                                        <img
                                            className="hidden w-full md:flex md:h-[250px]"
                                            src={banner1Img}
                                            alt=""
                                        />
                                        <img
                                            className="flex w-full md:hidden md:h-[250px]"
                                            src={bannerM1Img}
                                            alt=""
                                        />
                                    </Link>
                                </SwiperSlide>
                                <SwiperSlide className="w-full">
                                    <Link
                                        to="https://canisafe.app"
                                        target="_blank"
                                        className="w-full"
                                    >
                                        <img
                                            className="hidden w-full md:flex md:h-[250px]"
                                            src={banner2Img}
                                            alt=""
                                        />
                                        <img
                                            className="flex w-full md:hidden md:h-[250px]"
                                            src={bannerM2Img}
                                            alt=""
                                        />
                                    </Link>
                                </SwiperSlide>
                                <SwiperSlide className="w-full">
                                    <Link
                                        to="https://canistore.app"
                                        target="_blank"
                                        className="w-full"
                                    >
                                        <img
                                            className="hidden w-full md:flex md:h-[250px]"
                                            src={banner3Img}
                                            alt=""
                                        />
                                        <img
                                            className="flex w-full md:hidden md:h-[250px]"
                                            src={bannerM3Img}
                                            alt=""
                                        />
                                    </Link>
                                </SwiperSlide>
                            </Swiper>
                        </div>

                        <div className="relative mt-[15px] flex flex-1 flex-shrink-0 flex-col overflow-hidden rounded-[16px] px-[15px] py-[15px] md:ml-[24px] md:mt-0 md:h-[250px] md:px-[24px] md:py-[30px]">
                            <img
                                className="absolute left-0 top-0 h-full w-full object-cover"
                                src={licensingProtocolBgImg}
                                alt=""
                            />
                            <div className="flex items-center">
                                <img
                                    className="w-[24px] flex-shrink-0 md:w-[32px]"
                                    src={licensingImg}
                                    alt=""
                                />
                                <div className="ml-[10px] font-['Inter-new'] text-[14px] font-black text-[#50d955] md:ml-[20px] md:text-[24px]">
                                    CaniPLay v0.2
                                </div>
                            </div>
                            <div className="relative z-10 mt-[10px] w-full font-['Inter-new'] text-[12px] font-normal text-white md:mt-[18px] md:line-clamp-5 md:text-[18px]">
                                What is CaniPlay? CaniPlay is a revolutionary platform where artists
                                can share their music with a global audience in a unique way. Think
                                of it as a fusion between radio and streaming, where listeners vote
                                on what gets played, interact with artists, and discover new music.
                                <Link
                                    className="ml-1 text-green-400"
                                    to="https://canistore.io/faq/"
                                    target="_blank"
                                >
                                    FAQs
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="b-tran3 mb-[30px] mt-[12px] rounded-[24px] md:mt-[24px]">
                        <div className="relative flex flex-col overflow-hidden rounded-[18px] pb-[30px] pt-[16px] md:bg-[#001509] md:px-[32px] md:pb-[45px] md:pt-[32px]">
                            <img
                                className="absolute left-0 top-0 hidden h-full w-full object-cover md:flex"
                                src={licensingProtocolBgImg}
                                alt=""
                            />

                            <div className="scroll-none flex h-full flex-col ">
                                <div className="flex font-['Inter-new'] text-[16px] font-bold text-[#50d955] opacity-60 md:text-2xl">
                                    Radio Channels
                                    <div
                                        onClick={seeAllLive}
                                        className="ml-auto cursor-pointer font-['Inter-new'] text-[14px] font-normal text-[#50d955] opacity-60 md:text-xl"
                                    >
                                        See All
                                    </div>
                                </div>
                                <div className="mt-[6px] flex w-full md:mt-[30px]">
                                    {spinning && (
                                        <Spin
                                            className="fixed left-0 top-0 z-10 flex h-full w-full items-center justify-center bg-[#000]/10"
                                            size="large"
                                        />
                                    )}

                                    <div className="relative flex w-full justify-between md:min-h-[300px]">
                                        <div className="scroll-none flex w-full gap-[4%] pl-[2px] pt-[10px] md:flex-wrap md:gap-[2%] md:overflow-hidden md:px-[5px]">
                                            {liveList.slice(0, 8).map((item) => (
                                                <Item
                                                    mode="live"
                                                    key={Number(item.id)}
                                                    more={false}
                                                    item={item}
                                                ></Item>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-[15px] flex font-['Inter-new'] text-[16px] font-bold text-[#50d955] opacity-60 md:text-2xl">
                                    Playlists
                                    <div
                                        onClick={seeAllRoom}
                                        className="ml-auto cursor-pointer font-['Inter-new']  text-[14px] font-normal text-[#50d955] opacity-60 md:text-xl"
                                    >
                                        See All
                                    </div>
                                </div>
                                <div className="mt-[6px] flex w-full md:mt-[30px]">
                                    {spinning && (
                                        <Spin
                                            className="fixed left-0 top-0 z-10 flex h-full w-full items-center justify-center bg-[#000]/10"
                                            size="large"
                                        />
                                    )}

                                    <div className="relative flex w-full justify-between md:min-h-[300px]">
                                        <div className="scroll-none flex w-full gap-[4%] pl-[2px] pt-[10px] md:flex-wrap md:gap-[2%] md:overflow-hidden md:px-[5px]">
                                            {roomList.slice(0, 8).map((item) => (
                                                <Item
                                                    mode="play"
                                                    key={Number(item.id)}
                                                    more={false}
                                                    item={item}
                                                ></Item>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isLive && (
                <div className="mx-[16px] mt-[32px] flex w-full flex-col md:mx-[32px]">
                    <div className="flex items-center font-['Inter-new'] text-[24px] font-bold text-white md:text-[40px]">
                        <img
                            onClick={() => {
                                setIsRoom(false);
                                setIsLive(false);
                            }}
                            className="mr-[12px] h-[32px] w-[32px] cursor-pointer md:mr-[24px] md:h-[56px] md:w-[56px]"
                            src={backImg}
                            alt=""
                        />
                        Radio Channels
                    </div>

                    <div className="b-tran3 mb-[30px] mt-3 w-full rounded-[24px] md:mt-6">
                        <div className="relative flex flex-col overflow-hidden rounded-[18px] pb-[30px] pt-[16px] md:bg-[#001509] md:px-[10px] md:pb-[45px] md:pt-[32px]">
                            <img
                                className="absolute left-0 top-0 hidden h-full w-full object-cover md:flex"
                                src={licensingProtocolBgImg}
                                alt=""
                            />

                            <div className="grid w-full grid-cols-2 gap-x-[15px] md:grid-cols-4 md:flex-wrap md:gap-x-[32px] md:px-[20px]">
                                {liveList.map((item) => (
                                    <Item
                                        mode="live"
                                        key={Number(item.id)}
                                        item={item}
                                        more={true}
                                    ></Item>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isRoom && (
                <div className="mx-[16px] mt-[32px] flex w-full flex-col md:mx-[32px]">
                    <div className="flex items-center font-['Inter-new'] text-[24px] font-bold text-white md:text-[40px]">
                        <img
                            onClick={() => {
                                setIsRoom(false);
                                setIsLive(false);
                            }}
                            className="mr-[12px] h-[32px] w-[32px] cursor-pointer md:mr-[24px] md:h-[56px] md:w-[56px]"
                            src={backImg}
                            alt=""
                        />
                        Playlists
                    </div>

                    <div className="b-tran3 mb-[30px] mt-3 w-full rounded-[24px] md:mt-6">
                        <div className="relative flex flex-col overflow-hidden rounded-[18px] pb-[30px] pt-[16px] md:bg-[#001509] md:px-[10px] md:pb-[45px] md:pt-[32px]">
                            <img
                                className="absolute left-0 top-0 hidden h-full w-full object-cover md:flex"
                                src={licensingProtocolBgImg}
                                alt=""
                            />

                            <div className="grid w-full grid-cols-2 gap-x-[15px] md:grid-cols-4 md:flex-wrap md:gap-x-[32px] md:px-[20px]">
                                {roomList.map((item) => (
                                    <Item
                                        mode="play"
                                        key={Number(item.id)}
                                        item={item}
                                        more={true}
                                    ></Item>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default List;
