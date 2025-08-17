import { useState } from "react";
import { uploadFile } from "./api";  // 👈 import our helper function

export default function UploadComponent() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Select a file first");

    const formData = new FormData();
    formData.append("file", file);

    const data = await uploadFile(formData);
    console.log("Upload result:", data);
    alert("File uploaded!");
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}
