"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { getAllData, runFakeData } from "@/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { NodeItem } from "@/type";

const downloadJson = (data: unknown, fileName: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export function DataManagement() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const exportData = async (prefix = "data") => {
    const data = await getAllData("data");
    const date = new Date().toISOString().replace(/[:.]/g, "-");
    downloadJson(data || [], `${prefix}-${date}.json`);
    return data || [];
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportData();
      toast({
        title: "Export thành công",
        description: "Đã export dữ liệu từ collection data.",
      });
    } catch (error) {
      console.error("Export data error:", error);
      toast({
        title: "Export thất bại",
        description: "Không thể export dữ liệu. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      await exportData("backup-before-import-data");

      const text = await file.text();
      const importedData = JSON.parse(text);

      if (!Array.isArray(importedData)) {
        throw new Error("Imported JSON must be an array.");
      }

      await runFakeData(importedData as NodeItem[]);
      toast({
        title: "Import thành công",
        description:
          "Đã backup data, xoá data/historyData và import dữ liệu mới.",
      });
    } catch (error) {
      console.error("Import data error:", error);
      toast({
        title: "Import thất bại",
        description: "File không hợp lệ hoặc không thể import dữ liệu.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý dữ liệu</CardTitle>
          <CardDescription>
            Export collection data hoặc import dữ liệu mới cho gia phả.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="gap-2"
              disabled={isExporting || isImporting}
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Đang export..." : "Export data"}
            </Button>
            <Button
              className="gap-2"
              disabled={isExporting || isImporting}
              onClick={() => inputRef.current?.click()}
              variant="outline"
            >
              <Upload className="h-4 w-4" />
              {isImporting ? "Đang import..." : "Import data"}
            </Button>
          </div>
          <Input
            ref={inputRef}
            accept="application/json,.json"
            className="hidden"
            disabled={isExporting || isImporting}
            onChange={handleImport}
            type="file"
          />
          <p className="text-sm text-muted-foreground">
            Khi import, hệ thống sẽ export backup collection data trước, sau đó
            xoá toàn bộ collection data và historyData trước khi ghi dữ liệu
            mới.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
