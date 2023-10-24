/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

import ContractCreationCards from "examples/Cards/ContractCreationCards";

function Dashboard() {

	return (
		<DashboardLayout>
			<Grid item xs={12} md={6} lg={3}>
				<MDBox mb={1.5}>
					<ContractCreationCards
						color="dark"
						icon="computer"
						title="Contract Creation"
						count={281}
						percentage={{
							color: "success",
							amount: "+55%",
							label: "than lask week",
						}}
					/>
				</MDBox>
			</Grid>
		</DashboardLayout>
	);
}

export default Dashboard;
