import productList from './productList.mjs';
import { loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

// Only show these four tents on the home page
const allowedIds = ["880RR", "989CG", "344YJ", "985PR"];

productList(".product-list", "tents", allowedIds);