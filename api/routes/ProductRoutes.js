import { Router } from "express";
import { getProducts, getProduct } from "./controllers/productController.js";

const router = Router();

// GET /api/products?q=&type_id=&subtype_id=&active=1&limit=200&offset=0
router.get("/", getProducts);

// GET /api/products/:id
router.get("/:id", getProduct);

export default router;