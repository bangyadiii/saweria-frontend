"use client";

import React from "react";
import Sketch from "@uiw/react-color-sketch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ColorPickerProps = {
  value: string | null;
  setValue: (value: string | null) => void;
};

function ColorPicker({ value, setValue }: ColorPickerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`w-full shadow-normal transition-all active:shadow-pressed border-[1px] border-black font-mono px-4 py-2 rounded-md`}
        style={{
          backgroundColor: value ?? "#000000",
        }}
      >
        Pilih Warna
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-full" alignOffset={10} side="bottom">
        <Sketch
          style={{ boxShadow: "none" }}
          onChange={(color) => {
            setValue(color.hex);
          }}
          className="w-full"
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ColorPicker;
