import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import List from '@/views/List';
import Room from '@/views/Room';

const Home = () => {
    const router = useParams();

    useEffect(() => {}, [router]);

    return (
        <>
            <div
                className={`relative z-[10] hidden h-full w-full opacity-0  duration-300 ${
                    Object.values(router)[0] === '' && '!z-0 !flex !opacity-100'
                }`}
            >
                <List></List>
            </div>

            <div
                className={`absolute left-0 top-0 z-[-1] w-full opacity-0 duration-300 ${
                    Object.values(router)[0] !== '' && '!z-20 !opacity-100'
                }`}
            >
                <Room></Room>
            </div>
        </>
    );
};

export default Home;
