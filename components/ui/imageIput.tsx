import React, { useEffect, useState } from "react";
import { Input } from "./input";
import { Button } from "./button";
import Image from "next/image";

interface ImageInputProps {
  url?: string;
  onChange?: (file: File | null) => void;
}

const ImageInput: React.FC<ImageInputProps> = ({ url, onChange }) => {
  const [selectedImage, setSelectedImage] = useState<
    string | ArrayBuffer | null
  >(url || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (url) {
      setSelectedImage(url);
    }
  }, [url]);

  useEffect(() => {
    if (onChange) {
      onChange(selectedFile);
    }
  }, [selectedFile, onChange]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setSelectedImage(null);
    }
  };

  return (
    <div className="p-4">
      <Input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-4"
      />
      {selectedImage && (
        <div className="mt-4">
          <Image
            src={selectedImage as string}
            alt="Preview"
            className="w-full h-auto"
          />
        </div>
      )}
      <Button className="mt-4">Thay ảnh đại diện</Button>
    </div>
  );
};

export default ImageInput;
