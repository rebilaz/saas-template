"use client";

import React, { useState, createContext } from "react";

const VideoContext = createContext<{
  transcription: string | null;
  setTranscription: (transcription: string) => void;
  thumbnailUrl: string;
  setThumbnailUrl: (thumbnailUrl: string) => void;
  language: string;
  setLanguage: (thumbnailUrl: string) => void;
  videoData: VideoDescription | null;
  setVideoData: (data: VideoDescription) => void;
}>({
  transcription: "",
  setTranscription: () => {},
  thumbnailUrl: "",
  setThumbnailUrl: () => {},
  language: "",
  setLanguage: () => {},
  videoData: null,
  setVideoData: () => {},
});

interface EditorProviderProps {
  children: React.ReactNode;
}

interface VideoDescription {
  best_titles: string[];
  description: string;
  tags: string[];
}

export const VideoProvider: React.FC<EditorProviderProps> = ({ children }) => {
  const [transcription, setTranscription] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [videoData, setVideoData] = useState<VideoDescription | null>(
    null,
  );

  return (
    <VideoContext.Provider
      value={{
        transcription,
        setTranscription,
        thumbnailUrl,
        setThumbnailUrl,
        language,
        setLanguage,
        videoData,
        setVideoData
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export default VideoContext;