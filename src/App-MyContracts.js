import './App.css';

import * as React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { IExecDealModule, IExecTaskModule } from 'iexec';
import { getConfig, checkBrowser, getAddress } from './App';

function MyContractsComponent() {

	const [data, setData] = useState([]);

	async function getContracts() {
		if (checkBrowser()) {
			const address = await getAddress();
			const contracts = await axios.get('https://datacloud-r-market.westeurope.cloudapp.azure.com:5000/contracts/list?userAddress='.concat(address));

			//var result = contracts.data.join('\r\n\r\n');
			if (contracts.data.length === 0) {
				//result = 'This account does not have any contract yet. Try to create one first!';
				alert('This account does not have any contract yet. Try to create one first!');
			}
			//setContracts(result);
			var data = [];

			for (const element of contracts.data) {
				var jsonElement = JSON.parse(element);
				var status = await getStatus(jsonElement['contractID']);

				var jsonObject =
				{
					contractID: jsonElement['contractID'],
					startTime: jsonElement['startTime'],
					status: status
				}
				data.push(jsonObject);
			}

			//contracts.data.forEach(element => data.push(JSON.parse(element)));
			setData(data);
		}
	}

	async function getStatus(contract) {
		var status = "WAITING";
		if (checkBrowser()) {
			if (contract === '') {
				alert('Please provide a contract ID!');
			} else {
				const config = getConfig();
				const dealModule = IExecDealModule.fromConfig(config);
				const taskModule = IExecTaskModule.fromConfig(config);
				try {
					const deal = await dealModule.show(contract);
					try {
						const task = await taskModule.show(deal.tasks[0]);
						status = task.statusName;
					} catch (error) {
					}
					/*
					const dealObservable = await dealModule.obsDeal(contract);
										dealObservable.subscribe({
											next: (data) =>
												defineStatus(data.message),
											error: (e) => { defineStatus(e); },
										});
										*/
				} catch (error) {
					console.log(error);
					alert('Contract not found!');
				}
			}
		}
		return status;
	}

	return (
		<div className="content">
			<div>
				<button onClick={getContracts}> get My Contracts </button>
			</div>
			<br />
			<div>
				<table className="styled-table">
					<thead>
						<tr>
							<th>Contract ID</th>
							<th>Creation Time</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{
							data.map((item) => (
								<tr key={item.contractID}>
									<td>{item.contractID}</td>
									<td>{item.startTime}</td>
									<td>{item.status}</td>
								</tr>
							))
						}
					</tbody>
				</table>
			</div>
		</div>
		/*
	</div>
</div>
*/
	);
}


export default MyContractsComponent;
