import './App.css';

import * as React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { checkBrowser, getAddress } from './App';

function MyResourcesComponent() {
	const [data, setData] = useState([]);

	async function getResources() {
		if (checkBrowser()) {
			const address = await getAddress();
			const reservedResources = await axios.get('https://datacloud-r-market.westeurope.cloudapp.azure.com:5000/contracts/reserved?userAddress='.concat(address));

			//var result = contracts.data.join('\r\n\r\n');
			if (reservedResources.data.length === 0) {
				//result = 'This account does not have any contract yet. Try to create one first!';
				alert('This account does not have any reserved resource yet. Try to reserve one by creating a contract!');
			}

			var data = [];
			for (const element of reservedResources.data) {
				var jsonElement = JSON.parse(element);

				var endTime = getTimestamp(jsonElement['estimated-end-time']);
				var startTime = getTimestamp(jsonElement['start_time']);

				const now = Date.now() / 1000;

				var state = "PENDING";

				if (now > endTime) {
					state = "EXPIRED"
				} else if (now < endTime) {
					state = "ACTIVE"
				}

				var endDate = getDate(endTime);
				var startDate = getDate(startTime);

				var jsonObject =
				{
					resource_ip: jsonElement['resource_ip'],
					start_time: startDate,
					estimated_end_time: endDate,
					state: state
				}
				data.push(jsonObject);
			}
			data.reverse();

			setData(data);
		}
	}

	function getTimestamp(str) {
		var str2 = str.split("/");
		var strDate = str2[1].concat('/').concat(str2[0]).concat('/').concat(str2[2]);
		var datum = Date.parse(strDate) / 1000;

		return datum;
	}

	function getDate(timestamp) {
		const d = new Date();
		let diff = d.getTimezoneOffset();
		var time = timestamp - (diff * 60);
		var dateFormat = new Date(time * 1000);

		var day = "0" + dateFormat.getDate();
		var month = "0" + (dateFormat.getMonth() + 1);

		var minutes = "0" + dateFormat.getMinutes();
		var seconds = "0" + dateFormat.getSeconds();

		var date = day.substr(-2) +
			"/" + month.substr(-2) +
			"/" + dateFormat.getFullYear() +
			" " + dateFormat.getHours() +
			":" + minutes.substr(-2) +
			":" + seconds.substr(-2);

		return date;
	}

	return (
		<div className="content">
			<div>
				<button onClick={getResources}> get My Resources </button>
			</div>
			<br />
			<div>
				<table className="styled-table">
					<thead>
						<tr>
							<th>Resource IP</th>
							<th>Start Time</th>
							<th>End Time</th>
							<th>State</th>
						</tr>
					</thead>
					<tbody>
						{
							data.map((item) => (
								<tr key={item['resource_ip']}>
									<td>{item['resource_ip']}</td>
									<td>{item['start_time']}</td>
									<td>{item['estimated_end_time']}</td>
									<td>{item['state']}</td>
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


export default MyResourcesComponent;
