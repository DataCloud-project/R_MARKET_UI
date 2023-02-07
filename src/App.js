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

// create the configuration
const config = new IExecConfig(
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


async function getAddress() {
	// implementation details
	if (checkMetamask) {
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

function checkMetamask() {
	if (window.ethereum) {
		return true;
	} else {
		alert("install metamask extension!!")
		return false;
	}
}


function App() {
	console.warn = () => { };

	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} alt="logo" />
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



export { App, getAddress, checkMetamask, config };
