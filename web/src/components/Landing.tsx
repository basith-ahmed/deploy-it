import { useState } from "react";
import axios from "axios";
import { Github, Globe, LoaderIcon } from "lucide-react";
import { ShineBorder } from "./ui/ShineBorder";
import { cn } from "../lib/utils";

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
  const [owner, repoName] = repoUrl.replace(/\/$/, "").split("/").slice(-2);

  const handleDeploy = async () => {
    setInitiated(true);
    setUploading(true);
    setStatusText("uploading");
    let res;
    try {
      res = await axios.post(
        `${BACKEND_UPLOAD_URL}/upload`,
        { repoUrl },
        { timeout: 4000 }
      );
    } catch {
      setUploading(false);
      setStatusText("error");
      alert(
        "Service has been disabled by the owner, contact @basith-ahmed for more info"
      );
      return;
    }
    setUploadId(res.data.id);
    setUploading(false);

    const interval = setInterval(async () => {
      const response = await axios.get(
        `${BACKEND_UPLOAD_URL}/status/${res.data.id}`
      );
      const st = response.data.status;
      setStatusText(st);
      if (st === "deployed" || st === "error") {
        clearInterval(interval);
        if (st === "deployed") setDeployed(true);
        if (st === "error") alert("Service has been disabled by the owner, contact @basith-ahmed for more info");
      }
    }, 2000);
  };

  const bgColor = (): string => {
    switch (statusText) {
      case "uploading":
        return "#facc15";
      case "building":
        return "#3b82f6";
      case "deployed":
        return "#22c55e";
      case "error":
        return "#ef4444";
      default:
        return "#d1d5db";
    }
  };

  return (
    <main className="w-screen h-screen flex bg-black text-[#ededed]">
      <div
        className={cn(
          initiated ? "w-1/2 border-r-2 border-white/20" : "w-full",
          "h-screen flex flex-col justify-center items-center transition-width duration-700 relative overflow-hidden"
        )}
      >
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:20px_20px]",
            "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
            "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]"
          )}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
        <h1 className="text-8xl font-semibold bg-gradient-to-b from-white to-gray-400 text-transparent bg-clip-text mb-8 z-20">
          Deploy It.
        </h1>
        <div className="max-w-sm w-full z-20">
          <div className="space-y-4">
            <input
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
        className={cn(
          initiated ? "w-1/2" : "w-0",
          "h-screen bg-[#0a0a0a] flex flex-col justify-center items-center overflow-hidden transition-width duration-700 p-6"
        )}
      >
        {initiated && (
          <div className="border border-white/20 p-6 sm:p-8 rounded-2xl w-full max-w-md bg-[#0f0f0f] relative overflow-hidden">
            <ShineBorder shineColor={bgColor()} />
            <div className="flex items-center justify-between mb-4 z-20">
              <h2 className="text-xl sm:text-2xl font-semibold text-white">
                Deployment Status
              </h2>
              {!deployed && (
                <LoaderIcon className="w-5 h-5 text-white animate-spin" />
              )}
            </div>
            <div className="bg-[#1a1a1a] border border-white/10 p-4 rounded-xl flex items-center gap-4 mb-4">
              <Github className="w-5 h-5 text-white" />
              <div>
                <p className="font-medium text-white">{repoName}</p>
                <p className="text-sm text-gray-400">{owner}</p>
              </div>
            </div>
            <div
              className="text-white text-sm sm:text-base px-4 py-2 rounded-lg text-center mb-4"
              style={{ backgroundColor: bgColor() }}
            >
              {statusText}
            </div>
            <a
              href={`http://${uploadId}.${window.location.hostname}/index.html`}
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
