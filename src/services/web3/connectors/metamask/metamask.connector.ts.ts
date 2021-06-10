import { Connector } from '../connector';
import { AbstractProvider } from 'web3-core';
import { EventEmitter } from 'node:stream';
export class MetamaskConnector extends Connector {
  async connect() {
    const provider = window.ethereum;
    if (provider) {
      this.provider = provider as AbstractProvider & EventEmitter;
      this.active.value = true;

      try {
        const accounts = await provider.request({
          method: 'eth_requestAccounts'
        });

        const chainId = await provider.request({ method: 'eth_chainId' });
        this.handleChainChanged(chainId);
        this.handleAccountsChanged(accounts);
      } catch (err) {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      }
    } else {
      console.error(
        'Tried to connect to MetaMask but it was not detected. Please install MetaMask.'
      );
    }
    return {
      // TODO type this
      provider: provider as any,
      account: this.accounts,
      chainId: this.chainId
    };
  }
}
