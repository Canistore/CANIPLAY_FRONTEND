import { Link, useLocation, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import homeHoverSvg from '@/assets/images/home-hover.svg';
import homeSvg from '@/assets/images/home.svg';
import musicHoverSvg from '@/assets/images/music-hover.svg';
import musicSvg from '@/assets/images/music.svg';
import { useStoresStore } from '@/stores/stores';

export default function Nav() {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const isPlaying = useStoresStore((s) => s.isPlaying);

    const openRoom = () => {
        if (!isPlaying) {
            message.warning("No, it's not playing");
        } else {
            navigate(`/play/${isPlaying}`);
        }
    };

    return (
        <div className="hidden h-full w-[120px] flex-shrink-0 bg-[#fff]/10 md:block">
            <div className="mt-[125px] flex flex-col items-center gap-[60px]">
                <Link
                    to="/"
                    className={`flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl border border-transparent duration-200 hover:border-[#50D955] ${
                        pathname === '/' && '!border-[#50D955]'
                    }`}
                >
                    <img
                        className="h-8 w-8"
                        src={pathname === '/' ? homeHoverSvg : homeSvg}
                        alt=""
                    />
                </Link>
                <div
                    onClick={openRoom}
                    className={`flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl border border-transparent duration-200 ${
                        (pathname.includes('/play') || pathname.includes('/live')) &&
                        '!border-[#50D955]'
                    }`}
                >
                    <img
                        className="h-8 w-8"
                        src={
                            pathname.includes('/play') || pathname.includes('/live')
                                ? musicHoverSvg
                                : musicSvg
                        }
                        alt=""
                    />
                </div>
            </div>
        </div>
    );
}
