import './App.css';

import * as React from 'react';
import { useState } from 'react';
//import styled from 'styled-components'
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
//import { faChevronCircleDown } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios';
import { getConfig, checkBrowser } from './App';
import { IExecHubModule } from 'iexec';
import { createContract } from './App-Contract';
import { usePromiseTracker } from "react-promise-tracker";
import { RotatingLines } from 'react-loader-spinner';

function ResourceComponent() {
	/*
	const label = 'Resources';
	const [open, setOpen] = useState(false);
	const toggle = () => {
		setOpen(!open);
	};
	const contentRef = useRef();

	const PanelHeading = styled.div`
  background-color: #85C1E9;
  color: #ffffff;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`

	const ToggleButtonWrapper = styled.div`
  transform: ${open ? 'rotate(180deg)' : 'rotate(0deg)'}
`
*/
	const json = {
		"requirements": {
			"quantativeParameters": {
				"min-ncpu": 1,
				"max-ncpu": 10,
				"min-ram-mb": 1000,
				"max-ram-mb": 10000,
				"min-storage-mb": 1000,
				"max-storage-mb": 100000,
				"min-cores": 1,
				"max-cores": 10
			},
			"osRequirement": {
				"os-type": "Linux"
			},
			"cpu-architecture": "amd64",
			"tee": false
		}
	};


	//const [message, setMessage] = useState('');
	const [req, setReq] = useState(JSON.stringify(json, null, "\t"));
	const [data, setData] = useState([]);
	const { promiseInProgress } = usePromiseTracker();

	async function findResources(json) {
		if (await checkBrowser()) {
			// implementation details
			//var result;
			var resources;
			const rawResources = await axios.post('https://20.71.159.181:5000/resources', json);
			if (rawResources.data.length === 0) {
				//result = 'There are currently no resources available. Try again later!';
				alert('There are currently no resources available. Try again later!');
			} else {
				resources = await getFilteredResources(rawResources.data);
				/*
								//getBalance(address);
								result = resources.join('\r\n\r\n');
								if (resources.length === 0) {
									result = 'There are currently no resources available with the specified requirements. Try to modify the requirements!';
								}
								*/
			}

			//setMessage(result);
			return resources;
		}

	}

	async function getFilteredResources(resources) {
		const askedRequirements = JSON.parse(resources[0]).requirements;

		const askedcpuArch = askedRequirements["cpu-architecture"];
		const askedtee = askedRequirements["tee"];
		const askedosType = askedRequirements["osRequirement"]["os-type"];
		const askedmincores = parseInt(askedRequirements["quantativeParameters"]["min-cores"]);
		const askedminncpu = parseInt(askedRequirements["quantativeParameters"]["min-ncpu"]);
		const askedminram = parseInt(askedRequirements["quantativeParameters"]["min-ram-mb"]);
		const askedminstorage = parseInt(askedRequirements["quantativeParameters"]["min-storage-mb"]);

		const askedmaxcores = parseInt(askedRequirements["quantativeParameters"]["max-cores"]);
		const askedmaxncpu = parseInt(askedRequirements["quantativeParameters"]["max-ncpu"]);
		const askedmaxram = parseInt(askedRequirements["quantativeParameters"]["max-ram-mb"]);
		const askedmaxstorage = parseInt(askedRequirements["quantativeParameters"]["max-storage-mb"]);

		var array = [];
		var jsonArray = [];
		for (var i = 1; i < resources.length; ++i) {
			const resource = JSON.parse(resources[i]);
			const category = await getCategory(resource.category);
			const description = JSON.parse(category.description);
			const requirements = description.requirements;
			const cpuArch = requirements["cpu-architecture"];
			const tee = requirements["tee"];
			const osType = requirements["osRequirement"]["os-type"];
			const cores = parseInt(requirements["quantativeParameters"]["cores"]);
			const ncpu = parseInt(requirements["quantativeParameters"]["ncpu"]);
			const ram = parseInt(requirements["quantativeParameters"]["ram-mb"]);
			const storage = parseInt(requirements["quantativeParameters"]["storage-mb"]);

			if (cpuArch === askedcpuArch && tee === askedtee && osType === askedosType) {
				if (cores <= askedmaxcores && cores >= askedmincores) {
					if (ncpu <= askedmaxncpu && ncpu >= askedminncpu) {
						if (ram <= askedmaxram && ram >= askedminram) {
							if (storage <= askedmaxstorage && storage >= askedminstorage) {
								var jsonObject =
								{
									orderHash: resource['orderHash'],
									resourceName: category.name,
									requirements: requirements
								}
								jsonArray.push(jsonObject);
								array.push(JSON.stringify(jsonObject, null, "\t"));
							}
						}
					}
				}
			}
		}
		if (jsonArray.length === 0) {
			alert('There are currently no resources available with the specified requirements. Try to modify the requirements!');
		} else {
			setData(jsonArray);
		}


		return array;
	}

	async function getCategory(id) {
		const config = getConfig();
		const hubModule = IExecHubModule.fromConfig(config);
		//const nbCategory = await hubModule.countCategory();
		//console.log(nbCategory.words[0]);
		const category = await hubModule.showCategory(id);
		return category;
	}

	/*
	// GET request function to your Mock API
	const fetchInventory = () => {
		const resources = findResources();
		console.log(resources);
	}

	// Calling the function on component mount
	useEffect(() => {
		fetchInventory();
	}, []);
*/
	function handleChange(event) {
		setReq(event.target.value);
	}

	function handleSubmit(event) {
		findResources(JSON.parse(req));
		event.preventDefault();
	}

	function handleClick(event) {
		createContract(event.target.value);
	}


	const handleChangeFile = e => {
		const fileReader = new FileReader();
		fileReader.readAsText(e.target.files[0], "UTF-8");
		fileReader.onload = e => {
			setReq(e.target.result);
		};
	};

	const LoadingIndicator = props => {
		return (
			promiseInProgress &&
			<div style={{
				width: "100%",
				height: "100",
				display: "flex",
				justifyContent: "center",
				color: "#000000",
				alignItems: "center"
			}
			}>
				<RotatingLines
					strokeColor="lightblue"
					strokeWidth="5"
					animationDuration="1.75"
					width="30"
					visible={true}
				/>
				<span style={{ marginLeft: '10px' }}>
					Contract Creation in progress...
				</span>

			</div >
		);
	}

	return (
		/*
		<div>
			<PanelHeading onClick={toggle}>
				<span>{label}</span>
				<ToggleButtonWrapper>
					<FontAwesomeIcon icon={faChevronCircleDown} />
				</ToggleButtonWrapper>
			</PanelHeading>
			<div className="content-parent" ref={contentRef} style={open ? {
				height: contentRef.current.scrollHeight +
					"px"
			} : { height: "0px" }}>
			*/
		/*
		<textarea
			id="message"
			name="message"
			value={message}
			placeholder="Click on 'Find Resources' and the available resources will appear here."
			readOnly={true}
			style={{ width: "750px", height: "300px" }}
		/>
		*/
		<div className="content">
			<label style={{ color: "#000000", fontSize: "0.5em" }}> Please upload a JSON file for your resource requirements or use/customize the provided one below: </label>
			<br />
			<input type="file" onChange={handleChangeFile} style={{ color: "#000000", fontSize: "0.5em" }} />
			<br />
			<form onSubmit={handleSubmit}>
				<br />
				<label>
					<textarea
						id="req"
						name="req"
						value={req}
						onChange={handleChange}
						style={{ width: "500px", height: "300px" }}
					/>
				</label>
				<br />
				<input type="submit" value="Find Resources" />
			</form>
			<hr />
			<div>
				<LoadingIndicator />
				<table className="styled-table">
					<thead>
						<tr>
							<th>Resource Name</th>
							<th># CPU</th>
							<th># Cores</th>
							<th>Memory (MB)</th>
							<th>Storage (MB)</th>
							<th>CPU Architecture</th>
							<th>OS Type</th>
							<th>TEE</th>
							<th>Create Contract</th>
						</tr>
					</thead>
					<tbody>
						{
							data.map((item) => (
								<tr key={item.orderHash}>
									<td>{item.resourceName}</td>
									<td>{item.requirements.quantativeParameters.ncpu}</td>
									<td>{item.requirements.quantativeParameters.cores}</td>
									<td>{item.requirements.quantativeParameters['ram-mb']}</td>
									<td>{item.requirements.quantativeParameters['storage-mb']}</td>
									<td>{item.requirements['cpu-architecture']}</td>
									<td>{item.requirements.osRequirement['os-type']}</td>
									<td>{item.requirements.tee ? 'Yes' : 'No'}</td>
									<td>
										<button className="link" value={item.orderHash} onClick={handleClick} disabled={promiseInProgress}>
											{promiseInProgress ? 'Contract Creation in progress...' : 'Create Contract'}
										</button>
									</td>
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


export default ResourceComponent;
