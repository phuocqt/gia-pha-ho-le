import React, { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";

interface ValidatedYearInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const ValidatedYearInput: React.FC<ValidatedYearInputProps> = ({
  id,
  value,
  onChange,
  className,
}) => {
  const currentYear = new Date().getFullYear();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    const numericValue = inputValue.replace(/\D/g, "");

    const truncatedValue = numericValue.slice(0, 4);

    const year = parseInt(truncatedValue, 10);

    if (!isNaN(year) && year >= 1000 && year <= currentYear) {
      onChange(year.toString());
    } else if (truncatedValue === "") {
      onChange("");
    } else {
      onChange(value);
    }
  };

  return (
    <Input
      id={id}
      value={value}
      className={className}
      type="number"
      inputMode="numeric"
      pattern="\d{4}"
      placeholder="Nhập Năm"
      maxLength={4}
      onChange={handleInputChange}
    />
  );
};

export default ValidatedYearInput;
