"use client";

import React, { useContext, useEffect, useState } from "react";
import VideoContext from "@/contexts/videoContext";
import Image from "next/image";
import classNames from "classnames";
import axios from "axios";
import { CopyIcon } from "@/legacy/svg/CopyIcon";
import toast from "react-hot-toast";

interface VideoDescription {
  best_titles: string[];
  description: string;
  tags: string[];
}

export default function Editor({}) {
  const { transcription, thumbnailUrl, language, videoData, setVideoData } =
    useContext(VideoContext);
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [otherCategory, setOtherCategory] = useState("");
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const categories = [
    "Film & Animation",
    "Autos & Vehicles",
    "Music",
    "Pets & Animals",
    "Sports",
    "Travel & Events",
    "Gaming",
    "People & Blogs",
    "Comedy",
    "Entertainment",
    "News & Politics",
    "How-to & Style",
    "Science & Technology",
    "Education",
    "Science Fiction & Fantasy",
    "Nonprofits & Activism",
    "Beauty & Fashion",
    "Fitness & Exercise",
    "Food & Recipes",
    "Other",
  ];

  const handleCategoryChange = (event: any) => {
    setSelectedCategory(event.target.value);
    if (event.target.value != categories.length) {
      setOtherCategory("");
    }
  };

  const handleAdditionalPromptChange = (event: any) => {
    setAdditionalPrompt(event.target.value);
  };

  const handleOtherCategoryChange = (event: any) => {
    setOtherCategory(event.target.value);
  };

  const handleRegenerateClick = async () => {
    setLoading(true);
    axios
      .post("./api/thumbnail", {
        script: transcription,
        category: otherCategory
          ? otherCategory
          : categories[selectedCategory - 1],
        additional_prompt: additionalPrompt,
      })
      .then((response) => {
        setThumbnail(response.data[0].url as string);
      })
      .catch((error) => {
        console.error("There was an error making the request!", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    axios
      .post("./api/analyse", {
        script: transcription,
        language,
      })
      .then((response) => {
        setVideoData(response.data as VideoDescription);
      })
      .catch((error) => {
        console.error("There was an error making the request!", error);
      });
  }, []);

  useEffect(() => {
    axios
      .post("./api/thumbnail", {
        script: transcription,
        category: null,
        additional_prompt: null,
      })
      .then((response) => {
        setThumbnail(response.data[0].url as string);
      })
      .catch((error) => {
        console.error("There was an error making the request!", error);
      });
  }, []);

  const copyToClipboard = async (textToCopy: string) => {
    // Use the navigator Clipboard API where available
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        toast.success("Copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copied!");
      }
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;

      // Avoid scrolling to bottom
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand("copy");
        const msg = successful ? "successful" : "unsuccessful";
        if (successful) {
          toast.success("Copied to clipboard!");
        } else {
          toast.error("Failed to copied!");
        }
      } catch (err) {
        toast.error("Failed to copied!");
      }

      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="my-20 px-5 text-black xl:px-0">
      <div
        className="animate-fade-up bg-gradient-to-br tracking-[-0.02em]"
        style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
      >
        <div className="mx-auto justify-center lg:flex lg:max-w-screen-lg lg:space-x-10">
          <div className="md:w-2/5 w-full self-center">
            <div
              className="rounded-t-xl"
              style={{
                backgroundImage: thumbnailUrl
                  ? `url(${thumbnailUrl})`
                  : undefined,
                backgroundSize: "cover",
                height: 220,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            />
            <div
              className={classNames(
                "shadow-black-500/30 flex h-auto flex-col items-center justify-center divide-y-2 divide-slate-400/25 rounded-b-lg bg-white shadow-xl backdrop-blur-md",
              )}
            >
              {videoData ? (
                <>
                  <div className="flex flex-wrap">
                    {videoData?.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="rounded-md bg-neutral-300 px-4 py-2 text-sm"
                        style={{ margin: "0.5em" }}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full p-10 text-center ">
                  <div className="flex animate-pulse space-x-4">
                    <div className="flex-1 space-y-6 py-1">
                      <div className="h-3 rounded bg-slate-200"></div>
                      <div className="h-3 rounded bg-slate-200"></div>
                      <div className="h-3 rounded bg-slate-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-5 mb-5 w-full rounded-lg bg-white pb-10 shadow-xl backdrop-blur-md">
              <div className="px-6 py-4">
                <div className="mb-2 text-lg font-light uppercase">
                  Regeneration information
                </div>
              </div>
              <div className="px-6 pb-2">
                <div className="mb-2 mr-2 text-sm font-light uppercase">
                  Choice of category
                </div>
                <select
                  className="mb-2 h-full w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 pb-0 pt-0 leading-tight text-gray-700 focus:border-blue-500 focus:outline-none"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                >
                  {categories.map((category: string, index: number) => (
                    <option key={index} value={index + 1}>
                      {category}
                    </option>
                  ))}
                </select>
                {selectedCategory == categories.length && (
                  <input
                    type="text"
                    value={otherCategory}
                    onChange={handleOtherCategoryChange}
                    placeholder="Enter other category"
                    className="mb-2 h-full w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 pb-0 pt-0 leading-tight text-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                )}
              </div>
              <div className="px-6">
                <div className="mb-2 mr-2 text-sm font-light uppercase">
                  Additional prompt
                </div>
                <input
                  className="mb-2 h-full w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 pb-0 pt-0 leading-tight text-gray-700 focus:border-blue-500 focus:outline-none"
                  placeholder="Write a prompt for the thumbnail"
                  value={additionalPrompt}
                  onChange={handleAdditionalPromptChange}
                />
              </div>
              <div className="flex items-center justify-center">
                <button
                  className={`ml-5 mt-4 ${
                    loading || !thumbnail
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-red-500 hover:bg-red-600"
                  } rounded-full px-4 py-2 font-bold text-white`}
                  onClick={handleRegenerateClick}
                  disabled={loading || !thumbnail}
                >
                  Regenerate
                </button>
              </div>
            </div>
          </div>
          <div
            className="md:w-3/5 w-full animate-fade-up bg-gradient-to-br tracking-[-0.02em]"
            style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
          >
            <div
              className={classNames(
                "flex h-auto flex-col items-center justify-center divide-y-2 divide-slate-400/25 rounded-t-lg bg-white shadow-xl shadow-red-500/30 backdrop-blur-md",
              )}
            >
              <div className="w-full">
                <div className="px-6 py-4">
                  <div className="mb-2 text-lg font-light uppercase">
                    Recommanded Titles
                  </div>
                </div>
                {videoData ? (
                  videoData?.best_titles.map((title, id) => {
                    return (
                      <div
                        key={id}
                        className={classNames(
                          "group flex w-full items-start gap-x-3 px-10 py-2",
                        )}
                      >
                        <div className="rounded-md bg-neutral-300 px-4 py-2 text-sm">
                          {title}
                        </div>
                        <button
                          onClick={() => copyToClipboard(title)}
                          className="self-center opacity-0 transition group-hover:opacity-100"
                        >
                          <CopyIcon width={20} height={20} />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex animate-pulse space-x-4 px-10 text-center">
                    <div className="flex-1 space-y-6 py-1">
                      <div className="h-3 rounded bg-slate-200"></div>
                      <div className="h-3 rounded bg-slate-200"></div>
                      <div className="h-3 rounded bg-slate-200"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div
              className={classNames(
                "flex h-auto flex-col items-center justify-center divide-y-2 divide-slate-400/25 rounded-b-lg bg-white shadow-xl shadow-red-500/30 backdrop-blur-md",
              )}
            >
              <div className="w-full pb-10">
                <div className="px-6 py-4">
                  <div className="mb-2 text-lg font-light uppercase">
                    Recommanded Description
                  </div>
                </div>
                {videoData ? (
                  <div
                    className={classNames(
                      "group flex w-full items-start gap-x-3 px-10 py-2",
                    )}
                  >
                    <div className="rounded-md bg-neutral-300 px-4 py-2 text-sm">
                      {videoData?.description}
                    </div>
                    <button
                      onClick={() => copyToClipboard(videoData?.description)}
                      className="self-center opacity-0 transition group-hover:opacity-100"
                    >
                      <CopyIcon width={20} height={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex animate-pulse space-x-4 px-10 text-center">
                    <div className="flex-1 space-y-3 py-1">
                      <div className="h-3 rounded bg-slate-200"></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="w-full pb-10">
                <div className="px-6 py-4">
                  <div className="mb-2 text-lg font-light uppercase">
                    Generated thumbnail
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  {thumbnail && !loading ? (
                    <>
                      <img src={thumbnail} alt="thumbnail" className="px-5" loading="eager"/>
                    </>
                  ) : (
                    <div className="flex animate-pulse space-x-4">
                      <div className="flex-1 space-y-6 py-1">
                      <div className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96">
                        <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
                        </svg>
                      </div>
                      </div>
                    </div>
                  )}
                </div>
                <a
                  target="__blank"
                  href={thumbnail}
                  className={`md:ml-40 md:mr-40 ml-28 mr-28 mt-4 flex justify-center rounded-full px-2 py-1 text-sm font-bold text-white ${
                    thumbnail && !loading ? "bg-red-500 hover:bg-red-600" : "bg-gray-400"
                  } ${!thumbnail && "pointer-events-none"}`}
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
