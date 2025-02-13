import express from "express";
import config from "./config";
import indexRouter from "./routes";
import uploadRouter from "./routes/upload";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.use('/file', uploadRouter);
app.listen(config.port, ()=>{
   config.debug ? console.log(`Server is running in http://127.0.0.1:${config.port}`) : '';
})

module.exports = app;
