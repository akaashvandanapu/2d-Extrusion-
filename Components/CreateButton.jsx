import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";
import { useState } from "react";

const CreateButton = (
  displayText = "Click Me",
  gui = AdvancedDynamicTexture.CreateFullscreenUI("myUI"),
  isActive = false
) => {
  console.log(isActive);
  let btn = Button.CreateSimpleButton("Button", displayText);
  btn.width = 0.13;
  btn.height = "45px";
  btn.fontSize = "18px";
  btn.fontFamily = "Lucida Sans Unicode";

  // Adding shadow effect
  btn.shadowOffsetX = 3;
  btn.shadowOffsetY = 3;
  btn.shadowBlur = 10;
  btn.shadowColor = "rgba(0, 0, 0, 0.5)";

  btn.cornerRadius = 50;
  btn.color = "white"; // Initial font color (white)
  btn.thickness = 0;
  btn.background = "#C75B7A";

  // isActive ? btn.background="#921A40":btn.background="#C75b7a";

  // Add hover effect
  btn.onPointerEnterObservable.add(() => {
    btn.background = "#921A40";
  });

  btn.onPointerOutObservable.add(() => {
    btn.background = "#C75b7a";
  });

  gui.addControl(btn);
  return btn;
};

export default CreateButton;
