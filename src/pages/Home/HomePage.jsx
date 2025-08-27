import React from "react";
import { Layout, Button, Typography, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ backgroundColor: "#001529" }}>
        <Title style={{ color: "white", margin: 0 }} level={2}>
          Welcome to Our Service
        </Title>
      </Header>
      <Content style={{ padding: "50px" }}>
        <Row justify="center" align="middle" style={{ minHeight: "60vh" }}>
          <Col span={12} style={{ textAlign: "center" }}>
            <Typography>
              <Title>Welcome to Our Service</Title>
              <Paragraph>Please login or register to continue.</Paragraph>
            </Typography>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/login")}
              style={{ marginRight: "20px" }}
            >
              Login
            </Button>
            <Button
              type="default"
              size="large"
              onClick={() => navigate("/register")}
            >
              Register
            </Button>
          </Col>
        </Row>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        ©2024 Created by Your Company
      </Footer>
    </Layout>
  );
};
export default HomePage;
