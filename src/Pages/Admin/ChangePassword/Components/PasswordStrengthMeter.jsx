import React from 'react';
import { Progress } from 'antd';

function PasswordStrengthMeter({ password }) {
    // Tính toán độ mạnh của mật khẩu
    const calculatePasswordStrength = (pwd) => {
        if (!pwd) return { score: 0, label: '', color: '' };

        let score = 0;
        let feedback = [];

        // Độ dài
        if (pwd.length >= 8) {
            score += 20;
        } else {
            feedback.push('Ít nhất 8 ký tự');
        }

        // Chữ thường
        if (/[a-z]/.test(pwd)) {
            score += 20;
        } else {
            feedback.push('Chữ thường');
        }

        // Chữ hoa
        if (/[A-Z]/.test(pwd)) {
            score += 20;
        } else {
            feedback.push('Chữ hoa');
        }

        // Số
        if (/\d/.test(pwd)) {
            score += 20;
        } else {
            feedback.push('Chữ số');
        }

        // Ký tự đặc biệt
        if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) {
            score += 20;
        } else {
            feedback.push('Ký tự đặc biệt');
        }

        // Xác định level và màu
        let label = '';
        let color = '';

        if (score < 40) {
            label = 'Yếu';
            color = '#ff4d4f';
        } else if (score < 60) {
            label = 'Trung bình';
            color = '#faad14';
        } else if (score < 80) {
            label = 'Khá mạnh';
            color = '#1890ff';
        } else {
            label = 'Rất mạnh';
            color = '#52c41a';
        }

        return { score, label, color, feedback };
    };

    const strength = calculatePasswordStrength(password);

    if (!password) return null;

    return (
        <div style={{ marginTop: '8px' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '4px'
            }}>
                <span style={{ fontSize: '12px', color: '#8c8c8c' }}>Độ mạnh mật khẩu:</span>
                <span
                    style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: strength.color
                    }}
                >
                    {strength.label}
                </span>
            </div>

            <Progress
                percent={strength.score}
                strokeColor={strength.color}
                showInfo={false}
                size="small"
                style={{ borderRadius: '4px' }}
            />

            {strength.feedback.length > 0 && (
                <div style={{
                    fontSize: '12px',
                    color: '#bfbfbf',
                    marginTop: '4px'
                }}>
                    Thiếu: {strength.feedback.join(', ')}
                </div>
            )}
        </div>
    );
}

export default PasswordStrengthMeter;