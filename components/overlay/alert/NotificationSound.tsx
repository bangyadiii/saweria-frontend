"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React from "react";

function NotificationSound() {
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [soundDefault, setSoundDefault] = React.useState<boolean>(false);
  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.files);
  };

  return (
    <Card className="bg-gray-50">
      <CardHeader>
        <CardTitle>Suara Notifikasi Alert</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-x-3">
        {!isEditing && (
          <>
            <span className="flex-1">
              {soundDefault ? "default" : "custom_sound.mp3"}
            </span>
            <Button onClick={() => setIsEditing(true)}>Ganti Suara</Button>
            {!soundDefault && (
              <Button
                variant={"destructive"}
                onClick={() => setSoundDefault(true)}
              >
                Hapus
              </Button>
            )}
          </>
        )}
        {isEditing && (
          <>
            <Input type="file" onChange={onUpload} />
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
