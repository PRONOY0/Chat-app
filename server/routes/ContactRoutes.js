const {
  searchContacts,
  getContactsForDMList,
  getAllContacts,
} = require("../controllers/ContactController");
const { verifyToken } = require("../middlewares/AuthMiddleware");

const contactRoutes = require("express").Router();

contactRoutes.post("/search", verifyToken, searchContacts);

contactRoutes.get("/get-contacts-for-dm", verifyToken, getContactsForDMList);

contactRoutes.get("/get-all-contacts", verifyToken, getAllContacts);

module.exports = contactRoutes;
