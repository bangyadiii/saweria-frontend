"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import $axios from "@/lib/axios";
import { OVERLAY_SOUND_ENDPOINT } from "@/lib/api-endpoints";
import React from "react";

type NotificationSoundProps = {
  soundUrl: string | null;
};

function NotificationSound({ soundUrl }: NotificationSoundProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = React.useState<string | null>(soundUrl);

  React.useEffect(() => {
    setCurrentUrl(soundUrl);
  }, [soundUrl]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("sound", file);
    try {
      const res = await $axios.put<{ data: { sound_url: string } }>(
        OVERLAY_SOUND_ENDPOINT,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setCurrentUrl(res.data.data.sound_url);
      setIsEditing(false);
      toast({ title: "Suara notifikasi berhasil diupload" });
    } catch {
      toast({ title: "Gagal upload suara", variant: "destructive" });
    }
  };

  const onDelete = async () => {
    try {
      await $axios.put(OVERLAY_SOUND_ENDPOINT, { sound_url: null });
      setCurrentUrl(null);
      toast({ title: "Suara notifikasi dihapus" });
    } catch {
      toast({ title: "Gagal menghapus suara", variant: "destructive" });
    }
  };

  const fileName = currentUrl
    ? (currentUrl.split("/").pop() ?? "custom_sound")
    : null;

  return (
    <Card className="bg-gray-50">
      <CardHeader>
        <CardTitle>Suara Notifikasi Alert</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-x-3">
        {!isEditing && (
          <>
            <span className="flex-1">{fileName ?? "default"}</span>
            <Button onClick={() => setIsEditing(true)}>Ganti Suara</Button>
            {currentUrl && (
              <Button variant={"destructive"} onClick={onDelete}>
                Hapus
              </Button>
            )}
          </>
        )}
        {isEditing && (
          <>
            <Input type="file" accept="audio/*" onChange={onUpload} />
            <Button variant="destructive" onClick={() => setIsEditing(false)}>
              Batal
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default NotificationSound;
