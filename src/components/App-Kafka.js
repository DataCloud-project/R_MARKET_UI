import axios from 'axios';


async function getRawKafkaInfo(userAddress) {
	const reservedResources = await axios.get('https://r-market.westeurope.cloudapp.azure.com:5000/contracts/reserved?userAddress='.concat(userAddress));
	return reservedResources;
}

async function getKafkaInfo(reservedResources, taskid) {
	var data = [];
	const now = Date.now() / 1000;
	var start = now;
	var end = 0;
	var found = false;
	for (const element of reservedResources.data) {
		var jsonElement = JSON.parse(element);

		if (taskid === jsonElement['contract_id']) {
			found = true;
			var time = jsonElement['time'];

			if (time < start) {
				start = time;
			}

			if (time > end) {
				end = time;
			}
		}
	}

	if (found) {
		var endDate = getDate(end);
		var startDate = getDate(start);

		var jsonObject =
		{
			taskid: taskid,
			start: startDate,
			end: endDate
		}
		data.push(jsonObject);
	}

	return data;
}

function getTimestamp(str) {
	var str2 = str.split("/");
	var strDate = str2[1].concat('/').concat(str2[0]).concat('/').concat(str2[2]);
	var datum = Date.parse(strDate) / 1000;

	return datum;
}

function getDate(timestamp) {
	var time = timestamp;
	var dateFormat = new Date(time * 1000);

	var day = "0" + dateFormat.getUTCDate();
	var month = "0" + (dateFormat.getUTCMonth() + 1);

	var minutes = "0" + dateFormat.getUTCMinutes();
	var seconds = "0" + dateFormat.getUTCSeconds();

	var date = day.substr(-2) +
		"/" + month.substr(-2) +
		"/" + dateFormat.getUTCFullYear() +
		", " + dateFormat.getUTCHours() +
		":" + minutes.substr(-2) +
		":" + seconds.substr(-2) + " GMT";

	return date;
}


export { getRawKafkaInfo, getKafkaInfo, getTimestamp, getDate };
