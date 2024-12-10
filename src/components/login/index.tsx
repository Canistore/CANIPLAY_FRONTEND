import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer } from 'antd';
import { useConnect } from '@connect2ic/react';
import { dealPid } from '@/utils/common';
import closeSvg from '@/assets/images/close.svg';
import coverDefaultSvg from '@/assets/images/cover-default.svg';
import iiSvg from '@/assets/images/ii.svg';
import loginBgSvg from '@/assets/images/login-bg.png';
import loginoutSvg from '@/assets/images/loginout.png';
import logoSvg from '@/assets/images/logo.png';
import nfidSvg from '@/assets/images/nfid.png';
import outloginSvg from '@/assets/images/outlogin.svg';
import playSvg from '@/assets/images/play2.svg';
import plugSvg from '@/assets/images/plug.png';
import stoicSvg from '@/assets/images/stoic.png';
import userSvg from '@/assets/images/user.svg';
import { useStoresStore } from '@/stores/stores';
import { ConnectType } from '@/types/identity';

function Login() {
    const { pathname } = useLocation();

    const { connect } = useConnect();

    const [principal, setPrincipal] = useState<string>('');

    const [isShowLogin, setIsShowLogin] = useState<boolean>(false);

    const roomInfo = useStoresStore((s) => s.roomInfo);
    const isPlaying = useStoresStore((s) => s.isPlaying);

    // connect2ic
    const { isConnected, disconnect } = useConnect({
        // Logout
        onDisconnect: () => {},
        // Login success
        onConnect: async (connected: any) => {
            setPrincipal(connected.principal);
            setIsShowLogin(false);
        },
    });

    const loginInit = (mode: ConnectType) => {
        let anchor: string = mode;
        if (anchor === 'me') anchor = (window as any).icx ? 'icx' : 'astrox';
        connect(anchor);
    };

    return (
        <>
            <div className="mx-[24px] mt-[30px] flex w-full items-center justify-between md:mx-[32px] md:mt-[32px]">
                <div className="flex ">
                    <div className={`flex`}>
                        <Link to="/">
                            <img
                                className="h-[48px] w-[68px] md:h-[84px] md:w-[117px]"
                                src={logoSvg}
                                alt=""
                            />
                        </Link>
                        <div className="ml-[16px] flex flex-col md:ml-[32px]">
                            <span className="font-['Inter-new'] text-[16px] font-extrabold text-white md:text-[28px]">
                                The World's First
                            </span>
                            <span className="font-['Inter-new'] text-[14px] font-normal text-white md:text-xl">
                                Blockchain Broadcast Station
                            </span>
                        </div>
                    </div>

                    {/* <div className={`flex md:hidden ${pathname === '/' && '!hidden'}`}>123</div> */}

                    {roomInfo && (pathname.includes('/play') || pathname.includes('/live')) && (
                        <div className="hidden items-center justify-center md:ml-[30px] md:flex">
                            <div className="relative flex h-[80px] w-[80px] items-center justify-center overflow-hidden rounded-2xl md:h-[100px] md:w-[100px]">
                                {roomInfo.image[0] && roomInfo.image[0].includes('http') ? (
                                    <img src={roomInfo.image[0]} className="h-full w-full" />
                                ) : (
                                    <img src={coverDefaultSvg} className="h-full w-full" />
                                )}
                                {isPlaying && (
                                    <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black/50">
                                        <div className="loading relative top-[5px]"></div>
                                    </div>
                                )}
                            </div>

                            <div className="ml-[24px] flex flex-col">
                                <div className="font-['Inter-new'] text-[28px] font-bold text-[#50d955]">
                                    {roomInfo.name}
                                </div>
                                {/* <div className="mt-[8px] font-['Inter-new'] text-xl font-normal text-[#c1cfd6]">
                                    22 listeners
                                </div> */}
                            </div>
                        </div>
                    )}
                </div>

                <div className="hidden h-[56px] items-center justify-center rounded-[10px] bg-[#FFF]/10 px-[20px] md:flex">
                    {!isConnected ? (
                        <div className="flex h-[56px] items-center justify-center gap-[20px]">
                            <div className="font-['Inter-new'] text-sm font-normal text-white">
                                Sign in
                            </div>
                            <img
                                onClick={() => loginInit('ii')}
                                className="h-[17px] w-9 cursor-pointer"
                                src={iiSvg}
                                alt=""
                            />
                            <img
                                onClick={() => loginInit('stoic')}
                                className="h-[39px] w-[39px] cursor-pointer"
                                src={stoicSvg}
                                alt=""
                            />
                            {/* <img
                                onClick={() => loginInit('plug')}
                                className="h-[34px] w-9 cursor-pointer"
                                src={plugSvg}
                                alt=""
                            /> */}
                            <img
                                onClick={() => loginInit('nfid')}
                                className="w-9 cursor-pointer"
                                src={nfidSvg}
                                alt=""
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center text-[14px]">
                            <div className="flex flex-col text-base font-normal text-white">
                                <p className="text-base font-normal text-white">
                                    {dealPid(principal)}
                                </p>
                                <span className="font-['Inter-new'] text-xs font-normal text-neutral-400">
                                    Feel the Beat Within
                                </span>
                            </div>
                            <p
                                onClick={disconnect}
                                className="ml-[58px] h-[28px] w-[28px] cursor-pointer text-white"
                            >
                                <img src={loginoutSvg} alt="" />
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex md:hidden">
                    {!isConnected ? (
                        <div onClick={() => setIsShowLogin(true)} className="">
                            <img src={userSvg} alt="" />
                        </div>
                    ) : (
                        <div
                            onClick={() => {
                                disconnect();
                                setIsShowLogin(false);
                            }}
                            className=""
                        >
                            <img src={outloginSvg} alt="" />
                        </div>
                    )}
                </div>
            </div>
            {/* <div className="fixed left-0 top-0 z-50 flex h-6 w-full bg-green-600 md:hidden">
                {!isConnected ? (
                    <div
                        onClick={() => setIsShowLogin(true)}
                        className="flex w-full items-center justify-center text-center font-['Inter-new'] text-[12px] font-medium text-white"
                    >
                        Sign in
                    </div>
                ) : (
                    <div
                        onClick={() => setIsShowLogin(true)}
                        className="flex w-full items-center justify-between text-[14px]"
                    >
                        <div className="ml-[22px] text-center font-['Inter-new'] text-[12px] font-medium text-white">
                            {dealPid(principal)}
                        </div>
                        <p className="mr-[10px] w-[14px] cursor-pointer text-white">
                            <img src={loginoutMSvg} alt="" />
                        </p>
                    </div>
                )}
            </div> */}
            <Drawer
                placement="top"
                closable={false}
                onClose={() => setIsShowLogin(false)}
                open={isShowLogin}
                key="top"
                height="100vh"
                className="relative !bg-[#001509]"
            >
                <img
                    className="pointer-events-none absolute left-0 top-0 h-full w-full object-cover"
                    src={loginBgSvg}
                    alt=""
                />

                {isConnected ? (
                    <div className="z-[2] flex h-full flex-col items-center justify-start">
                        <img
                            onClick={() => setIsShowLogin(false)}
                            className="ml-auto mr-[18px] mt-[18px] h-[29px] w-[29px]"
                            src={closeSvg}
                            alt=""
                        />
                        <img className="mb-[30px] mt-[100px] w-[180px]" src={logoSvg} alt="" />
                        <div className="font-['Inter-new'] text-[15px] font-medium leading-snug text-white">
                            The World's First <br />
                            Blockchain Broadcast Station
                        </div>
                        <div className="mb-[100px] mt-auto flex w-full flex-col items-center px-[33px]">
                            <div className="mb-[65px] flex items-center border-b border-[#40609F] px-[12px] pb-[15px] font-['Inter-new'] text-xl font-normal text-green-600">
                                <img
                                    className="mr-[24px] h-[17px] w-9 cursor-pointer"
                                    src={iiSvg}
                                    alt=""
                                />
                                {dealPid(principal)}
                            </div>
                            <div
                                onClick={() => {
                                    disconnect();
                                    setIsShowLogin(false);
                                }}
                                className="flex h-14 w-full items-center justify-center rounded-xl border border-neutral-400"
                            >
                                <div className="font-['Inter-new'] text-base font-normal leading-normal text-white">
                                    Sign Out
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="z-[2] flex h-full flex-col items-center justify-start">
                        <img
                            onClick={() => setIsShowLogin(false)}
                            className="ml-auto mr-[18px] mt-[18px] h-[29px] w-[29px]"
                            src={closeSvg}
                            alt=""
                        />
                        <img className="mb-[30px] mt-[100px] w-[180px]" src={logoSvg} alt="" />
                        <div className="text-center font-['Inter-new'] text-[20px] font-medium leading-snug text-white">
                            The World's First <br />
                            Blockchain Broadcast Station
                        </div>
                        <div className="mb-[100px] mt-auto w-full">
                            <div
                                onClick={() => loginInit('ii')}
                                className="mx-[33px] flex h-14 items-center justify-center rounded-[16px] border border-[#C2CFD6] bg-[#fff]/10"
                            >
                                <img
                                    className="mr-[24px] h-[17px] w-9 cursor-pointer"
                                    src={iiSvg}
                                    alt=""
                                />
                                <div className="font-['Inter-new'] text-base font-normal leading-normal text-white">
                                    Internet Identity
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Drawer>
        </>
    );
}

export default Login;
