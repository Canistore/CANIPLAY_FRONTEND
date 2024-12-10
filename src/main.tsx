import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// import { HashRouter } from 'react-router-dom';
import { Connect2ICProvider } from '@connect2ic/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'animate.css';
// import Vconsole from 'vconsole';
import App from './app.tsx';
import { createClient } from './components/connect/connect.ts';

// new Vconsole();

const whitelist = [];

const connectClient = createClient(whitelist);
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.Fragment>
        <BrowserRouter>
            <Connect2ICProvider client={connectClient}>
                <QueryClientProvider client={queryClient}>
                    <App />
                </QueryClientProvider>
            </Connect2ICProvider>
        </BrowserRouter>
    </React.Fragment>,
);
