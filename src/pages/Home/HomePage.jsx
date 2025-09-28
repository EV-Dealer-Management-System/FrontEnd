import React from "react";
import { Button, Typography, Row, Col, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@ant-design/pro-components";
import Navbar from "../../components/Navbar";

const { Title, Paragraph } = Typography;

const adjectives = [
  "Chuyên nghiệp",
  "Cao cấp",
  "Tiện lợi",
  "Nhanh chóng",
  "Tiết kiệm",
  "Thông minh",
  "Bảo mật",
  "Đáng tin cậy",
];
const items = [
  "Gói dịch vụ",
  "Sản phẩm",
  "Giải pháp",
  "Tiện ích",
  "Module",
  "Add-on",
  "Gói hỗ trợ",
  "Bản quyền",
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProducts(count = 12) {
  return Array.from({ length: count }, (_, i) => {
    const name = `${adjectives[getRandomInt(0, adjectives.length - 1)]} ${
      items[getRandomInt(0, items.length - 1)]
    }`;
    const price = getRandomInt(99, 1999) * 1000;
    const duration = ["theo tháng", "theo năm", "trọn đời"][getRandomInt(0, 2)];
    const desc = `Giải pháp giúp bạn vận hành hiệu quả hơn, hỗ trợ ${
      getRandomInt(5, 100)
    }+ tác vụ ${duration}.`;
    return {
      id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      price,
      desc,
    };
  });
}

const HomePage = () => {
  const navigate = useNavigate();
  const products = React.useMemo(() => generateProducts(12), []);
  return (
    <Navbar title="Hệ thống quản lý dịch vụ">
      <PageContainer breadcrumb={false}>
        <div className="bg-gradient-to-br from-blue-50 to-white">
          <div className="text-center w-full px-6 py-16">
          <Title level={1} className="text-3xl font-bold mb-4">
            Welcome to Our Service
          </Title>
          <Paragraph className="text-lg text-gray-600 mb-8">
            Please login or register to continue.
          </Paragraph>
          <div className="flex justify-center gap-6">
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/login")}
              className="!min-w-[120px] !rounded-xl !font-medium hover:!scale-105 hover:!shadow-lg transition-all duration-200"
            >
              Login
            </Button>
            <Button
              type="default"
              size="large"
              onClick={() => navigate("/register")}
              className="!min-w-[120px] !rounded-xl !font-medium hover:!scale-105 hover:!shadow-lg transition-all duration-200"
            >
              Register
            </Button>
            </div>

            {/* Products/Services grid */}
            <div className="w-full mt-14">
              <Title level={3} className="!mb-4">Sản phẩm / Dịch vụ mẫu</Title>
              <Paragraph className="text-gray-600 !mb-8">
                Danh sách ngẫu nhiên được tạo khi tải trang để minh họa giao diện.
              </Paragraph>
              <Row gutter={[16, 16]}>
                {products.map((p) => (
                  <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
                    <Card hoverable className="!rounded-xl h-full" title={p.name}>
                      <Paragraph className="!mb-4 text-gray-600">{p.desc}</Paragraph>
                      <div className="text-xl font-semibold text-blue-600">
                        {p.price.toLocaleString("vi-VN")}₫
                      </div>
                      <div className="mt-4">
                        <Button type="primary" block className="!rounded-lg">Dùng thử</Button>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        </div>
      </PageContainer>
    </Navbar>
  );
};
export default HomePage;
