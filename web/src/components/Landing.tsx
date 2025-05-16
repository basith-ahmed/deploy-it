import { useState } from "react";
import axios from "axios";
import { Github, Globe } from "lucide-react";

const BACKEND_UPLOAD_URL = "http://localhost:3000";

const githubRegex = /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/?$/;

export function Landing() {
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [uploadId, setUploadId] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [deployed, setDeployed] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>("");
  const [initiated, setInitiated] = useState<boolean>(false);

  const isValid = githubRegex.test(repoUrl);

  const handleDeploy = async () => {
    setInitiated(true);
    setUploading(true);
    setStatusText("uploading");
    const res = await axios.post(`${BACKEND_UPLOAD_URL}/upload`, { repoUrl });
    setUploadId(res.data.id);
    setUploading(false);
    const interval = setInterval(async () => {
      const response = await axios.get(
        `${BACKEND_UPLOAD_URL}/status/${res.data.id}`
      );
      const st = response.data.status;
      setStatusText(st);
      if (st === "deployed") {
        clearInterval(interval);
        setDeployed(true);
      }
    }, 2000);
  };

  const bgColor = () => {
    switch (statusText) {
      case "uploading":
        return "bg-yellow-500";
      case "building":
        return "bg-blue-500";
      case "deployed":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  const [owner, repoName] = repoUrl.replace(/\/$/, "").split("/").slice(-2);

  return (
    <main className="w-screen h-screen flex bg-[#000000] text-[#ededed]">
      <div
        className={`${
          initiated ? "w-1/2 border-r-2 border-white/20" : "w-full"
        } h-screen flex flex-col justify-center items-center transition-width duration-500`}
      >
        <div className="max-w-sm w-full">
          <header className="mb-4">
            <h1 className="text-2xl font-semibold">
              Deploy your GitHub Repository
            </h1>
            <p>Enter the URL of your GitHub repository</p>
          </header>
          <div className="space-y-4">
            <input
              id="github-url"
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
              className="w-full border border-gray-300 bg-[#ededed] px-3 py-2 text-black rounded-md"
            />
            {!uploading && (
              <button
                onClick={handleDeploy}
                disabled={!isValid || uploading}
                className="w-full bg-[#ededed] px-4 py-2 text-black rounded-md"
              >
                Deploy
              </button>
            )}
          </div>
        </div>
      </div>
      <div
        className={`${
          initiated ? "w-1/2" : "w-0"
        } h-screen bg-[#0a0a0a] flex flex-col justify-center items-center overflow-hidden transition-width duration-500 p-6`}
      >
        {initiated && (
          <div className="border border-white/20 p-8  rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Deployment Status</h2>
              {!deployed && (
                <div className="animate-spin">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-loader-icon lucide-loader"
                  >
                    <path d="M12 2v4" />
                    <path d="m16.2 7.8 2.9-2.9" />
                    <path d="M18 12h4" />
                    <path d="m16.2 16.2 2.9 2.9" />
                    <path d="M12 18v4" />
                    <path d="m4.9 19.1 2.9-2.9" />
                    <path d="M2 12h4" />
                    <path d="m4.9 4.9 2.9 2.9" />
                  </svg>
                </div>
              )}
            </div>

            {initiated && (
              <div className="bg-[#1a1a1a] border border-white/10 p-4 rounded-xl w-full max-w-sm mb-4 flex items-center space-x-4">
                <Github />
                <div>
                  <p className="font-semibold">{repoName}</p>
                  <p className="text-sm text-gray-400">{owner}</p>
                </div>
              </div>
            )}

            {initiated && (
              <div
                className={`${bgColor()} text-white px-4 py-2 rounded-lg mb-4 text-center`}
              >
                {statusText}
              </div>
            )}

            {initiated && (
              <a
                href={`http://${uploadId}.localhost:3001/index.html`}
                target="_blank"
                className="text-black w-full flex items-center justify-center bg-[#ededed] p-2 rounded-lg"
              >
                Visit site <Globe className="h-4 w-4"/>
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
