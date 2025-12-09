"use client";

import { useState } from "react";

export default function UploadAndResult() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [aiUrl, setAiUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [requiresPayment, setRequiresPayment] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Select a file first");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/process", { method: "POST", body: formData });
      const data = await res.json();

      if (data.error) {
        alert("Error: " + data.error);
      }

      // Always show uploaded image
      setUploadedUrl(data.uploaded_url || "");

      if (data.requiresPayment) {
        setRequiresPayment(true);
        setAiUrl(""); // hide AI image
      } else if (data.ai_url) {
        setAiUrl(data.ai_url);
        setRequiresPayment(false);
      }
    } catch (err) {
      alert("Network error: " + err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    alert("Redirecting to payment gateway...");
    // Integrate Stripe or any payment gateway here
  };

  return (
    <div className="mt-12 flex flex-col items-center space-y-6">
      {/* Upload Section */}
      <div className="flex items-center gap-3">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="h-10 px-3 border border-gray-300 rounded"
        />
        <button
          onClick={handleUpload}
          disabled={loading}
          className={`h-10 px-4 rounded text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"}`}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {/* Uploaded Image */}
      {uploadedUrl && (
        <div className="text-center">
          <p className="mb-2 font-medium">Uploaded Image:</p>
          <img src={uploadedUrl} alt="Uploaded" className="border rounded max-w-xs mx-auto" />
        </div>
      )}

      {/* Payment Required */}
      {requiresPayment && (
        <div className="bg-yellow-100 border border-yellow-300 rounded p-4 text-center max-w-xs">
          <p className="mb-2 font-medium text-yellow-800">AI generation requires payment.</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handlePayment}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Pay & Generate
            </button>
            <button
              onClick={() => setRequiresPayment(false)}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* AI Generated Image */}
      {/* {aiUrl && (
        <div className="text-center">
          <p className="mb-2 font-medium">AI Generated Image:</p>
          <img src={aiUrl} alt="AI Result" className="border rounded max-w-xs mx-auto" />
        </div>
      )} */}
    </div>
  );
}
