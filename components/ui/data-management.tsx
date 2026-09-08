"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import { getAllData, runFakeData } from "@/actions";
import { Alert } from "@/components/ui/alert";
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
import { SOURCES, sourceKey } from "@/constants/const";

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
  const [isResetting, setIsResetting] = useState(false);
  const [isResetConfirmationOpen, setIsResetConfirmationOpen] =
    useState(false);
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

  const handleReset = async () => {
    try {
      setIsResetting(true);
      await exportData("backup-before-reset-data");
      await runFakeData(SOURCES[sourceKey] as unknown as NodeItem[]);
      toast({
        title: "Reset thành công",
        description: "Đã export backup và khôi phục dữ liệu mặc định.",
      });
    } catch (error) {
      console.error("Reset data error:", error);
      toast({
        title: "Reset thất bại",
        description: "Không thể khôi phục dữ liệu mặc định.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
      setIsResetConfirmationOpen(false);
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
              disabled={isExporting || isImporting || isResetting}
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Đang export..." : "Export data"}
            </Button>
            <Button
              className="gap-2"
              disabled={isExporting || isImporting || isResetting}
              onClick={() => inputRef.current?.click()}
              variant="outline"
            >
              <Upload className="h-4 w-4" />
              {isImporting ? "Đang import..." : "Import data"}
            </Button>
            <Button
              className="gap-2"
              disabled={isExporting || isImporting || isResetting}
              onClick={() => setIsResetConfirmationOpen(true)}
              variant="destructive"
            >
              <RotateCcw className="h-4 w-4" />
              {isResetting ? "Đang reset..." : "Reset data mặc định"}
            </Button>
          </div>
          <Input
            ref={inputRef}
            accept="application/json,.json"
            className="hidden"
            disabled={isExporting || isImporting || isResetting}
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
      <Alert
        desc="Dữ liệu hiện tại sẽ được export backup, sau đó collection data và historyData sẽ bị thay bằng dữ liệu mặc định."
        messenger="Bạn có chắc muốn reset dữ liệu?"
        onClose={() => setIsResetConfirmationOpen(false)}
        onContinue={handleReset}
        open={isResetConfirmationOpen}
      />
    </div>
  );
}
