import './App.css';

import { IExecOrderModule, IExecStorageModule, IExecOrderbookModule } from 'iexec';
import { getConfig, getAddress, checkBrowser } from './App';
import { trackPromise } from 'react-promise-tracker';

async function createContract(wpOrderHash, duration) {
	if (checkBrowser()) {
		// instanciate iExec SDK
		const config = getConfig();
		const storageModule = IExecStorageModule.fromConfig(config);
		const isIpfsStorageInitialized = await storageModule.checkStorageTokenExists(getAddress());

		if (!isIpfsStorageInitialized) {
			const token = await storageModule.defaultStorageLogin();
			await storageModule.pushStorageToken(token);
		}

		const orderModule = IExecOrderModule.fromConfig(config);
		const orderBookModule = IExecOrderbookModule.fromConfig(config);

		let requestorder = await getRequestOrder(orderBookModule);
		if (requestorder === null) {
			requestorder = await publishRequestOrder(orderModule, duration);
		}
		const workerpoolorder = await getWPOrder(orderBookModule, wpOrderHash);
		if (workerpoolorder === null) {
			alert('The resource you asked for is not available');
		}
		const apporder = await getAppOrder(orderBookModule);
		if (apporder === null) {
			alert('The app you asked for is not available');
		}

		if (requestorder !== null && workerpoolorder !== null && apporder !== null) {
			//alert(`Creation of the contract, please wait...`);
			console.log(requestorder);
			console.log(workerpoolorder);
			console.log(apporder);
			
			trackPromise(orderModule.matchOrders({
				apporder,
				workerpoolorder,
				requestorder,
			}).then((dealid) => {
				alert('Contract created with id: '.concat(dealid.dealid));
			}));
			

		}
	}
}

const appAddress = '0x5D80A92DbB1e810021E9B06AAE4aeA0471C84742';

async function publishRequestOrder(orderModule, duration) {
	console.log(duration);
	const address = await getAddress();
	const args = address.toLowerCase().concat(' ').concat(duration);
	console.log(args);
	
	const unsignedRequestorder = await orderModule.createRequestorder({
		app: appAddress,
		category: 6,
		params: {
			iexec_result_storage_provider: 'ipfs',
			iexec_result_storage_proxy: 'http://20.71.159.181:13200',
			iexec_result_encryption: false,
			iexec_input_files: [],
			iexec_args: args
		}
	});

	const requestOrder = await orderModule.signRequestorder(unsignedRequestorder);
	try {
		await orderModule.publishRequestorder(requestOrder);
	} catch (error) {
		alert('The app is unavailable !');
	}


	return requestOrder;
}

async function getRequestOrder(orderBookModule) {
	const { orders } = await orderBookModule.fetchRequestOrderbook();

	const address = await getAddress();

	for (let i = 0; i < orders.length; i++) {
		if (address.toUpperCase() === orders[i].order.requester.toUpperCase()) {
			return orders[i].order;
		}
	}
	return null;
}

async function getWPOrder(orderBookModule, wpOrderHash) {
	const { orders } = await orderBookModule.fetchWorkerpoolOrderbook();
	for (let i = 0; i < orders.length; i++) {
		if (wpOrderHash === orders[i].orderHash) {
			return orders[i].order;
		}
	}
	return null;
}

async function getAppOrder(orderBookModule) {
	const { orders } = await orderBookModule.fetchAppOrderbook(appAddress);
	for (let i = 0; i < orders.length; i++) {
		if (appAddress === orders[i].order.app) {
			return orders[i].order;
		}
	}
	return null;
}

export { createContract };
