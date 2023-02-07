import './App.css';

import * as React from 'react';
import { useState } from 'react';
//import styled from 'styled-components'
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
//import { faChevronCircleDown } from '@fortawesome/free-solid-svg-icons'
import { IExecDealModule, IExecTaskModule } from 'iexec';
import { config, checkMetamask } from './App';
import { BlobReader, TextWriter, ZipReader } from "@zip.js/zip.js";

const [status, setStatus] = useState('');
const [contract, setContract] = useState('');
const [result, setResult] = useState('');

const [contractCompleted, setContractCompleted] = useState(false);

async function getStatus(contract) {
	setResult('');
	if (checkMetamask) {
		if (contract === '') {
			alert('Please provide a contract ID!');
		} else {
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
	if (checkMetamask) {
		if (contract === '') {
			alert('Please provide a contract ID!');
		} else {
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

function handleChangeContract(event) {
	setContract(event.target.value);
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

		<label style={{ color: "#000000" }}> Contract ID </label>
		<input
			type="text"
			name="contract"
			value={contract}
			placeholder="Please put a valid contract ID here..."
			onChange={handleChangeContract}
			style={{ width: "700px" }}
		/>
		<br />
		<button onClick={getStatus}> Get Status </button>
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
		<button onClick={getResult} disabled={!contractCompleted}> Get Result </button>
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
	</div>
	/*
</div>
</div>
*/
);


export { getStatus, getResult };
