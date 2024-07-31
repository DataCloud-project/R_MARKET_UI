import './App.css';

import * as React from 'react';
import { useState } from 'react';
//import styled from 'styled-components'
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
//import { faChevronCircleDown } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios';
import { createContract } from './App-Contract';
import InformationPrompt from './App-Prompt';
import { usePromiseTracker } from "react-promise-tracker";

import { getIexec } from './App';


import MDBox from "components/MDBox";
import Grid from "@mui/material/Grid";
import MDTypography from "components/MDTypography";

import Dialog from '@mui/material/Dialog';

import Divider from "@mui/material/Divider";

import DataTable from "examples/Tables/DataTable";

import MDButton from "components/MDButton";
import Link from '@mui/material/Link';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';


function ResourceComponent() {
	
	const CLUSTER_IP = "192.168.99.1";
	const CLUSTER_TOKEN = "i5p8hf.xtk3i1fw0sk1le0y";
	const CLUSTER_HASH = "sha256:de2cddb6b84d6b3e0e6c90b26a2e6f72772b4ac61a666a92a0fdc27be9120925";


	const Order = ({ name, url }) => (
		<MDBox display="flex" alignItems="center" lineHeight={1}>
			<MDBox ml={2} lineHeight={1}>
				<Link href={url} target="_blank" rel="noopener noreferrer" title="Workerpool details">
					{name}
					<OpenInNewIcon fontSize="small" style={{ verticalAlign: 'middle' }} />
				</Link>

			</MDBox>
		</MDBox>
	);


	const [rows, setRows] = useState([]);

	const columns = [
		{ Header: "workerpool", accessor: "workerpool", width: "30%", align: "left" },
		{ Header: "# cpu (min/max)", accessor: "cpu", align: "center" },
		{ Header: "ram (MB) (min/max)", accessor: "ram", align: "center" },
		{ Header: "bandwidth (min/max)", accessor: "bandwidth", align: "center" },
		{ Header: "price (per hour)", accessor: "price", align: "center" },
		{ Header: "Maximal Duration", accessor: "maxduration", align: "center" },
		{ Header: "action", accessor: "action", align: "center" },
	];

	const [isPromptOpen, setIsPromptOpen] = useState(false);

	const [type, setType] = useState({});

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

	//const [message, setMessage] = useState('');
	const [reqData, setReqData] = useState({
		requirements: {
			cpu: {
				min: '',
				max: '',
			},
			ram: {
				min: '',
				max: '',
			},
			bandwidth: {
				min: '',
				max: '',
			},
		},
	});


	const [orderInfo, setOrderInfo] = useState('');
	const { promiseInProgress } = usePromiseTracker();

	async function findResources(data) {
		// implementation details
		//var result;

		const iexec = getIexec();

		const rawResources = await axios.post('https://r-market.westeurope.cloudapp.azure.com:5000/resources', data);
		if (rawResources.data.length === 0) {
			//result = 'There are currently no resources available. Try again later!';
			alert('There are currently no resources available. Try again later!');
		} else {
			var jsonArray = [];
			for (var i = 0; i < rawResources.data.length; ++i) {
				const resource = JSON.parse(rawResources.data[i]);
				/*
				const cpuArch = requirements["cpu-architecture"];
				const tee = requirements["tee"];
				const osType = requirements["osRequirement"]["os-type"];
				const cores = parseInt(requirements["quantativeParameters"]["cores"]);
				const ncpu = parseInt(requirements["quantativeParameters"]["ncpu"]);
				const ram = parseInt(requirements["quantativeParameters"]["ram-mb"]);
				const storage = parseInt(requirements["quantativeParameters"]["storage-mb"]);
				*/

				var requirements = JSON.parse(resource.order.hardwaredescription);

				const { workerpool } = await iexec.workerpool.showWorkerpool(resource.order.workerpool);

				const description = JSON.parse(workerpool.workerpoolDescription);

				jsonArray.push({
					workerpool: <Order name={description.name} url={description.url} />,
					cpu: (
						<MDBox>
							<MDTypography variant="caption" color="text" fontWeight="medium">
								{requirements['min_cpu']}
							</MDTypography>
							<Divider />
							<MDTypography variant="caption" color="text" fontWeight="medium">
								{requirements['max_cpu']}
							</MDTypography>
						</MDBox>
					),
					ram: (
						<MDBox>
							<MDTypography variant="caption" color="text" fontWeight="medium">
								{requirements['min_ram']}
							</MDTypography>
							<Divider />
							<MDTypography variant="caption" color="text" fontWeight="medium">
								{requirements['max_ram']}
							</MDTypography>
						</MDBox>
					),
					bandwidth: (
						<MDBox>
							<MDTypography variant="caption" color="text" fontWeight="medium">
								{requirements['min_bw']}
							</MDTypography>
							<Divider />
							<MDTypography variant="caption" color="text" fontWeight="medium">
								{requirements['max_bw']}
							</MDTypography>
						</MDBox>
					),
					price: (
						<MDTypography variant="caption" color="text" fontWeight="medium">
							{resource.order.workerpoolprice}
						</MDTypography>
					),
					maxduration: (
						<MDTypography variant="caption" color="text" fontWeight="medium">
							{secondsToHMS(resource.order.taskmaxduration)}
						</MDTypography>
					),
					action: (
						<MDBox>
							< MDButton value={[resource['orderHash'], resource.order.taskmaxduration]}
								onClick={(event) => openPrompt(event.currentTarget.value)} >
								<MDTypography variant="caption" color="text" fontWeight="medium">
									Create Contract
								</MDTypography>
							</MDButton >
						</MDBox>
					),
				});
			}

			setRows(jsonArray);
		}

	}

	function secondsToHMS(seconds) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = seconds % 60;

		let formattedDuration = '';

		if (hours > 0) {
			formattedDuration += hours + 'h';
		}

		if (minutes > 0) {
			formattedDuration += ' ' + minutes + 'm';
		}

		if (remainingSeconds > 0) {
			formattedDuration += ' ' + remainingSeconds + 's';
		}

		return formattedDuration.trim();
	}

	const handleChange = (event) => {
		const { name, value } = event.target;
		const [criterion, property] = name.split('_');
		const numericValue = parseFloat(value); // Convert the value to a number
		// Check if the numericValue is a positive number
		if (!isNaN(numericValue) && numericValue >= 0) {
			setReqData((prevReqData) => ({
				...prevReqData,
				requirements: {
					...prevReqData.requirements,
					[criterion]: {
						...prevReqData.requirements[criterion],
						[property]: numericValue, // Use the numeric value
					},
				},
			}));
		}
	};


	function handleSubmit(event) {
		event.preventDefault();

		// Create a copy of the current formData object
		const updatedReqData = { ...reqData }; // Shallow copy of reqData
		updatedReqData.requirements = { ...reqData.requirements }; // Shallow copy of requirements
		updatedReqData.requirements.cpu = { ...reqData.requirements.cpu }; // Shallow copy of CPU
		updatedReqData.requirements.ram = { ...reqData.requirements.ram }; // Shallow copy of RAM
		updatedReqData.requirements.bandwidth = { ...reqData.requirements.bandwidth }; // Shallow copy of bandwidth


		// Function to replace blank fields appropriately
		const replaceBlankWithAppropriateValue = (value, isMax) => {
			if (typeof value === 'string' && value.trim() === '') {
				return isMax ? Number.MAX_SAFE_INTEGER : 0;
			}
			return parseInt(value);
		};


		// Update the formData object with replaced values
		updatedReqData.requirements.cpu.min = replaceBlankWithAppropriateValue(
			updatedReqData.requirements.cpu.min,
			false
		);
		updatedReqData.requirements.cpu.max = replaceBlankWithAppropriateValue(
			updatedReqData.requirements.cpu.max,
			true
		);
		updatedReqData.requirements.ram.min = replaceBlankWithAppropriateValue(
			updatedReqData.requirements.ram.min,
			false
		);
		updatedReqData.requirements.ram.max = replaceBlankWithAppropriateValue(
			updatedReqData.requirements.ram.max,
			true
		);

		updatedReqData.requirements.bandwidth.min = replaceBlankWithAppropriateValue(
			updatedReqData.requirements.bandwidth.min,
			false
		);
		updatedReqData.requirements.bandwidth.max = replaceBlankWithAppropriateValue(
			updatedReqData.requirements.bandwidth.max,
			true
		);

		findResources(updatedReqData);
	}

	const openPrompt = (value) => {
		setOrderInfo(value.split(','));

		setIsPromptOpen(true);
		setType(["Create Contract", 'Contract Creation in progress...']);
	};

	const closePrompt = () => {
		setOrderInfo('');
		setIsPromptOpen(false);
	};

	const handleInfoSubmit = (info) => {

		var orderHash = orderInfo[0];
		var maxDuration = orderInfo[1];
		var duration = parseInt(info.hours) * 3600 + parseInt(info.minutes) * 60;

		if (duration <= 0) {
			alert("Duration can not be null!");
		} else if (duration > maxDuration) {
			alert(`Duration can not exceed total duration specified by the resource provider (${maxDuration} seconds)!`);
		} else {
			createContract(orderHash, duration, CLUSTER_IP, CLUSTER_TOKEN, CLUSTER_HASH);
		}
	};

	const criteriaBoxStyle = {
		border: '1px solid #ccc',
		padding: '10px',
		borderRadius: '5px',
	};

	const criterionStyle = {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		margin: '10px',
	};

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
		<div>
			<div>
				<form onSubmit={handleSubmit}>
					<Grid container spacing={2}>
						<Grid item xs={4}>
							<div style={criteriaBoxStyle}>
								<div style={criterionStyle}>
									<MDTypography htmlFor="cpu_min" style={{ color: "#000000", fontSize: "0.5em" }}>Min CPU:</MDTypography>
									<input
										type="number"
										id="cpu_min"
										name="cpu_min"
										value={reqData.requirements.cpu.min}
										onChange={handleChange}
									/>
								</div>
								<div style={criterionStyle}>
									<MDTypography htmlFor="cpu_max" style={{ color: "#000000", fontSize: "0.5em" }}>Max CPU:</MDTypography>
									<input
										type="number"
										id="cpu_max"
										name="cpu_max"
										value={reqData.requirements.cpu.max}
										onChange={handleChange}
									/>
								</div>
							</div>
						</Grid>
						<Grid item xs={4}>
							<div style={criteriaBoxStyle}>
								<div style={criterionStyle}>
									<MDTypography htmlFor="ram_min" style={{ color: "#000000", fontSize: "0.5em" }}>Min RAM (MB):</MDTypography>
									<input
										type="number"
										id="ram_min"
										name="ram_min"
										value={reqData.requirements.ram.min}
										onChange={handleChange}
									/>
								</div>
								<div style={criterionStyle}>
									<MDTypography htmlFor="ram_max" style={{ color: "#000000", fontSize: "0.5em" }}>Max RAM (MB):</MDTypography>
									<input
										type="number"
										id="ram_max"
										name="ram_max"
										value={reqData.requirements.ram.max}
										onChange={handleChange}
									/>
								</div>
							</div>
						</Grid>
						<Grid item xs={4}>
							<div style={criteriaBoxStyle}>
								<div style={criterionStyle}>
									<MDTypography htmlFor="bandwidth_min" style={{ color: "#000000", fontSize: "0.5em" }}>Min Bandwidth (Mbps):</MDTypography>
									<input
										type="number"
										id="bandwidth_min"
										name="bandwidth_min"
										value={reqData.requirements.bandwidth.min}
										onChange={handleChange}
									/>
								</div>
								<div style={criterionStyle}>
									<MDTypography htmlFor="bandwidth_max" style={{ color: "#000000", fontSize: "0.5em" }}>Max Bandwidth (Mbps):</MDTypography>
									<input
										type="number"
										id="bandwidth_max"
										name="bandwidth_max"
										value={reqData.requirements.bandwidth.max}
										onChange={handleChange}
									/>
								</div>
							</div>
						</Grid>
					</Grid>
					<Divider />
					<MDBox textAlign='center'>
						<MDButton type="submit" variant="contained">Submit</MDButton>
					</MDBox>
				</form>
			</div>
			<MDBox pt={3}>
				<DataTable
					table={{ columns, rows }}
					isSorted={false}
					entriesPerPage={false}
					showTotalEntries={false}
					noEndBorder
				/>
				<Dialog open={isPromptOpen} onClose={closePrompt} onBackdropClick={closePrompt}>
					<InformationPrompt isOpen={isPromptOpen} onRequestClose={closePrompt} onSubmit={handleInfoSubmit} disabled={promiseInProgress} type={type} />
				</Dialog>
			</MDBox>
		</div>
		/*
	</div>
	</div>
	*/
	);
}


export default ResourceComponent;
