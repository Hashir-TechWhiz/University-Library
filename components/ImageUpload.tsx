"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import config from "@/lib/config";
import { toast } from "@/hooks/use-toast";
import { IKImage, ImageKitProvider, IKUpload } from "imagekitio-next";

const {
  env: {
    imagekit: { publicKey, urlEndpoint },
  },
} = config;

const authenticator = async () => {
  try {
    // Use a more reliable way to detect production vs development
    let baseUrl;

    // When deployed to Vercel, use the deployment URL directly
    if (typeof window !== "undefined") {
      // For production/deployed environments, use the current origin
      baseUrl = window.location.origin;
    } else {
      // Fallback for server-side rendering contexts
      baseUrl =
        config.env.prodApiEndpoint ||
        config.env.apiEndpoint ||
        "https://university-library-muhammd-hashir.vercel.app";
    }

    console.log("Using API endpoint:", baseUrl);

    const response = await fetch(`${baseUrl}/api/auth/imagekit`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Authentication request failed:", error);
    throw error;
  }
};

const ImageUpload = ({
  onFileChange,
}: {
  onFileChange: (filePath: string) => void;
}) => {
  const ikUploadRef = useRef(null);
  const [file, setFile] = useState<{ filePath: string } | null>(null);

  const onError = (error: any) => {
    console.error("Image Upload Error:", error);
    toast({
      title: `Image Upload Failed`,
      description: `Your image could not be uploaded. Please try again.`,
      variant: "destructive",
    });
  };

  const onSuccess = (res: any) => {
    console.log("Upload Success:", res);
    setFile(res);
    onFileChange(res.filePath);

    toast({
      title: `Image Uploaded Successfully`,
      description: `${res.filePath} uploaded successfully!`,
    });
  };

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <IKUpload
        className="hidden"
        ref={ikUploadRef}
        onError={onError}
        onSuccess={onSuccess}
        fileName="Test upload png"
      />

      <button
        className={cn("upload-btn")}
        onClick={(e) => {
          e.preventDefault();
          if (ikUploadRef.current) {
            // @ts-ignore
            ikUploadRef.current?.click();
          }
        }}
      >
        <Image
          src="/icons/upload.svg"
          alt="upload-icon"
          width={20}
          height={20}
          className="object-contain"
        />

        <p className="text-base text-light-100">Upload a File</p>

        {file && <p className="upload-filename">{file.filePath}</p>}
      </button>

      {file && (
        <IKImage
          alt={file.filePath}
          path={file.filePath}
          width={500}
          height={300}
        />
      )}
    </ImageKitProvider>
  );
};

export default ImageUpload;
