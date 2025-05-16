import { useState } from "react";
import axios from "axios";
import { Github, Globe, LoaderIcon } from "lucide-react";

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
        } h-screen flex flex-col justify-center items-center transition-width duration-700`}
      >
        <h1 className="text-8xl font-semibold bg-gradient-to-b from-white to-gray-400 text-transparent bg-clip-text mb-2">
          Deploy It.
        </h1>

        <div className="max-w-sm w-full">
          <header className="mb-4 text-center">
            {/* <p>Enter the URL of your GitHub repository</p> */}
          </header>
          <div className="space-y-4">
            <input
              id="github-url"
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
              className="w-full bg-[#1a1a1a] border border-white/10 px-3 py-2 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
            />
            {!uploading && (
              <button
                onClick={handleDeploy}
                disabled={!isValid || uploading}
                className="w-full bg-[#ededed] px-4 py-2 text-black rounded-md font-semibold"
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
        } h-screen bg-[#0a0a0a] flex flex-col justify-center items-center overflow-hidden transition-width duration-700 p-6`}
      >
        {initiated && (
          <div className="border border-white/20 p-6 sm:p-8 rounded-2xl w-full max-w-md space-y-6 bg-[#0f0f0f]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-semibold text-white">
                Deployment Status
              </h2>
              {!deployed && (
                <div className="animate-spin text-white">
                  <LoaderIcon className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="bg-[#1a1a1a] border border-white/10 p-4 rounded-xl flex items-center gap-4">
              <Github className="w-5 h-5 text-white" />
              <div>
                <p className="font-medium text-white">{repoName}</p>
                <p className="text-sm text-gray-400">{owner}</p>
              </div>
            </div>

            <div
              className={`${bgColor()} text-white text-sm sm:text-base px-4 py-2 rounded-lg text-center`}
            >
              {statusText}
            </div>

            <a
              href={`http://${uploadId}.localhost:3001/index.html`}
              target="_blank"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-white text-black font-medium hover:bg-gray-100 transition"
            >
              Visit Site
              <Globe className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
