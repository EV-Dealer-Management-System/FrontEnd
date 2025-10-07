import React, { useState, useRef, useEffect } from 'react';
import {
    Modal,
    Button,
    InputNumber,
    Space,
    message,
    Typography,
    Card,
    Row,
    Col,
    Alert,
    Spin
} from 'antd';
import {
    CheckOutlined,
    CloseOutlined,
    DragOutlined,
    InfoCircleOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
    FullscreenOutlined
} from '@ant-design/icons';

const { Text } = Typography;

// Kích thước trang A4 theo points (1 point = 1/72 inch)
const A4_WIDTH = 595;
const A4_HEIGHT = 842;

// Modal để chọn vị trí chữ ký trên PDF với drag & drop
const SignaturePositionModal = ({
    visible,
    onCancel,
    onConfirm,
    contractLink,
    contractNo,
    signaturePreview
}) => {
    // State cho vị trí chữ ký (tọa độ PDF: llx, lly là góc dưới trái)
    const [signaturePosition, setSignaturePosition] = useState({
        llx: 50,    // Lower-left X
        lly: 110,   // Lower-left Y (từ đáy lên)
        width: 170, // Chiều rộng
        height: 70  // Chiều cao
    });

    // State khác
    const [signingPage, setSigningPage] = useState(0);
    const [pdfLoaded, setPdfLoaded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [currentService, setCurrentService] = useState(1); // Default to PDF.js Viewer
    const [signatureImage, setSignatureImage] = useState(null); // Image object cho preview
    const [zoom, setZoom] = useState(100); // Zoom level (%)
    const [isOverBox, setIsOverBox] = useState(false); // Mouse over signature box
    // Touchpad state
    const [touchpadDragging, setTouchpadDragging] = useState(false);
    const [touchpadStart, setTouchpadStart] = useState({ x: 0, y: 0 });
    const [touchpadSensitivity, setTouchpadSensitivity] = useState(2); // Độ nhạy

    // Refs
    const pdfContainerRef = useRef(null);
    const overlayRef = useRef(null);
    const iframeRef = useRef(null);

    // PDF Viewer services
    const services = [
        {
            name: "Google Docs Viewer",
            url: `https://docs.google.com/gview?url=${encodeURIComponent(contractLink)}&embedded=true`,
        },
        {
            name: "PDF.js Viewer",
            url: `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(contractLink)}`,
        },
        {
            name: "Direct PDF",
            url: contractLink,
        }
    ];

    const handleServiceChange = () => {
        setCurrentService((prev) => (prev + 1) % services.length);
        setPdfLoaded(false);
        setTimeout(() => setupCanvas(), 300);
    };

    // Zoom handlers
    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 25, 200));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 25, 50));
    };

    const handleZoomReset = () => {
        setZoom(100);
    };

    // Touchpad handlers
    const handleTouchpadMouseDown = (e) => {
        setTouchpadDragging(true);
        setTouchpadStart({ x: e.clientX, y: e.clientY });
        e.preventDefault();
    };

    const handleTouchpadMouseMove = (e) => {
        if (!touchpadDragging) return;

        const deltaX = (e.clientX - touchpadStart.x) * touchpadSensitivity;
        const deltaY = (e.clientY - touchpadStart.y) * touchpadSensitivity;

        setSignaturePosition(prev => {
            // X: đi sang phải tăng llx, đi sang trái giảm llx
            const newLlx = Math.max(0, Math.min(prev.llx + deltaX, A4_WIDTH - prev.width));
            // Y: đi xuống giảm lly (PDF gốc dưới), đi lên tăng lly
            const newLly = Math.max(0, Math.min(prev.lly - deltaY, A4_HEIGHT - prev.height));

            return { ...prev, llx: newLlx, lly: newLly };
        });

        // Reset start point để di chuyển liên tục
        setTouchpadStart({ x: e.clientX, y: e.clientY });
        e.preventDefault();
    };

    const handleTouchpadMouseUp = () => {
        if (touchpadDragging) {
            setTouchpadDragging(false);
            message.success(`Đã đặt vị trí: (${Math.round(signaturePosition.llx)}, ${Math.round(signaturePosition.lly)})`);
        }
    };

    const resetPosition = () => {
        setSignaturePosition({
            llx: (A4_WIDTH - signaturePosition.width) / 2,
            lly: (A4_HEIGHT - signaturePosition.height) / 2,
            width: signaturePosition.width,
            height: signaturePosition.height
        });
        message.info('Đã đặt chữ ký giữa trang!');
    };

    // Tính urx và ury từ công thức: urx = llx + width, ury = lly + height
    const calculateUrxUry = React.useCallback(() => {
        return {
            urx: signaturePosition.llx + signaturePosition.width,
            ury: signaturePosition.lly + signaturePosition.height
        };
    }, [signaturePosition]);

    // Format position string: "llx,lly,urx,ury"
    const getPositionString = () => {
        const { urx, ury } = calculateUrxUry();
        return `${Math.round(signaturePosition.llx)},${Math.round(signaturePosition.lly)},${Math.round(urx)},${Math.round(ury)}`;
    };

    // Chuyển PDF coords (gốc dưới trái) sang canvas coords (gốc trên trái)
    const pdfToCanvas = React.useCallback((pdfX, pdfY) => {
        if (!overlayRef.current) return { x: 0, y: 0 };

        const canvas = overlayRef.current;
        const scaleX = canvas.width / A4_WIDTH;
        const scaleY = canvas.height / A4_HEIGHT;

        // PDF Y tính từ dưới lên, canvas Y tính từ trên xuống
        const canvasX = pdfX * scaleX;
        const canvasY = (A4_HEIGHT - pdfY - signaturePosition.height) * scaleY;

        return { x: canvasX, y: canvasY };
    }, [signaturePosition.height]);

    // Chuyển canvas coords sang PDF coords
    const canvasToPdf = React.useCallback((canvasX, canvasY) => {
        if (!overlayRef.current) return { x: 0, y: 0 };

        const canvas = overlayRef.current;
        const scaleX = A4_WIDTH / canvas.width;
        const scaleY = A4_HEIGHT / canvas.height;

        const pdfX = canvasX * scaleX;
        const pdfY = A4_HEIGHT - (canvasY * scaleY) - signaturePosition.height;

        return { x: pdfX, y: pdfY };
    }, [signaturePosition.height]);

    // Vẽ signature box trên canvas overlay
    const drawSignatureBox = React.useCallback(() => {
        const canvas = overlayRef.current;
        if (!canvas || !pdfLoaded) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Tính vị trí và kích thước trên canvas
        const { x: canvasX, y: canvasY } = pdfToCanvas(signaturePosition.llx, signaturePosition.lly);
        const scaleX = canvas.width / A4_WIDTH;
        const scaleY = canvas.height / A4_HEIGHT;
        const canvasWidth = signaturePosition.width * scaleX;
        const canvasHeight = signaturePosition.height * scaleY;

        // Vẽ với hiệu ứng đẹp
        ctx.save();

        // Shadow
        ctx.shadowColor = 'rgba(24, 144, 255, 0.4)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 5;

        // Nền
        ctx.fillStyle = isDragging ? 'rgba(24, 144, 255, 0.25)' : 'rgba(24, 144, 255, 0.15)';
        ctx.fillRect(canvasX, canvasY, canvasWidth, canvasHeight);

        ctx.restore();

        // Viền
        ctx.strokeStyle = isDragging ? '#40a9ff' : '#1890ff';
        ctx.lineWidth = isDragging ? 4 : 3;
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(canvasX, canvasY, canvasWidth, canvasHeight);

        // Vẽ chữ ký preview nếu có
        if (signatureImage) {
            ctx.save();
            // Tạo padding 8px
            const padding = 8;
            const imgX = canvasX + padding;
            const imgY = canvasY + padding;
            const imgW = canvasWidth - padding * 2;
            const imgH = canvasHeight - padding * 2;

            // Vẽ nền trắng cho signature
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.fillRect(imgX, imgY, imgW, imgH);

            // Vẽ signature image
            ctx.drawImage(signatureImage, imgX, imgY, imgW, imgH);
            ctx.restore();
        } else {
            // Text khi chưa có signature
            ctx.fillStyle = '#1890ff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('📝 Kéo để di chuyển', canvasX + canvasWidth / 2, canvasY + canvasHeight / 2);
        }

        // Tọa độ (llx, lly)
        ctx.font = '11px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillRect(canvasX, canvasY - 20, 120, 18);
        ctx.fillStyle = '#1890ff';
        ctx.textAlign = 'left';
        ctx.fillText(
            `(${Math.round(signaturePosition.llx)}, ${Math.round(signaturePosition.lly)})`,
            canvasX + 5,
            canvasY - 11
        );

        // urx, ury ở góc phải trên
        const { urx, ury } = calculateUrxUry();
        ctx.fillStyle = '#fff';
        ctx.fillRect(canvasX + canvasWidth - 120, canvasY + canvasHeight + 2, 120, 18);
        ctx.fillStyle = '#1890ff';
        ctx.textAlign = 'right';
        ctx.fillText(
            `(${Math.round(urx)}, ${Math.round(ury)})`,
            canvasX + canvasWidth - 5,
            canvasY + canvasHeight + 11
        );

        // Handles góc
        const handleSize = 8;
        ctx.fillStyle = '#1890ff';
        [[0, 0], [canvasWidth, 0], [0, canvasHeight], [canvasWidth, canvasHeight]].forEach(([dx, dy]) => {
            ctx.fillRect(canvasX + dx - handleSize / 2, canvasY + dy - handleSize / 2, handleSize, handleSize);
        });
    }, [signaturePosition, pdfLoaded, isDragging, pdfToCanvas, signatureImage, calculateUrxUry]);

    // Effect vẽ lại khi thay đổi
    useEffect(() => {
        drawSignatureBox();
    }, [drawSignatureBox]);

    // Kiểm tra click trong signature box
    const isInsideBox = (canvasX, canvasY) => {
        const { x: boxX, y: boxY } = pdfToCanvas(signaturePosition.llx, signaturePosition.lly);
        const canvas = overlayRef.current;
        if (!canvas) return false;

        const scaleX = canvas.width / A4_WIDTH;
        const scaleY = canvas.height / A4_HEIGHT;
        const boxWidth = signaturePosition.width * scaleX;
        const boxHeight = signaturePosition.height * scaleY;

        return canvasX >= boxX && canvasX <= boxX + boxWidth &&
            canvasY >= boxY && canvasY <= boxY + boxHeight;
    };

    // Mouse down - bắt đầu drag
    const handleMouseDown = (e) => {
        const canvas = overlayRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isInsideBox(x, y)) {
            setIsDragging(true);
            const { x: boxX, y: boxY } = pdfToCanvas(signaturePosition.llx, signaturePosition.lly);
            setDragOffset({ x: x - boxX, y: y - boxY });
            e.preventDefault();
            e.stopPropagation();
        }
    };

    // Mouse move - di chuyển
    const handleMouseMove = (e) => {
        const canvas = overlayRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check nếu mouse ở trong box
        const inBox = isInsideBox(x, y);
        setIsOverBox(inBox);

        // Nếu đang drag, di chuyển signature
        if (isDragging) {
            const canvasX = x - dragOffset.x;
            const canvasY = y - dragOffset.y;

            const { x: pdfX, y: pdfY } = canvasToPdf(canvasX, canvasY);

            // Giới hạn trong bounds của A4
            const newLlx = Math.max(0, Math.min(pdfX, A4_WIDTH - signaturePosition.width));
            const newLly = Math.max(0, Math.min(pdfY, A4_HEIGHT - signaturePosition.height));

            setSignaturePosition(prev => ({
                ...prev,
                llx: newLlx,
                lly: newLly
            }));

            // CHỈ preventDefault khi đang drag
            e.preventDefault();
            e.stopPropagation();
        }
        // KHÔNG drag → KHÔNG preventDefault → SCROLL TỰ DO ✓
    };

    // Mouse up - kết thúc drag
    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            message.success(`Đã đặt vị trí: (${Math.round(signaturePosition.llx)}, ${Math.round(signaturePosition.lly)})`);
        }
    };

    // Click - đặt vị trí nhanh
    const handleCanvasClick = (e) => {
        if (isDragging) return;

        const canvas = overlayRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (!isInsideBox(x, y)) {
            const { x: pdfX, y: pdfY } = canvasToPdf(x, y);

            // Đặt center của box tại vị trí click
            const newLlx = Math.max(0, Math.min(pdfX - signaturePosition.width / 2, A4_WIDTH - signaturePosition.width));
            const newLly = Math.max(0, Math.min(pdfY - signaturePosition.height / 2, A4_HEIGHT - signaturePosition.height));

            setSignaturePosition(prev => ({ ...prev, llx: newLlx, lly: newLly }));
            message.info('Đã di chuyển chữ ký!');
            e.preventDefault();
            e.stopPropagation();
        }
    };

    // Setup canvas khi PDF load - Đảm bảo tỷ lệ A4 chính xác
    const setupCanvas = () => {
        const container = pdfContainerRef.current;
        const canvas = overlayRef.current;
        const pdfElement = container?.querySelector('iframe, embed');

        if (!container || !canvas) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Tính size theo tỷ lệ A4 chính xác (595:842)
        const aspectRatio = A4_WIDTH / A4_HEIGHT; // 0.7068

        let canvasWidth = containerWidth;
        let canvasHeight = canvasWidth / aspectRatio;

        // Nếu cao quá, scale theo chiều cao
        if (canvasHeight > containerHeight) {
            canvasHeight = containerHeight;
            canvasWidth = canvasHeight * aspectRatio;
        }

        // Set canvas size chính xác
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Đặt PDF element cùng size với canvas để khớp 100%
        if (pdfElement) {
            pdfElement.style.width = `${canvasWidth}px`;
            pdfElement.style.height = `${canvasHeight}px`;
        }

        console.log('✓ Canvas setup:', {
            containerSize: `${containerWidth}x${containerHeight}`,
            canvasSize: `${canvasWidth}x${canvasHeight}`,
            aspectRatio: aspectRatio.toFixed(4),
            pdfStandard: '595x842 pt'
        });

        setPdfLoaded(true);
        setTimeout(drawSignatureBox, 50);
    };

    // Effect setup khi modal mở
    useEffect(() => {
        if (visible && contractLink) {
            setTimeout(setupCanvas, 200);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, contractLink]);

    // Effect load signature image khi signaturePreview thay đổi
    useEffect(() => {
        if (signaturePreview) {
            const img = new Image();
            img.onload = () => {
                setSignatureImage(img);
                drawSignatureBox();
            };
            img.src = signaturePreview;
        } else {
            setSignatureImage(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signaturePreview]);

    // Preset positions
    const presets = {
        bottomLeft: { llx: 50, lly: 110, width: 170, height: 70, name: 'Góc trái dưới (Trần Văn A)' },
        bottomRight: { llx: 375, lly: 110, width: 170, height: 70, name: 'Góc phải dưới' },
        topLeft: { llx: 50, lly: 672, width: 170, height: 70, name: 'Góc trái trên' },
        topRight: { llx: 375, lly: 672, width: 170, height: 70, name: 'Góc phải trên' },
        center: { llx: 212, lly: 386, width: 170, height: 70, name: 'Giữa trang' },
    };

    const applyPreset = (preset) => {
        setSignaturePosition(preset);
        message.success(`✓ ${preset.name}`);
    };

    // Xác nhận
    const handleConfirm = () => {
        const { urx, ury } = calculateUrxUry();
        console.log('✓ Signature position:', {
            llx: signaturePosition.llx,
            lly: signaturePosition.lly,
            urx,
            ury,
            positionString: getPositionString(),
            signingPage
        });

        onConfirm({
            positionString: getPositionString(),
            signingPage,
            position: signaturePosition
        });
    };

    return (
        <Modal
            title={
                <div className="flex items-center justify-between" style={{ width: '100%' }}>
                    <div className="flex items-center">
                        <DragOutlined className="text-blue-500 mr-2" />
                        <span>Chọn Vị Trí Chữ Ký - {contractNo}</span>
                    </div>
                    <Button size="small" onClick={handleServiceChange} className="text-xs">
                        Viewer: {services[currentService]?.name}
                    </Button>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            width="95vw"
            style={{ top: 20 }}
            styles={{
                body: { height: 'calc(90vh - 110px)', padding: '16px' }
            }}
            footer={[
                <Button key="cancel" onClick={onCancel} icon={<CloseOutlined />}>
                    Hủy
                </Button>,
                <Button
                    key="confirm"
                    type="primary"
                    onClick={handleConfirm}
                    icon={<CheckOutlined />}
                    className="bg-blue-500"
                >
                    Xác Nhận Vị Trí ✓
                </Button>
            ]}
        >
            <Row gutter={16} style={{ height: '100%' }}>
                {/* PDF Viewer với overlay */}
                <Col span={18} style={{ height: '100%' }}>
                    <Card
                        title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Space>
                                    <InfoCircleOutlined className="text-blue-500" />
                                    <span>PDF - Kéo thả khung xanh để di chuyển chữ ký</span>
                                </Space>
                                <Space>
                                    <Button size="small" icon={<ZoomOutOutlined />} onClick={handleZoomOut} disabled={zoom <= 50} />
                                    <span style={{ minWidth: '50px', textAlign: 'center' }}>{zoom}%</span>
                                    <Button size="small" icon={<ZoomInOutlined />} onClick={handleZoomIn} disabled={zoom >= 200} />
                                    <Button size="small" icon={<FullscreenOutlined />} onClick={handleZoomReset}>Fit</Button>
                                </Space>
                            </div>
                        }
                        style={{ height: '100%' }}
                        bodyStyle={{
                            height: 'calc(100% - 57px)',
                            padding: '16px',
                            backgroundColor: '#525659',
                            position: 'relative',
                            overflow: 'auto'
                        }}
                    >
                        <div
                            ref={pdfContainerRef}
                            style={{
                                minWidth: '100%',
                                minHeight: '100%',
                                position: 'relative',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'flex-start',
                                paddingTop: '20px',
                                paddingBottom: '20px'
                            }}
                        >
                            {contractLink ? (
                                <>
                                    {/* PDF Display với multiple viewers - Cố định tỷ lệ A4 */}
                                    <div
                                        onMouseMove={(e) => {
                                            // Wrapper này LUÔN nhận events để track mouse position
                                            const canvas = overlayRef.current;
                                            if (!canvas) return;

                                            const rect = canvas.getBoundingClientRect();
                                            const x = e.clientX - rect.left;
                                            const y = e.clientY - rect.top;

                                            // Kiểm tra xem chuột có trong signature box không
                                            const inBox = isInsideBox(x, y);
                                            setIsOverBox(inBox);

                                            // KHÔNG preventDefault ở đây để scroll tự do
                                        }}
                                        onMouseLeave={() => {
                                            // Khi rời khỏi vùng PDF
                                            if (!isDragging) {
                                                setIsOverBox(false);
                                            }
                                        }}
                                        style={{
                                            position: 'relative',
                                            display: 'inline-block',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                            transform: `scale(${zoom / 100})`,
                                            transformOrigin: 'top center',
                                            transition: 'transform 0.2s ease'
                                        }}
                                    >
                                        {currentService === 2 ? (
                                            // Direct PDF embed
                                            <embed
                                                src={`${contractLink}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                                                type="application/pdf"
                                                style={{
                                                    display: 'block',
                                                    border: 'none',
                                                    backgroundColor: 'white'
                                                }}
                                                onLoad={setupCanvas}
                                            />
                                        ) : (
                                            // iframe với Google Docs hoặc PDF.js
                                            <iframe
                                                ref={iframeRef}
                                                src={services[currentService]?.url}
                                                title={`PDF - ${contractNo}`}
                                                style={{
                                                    display: 'block',
                                                    border: 'none',
                                                    backgroundColor: 'white'
                                                }}
                                                onLoad={setupCanvas}
                                            />
                                        )}

                                        {/* Canvas Overlay - pointerEvents động */}
                                        <canvas
                                            ref={overlayRef}
                                            onMouseDown={handleMouseDown}
                                            onMouseMove={handleMouseMove}
                                            onMouseUp={handleMouseUp}
                                            onMouseLeave={() => {
                                                handleMouseUp();
                                                setIsOverBox(false);
                                            }}
                                            onClick={handleCanvasClick}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                cursor: isDragging ? 'grabbing' : (isOverBox ? 'move' : 'default'),
                                                // KEY: Canvas chỉ bắt events khi hover vào box HOẶC đang drag
                                                // Còn lại 'none' để PDF scroll tự do
                                                pointerEvents: (isDragging || isOverBox) ? 'auto' : 'none',
                                                zIndex: 10,
                                                userSelect: 'none'
                                            }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', color: 'white' }}>
                                    <Spin size="large" />
                                    <p style={{ marginTop: '16px' }}>Đang tải PDF...</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>

                {/* Controls Panel */}
                <Col span={6} style={{ height: '100%', overflowY: 'auto' }}>
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                        <Alert
                            message="💡 Hướng dẫn"
                            description="Dùng Touchpad Cảm Ứng: vuốt trái/phải/lên/xuống để di chuyển chữ ký chính xác"
                            type="info"
                            showIcon
                        />

                        {/* Số trang */}
                        <Card title="📄 Số Trang Ký" size="small">
                            <InputNumber
                                value={signingPage}
                                onChange={setSigningPage}
                                min={0}
                                style={{ width: '100%' }}
                                placeholder="0 = trang đầu"
                                addonBefore="Trang"
                            />
                        </Card>

                        {/* Preview */}
                        {signaturePreview && (
                            <Card title="✍️ Chữ Ký" size="small">
                                <img
                                    src={signaturePreview}
                                    alt="Signature"
                                    style={{
                                        maxWidth: '100%',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: '4px',
                                        backgroundColor: 'white',
                                        padding: '8px'
                                    }}
                                />
                            </Card>
                        )}

                        {/* Presets */}
                        <Card title="📌 Vị Trí Mẫu" size="small">
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                                {Object.values(presets).map((preset, idx) => (
                                    <Button
                                        key={idx}
                                        onClick={() => applyPreset(preset)}
                                        block
                                        size="small"
                                        type={
                                            signaturePosition.llx === preset.llx &&
                                                signaturePosition.lly === preset.lly
                                                ? 'primary'
                                                : 'default'
                                        }
                                    >
                                        {preset.name}
                                    </Button>
                                ))}
                            </Space>
                        </Card>

                        {/* Touchpad Control */}
                        <Card title="🎮 Touchpad Di Chuyển" size="small">
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                                <div
                                    style={{
                                        width: '100%',
                                        height: '120px',
                                        border: '2px solid #1890ff',
                                        borderRadius: '8px',
                                        backgroundColor: touchpadDragging ? '#f0f9ff' : '#fafafa',
                                        cursor: 'grab',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        userSelect: 'none'
                                    }}
                                    onMouseDown={handleTouchpadMouseDown}
                                    onMouseMove={handleTouchpadMouseMove}
                                    onMouseUp={handleTouchpadMouseUp}
                                    onMouseLeave={handleTouchpadMouseUp}
                                >
                                    <div style={{
                                        textAlign: 'center',
                                        color: '#666',
                                        fontSize: '12px',
                                        lineHeight: '1.4'
                                    }}>
                                        <div>🖱️ Vuốt để di chuyển</div>
                                        <div>chữ ký trên PDF</div>
                                        {touchpadDragging && (
                                            <div style={{ color: '#1890ff', fontWeight: 'bold' }}>
                                                Đang di chuyển...
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Space>
                                    <span style={{ fontSize: '12px' }}>Độ nhạy:</span>
                                    <InputNumber
                                        size="small"
                                        min={0.5}
                                        max={3}
                                        step={0.1}
                                        value={touchpadSensitivity}
                                        onChange={(value) => setTouchpadSensitivity(value || 1)}
                                        style={{ width: '60px' }}
                                    />
                                    <Button size="small" onClick={resetPosition}>
                                        Reset
                                    </Button>
                                </Space>
                            </Space>
                        </Card>

                        {/* Tọa độ */}
                        <Card title="🎯 Tọa Độ (PDF Points)" size="small">
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                                <div>
                                    <Text type="secondary">llx (góc trái):</Text>
                                    <InputNumber
                                        value={Math.round(signaturePosition.llx)}
                                        onChange={(v) => setSignaturePosition(p => ({
                                            ...p,
                                            llx: Math.max(0, Math.min(v, A4_WIDTH - p.width))
                                        }))}
                                        min={0}
                                        max={A4_WIDTH - signaturePosition.width}
                                        style={{ width: '100%', marginTop: '4px' }}
                                    />
                                </div>

                                <div>
                                    <Text type="secondary">lly (từ đáy lên):</Text>
                                    <InputNumber
                                        value={Math.round(signaturePosition.lly)}
                                        onChange={(v) => setSignaturePosition(p => ({
                                            ...p,
                                            lly: Math.max(0, Math.min(v, A4_HEIGHT - p.height))
                                        }))}
                                        min={0}
                                        max={A4_HEIGHT - signaturePosition.height}
                                        style={{ width: '100%', marginTop: '4px' }}
                                    />
                                </div>

                                <div>
                                    <Text type="secondary">width:</Text>
                                    <InputNumber
                                        value={Math.round(signaturePosition.width)}
                                        onChange={(v) => setSignaturePosition(p => ({
                                            ...p,
                                            width: Math.max(50, Math.min(v, A4_WIDTH - p.llx))
                                        }))}
                                        min={50}
                                        max={A4_WIDTH - signaturePosition.llx}
                                        style={{ width: '100%', marginTop: '4px' }}
                                    />
                                </div>

                                <div>
                                    <Text type="secondary">height:</Text>
                                    <InputNumber
                                        value={Math.round(signaturePosition.height)}
                                        onChange={(v) => setSignaturePosition(p => ({
                                            ...p,
                                            height: Math.max(30, Math.min(v, A4_HEIGHT - p.lly))
                                        }))}
                                        min={30}
                                        max={A4_HEIGHT - signaturePosition.lly}
                                        style={{ width: '100%', marginTop: '4px' }}
                                    />
                                </div>
                            </Space>
                        </Card>

                        {/* Tính toán */}
                        <Card title="📊 Giá Trị Tính Toán" size="small">
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                                <div>
                                    <Text type="secondary">urx = llx + width:</Text>
                                    <div><Text strong>{Math.round(calculateUrxUry().urx)} pt</Text></div>
                                </div>
                                <div>
                                    <Text type="secondary">ury = lly + height:</Text>
                                    <div><Text strong>{Math.round(calculateUrxUry().ury)} pt</Text></div>
                                </div>
                                <div>
                                    <Text type="secondary">Position String:</Text>
                                    <div>
                                        <Text code copyable style={{ fontSize: '10px' }}>
                                            {getPositionString()}
                                        </Text>
                                    </div>
                                </div>
                            </Space>
                        </Card>

                        <Alert
                            message={`A4: ${A4_WIDTH} × ${A4_HEIGHT} pt`}
                            type="success"
                            showIcon
                        />
                    </Space>
                </Col>
            </Row>
        </Modal>
    );
};

export default SignaturePositionModal;
