const express = require("express");
const {
  newKit,
  getKitbyID,
  getCustomerKitsById,
  updateKitbyID,
  getbykitId,
  deletbykitID,
  kitUpdateById,
  AddCamera,
} = require("../controller/kit.controller");
const { upload,uplaodOne } = require("../middleware/multerConfig");
const kitRouter = express.Router();

kitRouter.post("/new-kit", upload.array("cameraImage", 10), newKit);
// "cameraImage" is used for image uploads
kitRouter.patch("/addcamera",uplaodOne.single("cameraImg"), AddCamera);
kitRouter.get("/get-kit/:id", getKitbyID);
kitRouter.get("/get-kits/:id", getCustomerKitsById);
kitRouter.patch("/update-kit", updateKitbyID);
kitRouter.get("/getbykit/:id", getbykitId);
kitRouter.delete("/deletekit/:id", deletbykitID);
kitRouter.patch("/updatekitbyid/:id", kitUpdateById);
module.exports = { kitRouter };
