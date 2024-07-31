import './App.css';

import { getIexec, getAddress, checkBrowser } from './App';
import { trackPromise } from 'react-promise-tracker';

async function createContract(wpOrderHash, duration, ip, token, hash) {
	if (checkBrowser()) {
		// instanciate iExec SDK
		const iexec = getIexec();
		/*
		const isIpfsStorageInitialized = await iexec.storage.checkStorageTokenExists(getAddress());

		if (!isIpfsStorageInitialized) {
			const token = await iexec.storage.defaultStorageLogin();
			await iexec.storage.pushStorageToken(token);
		}
		*/

		let requestorder = await getRequestOrder();
		if (requestorder === null) {
			requestorder = await publishRequestOrder(duration, ip, token, hash);
		}
		const workerpoolorder = await getWPOrder(wpOrderHash);
		if (workerpoolorder === null) {
			alert('The resource you asked for is not available');
		}
		const apporder = await getAppOrder();
		if (apporder === null) {
			alert('The app you asked for is not available');
		}

		if (requestorder !== null && workerpoolorder !== null && apporder !== null) {
			//alert(`Creation of the contract, please wait...`);
			trackPromise(iexec.order.matchOrders({
				apporder,
				workerpoolorder,
				requestorder,
			}, {
			checkRequest: false,
		}).then((res) => {
				alert('Contract created with id: '.concat(res.dealid));
			})
				.catch((error) => {
					console.error("Promise rejected:", error);
				}));

		}
	}
}

async function extendContract(taskid, duration) {
	if (checkBrowser()) {
		// instanciate iExec SDK
		const iexec = getIexec();

		trackPromise(iexec.task.extend(taskid, duration).then((res) => {
			alert(`Task successfully extended by ${duration} seconds`);
		})
			.catch((error) => {
				console.error("Promise rejected:", error);
			}));
	}
}

async function interruptContract(taskid) {
	if (checkBrowser()) {
		// instanciate iExec SDK
		const iexec = getIexec();

		trackPromise(iexec.task.interrupt(taskid).then((res) => {
			alert('Task successfully interrupted');
		})
			.catch((error) => {
				console.error("Promise rejected:", error);
			}));
	}
}

const appAddress = '0xBA71ca91CA7979Df41Ef6239C85162D17352BA7e';

async function publishRequestOrder(duration, ip, token, hash) {
	const address = await getAddress();
	const args = address.toLowerCase() + ' ' + ip + ' ' + token + ' ' + hash;
	
	const unsignedRequestorder = await getIexec().order.createRequestorder({
		app: appAddress,
		category: 5,
		taskduration: duration,
		params: {
			iexec_result_storage_provider: 'ipfs',
			iexec_result_storage_proxy: 'http://13.81.101.41:13200',
			iexec_result_encryption: false,
			iexec_input_files: [],
			iexec_args: args
		}
	});

	const requestOrder = await getIexec().order.signRequestorder(unsignedRequestorder, {
			checkRequest: false,
		});
		
	try {
		await getIexec().order.publishRequestorder(requestOrder, {
				checkRequest: false,
			});
	} catch (error) {
		alert('Unable to publish request !');
	}


	return requestOrder;
}

async function getRequestOrder() {
	const { orders } = await getIexec().orderbook.fetchRequestOrderbook();

	const address = await getAddress();

	for (let i = 0; i < orders.length; i++) {
		if (address.toUpperCase() === orders[i].order.requester.toUpperCase()) {
			return orders[i].order;
		}
	}
	return null;
}

async function getWPOrder(wpOrderHash) {
	const { orders } = await getIexec().orderbook.fetchWorkerpoolOrderbook();
	for (let i = 0; i < orders.length; i++) {
		if (wpOrderHash === orders[i].orderHash) {
			return orders[i].order;
		}
	}
	return null;
}

async function getAppOrder() {
	const { orders } = await getIexec().orderbook.fetchAppOrderbook(appAddress);
	for (let i = 0; i < orders.length; i++) {
		if (appAddress === orders[i].order.app) {
			return orders[i].order;
		}
	}
	return null;
}

export { createContract, extendContract, interruptContract };
