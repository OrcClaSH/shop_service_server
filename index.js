require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const router = require('./router/index');
const errorMiddleware = require('./middlewares/error-middleware');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: [
        process.env.CLIENT_URL,
        `http://localhost:${PORT}`
    ],
}));
app.use('/api', router);
app.use(errorMiddleware);

mongoose.set('strictQuery', false);

const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        app.listen(PORT, () => console.log(`Server EXPRESS started on ${PORT} port`))
    } catch (e) {
        console.log('[ERROR]', e)
    }
};

start();
