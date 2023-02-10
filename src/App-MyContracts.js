import './App.css';

import * as React from 'react';
import { useState } from 'react';
//import styled from 'styled-components'
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
//import { faChevronCircleDown } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios';
import { IExecDealModule, IExecTaskModule } from 'iexec';
import { getConfig, checkBrowser, getAddress } from './App';
import { BlobReader, TextWriter, ZipReader } from "@zip.js/zip.js";

function MyContractsComponent() {
	/*
	const label = 'My Contracts';
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


	//const [contracts, setContracts] = useState('');
	const [data, setData] = useState([]);
	const [contract, setContract] = useState('');
	const [status, setStatus] = useState('');
	const [result, setResult] = useState('');

	async function getContracts() {
		if (checkBrowser()) {
			const address = await getAddress();
			const contracts = await axios.get('https://20.71.159.181:5000/contracts/list?userAddress='.concat(address));

			//var result = contracts.data.join('\r\n\r\n');
			if (contracts.data.length === 0) {
				//result = 'This account does not have any contract yet. Try to create one first!';
				alert('This account does not have any contract yet. Try to create one first!');
			}
			//setContracts(result);
			var data = [];
			contracts.data.forEach(element => data.push(JSON.parse(element)));
			setData(data);
		}
	}

	const [contractCompleted, setContractCompleted] = useState(false);

	async function getStatus(contract) {
		setResult('');
		if (checkBrowser()) {
			if (contract === '') {
				alert('Please provide a contract ID!');
			} else {
				const config = getConfig();
				const dealModule = IExecDealModule.fromConfig(config);
				try {
					const dealObservable = await dealModule.obsDeal(contract);

					dealObservable.subscribe({
						next: (data) =>
							defineStatus(data.message),
						error: (e) => { defineStatus(e); },
					});
					// call unsubscribe() to unsubscribe from dealObservable
					//getBalance(address);
					//setStatus(status.data.join('\r\n\r\n'));
				} catch (error) {
					console.log(error);
					alert('Contract not found!');
				}
			}
		}
	}

	async function getResult(contract) {
		if (checkBrowser()) {
			if (contract === '') {
				alert('Please provide a contract ID!');
			} else {
				const config = getConfig();
				const dealModule = IExecDealModule.fromConfig(config);
				try {
					const deal = await dealModule.show(contract);
					const taskModule = IExecTaskModule.fromConfig(config);
					const result = await taskModule.fetchResults(deal.tasks[0]);
					const binary = await result.blob();
					// Creates a BlobReader object used to read `zipFileBlob`.
					const zipFileReader = new BlobReader(binary);
					// Creates a TextWriter object where the content of the first entry in the zip
					// will be written.
					const helloWorldWriter = new TextWriter();

					// Creates a ZipReader object reading the zip content via `zipFileReader`,
					// retrieves metadata (name, dates, etc.) of the first entry, retrieves its
					// content via `helloWorldWriter`, and closes the reader.
					const zipReader = new ZipReader(zipFileReader);
					const entries = await zipReader.getEntries();
					var entry = entries.shift();
					while (entry.filename !== 'result.txt') {
						entry = entries.shift();
					}

					const text = await entry.getData(helloWorldWriter);
					await zipReader.close();

					setResult(text);
				} catch (error) {
					console.log(error);
					alert('Contract not found!');
				}
			}
		}
	}

	async function defineStatus(message) {
		switch (message) {
			case 'DEAL_COMPLETED':
				setStatus("The task has been executed, you can retrieve the result of the execution!");
				setContractCompleted(true);
				break;
			case 'DEAL_UPDATED':
				setStatus("Task execution in progress, please wait...");
				setContractCompleted(false);
				break;
			case 'DEAL_TIMEDOUT':
				setStatus("Task failed!");
				setContractCompleted(false);
				break;
			default:
				setStatus(message);
				setContractCompleted(false);
		}

	}

	function handleClickSelect(event) {
		if (event.target.value !== contract) {
			setContract(event.target.value);
			setStatus('');
			setResult('');
			setContractCompleted(false);
		}
	}

	function handleClickStatus(event) {
		getStatus(event.target.value);
	}

	function handleClickResult(event) {
		getResult(event.target.value);
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
		<div className="content">
			<div>
				<button onClick={getContracts}> get My Contracts </button>
			</div>
			<br />
			<label style={{ color: "#000000" }}> Contract ID </label>
			<input
				type="text"
				id="contract"
				name="contract"
				value={contract}
				placeholder="Click on 'Get Status' and the corresponding contract ID will appear here..."
				readOnly={true}
				style={{ width: "700px" }}
			/>
			<br />
			<label style={{ color: "#000000" }}> Status </label>
			<input
				type="text"
				id="status"
				name="status"
				value={status}
				placeholder="Click on 'Get Status' and the status of the corresponding contract will appear here..."
				readOnly={true}
				style={{ width: "700px" }}
			/>
			<br />
			<label style={{ color: "#000000" }}> Result </label>
			<input
				type="text"
				id="result"
				name="result"
				value={result}
				placeholder="Click on 'Get Result' and the result of the corresponding contract will appear here..."
				readOnly={true}
				style={{ width: "700px" }}
			/>
			<br />
			<button value={contract} onClick={handleClickStatus} disabled={contract === ''}>
				Get Status
			</button>
			<button value={contract} onClick={handleClickResult} disabled={!contractCompleted}>
				Get Result
			</button>
			<div>
				<table className="styled-table">
					<thead>
						<tr>
							<th>Contract ID</th>
							<th>Creation Time</th>
							<th>Select</th>
						</tr>
					</thead>
					<tbody>
						{
							data.map((item) => (
								<tr key={item.contractID}>
									<td>{item.contractID}</td>
									<td>{item.startTime}</td>
									<td>
										<button className="link" value={item.contractID} onClick={handleClickSelect}>
											Select
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


export default MyContractsComponent;
