import express from "express";

const router = express.Router();
router.get('/', function (req, res, next) {
    res.send("Welcome to Cute-Upload")
});
// 以 public 开头的静态资源，可以直接返回
router.use('/public', express.static('public'));
export default router;
