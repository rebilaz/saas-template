"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import classNames from "classnames";
import axios from "axios";
import Modal from "../shared/modal";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { TRANSCRIPT_LANGUAGES } from "@/legacy/langs";
import VideoContext from "@/contexts/videoContext";
import { v4 as uuidv4 } from "uuid";
import { useSignInModal } from "../layout/sign-in-modal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSupabaseUser } from "@/lib/hooks/use-supabase-user";

export default function Upload({ }) {
  const { user } = useSupabaseUser();
  const { SignInModal, setShowSignInModal } = useSignInModal();

  const searchParams = useSearchParams();
  const { setTranscription, thumbnailUrl, setThumbnailUrl, setLanguage } =
    useContext(VideoContext);
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progression, setProgression] = useState(0);
  const [jobId, setJobId] = useState(null);

  const ffmpegRef = useRef(new FFmpeg());
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const messageRef = useRef<HTMLParagraphElement | null>(null);

  const [selectedLanguage, setSelectedLanguage] = useState(TRANSCRIPT_LANGUAGES[3]);

  const [inputValue, setInputValue] = useState(searchParams?.get("ytb") || "");
  const [isLanguageSelectorOpen, setLanguageSelector] = useState(false);
  const [isWaitingForlanguage, setWaitingForLanguage] = useState(false);

  const load = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      if (messageRef.current) messageRef.current.innerHTML = message;
    });
    //toBlobURL is used to bypass CORS issue, urls with the same
    //domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm",
      ),
    });
    setLoaded(true);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const convertToAudio = async (videoFile: File) => {
    ffmpegRef.current.on("progress", (e) => {
      setProgression(e.progress * 100);
    });
    ffmpegRef.current.writeFile("test.mp4", await fetchFile(videoFile));

    await ffmpegRef.current.exec([
      "-i",
      "test.mp4",
      "-vframes",
      "1",
      "output.jpeg",
    ]);
    const thumbnail = (await ffmpegRef.current.readFile("output.jpeg")) as any;
    setThumbnailUrl(
      URL.createObjectURL(new Blob([thumbnail.buffer], { type: "image/jpeg" })),
    );
    await ffmpegRef.current.exec([
      "-i",
      "test.mp4",
      "-vn",
      "-sn",
      "-c:a",
      "mp3",
      "-ab",
      "192k",
      "-y",
      "output.mp3",
    ]);
    const data = (await ffmpegRef.current.readFile("output.mp3")) as any;
    setAudioBlob(new Blob([data.buffer], { type: "audio/mpeg" }));
  };

  const uploadAudio = async () => {
    if (!audioBlob)
      return;
    const uniqueFilenameTemp = `${uuidv4()}${".mp3"}`;

    type PresignedPostData = {
      url: string;
      fields: { [key: string]: string };
    };

    try {
      // Prepare upload to S3
      await axios.post<PresignedPostData>(
        "/api/prepareUpload",
        {
          name: uniqueFilenameTemp,
          type: 'audio/mpeg',
        }
      ).then(async res => {
        let { data: presignedPostData } = res;
        // Upload to S3 using a multipart/form-data POST request
        const formData = new FormData();

        Object.entries(presignedPostData.fields).forEach(([key, value]) => {
          formData.append(key, value);
        });

        formData.append("file", audioBlob);

        await axios
          .post(presignedPostData.url, formData, {
            onUploadProgress: (progressEvent) => {
              const progressPercentage = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total ?? 1)
              );
              setProgression(progressPercentage);
            }
          });
        axios
          .post("./api/extract", {
            fileName: uniqueFilenameTemp,
            lang: selectedLanguage.lang,
          })
          .then((response) => {
            const { jobId } = response.data;
            setJobId(jobId);
            setProgression(1);
          }).catch(error => {
            console.error('Error fetching job status:', error);
          });
      })
        .catch(e => {
          const { error } = e.response.data;
          switch (error) {
            case "no_credits":
              toast.error("You have no credits left. Please upgrade your plan", { position: 'bottom-center' });
              router.push('/pricing')
              break;
          }
        });
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          // toast.error("You have been sign out. Please login", {
          //   style: {
          //     borderRadius: "10px",
          //     background: "#333",
          //     color: "#fff",
          //   },
          // });
          // router.push("/login");
        }
      }
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();

    if (e.dataTransfer.files.length) {
      await processVideoFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    // You might add some styling or classes here to indicate the drag over state
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    // Revert any styles or classes added during drag over
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const videoFile = event.target.files?.[0];
    await processVideoFile(videoFile);
  };

  const processVideoFile = async (videoFile: File | undefined) => {
    if (videoFile) {
      if (loaded) {
        await convertToAudio(videoFile);
      } else {
        setTimeout(handleFileUpload, 1000);
      }
    }
  };

  const startProcessing = () => {
    setWaitingForLanguage(false);
    setLanguageSelector(false);

    let intervalId = setInterval(() => {
      setProgression((i) => (i < 100 ? i + 1 : 100));
    }, 500);

    if (inputValue) {
      axios
        .post("./api/extract", {
          videoUrl: inputValue,
          lang: selectedLanguage.lang,
        })
        .then((response) => {
          clearInterval(intervalId);
          setProgression(1);
          const { jobId } = response.data;
          setJobId(jobId);
        }).catch(e => {
          const { error } = e.response.data;
          switch (error) {
            case "no_credits":
              toast.error("You have no credits left. Please upgrade your plan", { position: 'bottom-center' });
              router.push('/pricing')
              break;
          }
        });
    }

    if (audioBlob) {
      uploadAudio();
    }
  };

  useEffect(() => {
    if (audioBlob) {
      setWaitingForLanguage(true);
      setProgression(0);
    }
  }, [audioBlob]);

  useEffect(() => {
    if (isWaitingForlanguage && !user) {
      setShowSignInModal(true);
    }
  }, [isWaitingForlanguage, setShowSignInModal, user]);

  useEffect(() => {
    const urlPattern =
      /^(https?:\/\/)?((www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})|youtu\.be\/([a-zA-Z0-9_-]{11}))$/;
    const match = inputValue.match(urlPattern);
    if (match) {
      const videoId = match[4] || match[5];
      setWaitingForLanguage(true);
      setThumbnailUrl(`http://img.youtube.com/vi/${videoId}/0.jpg`);
    }
  }, [inputValue]);

  const handleLanguageChange = (name: string, lang: string, flag: string) => {
    setSelectedLanguage({ name, lang, flag });
  };

  useEffect(() => {
    setLanguage(selectedLanguage.name);
  }, [selectedLanguage]);

  const findLanguageByCode = (code: string) => {
    return TRANSCRIPT_LANGUAGES.find(lang => lang.lang === code) || TRANSCRIPT_LANGUAGES[0]; // fallback to the first language if not found
  };

  useEffect(() => {
    // Check if running in a browser environment
    if (typeof window !== 'undefined') {
      const browserLang = window.navigator.language.split('-')[0];
      const defaultLanguage = findLanguageByCode(browserLang);
      setSelectedLanguage(defaultLanguage);
    }
  }, []);

    useEffect(() => {
    let requestCount = 0;

    const maxRequests = 60;
    const requestInterval = 5000;

    let intervalId: number;

    const checkJob = () => {
      if (requestCount >= maxRequests) {
        clearInterval(intervalId);
        console.error("Max request limit reached");
        return;
      }

      axios.get("./api/extract/" + jobId)
        .then((response) => {
          const { status, result } = response.data;

          if (status !== "finished") {
            requestCount++;
            intervalId = window.setTimeout(checkJob, requestInterval);
          } else {
            setTranscription(result);
            clearInterval(intervalId);
            setProgression(100);
          }
        })
        .catch((e) => {
          const { error } = e.response.data;
          if (error === "no_credits") {
            toast.error("You have no credits left. Please upgrade your plan");
            router.push("/pricing");
          }
        });
    };

    intervalId = window.setTimeout(checkJob, requestInterval);

    return () => clearTimeout(intervalId);
  }, []);


  return (
    <>
      <SignInModal />
      <div className="my-20 px-5 text-black xl:px-0">
        <div
          className="animate-fade-up bg-gradient-to-br tracking-[-0.02em]"
          style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
        >
          <div
            className="mx-auto flex w-full justify-center rounded-xl sm:max-w-lg"
            style={{
              backgroundImage: thumbnailUrl
                ? `url(${thumbnailUrl})`
                : undefined,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          >
            {progression > 0 ? (
              <div className="z-10 flex h-72 w-full items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm">
                <p className="text-center text-lg font-bold text-white">
                  Processing ... ({progression.toFixed(2)}%)
                </p>
              </div>
            ) : (
              <div
                className={classNames(
                  "flex h-auto w-3/4 w-full flex-col items-center justify-center divide-y-2 divide-slate-400/25 rounded-lg bg-white shadow-xl shadow-red-500/30 backdrop-blur-md",
                )}
              >
                <div className="mb-10 mt-10 text-center">
                  <h2 className="mb-2 text-2xl font-semibold">
                    Upload your video
                  </h2>
                  <p className="text-gray-500">.mp4, .avi, .mov or .mkv</p>
                </div>
                <form
                  action="#"
                  className="relative h-32 w-full max-w-xs bg-white"
                >
                  <>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".mp4,.avi,.mov,.mkv"
                    />
                    <label
                      htmlFor="file-upload"
                      className="z-20 flex h-full w-full cursor-pointer flex-col-reverse items-center justify-center"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {loaded ? (
                        <>
                          <p className="z-10 text-center text-xs font-medium text-gray-500">
                            Drag & Drop your video here
                          </p>
                          <svg
                            className="z-10 h-8 w-8 text-indigo-400"
                            fill="red"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                          </svg>
                        </>
                      ) : (
                        <div role="status">
                          <svg
                            aria-hidden="true"
                            className="mr-2 h-8 w-8 animate-spin fill-red-600 text-gray-600"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor"
                            />
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentFill"
                            />
                          </svg>
                        </div>
                      )}
                    </label>
                  </>
                </form>
                <div className="mb-5 w-full max-w-xs border-none bg-white">
                  <div className="h-3 border-b-2 border-slate-400/25 text-center text-sm">
                    <span className="bg-white px-5">OR</span>
                  </div>
                  <div className="mt-5">
                    <div className="relative flex items-center space-x-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 64 64"
                        fill="#000"
                        width="50px"
                        height="50px"
                      >
                        <path d="M56.456,17.442c-0.339-1.44-1.421-2.595-2.866-3.053C49.761,13.174,41.454,12,32,12s-17.761,1.174-21.591,2.389 c-1.445,0.458-2.527,1.613-2.866,3.053C6.903,20.161,6,25.203,6,32c0,6.797,0.903,11.839,1.544,14.558 c0.339,1.44,1.421,2.595,2.866,3.053C14.239,50.826,22.546,52,32,52s17.761-1.174,21.591-2.389 c1.445-0.458,2.527-1.613,2.866-3.053C57.097,43.839,58,38.797,58,32C58,25.203,57.097,20.161,56.456,17.442z M27,40V24l14.857,8 L27,40z" />
                      </svg>
                      <input
                        type="text"
                        value={inputValue}
                        placeholder="YouTube URL"
                        onChange={(e) => setInputValue(e.target.value)}
                        className="font-small relative text-black h-10 w-full rounded-md border-neutral-500 bg-neutral-300 px-4 placeholder-dark outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:border-transparent focus:ring-2 focus:ring-red-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal showModal={isWaitingForlanguage && !!user} setShowModal={() => null}>
        <div className="w-full border-black md:max-w-md md:border md:shadow-xl">
          <div className="flex flex-col items-center justify-center space-y-3 bg-white px-4 py-3 text-center text-black">
            <div className="w-full text-right">
              <button
                className="menu-close"
                onClick={() => {
                  setWaitingForLanguage(false);
                  setInputValue("");
                  setLanguageSelector(false);
                }}
              >
                <svg
                  className="h-6 w-6 cursor-pointer text-gray-500 hover:text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            {thumbnailUrl && (
              <Image
                src={thumbnailUrl}
                className="rounded-xl"
                alt="Picture of the author"
                width={350}
                height={200}
                style={{
                  maxHeight: 220,
                  objectFit: 'cover'
                }}
              />
            )}
            <h3 className="font-display text-2xl font-bold">
              Language of the video
            </h3>
            <div className="flex-inline flex">
              <button
                onClick={() => setLanguageSelector((o) => !o)}
                type="button"
                className="inline-flex items-center"
                aria-expanded={isLanguageSelectorOpen}
              >
                <span
                  className={`fi fis mr-2 rounded-full text-3xl fi-${selectedLanguage.flag}`}
                />
                {selectedLanguage.name}
                <svg
                  className="-me-1 ms-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L10 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={startProcessing}
                type="button"
                className="font-small relative ml-5 h-10 w-full rounded-md border-black bg-neutral-300 px-4 placeholder-white outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:border-transparent focus:bg-neutral-800 focus:ring-2 focus:ring-red-800"
              >
                Go !
              </button>
              {isLanguageSelectorOpen && (
                <div
                  className="absolute bottom-0 left-0 right-0 top-auto z-10 mb-5 mt-2 h-full w-full overflow-y-auto overflow-x-hidden rounded-md bg-neutral-200 shadow-lg ring-1 ring-black ring-opacity-5 lg:left-auto lg:right-1/3 lg:h-1/2 lg:w-96"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div
                    className="grid grid-cols-2 gap-2 lg:grid-cols-3"
                    role="none"
                  >
                    {TRANSCRIPT_LANGUAGES.map((c, i) => {
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            handleLanguageChange(c.name, c.lang, c.flag);
                            setLanguageSelector(false);
                          }}
                          className={`${c.lang == selectedLanguage.lang
                            ? "bg-neutral-400"
                            : "text-gray-700 hover:bg-neutral-300"
                            } block inline-flex items-center px-4 py-2 text-start text-sm text-black ${i % 2 === 0 ? "rounded-r" : "rounded-l"
                            }`}
                          role="menuitem"
                        >
                          <span
                            className={`fi fis mr-2 rounded-full text-3xl fi-${c.flag}`}
                          />
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
