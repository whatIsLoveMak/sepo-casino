import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia } from 'wagmi/chains'
import { http } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'

const PROJECT_ID = 'ce344294133abbb9a59a3da39d30444f'

export const injectedConnector = injected()
export const walletConnectConnector = walletConnect({ projectId: PROJECT_ID })

export const config = getDefaultConfig({
  appName: 'Sepo Casino',
  projectId: PROJECT_ID,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/VglXLT106meteX5JYI28L'),
  },
  connectors: [injectedConnector, walletConnectConnector],
  ssr: false,
})
