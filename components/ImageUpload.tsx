'use client';

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
        const response = await fetch(`${config.env.apiEndpoint}/api/auth/imagekit`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Request failed with status ${response.status}: ${errorText}`
            );
        }

        const data = await response.json();
        const { signature, expire, token } = data;

        return { token, expire, signature };
    } catch (error: any) {
        console.error(`Authentication request failed: ${error.message}`);
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
