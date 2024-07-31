/**
=========================================================
* R-MARKET React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// R-MARKET React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDProgress from "components/MDProgress";

import Dialog from '@mui/material/Dialog';
import InformationPrompt from 'components/App-Prompt';

// R-MARKET React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DataTable from "examples/Tables/DataTable";

// Images
import { extendContract, interruptContract } from 'components/App-Contract';
import { getRawKafkaInfo, getKafkaInfo, getTimestamp, getDate } from 'components/App-Kafka';

import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import Popover from '@mui/material/Popover';

import { useState, useEffect } from 'react';
import axios from 'axios';

import { getIexec, checkBrowser, getAddress } from 'components/App';

import { usePromiseTracker } from "react-promise-tracker";
import MoreVertIcon from '@mui/icons-material/MoreVert';

// Data
function Tables() {

	const [menuRow, setMenuRow] = useState(null);
	const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

	const handleMenuClick = (event, row) => {
		setMenuRow(row);
		setMenuPosition({
			top: event.clientY,
			left: event.clientX,
		});
	};

	const handleMenuClose = () => {
		setMenuRow(null);
	};

	const handleMenuItemClick = (action) => {
		if (action === 'extend') {
			openExtensionPrompt(`${menuRow.taskid},${menuRow.prevduration},${menuRow.maxduration}`);
		}
		if (action === 'interrupt') {
			openInterruptionPrompt(`${menuRow.taskid}`);
		}
		handleMenuClose(); // Close the menu
	};



	const [extensionOrderInfo, setExtensionOrderInfo] = useState('');
	const [isExtensionPromptOpen, setIsExtensionPromptOpen] = useState(false);
	const [type, setType] = useState({});

	const [interruptionOrderInfo, setInterruptionOrderInfo] = useState('');
	const [isInterruptionPromptOpen, setIsInterruptionPromptOpen] = useState(false);

	const { promiseInProgress } = usePromiseTracker();

	const openExtensionPrompt = (value) => {
		setExtensionOrderInfo(value.split(','));
		setIsExtensionPromptOpen(true);
		setType(["Extend Contract", 'Contract Extenstion in progress...']);
	};

	const closeExtensionPrompt = () => {
		setExtensionOrderInfo('');
		setIsExtensionPromptOpen(false);
	};

	const handleExtensionInfoSubmit = (info) => {

		var taskid = extensionOrderInfo[0];
		var prevDuration = extensionOrderInfo[1];
		var maxDuration = extensionOrderInfo[2];
		var duration = parseInt(info.hours) * 3600 + parseInt(info.minutes) * 60;
		var newDuration = parseInt(prevDuration) + parseInt(duration);

		if (duration <= 0) {
			alert("Duration can not be null!");
		} else if (newDuration > maxDuration) {
			alert(`Duration can not exceed total duration specified by the resource provider (${maxDuration} seconds)!`);
		} else {
			extendContract(taskid, duration).then(getContracts());
		}
	};

	const openInterruptionPrompt = (value) => {
		setInterruptionOrderInfo(value.split(','));
		setIsInterruptionPromptOpen(true);
		setType(["Interrupt Contract", 'Contract Interruption in progress...']);
	};

	const closeInterruptionPrompt = () => {
		setIsInterruptionPromptOpen(false);
	};

	const handleInterruptionInfoSubmit = () => {
		var taskid = interruptionOrderInfo[0];
		interruptContract(taskid).then(getContracts());
	};

	async function getContracts() {
		if (checkBrowser()) {
			const address = await getAddress();
			const contracts = await axios.get('https://r-market.westeurope.cloudapp.azure.com:5000/contracts/list?userAddress='.concat(address));
			//var result = contracts.data.join('\r\n\r\n');
			if (contracts.data.length === 0) {
				//result = 'This account does not have any contract yet. Try to create one first!';
				//alert('This account does not have any contract yet. Try to create one first!');
			}
			//setContracts(result);
			var data = [];
			const reservedResources = await getRawKafkaInfo(address);

			for (const element of contracts.data) {
				var jsonElement = JSON.parse(element);
				var status = await getStatus(jsonElement['contractID']);
				var start = "N/A";
				var end = "N/A";
				var diffEnd = 1;
				var now = Date.now();

				var diffNow = 0;

				var heartbeat = "N/A";

				var deal = await getIexec().deal.show(jsonElement['contractID']);

				var kafkaInfo = await getKafkaInfo(reservedResources, deal.tasks[0]);

				if (kafkaInfo.length !== 0) {
					start = getDate(getTimestamp(kafkaInfo[0].start));
					var pEnd = getTimestamp(start) + parseInt(deal.duration);

					if (pEnd < getTimestamp(kafkaInfo[0].end)) {
						end = kafkaInfo[0].end;
					} else {
						end = getDate(pEnd);
					}

					heartbeat = ((now - (getTimestamp(kafkaInfo[0].end)) * 1000) / 1000).toFixed(0);
					if (heartbeat >= 60) {
						heartbeat = ">1mn";
					} else {
						heartbeat = heartbeat.concat(" s");
					}

					diffNow = getTimestamp(kafkaInfo[0].end) - getTimestamp(start);
					diffEnd = getTimestamp(end) - getTimestamp(start);

					if (diffNow > diffEnd) {
						diffNow = diffEnd;
					}

				} else if (status === "ACTIVE") {
					status = "WAITING";
				}

				var completion = parseInt(((diffNow / diffEnd) * 100).toFixed(0));

				var jsonObject =
				{
					contractid: jsonElement['contractID'],
					taskid: deal.tasks[0],
					prevduration: deal.duration,
					maxduration: deal.maxduration,
					creationtime: getDate(jsonElement['startTime']),
					status: (
						<MDTypography variant="caption" color="text" fontWeight="medium">
							{status}
						</MDTypography>
					),
					starttime: (
						<MDTypography variant="caption" color="text" fontWeight="medium">
							{start}
						</MDTypography>
					),
					endtime: (
						<MDTypography variant="caption" color="text" fontWeight="medium">
							{end}
						</MDTypography>
					),
					completion: <Progress color="info" value={completion} />,
					heartbeat: (
						<MDTypography variant="caption" color="text" fontWeight="medium">
							{heartbeat}
						</MDTypography>
					)
				}
				data.push(jsonObject);
			}
			setRows(data);
		}
	}

	async function getStatus(contract) {
		var status = "WAITING";
		if (checkBrowser()) {
			if (contract === '') {
				alert('Please provide a contract ID!');
			} else {
				try {
					const deal = await getIexec().deal.show(contract);
					try {
						const task = await getIexec().task.show(deal.tasks[0]);
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
					alert('Contract not found!');
				}
			}
		}
		return status;
	}

	const Progress = ({ color, value }) => (
		<MDBox display="flex" alignItems="center">
			<MDTypography variant="caption" color="text" fontWeight="medium">
				{value}%
			</MDTypography>
			<MDBox ml={0.5} width="9rem">
				<MDProgress variant="gradient" color={color} value={value} />
			</MDBox>
		</MDBox>
	);

	const columns = [
		{ Header: "contract id", accessor: "contractid", width: "12.5%", align: "left" },
		{ Header: "creation time", accessor: "creationtime", width: "12.5%", align: "center" },
		{ Header: "status", accessor: "status", width: "12.5%", align: "center" },
		{ Header: "start time", accessor: "starttime", width: "12.5%", align: "center" },
		{ Header: "end time", accessor: "endtime", width: "12.5%", align: "center" },
		{ Header: "completion", accessor: "completion", width: "12.5%", align: "center" },
		{ Header: "latest heartbeat", accessor: "heartbeat", width: "12.5%", align: "center" },
		{
			Header: "action", accessor: "action", width: "12.5%", align: "center", Cell: ({ row }) => (
				<div>
					<IconButton
						aria-label="more options"
						onClick={(e) => handleMenuClick(e, row.original)}
					>
						<MoreVertIcon />
					</IconButton>

					{menuRow && menuRow.id === row.original.id && (
						<Popover
							open={Boolean(menuRow)}
							anchorReference="anchorPosition"
							anchorPosition={menuPosition}
							onClose={handleMenuClose}
							PaperProps={{
								style: {
									backgroundColor: 'rgba(255, 255, 255, 0.9)', // Adjust the alpha value (fourth parameter) as needed
									boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.2)', // Optional: Add a shadow
								},
							}}
						>
							<MenuItem onClick={() => handleMenuItemClick('extend')}>Extend</MenuItem>
							<MenuItem onClick={() => handleMenuItemClick('interrupt')}>Interrupt</MenuItem>
							{/* Add more menu items as needed */}
						</Popover>
					)}
				</div>
			)
		},
	];

	const [rows, setRows] = useState([]);

	useEffect(() => {
		// This code will run when the component is mounted

		// Call your function here
		getContracts();
	}, []);

	return (
		<DashboardLayout>
			<MDBox pt={6} pb={3}>
				<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
					<IconButton color="primary" aria-label="Refresh" onClick={getContracts}>
						<RefreshIcon />
					</IconButton>
				</div>
				<Grid container spacing={6}>
					<Grid item xs={12}>
						<Card>
							<MDBox pt={3}>
								<DataTable
									table={{ columns, rows }}
									isSorted={false}
									entriesPerPage={false}
									showTotalEntries={false}
									noEndBorder
								/>
								<Dialog open={isExtensionPromptOpen} onClose={closeExtensionPrompt} onBackdropClick={closeExtensionPrompt}>
									<InformationPrompt isOpen={isExtensionPromptOpen} onRequestClose={closeExtensionPrompt} onSubmit={handleExtensionInfoSubmit} disabled={promiseInProgress} type={type} />
								</Dialog>
								<Dialog open={isInterruptionPromptOpen} onClose={closeInterruptionPrompt} onBackdropClick={closeInterruptionPrompt}>
									<InformationPrompt isOpen={isInterruptionPromptOpen} onRequestClose={closeInterruptionPrompt} onSubmit={handleInterruptionInfoSubmit} disabled={promiseInProgress} type={type} />
								</Dialog>
							</MDBox>
						</Card>
					</Grid>
				</Grid>
			</MDBox>
		</DashboardLayout>
	);
}

export default Tables;
