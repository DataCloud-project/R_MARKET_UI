import './App.css';

import * as React from 'react';
import { IExec } from 'iexec';
import detectEthereumProvider from '@metamask/detect-provider';


const hubAddress = '0xC129e7917b7c7DeDfAa5Fff1FB18d5D7050fE8ca';
const iexecGatewayURL = 'https://r-market.westeurope.cloudapp.azure.com:3001';
const resultProxyURL = 'http://13.81.101.41:13200';
const smsURL = 'https://r-market.westeurope.cloudapp.azure.com:13301';
const ipfsGatewayURL = 'http://13.81.101.41:8080';

function App() {
	console.warn = () => { };
	return (
		<div className="App">
		</div>
	);
}

// create the configuration
function getIexec() {
	if (checkBrowser()) {
		return new IExec(
			{ ethProvider: window.ethereum },
			{
				hubAddress: hubAddress,
				iexecGatewayURL: iexecGatewayURL,
				resultProxyURL: resultProxyURL,
				smsURL: smsURL,
				ipfsGatewayURL: ipfsGatewayURL,
				isNative: true,
				useGas: false
			});
	}
}


async function getAddress() {
	// implementation details
	if (checkBrowser()) {
		// Do something
		const address = await window.ethereum.request({ method: 'eth_requestAccounts' })
			.then(res => {
				// Return the address of the wallet
				return JSON.stringify(res).substr(2, 42);
			})
		//getBalance(address);
		return address;
	}
}

async function checkBrowser() {
	if (checkMetamask()) {
		const isAccountDefined = await checkAccountDefined();
		if (isAccountDefined) {
			const isRightChainID = await checkBlockchainConfig();
			return isRightChainID;
		} else {
			return false;
		}
	}
	return false;

}
function checkMetamask() {
	if (window.ethereum === undefined || window.ethereum === null || window.ethereum === '') {
		alert("Please install metamask extension for using R-MARKET!!")
		return false;
	} else {
		return true;
	}
}

async function checkBlockchainConfig() {
	var chainID = 0;
	try {
		chainID = window.ethereum.networkVersion;
		if (chainID !== '65535') {
			//alert('Please connect your metamask wallet to the Datacloud blockchain network (IP: http://dcd-blockchain.westeurope.cloudapp.azure.com:8545, chainID: 65535) for using R-MARKET!!')
			await switchNetwork();
		}

	} catch (e) {
	}

	return chainID === '65535';

}

async function getProvider() {
  const provider = await detectEthereumProvider();
  if (provider) {
    console.log('MetaMask is installed!');
    return provider;
  } else {
    console.error('MetaMask is not installed!');
  }
}

async function switchNetwork() {
      const provider = await getProvider();

      if (provider) {
        const ethereum = window.ethereum;
        const chainId = '0xffff'; // Example for Mainnet

        try {
          // Check if the network is already added
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }],
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId,
                    chainName: 'Datacloud Mainnet',
                    nativeCurrency: {
                      name: 'DCD',
                      symbol: 'DCD',
                      decimals: 18,
                    },
                    rpcUrls: ['http://dcd-blockchain.westeurope.cloudapp.azure.com:8545'],
                    blockExplorerUrls: [],
                  },
                ],
              });
            } catch (addError) {
              console.error(addError);
            }
          }
        }
      }
    }

async function checkAccountDefined() {
	var address = '0x';
	try {
		const res = await window.ethereum.request({ method: 'eth_requestAccounts' });
		address = JSON.stringify(res).substr(2, 42);
	} catch (e) {
		alert('Please connect to your metamask account (or create one) for using R-MARKET!!')
	}

	return address !== '0x';
}



export { App, getAddress, checkBrowser, getIexec };
