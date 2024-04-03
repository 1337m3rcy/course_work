const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Обслуживание статических файлов из папки public
app.use(express.static(path.join(__dirname, "public")));

// Обслуживание статических файлов из папки node_modules/three/build
app.use(
	"/node_modules/three",
	express.static(path.join(__dirname, "node_modules/three"))
);

app.use(express.static(path.join(__dirname, "public")));

// Обработка запросов к корневому URL
app.get("/", (res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Запуск сервера
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
