import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";

import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Water } from "three/examples/jsm/objects/Water";
import { Sky } from "three/examples/jsm/objects/Sky";

function main() {
	const canvas = document.querySelector(".screen");
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
	document.body.appendChild(renderer.domElement);

	const fov = 120;
	const aspect = 2; // холст по умолчанию
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.z = 15;
	camera.position.y = 5;
	camera.lookAt(0, 5, 0);

	const scene = new THREE.Scene();

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.maxPolarAngle = Math.PI * 0.495;
	controls.target.set(0, 10, 0);
	controls.minDistance = 40.0;
	controls.maxDistance = 200.0;
	controls.update();

	const gui = new GUI();

	const sky = new Sky();
	sky.scale.setScalar(10000);
	scene.add(sky);

	//солнце
	const sun = new THREE.Vector3();

	const stats = new Stats();
	document.body.appendChild(stats.dom);

	const pointLight = new THREE.PointLight(0xffffff, 1, 100);
	pointLight.position.set(0, 40, 0);
	pointLight.castShadow = true;
	scene.add(pointLight);

	const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

	const water = new Water(waterGeometry, {
		textureWidth: 512,
		textureHeight: 512,
		waterNormals: new THREE.TextureLoader().load(
			"../textures/waternormals.jpg",
			function (texture) {
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
				texture.repeat.set(1, 1);
			}
		),
		sunDirection: new THREE.Vector3(),
		sunColor: 0xffffff,
		waterColor: 0x001e0f,
		distortionScale: 3.7,
		fog: scene.fog !== undefined,
	});

	const waterUniforms = water.material.uniforms;

	const folderWater = gui.addFolder("Water");
	folderWater
		.add(waterUniforms.distortionScale, "value", 0, 8, 0.1)
		.name("distortionScale");
	folderWater.add(waterUniforms.size, "value", 0.1, 10, 0.1).name("size");
	folderWater.open();

	water.rotation.x = -Math.PI / 2;

	scene.add(water);

	const geometry = new THREE.BoxGeometry(30, 30, 30);
	const material = new THREE.MeshStandardMaterial({ roughness: 0 });

	const mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);

	const parameters = {
		elevation: 2,
		azimuth: 180,
	};

	const folderSky = gui.addFolder("Sky");
	folderSky.add(parameters, "elevation", 0, 90, 0.1).onChange(updateSun);
	folderSky.add(parameters, "azimuth", -180, 180, 0.1).onChange(updateSun);
	folderSky.open();

	const pmremGenerator = new THREE.PMREMGenerator(renderer);
	const sceneEnv = new THREE.Scene();

	let renderTarget;

	//источник света
	function updateSun() {
		const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
		const theta = THREE.MathUtils.degToRad(parameters.azimuth);

		sun.setFromSphericalCoords(1, phi, theta);

		sky.material.uniforms["sunPosition"].value.copy(sun);
		water.material.uniforms["sunDirection"].value.copy(sun).normalize();

		if (renderTarget !== undefined) renderTarget.dispose();

		sceneEnv.add(sky);
		renderTarget = pmremGenerator.fromScene(sceneEnv);
		scene.add(sky);

		scene.environment = renderTarget.texture;
	}

	updateSun();

	function resizeRendererToDisplaySize(renderer) {
		// const renderer = new THREE.WebGLRenderer;
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		const canvas = renderer.domElement;
		const pixelRatio = window.devicePixelRatio;
		const width = (canvas.clientWidth * pixelRatio) | 0;
		const height = (canvas.clientHeight * pixelRatio) | 0;
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize) {
			renderer.setSize(width, height, false);
		}
		return needResize;
	}

	function render() {
		if (resizeRendererToDisplaySize(renderer)) {
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}

		const time = performance.now() * 0.001;
		mesh.position.y = Math.sin(time) * 20 + 5;
		mesh.rotation.x = time * 0.5;
		mesh.rotation.z = time * 0.51;

		water.material.uniforms["time"].value += 1.0 / 60.0;

		renderer.render(scene, camera);

		requestAnimationFrame(render);
		stats.update();
	}

	requestAnimationFrame(render);
}

main();
