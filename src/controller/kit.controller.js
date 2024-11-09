const VisionXDetails = require("../models/VisionXDetails.model.");
const { logger } = require("../logger/logger");
const {
  newKitRegister,
  getKit,
  getKitsByCustomerId,
  updateKit,
  getbykitIds,
  deleteByKitId,
  updateByKitId,
  addCamera,
} = require("../services/kit/visionX.service");

const newKit = async (req, res) => {
  console.log(req.body);

  // Parse cameraStatuses from string to JSON array
  let cameraStatuses = JSON.parse(req.body.cameraStatuses);
  console.log(cameraStatuses);
  try {
    // Attach image paths to the cameraStatuses array
    if (req.files && req.files.length > 0) {
      cameraStatuses = cameraStatuses.map((camera, index) => {
        return {
          ...camera,
          image: req.files[index] ? req.files[index].path : "", // Attach the image path to each camera
        };
      });
    }

    // Add the cameraStatuses array back to the request body
    req.body.cameraStatuses = cameraStatuses;

    // Pass VisionXDetails and request to the service
    const newKitService = newKitRegister(VisionXDetails);
    const responseMessage = await newKitService(req);

    logger.info(`newKit API executed successfully`);
    res.status(responseMessage.status).json(responseMessage);
  } catch (error) {
    logger.error("Error executing newKit API", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getKitbyID = async (req, res) => {
  const getById = getKit(VisionXDetails);
  const responseMessage = await getById(req);
  logger.info(`getKitById api Executed`);
  res.status(responseMessage.status).json(responseMessage);
};
const getCustomerKitsById = async (req, res) => {
  const GetKitsByCustomerId = getKitsByCustomerId(VisionXDetails);
  const responseMessage = await GetKitsByCustomerId(req);
  logger.info("getkitsBycustomerid api Excuted");
  res.status(responseMessage.status).send(responseMessage);
};
const updateKitbyID = async (req, res) => {
  const updatekitbyvisionxId = await updateKit(VisionXDetails);
  const responseMessage = await updatekitbyvisionxId(req);
  logger.info("updatekitbyvisionxId api Excuted");
  res.status(responseMessage.status).send(responseMessage);
};
const getbykitId = async (req, res) => {
  getbykitid = await getbykitIds(VisionXDetails);
  const responseMessage = await getbykitid(req);
  logger.info("getbykitid api Excuted ");
  res.status(responseMessage.status).send(responseMessage);
};
const deletbykitID = async (req, res) => {
  const deletekit = await deleteByKitId(VisionXDetails);
  const responseMessage = await deletekit(req);
  logger.info("deletebykitid api Excuted ");
  res.status(responseMessage.status).send(responseMessage);
};

const kitUpdateById = async (req, res) => {
  console.log(req);
  const updateKitByIdFunction = await updateByKitId(VisionXDetails);
  const responseMessage = await updateKitByIdFunction(req);
  logger.info("updationkitbyid api Excuted ");
  res.status(responseMessage.status).send(responseMessage);
};
const AddCamera = async (req, res) => {
  const addCameras = await addCamera(VisionXDetails);
  const responseMessage = await addCameras(req);
  logger.info("add camera api Excuted ");
  res.status(responseMessage.status).send(responseMessage); // Send the response from the service
};
module.exports = {
  newKit,
  getKitbyID,
  getCustomerKitsById,
  updateKitbyID,
  getbykitId,
  deletbykitID,
  kitUpdateById,
  AddCamera,
};
