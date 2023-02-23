import './App.css';

import * as React from 'react';

function CurrentResourcesComponent() {

	return (
		<div className="content">
			<h2 style={{ color: "#000000" }}>DatacloudWP1</h2>		
			<iframe title="resources" src="http://datacloud-r-market.westeurope.cloudapp.azure.com:30000/d-solo/Home/home?orgId=2&refresh=1m&from=1676386007917&to=1676990807917&panelId=6" width="1000px" height="300px" frameorder="0"></iframe>
		</div>
		/*
	</div>
	</div>
	*/
	);
}


export default CurrentResourcesComponent;
