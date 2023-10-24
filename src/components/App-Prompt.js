import React, { useState } from 'react';
import { usePromiseTracker } from "react-promise-tracker";
import { RotatingLines } from 'react-loader-spinner';

function InformationPrompt({ isOpen, onRequestClose, onSubmit, type }) {
	const [hours, setHours] = useState(0);
	const [minutes, setMinutes] = useState(0);
	const [selectedFile, setSelectedFile] = useState(null);
	const { promiseInProgress } = usePromiseTracker();

	const handleSubmit = () => {
		const duration = {
			hours: hours,
			minutes: minutes,
		};
		onSubmit(duration);
		// Clear the input fields
		setHours(0);
		setMinutes(0);
	};

	const handleCancel = () => {
		// Clear the input fields
		setHours(0);
		setMinutes(0);
		onRequestClose();
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
		<div className="information-prompt" style={{ display: isOpen ? 'block' : 'none' }}>
			<div className="modal-content">
				{(() => {
					if (type[0] !== "Interrupt Contract") {
						return <div>
							<h3>Enter Duration</h3>
							<div className="duration-input">
								<input
									type="number"
									placeholder="Hours"
									value={hours}
									onChange={(e) => {
										const inputValue = parseFloat(e.target.value);
										if (inputValue >= 0) {
											setHours(inputValue);
										}
									}}
									min="0" // Minimum allowed value is 0
								/>
								<span className="input-label">Hours</span>
							</div>
							<div className="duration-input">
								<input
									type="number"
									placeholder="Minutes"
									value={minutes}
									onChange={(e) => {
										const inputValue = parseFloat(e.target.value);
										if (inputValue >= 0 && inputValue < 60) {
											setMinutes(inputValue);
										}
									}}
									min="0" // Minimum allowed value is 0
								/>
								<span className="input-label">Minutes</span>
							</div>
						</div>;
					}
				})()}

				<button onClick={handleSubmit} className="btn-submit" disabled={promiseInProgress}>
					{promiseInProgress ? type[1] : type[0]}
				</button>
				<button onClick={handleCancel} className="btn-cancel" disabled={promiseInProgress}>
					Cancel
				</button>
			</div>
			{/*
			<LoadingIndicator />
			*/}
		</div>
	);
}

export default InformationPrompt;
