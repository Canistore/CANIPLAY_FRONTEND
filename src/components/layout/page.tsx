import { useEffect } from 'react';
import mainBgM from '@/assets/images/main-bg-m.png';
import mainBg from '@/assets/images/main-bg.svg';
import Nav from './components/nav';

function PageLayout({ children }) {
    useEffect(() => {}, []);

    return (
        <div className="relative flex h-screen w-screen md:items-center">
            <img
                className="absolute left-0 top-0 -z-[1] hidden h-full w-full object-cover md:flex"
                src={mainBg}
                alt=""
            />
            <img
                className="absolute left-0 top-0 -z-[1] flex h-full w-full object-cover md:hidden"
                src={mainBgM}
                alt=""
            />

            <Nav></Nav>
            <div className="flex flex-1">{children}</div>
        </div>
    );
}
export default PageLayout;
