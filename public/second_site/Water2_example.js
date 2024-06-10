import * as THREE from "three";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Water } from "three/addons/objects/Water2.js";

const params = {
	color: "#ffffff",
	scale: 4,
	flowX: 1,
	flowY: 1,
};

let renderer, scene, camera, torusKnot;

function main() {
	const canvas = document.querySelector(".screen");
	renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	document.body.appendChild(renderer.domElement);

	const fov = 45;
	const aspect = window.innerWidth / window.innerHeight; // холст по умолчанию
	const near = 0.1;
	const far = 200;

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(-15, 7, 15);
	camera.lookAt(scene.position);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.maxPolarAngle = Math.PI * 0.495;
	controls.target.set(0, 10, 0);
	controls.minDistance = 40.0;
	controls.maxDistance = 200.0;
	controls.update();

	// ground

	const groundGeometry = new THREE.PlaneGeometry(20, 20);
	const groundMaterial = new THREE.MeshStandardMaterial({
		roughness: 0.8,
		metalness: 0.4,
	});
	const ground = new THREE.Mesh(groundGeometry, groundMaterial);
	ground.rotation.x = Math.PI * -0.5;
	scene.add(ground);

	// mesh

	const torusKnotGeometry = new THREE.TorusKnotGeometry(3, 1, 256, 32);
	const torusKnotMaterial = new THREE.MeshNormalMaterial();

	torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
	torusKnot.position.y = 4;
	torusKnot.scale.set(0.5, 0.5, 0.5);
	scene.add(torusKnot);

	// water

	const textureLoader = new THREE.TextureLoader();
	textureLoader.load("../textures/hardwood2_diffuse.jpg", function (map) {
		map.wrapS = THREE.RepeatWrapping;
		map.wrapT = THREE.RepeatWrapping;
		map.anisotropy = 16;
		map.repeat.set(4, 4);
		map.colorSpace = THREE.SRGBColorSpace;
		groundMaterial.map = map;
		groundMaterial.needsUpdate = true;
	});

	const waterGeometry = new THREE.PlaneGeometry(20, 20);

	const water = new Water(waterGeometry, {
		color: params.color,
		scale: params.scale,
		flowDirection: new THREE.Vector2(params.flowX, params.flowY),
		textureWidth: 1024,
		textureHeight: 1024,
	});

	water.position.y = 1;
	water.rotation.x = Math.PI * -0.5;
	scene.add(water);

	// skybox

	try {
		const cubeTextureLoader = new THREE.CubeTextureLoader();
		cubeTextureLoader.setPath("/textures/");

		const cubeTexture = cubeTextureLoader.load([
			"posx.jpg",
			"negx.jpg",
			"posy.jpg",
			"negy.jpg",
			"posz.jpg",
			"negz.jpg",
		]);

		scene.background = cubeTexture;
	} catch (error) {
		console.error("Ошибка при загрузке текстуры для заднего фона:", error);
	}

	// light

	const ambientLight = new THREE.AmbientLight(0xe7e7e7, 1.2);
	scene.add(ambientLight);

	const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
	directionalLight.position.set(-1, 1, 1);
	scene.add(directionalLight);

	// gui

	const gui = new GUI();

	gui.addColor(params, "color").onChange(function (value) {
		water.material.uniforms["color"].value.set(value);
	});
	gui.add(params, "scale", 1, 10).onChange(function (value) {
		water.material.uniforms["config"].value.w = value;
	});
	gui.add(params, "flowX", -1, 1)
		.step(0.01)
		.onChange(function (value) {
			water.material.uniforms["flowDirection"].value.x = value;
			water.material.uniforms["flowDirection"].value.normalize();
		});
	gui.add(params, "flowY", -1, 1)
		.step(0.01)
		.onChange(function (value) {
			water.material.uniforms["flowDirection"].value.y = value;
			water.material.uniforms["flowDirection"].value.normalize();
		});

	gui.open();

	window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	requestAnimationFrame(animate);
	render();
}

function render() {
	const time = performance.now() * 0.001;
	torusKnot.position.y = Math.sin(time) + 3;
	torusKnot.rotation.x = time * 0.05;
	torusKnot.rotation.z = time * 0.051;

	renderer.render(scene, camera);
}

main();
animate();
