import { useRoutes } from 'react-router-dom';
import PageLayout from '@/components/layout/page';
import Login from '@/components/login';
import '@/assets/css/main.css';
import routes from '@/routes';

function App() {
    const views = useRoutes(routes);

    return (
        <>
            <PageLayout>
                <div className="relative flex h-full w-full flex-col md:h-screen md:w-[calc(100vw-120px)]">
                    <header className="flex w-full">
                        <Login />
                    </header>

                    <div className="scroll-none relative flex flex-1 overflow-y-scroll">
                        {views}
                    </div>
                </div>
            </PageLayout>
        </>
    );
}

export default App;
