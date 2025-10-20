import React from 'react';
import { SafetyOutlined } from '@ant-design/icons';

function SecurityNotice() {
    return (
        <div style={{
            background: '#e6f7ff',
            border: '1px solid #91d5ff',
            borderLeft: '4px solid #1890ff',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '24px'
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <SafetyOutlined style={{ color: '#1890ff', marginRight: '8px', marginTop: '2px' }} />
                <div>
                    <div style={{ fontWeight: '500', color: '#262626', marginBottom: '4px' }}>
                        Lưu ý bảo mật
                    </div>
                    <div style={{ color: '#595959', fontSize: '14px' }}>
                        Sau khi đổi mật khẩu thành công, bạn sẽ cần đăng nhập lại trên tất cả các thiết bị khác.
                        Không chia sẻ mật khẩu với bất kỳ ai.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SecurityNotice;