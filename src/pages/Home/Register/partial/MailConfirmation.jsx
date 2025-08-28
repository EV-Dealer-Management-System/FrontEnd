import React, {useState} from "react";
export const MailConfirmation = () => {
 const [code, setCode] = useState("");
 const [message, setMessage] = useState("");

 const handleSubmit = (e) => {
    e.preventDefault();
    if (code === "") {
      setMessage("Please enter the confirmation code.");
    } else {
      setMessage("Code confirmed successfully!");
    }
  };

  return (
     <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Xác thực Email</h2>
      <p>Vui lòng nhập mã xác thực đã gửi tới email của bạn.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nhập mã xác thực"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
        />
        <button type="submit" style={{ width: "100%", padding: 8 }}>Xác thực</button>
      </form>
      {message && <p style={{ marginTop: 16 }}>{message}</p>}
    </div>
  );
};
