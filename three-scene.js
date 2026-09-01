import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* ===========================================================
   ARCHON Tech — procedural creative-studio scene
   Desk, monitor, laptop, chair, lamp, plant, floating UI panel —
   wrapped in a complete enclosing room so rotating the camera
   360° never reveals blank white space. Recolored to the
   medium-dark ARCHON Tech theme; geometry and interaction
   are unchanged from the original scene.
=========================================================== */

const canvas = document.getElementById("studio-canvas");
if (canvas) {
  const wrap = canvas.parentElement;

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(4.6, 3.4, 5.4);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  const maxPR = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(maxPR);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ---------- Palette (matches CSS tokens) ----------
  const violet = 0x8c7cfb;
  const cyan = 0x55d6ec;
  const pink = 0xf0a8d0;
  const wood = 0xd9c9b4;
  const woodDark = 0xb79f81;
  const ink = 0x2c2a3f;
  const device = 0xd8d3ee;

  // ---------- Lighting ----------
  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 1.05);
  key.position.set(5, 8, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -6;
  key.shadow.camera.right = 6;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -6;
  scene.add(key);

  const fill = new THREE.PointLight(cyan, 1.0, 12);
  fill.position.set(-3, 3, -2);
  scene.add(fill);

  const rim = new THREE.PointLight(violet, 0.85, 12);
  rim.position.set(3, 2, -4);
  scene.add(rim);

  // Soft light bounced from the room itself so walls don't look flat/unlit.
  const roomFill = new THREE.HemisphereLight(0x8f86c9, 0x201c33, 0.6);
  scene.add(roomFill);

  // ---------- Group ----------
  const studio = new THREE.Group();
  scene.add(studio);

  // ---------- Complete enclosing room ----------
  // A single large box, rendered from the inside (BackSide), so that no
  // matter how far the camera orbits, there is always room geometry behind
  // everything instead of blank page background. Sized generously relative
  // to the OrbitControls max distance (see below) so the camera can never
  // pass through a wall and "exit" the box.
  const room = new THREE.Group();

  const roomHalfW = 10;   // half width (x)
  const roomHalfD = 10;   // half depth (z)
  const roomHeight = 12;  // full height (y)

  const roomMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x1c1830, roughness: 1, side: THREE.BackSide }), // +x wall
    new THREE.MeshStandardMaterial({ color: 0x1c1830, roughness: 1, side: THREE.BackSide }), // -x wall
    new THREE.MeshStandardMaterial({ color: 0x161327, roughness: 1, side: THREE.BackSide }), // ceiling
    new THREE.MeshStandardMaterial({ color: 0x171429, roughness: 1, side: THREE.BackSide }), // floor (fallback, real floor sits above it)
    new THREE.MeshStandardMaterial({ color: 0x1a1730, roughness: 1, side: THREE.BackSide }), // +z wall
    new THREE.MeshStandardMaterial({ color: 0x1f1a35, roughness: 1, side: THREE.BackSide }), // -z wall (behind desk)
  ];
  const roomShell = new THREE.Mesh(
    new THREE.BoxGeometry(roomHalfW * 2, roomHeight, roomHalfD * 2),
    roomMaterials
  );
  roomShell.position.set(0, roomHeight / 2 - 1, -0.5);
  room.add(roomShell);

  // Real floor (flat, slightly reflective-feeling, receives shadow)
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(4.2, 48),
    new THREE.MeshStandardMaterial({ color: 0x241f3c, roughness: 0.85 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  room.add(floor);

  // Wider room-scale floor so the ground continues beyond the rug-like circle
  const roomFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(roomHalfW * 2 - 0.4, roomHalfD * 2 - 0.4),
    new THREE.MeshStandardMaterial({ color: 0x18142a, roughness: 1 })
  );
  roomFloor.rotation.x = -Math.PI / 2;
  roomFloor.position.y = -0.01;
  roomFloor.receiveShadow = true;
  room.add(roomFloor);

  // Back accent wall (closer, slightly different tone for depth/parallax)
  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 5),
    new THREE.MeshStandardMaterial({ color: 0x1c1830, roughness: 1 })
  );
  backWall.position.set(0, 2.4, -2.05);
  backWall.receiveShadow = true;
  room.add(backWall);

  // Simple "window" accent on the left wall — a soft glowing panel, not a
  // hole (keeps geometry simple / performant while still reading as a window)
  const window1 = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 2.1),
    new THREE.MeshStandardMaterial({ color: 0x35506b, emissive: 0x4fc7dd, emissiveIntensity: 0.5, roughness: 0.6 })
  );
  window1.position.set(-4.35, 2.6, -0.4);
  window1.rotation.y = Math.PI / 2;
  room.add(window1);

  const windowFrame = new THREE.Mesh(
    new THREE.PlaneGeometry(1.85, 2.35),
    new THREE.MeshStandardMaterial({ color: 0xe9e4f6, roughness: 0.8 })
  );
  windowFrame.position.set(-4.4, 2.6, -0.4);
  windowFrame.rotation.y = Math.PI / 2;
  room.add(windowFrame);
  window1.position.x = -4.34; // keep window slightly in front of its frame

  studio.add(room);

  // Shelf (kept from original scene, sits against the back accent wall)
  const shelf = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.05, 0.22),
    new THREE.MeshStandardMaterial({ color: woodDark })
  );
  shelf.position.set(1.7, 2.15, -1.95);
  shelf.castShadow = true;
  studio.add(shelf);

  // A couple of low-poly decorative boxes on the shelf for visual interest
  const shelfDecorMat1 = new THREE.MeshStandardMaterial({ color: violet, roughness: 0.6 });
  const shelfDecorMat2 = new THREE.MeshStandardMaterial({ color: pink, roughness: 0.6 });
  const decorBox1 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.14), shelfDecorMat1);
  decorBox1.position.set(1.35, 2.29, -1.95);
  decorBox1.castShadow = true;
  const decorBox2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.18, 12), shelfDecorMat2);
  decorBox2.position.set(2.05, 2.27, -1.95);
  decorBox2.castShadow = true;
  studio.add(decorBox1, decorBox2);

  // Desk
  const deskTop = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.12, 1.5),
    new THREE.MeshStandardMaterial({ color: wood, roughness: 0.6 })
  );
  deskTop.position.set(0, 0.9, 0);
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;
  studio.add(deskTop);

  const legGeo = new THREE.BoxGeometry(0.1, 0.9, 0.1);
  const legMat = new THREE.MeshStandardMaterial({ color: woodDark, roughness: 0.6 });
  [[-1.45, -0.6], [1.45, -0.6], [-1.45, 0.6], [1.45, 0.6]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, 0.45, z);
    leg.castShadow = true;
    studio.add(leg);
  });

  // Monitor
  const monitorGroup = new THREE.Group();
  const monitorStand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.09, 0.28, 12),
    new THREE.MeshStandardMaterial({ color: ink })
  );
  monitorStand.position.set(-0.55, 1.1, -0.35);
  monitorStand.castShadow = true;
  monitorGroup.add(monitorStand);

  const monitorScreen = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.72, 0.045),
    new THREE.MeshStandardMaterial({ color: ink, roughness: 0.4 })
  );
  monitorScreen.position.set(-0.55, 1.62, -0.35);
  monitorScreen.castShadow = true;
  monitorGroup.add(monitorScreen);

  const monitorGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.02, 0.6),
    new THREE.MeshBasicMaterial({ color: violet })
  );
  monitorGlow.position.set(-0.55, 1.62, -0.325);
  monitorGroup.add(monitorGlow);

  // faux "code lines" on screen
  const lineMat = new THREE.MeshBasicMaterial({ color: cyan });
  for (let i = 0; i < 6; i++) {
    const w = 0.3 + Math.random() * 0.45;
    const line = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.035), lineMat);
    line.position.set(-0.55 - 0.45 + w / 2, 1.85 - i * 0.08, -0.322);
    monitorGroup.add(line);
  }
  studio.add(monitorGroup);

  // Laptop
  const laptopGroup = new THREE.Group();
  const laptopBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.03, 0.42),
    new THREE.MeshStandardMaterial({ color: device, roughness: 0.5 })
  );
  laptopBase.position.set(0.85, 0.975, 0.25);
  laptopBase.castShadow = true;
  laptopGroup.add(laptopBase);

  const laptopScreen = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.4, 0.02),
    new THREE.MeshStandardMaterial({ color: device, roughness: 0.5 })
  );
  laptopScreen.position.set(0.85, 1.17, 0.03);
  laptopScreen.rotation.x = -0.35;
  laptopScreen.castShadow = true;
  laptopGroup.add(laptopScreen);

  const laptopGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.54, 0.32),
    new THREE.MeshBasicMaterial({ color: pink })
  );
  laptopGlow.position.set(0.85, 1.17, 0.041);
  laptopGlow.rotation.x = -0.35;
  laptopGroup.add(laptopGlow);
  studio.add(laptopGroup);

  // Keyboard
  const keyboard = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.02, 0.2),
    new THREE.MeshStandardMaterial({ color: device, roughness: 0.6 })
  );
  keyboard.position.set(-0.55, 0.97, 0.25);
  keyboard.castShadow = true;
  studio.add(keyboard);

  // Desk lamp
  const lampGroup = new THREE.Group();
  const lampBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.14, 0.04, 16),
    new THREE.MeshStandardMaterial({ color: ink })
  );
  lampBase.position.set(1.35, 0.98, -0.5);
  lampGroup.add(lampBase);

  const lampArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.55, 8),
    new THREE.MeshStandardMaterial({ color: ink })
  );
  lampArm.position.set(1.35, 1.25, -0.5);
  lampArm.rotation.z = 0.3;
  lampGroup.add(lampArm);

  const lampHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.13, 0.2, 16, 1, true),
    new THREE.MeshStandardMaterial({ color: violet, side: THREE.DoubleSide })
  );
  lampHead.position.set(1.55, 1.5, -0.5);
  lampHead.rotation.z = Math.PI + 0.4;
  lampGroup.add(lampHead);

  const bulb = new THREE.PointLight(0xffe9c9, 0.65, 3);
  bulb.position.set(1.55, 1.45, -0.5);
  lampGroup.add(bulb);
  studio.add(lampGroup);

  // Chair
  const chairGroup = new THREE.Group();
  const seat = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 0.08, 20),
    new THREE.MeshStandardMaterial({ color: woodDark })
  );
  seat.position.set(0, 0.55, 1.3);
  seat.castShadow = true;
  chairGroup.add(seat);

  const chairBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.55, 0.07),
    new THREE.MeshStandardMaterial({ color: violet })
  );
  chairBack.position.set(0, 0.92, 1.58);
  chairBack.castShadow = true;
  chairGroup.add(chairBack);

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.5, 10),
    new THREE.MeshStandardMaterial({ color: ink })
  );
  pole.position.set(0, 0.28, 1.3);
  chairGroup.add(pole);
  studio.add(chairGroup);

  // Plant
  const plantGroup = new THREE.Group();
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.12, 0.24, 16),
    new THREE.MeshStandardMaterial({ color: 0xd88a8a })
  );
  pot.position.set(-1.7, 1.02, -0.55);
  pot.castShadow = true;
  plantGroup.add(pot);

  const leafMat = new THREE.MeshStandardMaterial({ color: 0x6fae7a, roughness: 0.7 });
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), leafMat);
    const angle = (i / 5) * Math.PI * 2;
    leaf.position.set(
      -1.7 + Math.cos(angle) * 0.12,
      1.28 + Math.random() * 0.15,
      -0.55 + Math.sin(angle) * 0.12
    );
    leaf.scale.set(0.7, 1.3, 0.7);
    leaf.castShadow = true;
    plantGroup.add(leaf);
  }
  studio.add(plantGroup);

  // A second plant + a floor rug accent on the opposite side, so the room
  // reads as furnished no matter which way the camera is facing.
  const plant2Group = plantGroup.clone(true);
  plant2Group.position.set(3.2, 0, -1.1);
  plant2Group.scale.set(0.85, 0.85, 0.85);
  studio.add(plant2Group);

  // Floating "website interface" panels behind the desk
  const panelMat1 = new THREE.MeshStandardMaterial({ color: violet, transparent: true, opacity: 0.85 });
  const panelMat2 = new THREE.MeshStandardMaterial({ color: cyan, transparent: true, opacity: 0.85 });
  const panelMat3 = new THREE.MeshStandardMaterial({ color: pink, transparent: true, opacity: 0.85 });

  const panel1 = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.75), panelMat1);
  panel1.position.set(-1.9, 1.9, -1.4);
  panel1.rotation.y = 0.3;
  const panel2 = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.65), panelMat2);
  panel2.position.set(-1.35, 2.35, -1.7);
  panel2.rotation.y = 0.15;
  const panel3 = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.55), panelMat3);
  panel3.position.set(1.9, 2.1, -1.5);
  panel3.rotation.y = -0.3;

  const floaters = new THREE.Group();
  floaters.add(panel1, panel2, panel3);
  studio.add(floaters);

  studio.position.set(0, -1, 0);
  studio.rotation.y = -0.35;

  // ---------- Controls ----------
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.enableZoom = true;
  // Room half-extents are 10 (x/z) and the ceiling sits well above 11 units
  // up, so a max orbit distance of 8.5 keeps the camera comfortably inside
  // the shell at every angle — it can never clip through a wall or exit
  // into empty space.
  controls.minDistance = 4.5;
  controls.maxDistance = 8.5;
  controls.minPolarAngle = Math.PI / 5;   // don't let the camera go flat over the ceiling
  controls.maxPolarAngle = Math.PI / 2.05; // don't let the camera dip under the floor
  controls.target.set(0, 0.6, 0);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.6;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) controls.autoRotate = false;

  let userInteracting = false;
  controls.addEventListener("start", () => { userInteracting = true; controls.autoRotate = false; });
  controls.addEventListener("end", () => {
    userInteracting = false;
    setTimeout(() => { if (!userInteracting && !prefersReducedMotion) controls.autoRotate = true; }, 2500);
  });

  // ---------- Resize ----------
  function resize() {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(w, h, false);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(wrap);
  resize();

  // ---------- Visibility pause ----------
  let isVisible = true;
  const io = new IntersectionObserver(
    (entries) => { entries.forEach((e) => { isVisible = e.isIntersecting; }); },
    { threshold: 0.05 }
  );
  io.observe(canvas);

  document.addEventListener("visibilitychange", () => {
    isVisible = isVisible && !document.hidden;
  });

  // ---------- Animate ----------
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;
    const t = clock.getElapsedTime();

    floaters.children.forEach((p, i) => {
      p.position.y += Math.sin(t * 0.6 + i) * 0.0009;
      p.rotation.z = Math.sin(t * 0.3 + i) * 0.05;
    });

    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}