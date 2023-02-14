import logo from './logo.jpg';
import './App.css';

import * as React from 'react';
import ResourceComponent from './App-Resources';
import MyContractsComponent from './App-MyContracts';
import { IExecConfig } from 'iexec';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';


const hubAddress = '0xC129e7917b7c7DeDfAa5Fff1FB18d5D7050fE8ca';
const iexecGatewayURL = 'http://20.71.159.181:3000';
const resultProxyURL = 'http://20.71.159.181:13200';
const smsURL = 'http://20.71.159.181:13300';
const ipfsGatewayURL = 'http://20.71.159.181:8080';

function App() {
	console.warn = () => { };
	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} alt="logo" width="300px" />
				<br />
				<div>
					<Tabs>
						<TabList>
							<Tab>Resources</Tab>
							<Tab>My Contracts</Tab>
						</TabList>
						<TabPanel>
							<ResourceComponent />
						</TabPanel>
						<TabPanel>
							<MyContractsComponent />
						</TabPanel>
					</Tabs>
				</div>
			</header>
		</div>
	);
}

// create the configuration
function getConfig() {
	if (checkBrowser()) {
		return new IExecConfig(
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
			return checkBlockchainConfig();
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

function checkBlockchainConfig() {
	var chainID = 0;
	try {
		chainID = window.ethereum.networkVersion;
		if (chainID !== '65535') {
			alert('Please connect your metamask wallet to the Datacloud blockchain network (IP: http://20.71.153.50:8545, chainID: 65535) for using R-MARKET!!')
		}

	} catch (e) {
		console.log(e);
	}

	return chainID === '65535';

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



export { App, getAddress, checkBrowser, getConfig };
