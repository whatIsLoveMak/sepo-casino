import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia } from 'wagmi/chains'
import { http } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'

const PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string
const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY_KEY as string

export const injectedConnector = injected()
export const walletConnectConnector = walletConnect({ projectId: PROJECT_ID })

export const config = getDefaultConfig({
  appName: 'Sepo Casino',
  projectId: PROJECT_ID,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`),
  },
  ssr: false,
})
