import { EIP1193Provider } from 'eip1193-provider';

declare interface BloctoProviderInterface extends EIP1193Provider {
  isBlocto: boolean;
  isConnecting: boolean;
  connected: boolean;
  appId?: string;
  eventListeners: {
    [key: string]: Array<(arg?: any) => void>
  };
  code: string | null;
  sessionKey: string;
}

export default BloctoProviderInterface;
