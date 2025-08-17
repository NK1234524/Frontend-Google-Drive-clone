const API_BASE = import.meta.env.VITE_API_BASE;

// Function to upload a file
export async function uploadFile(formData) {
  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}
