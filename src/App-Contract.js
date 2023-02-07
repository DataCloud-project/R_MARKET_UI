import './App.css';

import { IExecOrderModule, IExecStorageModule, IExecOrderbookModule } from 'iexec';
import { config, getAddress, checkMetamask } from './App';
import { trackPromise } from 'react-promise-tracker';

async function createContract(wpOrderHash) {
	if (checkMetamask) {
		// instanciate iExec SDK
		//const iexec = IExec.fromConfig(config);

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
			requestorder = await publishRequestOrder(orderModule);
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
			trackPromise(orderModule.matchOrders({
				apporder,
				workerpoolorder,
				requestorder,
			}).then((dealid) => {
				console.log(dealid);
			}));

		}
	}
}

const appAddress = '0xffe6dAB7e1F670bB51ba831E8ed74CB146816991';

async function publishRequestOrder(orderModule) {
	const unsignedRequestorder = await orderModule.createRequestorder({
		app: appAddress,
		category: 6,
		params: {
			iexec_result_storage_provider: 'ipfs',
			iexec_result_storage_proxy: 'http://20.71.159.181:13200',
			iexec_result_encryption: false,
			iexec_input_files: [],
			iexec_args: ''
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
