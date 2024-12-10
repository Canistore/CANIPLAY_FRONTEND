import { createClient as create, IConnector } from '@connect2ic/core';
import { AstroX, ICX, InfinityWallet, StoicWallet } from '@connect2ic/core/providers';
import { isPrincipalText } from '@/utils/principals';
import { ConnectedIdentity, ConnectType } from '@/types/identity';
import { getConnectDerivationOrigin, getConnectHost, isDevMode } from '../../utils/env';
import { getActorCreatorByActiveProvider } from './creator';
import { CustomInternetIdentity, getIIFrame } from './providers/ii';
import { CustomNFID } from './providers/nfid';

export const createClient = (whitelist?: string[]) => {
    const derivationOrigin = getConnectDerivationOrigin();

    const astroXProvider = (window as any).icx
        ? new ICX({
              delegationModes: ['domain', 'global'],
              dev: isDevMode(),
          })
        : new AstroX({
              delegationModes: ['domain', 'global'],
              dev: isDevMode(),
          });
    const infinityProvider = new InfinityWallet();
    const iiProvider = new CustomInternetIdentity({
        windowOpenerFeatures: window.innerWidth < 768 ? undefined : getIIFrame(),
        derivationOrigin: derivationOrigin,
    });
    const nfidProvider = new CustomNFID({
        windowOpenerFeatures: window.innerWidth < 768 ? undefined : getIIFrame(),
        derivationOrigin,
    });
    const stoicProvider = new StoicWallet();

    const globalProviderConfig = {
        appName: 'caniplay',
        dev: false,
        autoConnect: true,
        host: getConnectHost(),
        customDomain: derivationOrigin,
        whitelist,
    };

    return create({
        providers: [
            astroXProvider as any,
            infinityProvider,
            iiProvider,
            nfidProvider,
            stoicProvider,
        ],
        globalProviderConfig,
    });
};

export const checkConnected = (
    last: ConnectedIdentity | undefined,
    {
        isConnected,
        principal,
        provider,
    }: {
        isConnected: boolean;
        principal: string | undefined;
        provider: IConnector | undefined;
    },
    callback: () => void,
    handleIdentity: (identity: ConnectedIdentity) => Promise<void>,
    err?: () => void,
) => {
    const failed = () => err && err();
    if (!isConnected) return failed();
    if (!principal || !isPrincipalText(principal)) return failed();
    if (!provider) return failed();

    let connectType = provider.meta.id;
    if (['astrox', 'icx'].includes(connectType)) connectType = 'me';
    if (!['ii', 'plug', 'me', 'infinity', 'nfid', 'stoic'].includes(connectType)) {
        console.error(`what a provider id: ${connectType}`);
        return failed();
    }
    if (last?.principal === principal && last?.connectType === connectType) {
        callback();
        return;
    }
    const next = {
        connectType: connectType as ConnectType,
        principal,
        creator: getActorCreatorByActiveProvider(provider),
    };

    handleIdentity(next).finally(callback);
};
