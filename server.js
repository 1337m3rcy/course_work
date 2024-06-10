const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Обслуживание статических файлов из папки public
app.use(express.static(path.join(__dirname, "public")));

// Обслуживание статических файлов из папки first_site
app.use(
	"/first_site",
	express.static(path.join(__dirname, "public/first_site"))
);

// Обслуживание статических файлов из папки second_site
app.use(
	"/second_site",
	express.static(path.join(__dirname, "public/second_site"))
);

// Обслуживание статических файлов из папки node_modules/three
app.use(
	"/node_modules/three",
	express.static(path.join(__dirname, "node_modules/three"))
);

// Обработка запросов к корневому URL
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Запуск сервера
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
