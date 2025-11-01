import React from "react";
import SensorData from "../Tables/DeviceTable"; // Adjusted the path to match the relative location
import Layout from "../MainLayout";

export const Home: React.FC = () => {
  return (
    <Layout>
      <SensorData />
    </Layout>
  );
};

