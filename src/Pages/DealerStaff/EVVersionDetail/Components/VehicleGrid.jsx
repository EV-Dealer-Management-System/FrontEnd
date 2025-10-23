import React from "react";
import { Row, Col } from "antd";
import VehicleCard from "../components/VehicleCard";

function VehicleGrid({ vehicles, formatPriceShort, onViewDetails }) {
  return (
    <Row gutter={[16, 16]}>
      {vehicles.map((vehicle, index) => (
        <Col xs={24} sm={12} md={8} lg={6} key={index}>
          <VehicleCard
            vehicle={vehicle}
            formatPriceShort={formatPriceShort}
            onViewDetails={onViewDetails}
          />
        </Col>
      ))}
    </Row>
  );
}

export default VehicleGrid;
