/**
 * 3D Game Scene powered by Three.js
 * Implements 9 interactive spots with 4 procedural themes (House/Boy, Burrow/Bunny, Orchard Hole/Fruit, Ocean/Turtle).
 * Supports Numbers and Alphabets (English, French, Arabic) seamlessly with crisp responsive rendering.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import confetti from 'canvas-confetti';
import { GameDifficulty, GameTheme } from '../services/storage';
import { SpotContentItem } from '../services/learningData';

export interface SceneCallbacks {
  onSpotSmash: (spotIndex: number, display: string, spoken: string) => void;
  onSpotTap: (spotIndex: number, display: string, spoken: string) => void;
}

interface SpotObject {
  index: number;
  currentDisplay: string;
  currentSpoken: string;
  group: THREE.Group;
  doorLeft?: THREE.Object3D;
  doorRight?: THREE.Object3D;
  doorLid?: THREE.Object3D;
  characterGroup: THREE.Group;
  numberGroup: THREE.Group;
  numberCanvas: HTMLCanvasElement;
  numberTexture: THREE.CanvasTexture;
  highlightRing: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  isOpen: boolean;
  openProgress: number;
  targetOpenProgress: number;
  isSmashing: boolean;
  smashProgress: number;
  bobTime: number;
  position: THREE.Vector3;
}

const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();

export class NumberSmashScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private spots: SpotObject[] = [];
  private theme: GameTheme = 'house';
  private difficulty: GameDifficulty = 'easy';
  private activeSpotIndex: number = -1;
  private callbacks: SceneCallbacks;
  private isSoftwareGl: boolean = false;
  private animationFrameId: number = 0;
  private activeCloseTimer: number | null = null;
  private clock = new THREE.Clock();
  private isDisposed: boolean = false;
  private ambientLight!: THREE.HemisphereLight;
  private dirLight!: THREE.DirectionalLight;
  private backgroundScenery!: THREE.Group;
  private particlesGroup!: THREE.Group;
  private dynamicParticles: Array<{
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    rotSpeed: THREE.Vector3;
    life: number;
    maxLife: number;
  }> = [];

  constructor(
    container: HTMLElement,
    callbacks: SceneCallbacks,
    initialTheme: GameTheme = 'house',
    initialDifficulty: GameDifficulty = 'easy'
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.theme = initialTheme;
    this.difficulty = initialDifficulty;

    // Software-WebGL Detection
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    // Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    this.adjustCameraFraming(width, height);

    // Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    this.setupLighting();

    this.backgroundScenery = new THREE.Group();
    this.scene.add(this.backgroundScenery);

    this.particlesGroup = new THREE.Group();
    this.scene.add(this.particlesGroup);

    this.rebuildScene();
    this.bindEvents();
    this.startLoop();
  }

  private adjustCameraFraming(width: number, height: number) {
    const aspect = width / Math.max(1, height);
    this.camera.aspect = aspect;

    const fitWidth = 7.8;
    const fitHeight = 7.3;

    const vFovRad = THREE.MathUtils.degToRad(this.camera.fov);
    const distForHeight = (fitHeight / 2) / Math.tan(vFovRad / 2);
    const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * aspect);
    const distForWidth = (fitWidth / 2) / Math.tan(hFovRad / 2);

    const requiredDistance = Math.max(distForHeight, distForWidth) + 0.6;
    this.camera.position.set(0, 0.05, requiredDistance);
    this.camera.lookAt(0, -0.05, 0);
    this.camera.updateProjectionMatrix();
  }

  private setupLighting() {
    this.ambientLight = new THREE.HemisphereLight(0xfff6e6, 0x90b5e8, 1.25);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    this.dirLight.position.set(5, 12, 8);
    if (!this.isSoftwareGl) {
      this.dirLight.castShadow = true;
      this.dirLight.shadow.mapSize.width = 1024;
      this.dirLight.shadow.mapSize.height = 1024;
      this.dirLight.shadow.camera.near = 1;
      this.dirLight.shadow.camera.far = 30;
      const d = 8;
      this.dirLight.shadow.camera.left = -d;
      this.dirLight.shadow.camera.right = d;
      this.dirLight.shadow.camera.top = d;
      this.dirLight.shadow.camera.bottom = -d;
      this.dirLight.shadow.bias = -0.0005;
      this.dirLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.dirLight);

    const rimLight = new THREE.DirectionalLight(0x73d2de, 0.9);
    rimLight.position.set(-6, 3, -6);
    this.scene.add(rimLight);
  }

  public rebuildScene(contentItems?: SpotContentItem[]) {
    if (this.activeCloseTimer) {
      clearTimeout(this.activeCloseTimer);
      this.activeCloseTimer = null;
    }

    this.spots.forEach((spot) => {
      this.scene.remove(spot.group);
      spot.numberTexture.dispose();
    });
    this.spots = [];

    while (this.backgroundScenery.children.length > 0) {
      this.backgroundScenery.remove(this.backgroundScenery.children[0]);
    }

    this.buildThemeEnvironment();

    const spacingX = 2.25;
    const spacingY = 2.05;
    const startX = -spacingX;
    const startY = spacingY;

    for (let i = 0; i < 9; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = startX + col * spacingX;
      const y = startY - row * spacingY;
      const z = 0;

      const item = contentItems && contentItems[i]
        ? contentItems[i]
        : { display: String(i + 1), spoken: String(i + 1) };

      const spot = this.createSpot(i, item, new THREE.Vector3(x, y, z));
      this.spots.push(spot);
      this.scene.add(spot.group);
    }
  }

  private buildThemeEnvironment() {
    if (this.theme === 'house') {
      this.scene.background = new THREE.Color(0x89c4f4);
      this.scene.fog = new THREE.Fog(0x89c4f4, 16, 36);

      const wallGeo = new THREE.PlaneGeometry(16, 12);
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0xfdfbf7,
        roughness: 0.7,
        metalness: 0.05,
      });
      const wallMesh = new THREE.Mesh(wallGeo, wallMat);
      wallMesh.position.set(0, 0.4, -0.6);
      wallMesh.receiveShadow = !this.isSoftwareGl;
      this.backgroundScenery.add(wallMesh);

      const roofGeo = new THREE.ConeGeometry(7.6, 2.2, 4);
      roofGeo.rotateY(Math.PI / 4);
      const roofMat = new THREE.MeshStandardMaterial({
        color: 0xe0564c,
        roughness: 0.5,
        metalness: 0.1,
      });
      const roofMesh = new THREE.Mesh(roofGeo, roofMat);
      roofMesh.position.set(0, 4.4, -0.5);
      this.backgroundScenery.add(roofMesh);

      const groundGeo = new THREE.PlaneGeometry(24, 8);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x78c044,
        roughness: 0.85,
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.set(0, -3.8, 0);
      this.backgroundScenery.add(ground);
    } else if (this.theme === 'burrow') {
      this.scene.background = new THREE.Color(0x9ae0b8);
      this.scene.fog = new THREE.Fog(0x9ae0b8, 16, 36);

      const meadowBackdrop = new THREE.Mesh(
        new THREE.PlaneGeometry(18, 14),
        new THREE.MeshStandardMaterial({
          color: 0x55a649,
          roughness: 0.9,
        })
      );
      meadowBackdrop.position.set(0, 0, -1.0);
      meadowBackdrop.receiveShadow = !this.isSoftwareGl;
      this.backgroundScenery.add(meadowBackdrop);

      for (let i = 0; i < 8; i++) {
        const flower = new THREE.Group();
        const fStem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.4),
          new THREE.MeshStandardMaterial({ color: 0x2d6a4f })
        );
        const fPetal = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 8, 8),
          new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? 0xffdf65 : 0xff70a6,
          })
        );
        fPetal.position.y = 0.22;
        flower.add(fStem, fPetal);
        const posX = i % 2 === 0 ? -4.1 - Math.random() * 0.8 : 4.1 + Math.random() * 0.8;
        const posY = -2.5 + i * 0.6;
        flower.position.set(posX, posY, 0.2);
        this.backgroundScenery.add(flower);
      }
    } else if (this.theme === 'tree') {
      // Clean Orchard Fruit Holes
      this.scene.background = new THREE.Color(0xa7c957);
      this.scene.fog = new THREE.Fog(0xa7c957, 18, 40);

      const orchardBackdrop = new THREE.Mesh(
        new THREE.PlaneGeometry(18, 14),
        new THREE.MeshStandardMaterial({
          color: 0x6a994e,
          roughness: 0.85,
        })
      );
      orchardBackdrop.position.set(0, 0, -1.0);
      orchardBackdrop.receiveShadow = !this.isSoftwareGl;
      this.backgroundScenery.add(orchardBackdrop);
    } else {
      // Ocean / Coral Cove
      this.scene.background = new THREE.Color(0x38b6ff);
      this.scene.fog = new THREE.Fog(0x38b6ff, 16, 36);

      const seaBackdrop = new THREE.Mesh(
        new THREE.PlaneGeometry(18, 14),
        new THREE.MeshStandardMaterial({
          color: 0x0077b6,
          roughness: 0.85,
        })
      );
      seaBackdrop.position.set(0, 0, -1.0);
      this.backgroundScenery.add(seaBackdrop);

      for (let i = 0; i < 8; i++) {
        const coral = new THREE.Mesh(
          new THREE.ConeGeometry(0.35, 1.2, 8),
          new THREE.MeshStandardMaterial({
            color: [0xff477e, 0xff70a6, 0x06d6a0, 0xffd166][i % 4],
            roughness: 0.6,
          })
        );
        const posX = i % 2 === 0 ? -4.2 - Math.random() * 0.6 : 4.2 + Math.random() * 0.6;
        coral.position.set(posX, -2.8 + Math.random() * 1.5, -0.2);
        this.backgroundScenery.add(coral);
      }
    }
  }

  private createSpot(
    index: number,
    item: SpotContentItem,
    pos: THREE.Vector3
  ): SpotObject {
    const spotGroup = new THREE.Group();
    spotGroup.position.copy(pos);

    let doorLeft: THREE.Object3D | undefined;
    let doorRight: THREE.Object3D | undefined;
    let doorLid: THREE.Object3D | undefined;

    const frameGroup = new THREE.Group();
    spotGroup.add(frameGroup);

    if (this.theme === 'house') {
      const frameOuter = new THREE.Mesh(
        new THREE.BoxGeometry(1.7, 1.7, 0.14),
        new THREE.MeshStandardMaterial({
          color: 0x3d7ea6,
          roughness: 0.4,
          metalness: 0.1,
        })
      );
      const frameInner = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 1.4, 0.2),
        new THREE.MeshStandardMaterial({
          color: 0x253b49,
          roughness: 0.9,
        })
      );
      frameInner.position.z = -0.05;
      frameOuter.castShadow = !this.isSoftwareGl;
      frameGroup.add(frameOuter, frameInner);

      const shutterGeo = new THREE.BoxGeometry(0.68, 1.35, 0.08);
      const shutterMat = new THREE.MeshStandardMaterial({
        color: 0xffb703,
        roughness: 0.35,
        metalness: 0.1,
      });

      const leftPivot = new THREE.Group();
      leftPivot.position.set(-0.68, 0, 0.08);
      const leftMesh = new THREE.Mesh(shutterGeo, shutterMat);
      leftMesh.position.set(0.34, 0, 0);
      leftMesh.castShadow = !this.isSoftwareGl;
      leftPivot.add(leftMesh);
      spotGroup.add(leftPivot);
      doorLeft = leftPivot;

      const rightPivot = new THREE.Group();
      rightPivot.position.set(0.68, 0, 0.08);
      const rightMesh = new THREE.Mesh(shutterGeo, shutterMat);
      rightMesh.position.set(-0.34, 0, 0);
      rightMesh.castShadow = !this.isSoftwareGl;
      rightPivot.add(rightMesh);
      spotGroup.add(rightPivot);
      doorRight = rightPivot;
    } else if (this.theme === 'burrow') {
      const mound = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.18, 14, 28),
        new THREE.MeshStandardMaterial({
          color: 0x4f772d,
          roughness: 0.85,
        })
      );
      mound.castShadow = !this.isSoftwareGl;
      const holeInterior = new THREE.Mesh(
        new THREE.CircleGeometry(0.72, 24),
        new THREE.MeshStandardMaterial({
          color: 0x1f140e,
          roughness: 0.95,
        })
      );
      holeInterior.position.z = -0.08;
      frameGroup.add(mound, holeInterior);

      const lidPivot = new THREE.Group();
      lidPivot.position.set(0, 0.78, 0.06);
      const lidMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.74, 0.74, 0.07, 24),
        new THREE.MeshStandardMaterial({
          color: 0x9b5de5,
          roughness: 0.4,
          metalness: 0.1,
        })
      );
      lidMesh.rotation.x = Math.PI / 2;
      lidMesh.position.set(0, -0.78, 0);
      lidMesh.castShadow = !this.isSoftwareGl;
      lidPivot.add(lidMesh);
      spotGroup.add(lidPivot);
      doorLid = lidPivot;
    } else if (this.theme === 'tree') {
      const holeRim = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.18, 14, 28),
        new THREE.MeshStandardMaterial({
          color: 0xf4a261,
          roughness: 0.5,
          metalness: 0.1,
        })
      );
      holeRim.castShadow = !this.isSoftwareGl;
      const holeInterior = new THREE.Mesh(
        new THREE.CircleGeometry(0.72, 24),
        new THREE.MeshStandardMaterial({
          color: 0x1f140e,
          roughness: 0.95,
        })
      );
      holeInterior.position.z = -0.08;
      frameGroup.add(holeRim, holeInterior);

      const lidPivot = new THREE.Group();
      lidPivot.position.set(0, 0.78, 0.06);
      const lidMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.74, 0.74, 0.07, 24),
        new THREE.MeshStandardMaterial({
          color: 0xe76f51,
          roughness: 0.4,
          metalness: 0.1,
        })
      );
      lidMesh.rotation.x = Math.PI / 2;
      lidMesh.position.set(0, -0.78, 0);
      lidMesh.castShadow = !this.isSoftwareGl;
      lidPivot.add(lidMesh);
      spotGroup.add(lidPivot);
      doorLid = lidPivot;
    } else {
      const clamRim = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.18, 14, 28),
        new THREE.MeshStandardMaterial({
          color: 0xffa5ab,
          roughness: 0.35,
          metalness: 0.1,
        })
      );
      const clamDeep = new THREE.Mesh(
        new THREE.CircleGeometry(0.72, 24),
        new THREE.MeshStandardMaterial({
          color: 0x0077b6,
          roughness: 0.7,
        })
      );
      clamDeep.position.z = -0.08;
      frameGroup.add(clamRim, clamDeep);

      const lidPivot = new THREE.Group();
      lidPivot.position.set(0, 0.76, 0.06);
      const lidMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.74, 0.74, 0.07, 24),
        new THREE.MeshStandardMaterial({
          color: 0xff70a6,
          roughness: 0.3,
          metalness: 0.15,
        })
      );
      lidMesh.rotation.x = Math.PI / 2;
      lidMesh.position.set(0, -0.76, 0);
      lidPivot.add(lidMesh);
      spotGroup.add(lidPivot);
      doorLid = lidPivot;
    }

    // 2. Character Model
    const characterGroup = this.buildCharacter();
    characterGroup.position.set(0, 0.0, -0.05);
    characterGroup.scale.set(0.001, 0.001, 0.001);
    spotGroup.add(characterGroup);

    // 3. Highlight Guidance Ring
    const highlightRing = new THREE.Mesh(
      new THREE.RingGeometry(0.98, 1.15, 32),
      new THREE.MeshBasicMaterial({
        color: 0xffe600,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      })
    );
    highlightRing.position.z = 0.04;
    spotGroup.add(highlightRing);

    // 4. Solid Opaque Plaque
    const { group: numberGroup, canvas: numberCanvas, texture: numberTexture } =
      this.createPlaqueBadge(item.display);
    numberGroup.position.set(0, -0.86, 0.32);
    spotGroup.add(numberGroup);

    spotGroup.userData = { spotIndex: index };

    return {
      index,
      currentDisplay: item.display,
      currentSpoken: item.spoken,
      group: spotGroup,
      doorLeft,
      doorRight,
      doorLid,
      characterGroup,
      numberGroup,
      numberCanvas,
      numberTexture,
      highlightRing,
      isOpen: false,
      openProgress: 0,
      targetOpenProgress: 0,
      isSmashing: false,
      smashProgress: 0,
      bobTime: Math.random() * 10,
      position: pos,
    };
  }

  private buildCharacter(): THREE.Group {
    const charGroup = new THREE.Group();

    if (this.theme === 'house') {
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 20, 20),
        new THREE.MeshStandardMaterial({ color: 0xffd1b3, roughness: 0.6 })
      );

      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.44, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0x3a86ff, roughness: 0.4 })
      );
      cap.position.y = 0.12;

      const visor = new THREE.Mesh(
        new THREE.CylinderGeometry(0.46, 0.48, 0.05, 16, 1, false, 0, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0x2255cc })
      );
      visor.position.set(0, 0.12, 0.3);
      visor.rotation.x = 0.2;

      const eyeGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1d2d44 });
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.15, 0.05, 0.38);
      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.15, 0.05, 0.38);

      const cheekGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const cheekMat = new THREE.MeshBasicMaterial({ color: 0xff8fa3 });
      const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
      leftCheek.position.set(-0.24, -0.05, 0.35);
      const rightCheek = new THREE.Mesh(cheekGeo, cheekMat);
      rightCheek.position.set(0.24, -0.05, 0.35);

      const smile = new THREE.Mesh(
        new THREE.TorusGeometry(0.11, 0.024, 8, 12, Math.PI),
        new THREE.MeshBasicMaterial({ color: 0xb5179e })
      );
      smile.rotation.x = Math.PI;
      smile.position.set(0, -0.09, 0.4);

      const shirt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.42, 0.48, 16),
        new THREE.MeshStandardMaterial({ color: 0xff006e, roughness: 0.5 })
      );
      shirt.position.y = -0.48;

      const hand = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xffd1b3 })
      );
      hand.position.set(0.46, 0.0, 0.1);
      hand.name = 'wavingHand';

      charGroup.add(
        head,
        cap,
        visor,
        leftEye,
        rightEye,
        leftCheek,
        rightCheek,
        smile,
        shirt,
        hand
      );
    } else if (this.theme === 'burrow') {
      const bunnyHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 20, 20),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 })
      );

      const earGeo = new THREE.CylinderGeometry(0.09, 0.13, 0.65, 12);
      const earMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.7 });
      const innerEarMat = new THREE.MeshBasicMaterial({ color: 0xffb5a7 });

      const leftEar = new THREE.Group();
      const leftEarMesh = new THREE.Mesh(earGeo, earMat);
      const leftInner = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.08, 0.55, 8),
        innerEarMat
      );
      leftInner.position.z = 0.04;
      leftEar.add(leftEarMesh, leftInner);
      leftEar.position.set(-0.2, 0.54, 0);
      leftEar.rotation.z = -0.15;
      leftEar.name = 'leftEar';

      const rightEar = new THREE.Group();
      const rightEarMesh = new THREE.Mesh(earGeo, earMat);
      const rightInner = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.08, 0.55, 8),
        innerEarMat
      );
      rightInner.position.z = 0.04;
      rightEar.add(rightEarMesh, rightInner);
      rightEar.position.set(0.2, 0.54, 0);
      rightEar.rotation.z = 0.15;
      rightEar.name = 'rightEar';

      const eyeGeo = new THREE.SphereGeometry(0.065, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.15, 0.05, 0.38);
      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.15, 0.05, 0.38);

      const nose = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xff758f })
      );
      nose.position.set(0, -0.04, 0.42);

      const carrot = new THREE.Group();
      const cBody = new THREE.Mesh(
        new THREE.ConeGeometry(0.09, 0.42, 10),
        new THREE.MeshStandardMaterial({ color: 0xf77f00, roughness: 0.4 })
      );
      cBody.rotation.z = Math.PI;
      const cTop = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0x52b788 })
      );
      cTop.position.y = 0.24;
      carrot.add(cBody, cTop);
      carrot.position.set(0.26, -0.22, 0.32);
      carrot.rotation.z = -0.3;

      charGroup.add(bunnyHead, leftEar, rightEar, leftEye, rightEye, nose, carrot);
    } else if (this.theme === 'tree') {
      const fruitBody = new THREE.Mesh(
        new THREE.SphereGeometry(0.44, 20, 20),
        new THREE.MeshStandardMaterial({
          color: 0xef233c,
          roughness: 0.3,
          metalness: 0.05,
        })
      );
      fruitBody.scale.set(1.05, 0.95, 1.05);

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.22),
        new THREE.MeshStandardMaterial({ color: 0x582f0e })
      );
      stem.position.y = 0.48;
      stem.rotation.z = 0.15;

      const leaf = new THREE.Mesh(
        new THREE.ConeGeometry(0.11, 0.28, 8),
        new THREE.MeshStandardMaterial({ color: 0x38b000 })
      );
      leaf.position.set(0.11, 0.46, 0);
      leaf.rotation.z = -Math.PI / 3;

      const eyeGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.15, 0.05, 0.42);
      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.15, 0.05, 0.42);

      const smile = new THREE.Mesh(
        new THREE.TorusGeometry(0.13, 0.024, 8, 12, Math.PI),
        new THREE.MeshBasicMaterial({ color: 0x800f2f })
      );
      smile.rotation.x = Math.PI;
      smile.position.set(0, -0.09, 0.43);

      charGroup.add(fruitBody, stem, leaf, leftEye, rightEye, smile);
    } else {
      const shell = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({
          color: 0x2ec4b6,
          roughness: 0.4,
          metalness: 0.1,
        })
      );
      shell.rotation.x = 0.3;

      const tHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 14, 14),
        new THREE.MeshStandardMaterial({ color: 0xcbf3f0, roughness: 0.5 })
      );
      tHead.position.set(0, 0.32, 0.2);

      const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x012a4a });
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.11, 0.35, 0.37);
      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.11, 0.35, 0.37);

      const flipperGeo = new THREE.BoxGeometry(0.32, 0.09, 0.05);
      const flipperMat = new THREE.MeshStandardMaterial({ color: 0x2ec4b6 });
      const leftFlip = new THREE.Mesh(flipperGeo, flipperMat);
      leftFlip.position.set(-0.42, 0.1, 0.15);
      leftFlip.rotation.z = 0.4;
      const rightFlip = new THREE.Mesh(flipperGeo, flipperMat);
      rightFlip.position.set(0.42, 0.1, 0.15);
      rightFlip.rotation.z = -0.4;

      charGroup.add(shell, tHead, leftEye, rightEye, leftFlip, rightFlip);
    }

    return charGroup;
  }

  private createPlaqueBadge(text: string): {
    group: THREE.Group;
    canvas: HTMLCanvasElement;
    texture: THREE.CanvasTexture;
  } {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 160;
    this.drawContentOnCanvas(canvas, text);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    const group = new THREE.Group();

    const backGeo = new THREE.PlaneGeometry(1.25, 0.62);
    const backMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      depthTest: true,
      depthWrite: true,
    });
    const backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.position.z = -0.01;
    group.add(backMesh);

    const frontGeo = new THREE.PlaneGeometry(1.25, 0.62);
    const frontMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthTest: true,
      depthWrite: true,
    });
    const frontMesh = new THREE.Mesh(frontGeo, frontMat);
    frontMesh.renderOrder = 30;
    group.add(frontMesh);

    return { group, canvas, texture };
  }

  private drawContentOnCanvas(canvas: HTMLCanvasElement, text: string) {
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const x = 8;
    const y = 8;
    const w = canvas.width - 16;
    const h = canvas.height - 16;
    const r = h / 2;

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#ffeb3b');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();

    ctx.lineWidth = 10;
    ctx.strokeStyle = '#2b2d42';
    ctx.stroke();

    const textStr = String(text);
    let fontSize = textStr.length <= 1 ? 84 : textStr.length === 2 ? 68 : 50;
    ctx.font = `900 ${fontSize}px "Fredoka", "Noto Sans Arabic", "Segoe UI", Arial, sans-serif`;

    while (ctx.measureText(textStr).width > canvas.width - 50 && fontSize > 24) {
      fontSize -= 4;
      ctx.font = `900 ${fontSize}px "Fredoka", "Noto Sans Arabic", "Segoe UI", Arial, sans-serif`;
    }

    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(textStr, canvas.width / 2, canvas.height / 2 + 3);

    ctx.font = '24px sans-serif';
    ctx.fillText('⭐', canvas.width - 38, 38);
  }

  public updateSpotContent(spotIndex: number, display: string, spoken: string) {
    const spot = this.spots[spotIndex];
    if (!spot) return;
    spot.currentDisplay = display;
    spot.currentSpoken = spoken;
    this.drawContentOnCanvas(spot.numberCanvas, display);
    spot.numberTexture.needsUpdate = true;
  }

  public openSpot(index: number, content?: SpotContentItem): string {
    if (this.activeCloseTimer) {
      clearTimeout(this.activeCloseTimer);
      this.activeCloseTimer = null;
    }

    this.spots.forEach((spot, i) => {
      if (i !== index) {
        spot.targetOpenProgress = 0;
        spot.isOpen = false;
        spot.isSmashing = false;
        spot.highlightRing.material.opacity = 0;
      }
    });

    this.activeSpotIndex = index;
    const spot = this.spots[index];
    if (!spot) return '1';

    if (content) {
      this.updateSpotContent(index, content.display, content.spoken);
    }

    spot.isOpen = true;
    spot.targetOpenProgress = 1;
    spot.isSmashing = false;
    spot.smashProgress = 0;

    return spot.currentDisplay;
  }

  public triggerSmash(index: number) {
    const spot = this.spots[index];
    if (!spot) return;

    spot.isSmashing = true;
    spot.smashProgress = 0;

    const rect = this.container.getBoundingClientRect();
    const screenX = (spot.position.x / 5 + 0.5) * rect.width + rect.left;
    const screenY = (-spot.position.y / 5 + 0.5) * rect.height + rect.top;

    confetti({
      particleCount: 45,
      spread: 70,
      origin: {
        x: Math.max(0.1, Math.min(0.9, screenX / window.innerWidth)),
        y: Math.max(0.1, Math.min(0.9, screenY / window.innerHeight)),
      },
      colors: ['#ff007f', '#ffd60a', '#06d6a0', '#3a86ff', '#ffbe0b'],
      disableForReducedMotion: false,
    });

    this.spawnSparkleParticles(spot.position);
    this.callbacks.onSpotSmash(spot.index, spot.currentDisplay, spot.currentSpoken);

    if (this.activeCloseTimer) {
      clearTimeout(this.activeCloseTimer);
    }
    this.activeCloseTimer = window.setTimeout(() => {
      if (!this.isDisposed && spot) {
        spot.targetOpenProgress = 0;
        spot.isOpen = false;
      }
      this.activeCloseTimer = null;
    }, 650);
  }

  private spawnSparkleParticles(pos: THREE.Vector3) {
    const starGeo = new THREE.DodecahedronGeometry(0.12, 0);
    const starColors = [0xffd166, 0xef476f, 0x06d6a0, 0x118ab2, 0xff9f1c];

    for (let i = 0; i < 14; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: starColors[i % starColors.length],
      });
      const star = new THREE.Mesh(starGeo, mat);
      star.position.copy(pos).add(new THREE.Vector3(0, 0.2, 0.4));
      this.particlesGroup.add(star);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4.5,
        Math.random() * 3.5 + 1.5,
        (Math.random() - 0.5) * 3
      );

      this.dynamicParticles.push({
        mesh: star,
        velocity: vel,
        rotSpeed: new THREE.Vector3(
          Math.random() * 10,
          Math.random() * 10,
          Math.random() * 10
        ),
        life: 0,
        maxLife: 0.65 + Math.random() * 0.35,
      });
    }
  }

  public setTheme(newTheme: GameTheme) {
    this.theme = newTheme;
    this.rebuildScene();
  }

  public getActiveSpotIndex(): number {
    return this.activeSpotIndex;
  }

  private handlePointerDown = (event: MouseEvent | TouchEvent) => {
    let clientX = 0;
    let clientY = 0;
    if ('touches' in event) {
      if (event.touches.length === 0) return;
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const rect = this.container.getBoundingClientRect();
    _mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_mouse, this.camera);

    const interactables: THREE.Object3D[] = [];
    this.spots.forEach((spot) => {
      interactables.push(spot.group);
    });

    const intersects = _raycaster.intersectObjects(interactables, true);
    if (intersects.length > 0) {
      let obj: THREE.Object3D | null = intersects[0].object;
      let spotIndex = -1;
      while (obj && obj !== this.scene) {
        if (obj.userData && typeof obj.userData.spotIndex === 'number') {
          spotIndex = obj.userData.spotIndex;
          break;
        }
        obj = obj.parent;
      }

      if (spotIndex !== -1) {
        const spot = this.spots[spotIndex];
        if (spot) {
          if (spot.isOpen && !spot.isSmashing) {
            this.triggerSmash(spotIndex);
          } else {
            this.callbacks.onSpotTap(spotIndex, spot.currentDisplay, spot.currentSpoken);
            spot.group.scale.set(1.1, 1.1, 1.1);
            setTimeout(() => {
              if (spot && !this.isDisposed) spot.group.scale.set(1, 1, 1);
            }, 180);
          }
        }
      }
    }
  };

  public tapSpotDirectly(index: number) {
    const spot = this.spots[index];
    if (!spot) return;
    if (spot.isOpen && !spot.isSmashing) {
      this.triggerSmash(index);
    } else {
      this.callbacks.onSpotTap(index, spot.currentDisplay, spot.currentSpoken);
      spot.group.scale.set(1.1, 1.1, 1.1);
      setTimeout(() => {
        if (spot && !this.isDisposed) spot.group.scale.set(1, 1, 1);
      }, 180);
    }
  }

  private handleResize = () => {
    if (!this.container || this.isDisposed) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.adjustCameraFraming(w, h);
    this.renderer.setSize(w, h);
  };

  private bindEvents() {
    this.container.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('resize', this.handleResize);
  }

  private startLoop() {
    const tick = () => {
      if (this.isDisposed) return;

      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.05);

      this.update(dt);
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.animationFrameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.afterDraw(tick);
    } else {
      this.animationFrameId = requestAnimationFrame(tick);
    }
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.isDisposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.animationFrameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.animationFrameId = window.setTimeout(cb, 60);
      }
    };
    this.animationFrameId = window.setTimeout(poll, 5);
  }

  private update(dt: number) {
    this.spots.forEach((spot) => {
      spot.bobTime += dt * 3.5;
      spot.openProgress += (spot.targetOpenProgress - spot.openProgress) * Math.min(1, dt * 10);

      if (spot.doorLeft && spot.doorRight) {
        const openAngle = spot.openProgress * 1.8;
        spot.doorLeft.rotation.y = -openAngle;
        spot.doorRight.rotation.y = openAngle;
      }

      if (spot.doorLid) {
        const openAngle = spot.openProgress * 1.6;
        spot.doorLid.rotation.x = -openAngle;
      }

      if (spot.isSmashing) {
        spot.smashProgress += dt * 2.8;
        const scaleVal = 1.0 + Math.sin(spot.smashProgress * Math.PI) * 0.45;
        spot.characterGroup.scale.set(scaleVal, scaleVal * 1.15, scaleVal);
        spot.characterGroup.rotation.y += dt * 12;
        spot.characterGroup.position.z = 0.25 + Math.sin(spot.smashProgress * Math.PI) * 0.2;
      } else {
        const scale = THREE.MathUtils.lerp(0.001, 1.0, spot.openProgress);
        spot.characterGroup.scale.set(scale, scale, scale);
        spot.characterGroup.rotation.y = Math.sin(spot.bobTime * 0.6) * 0.15;
        spot.characterGroup.position.z = 0.02 + spot.openProgress * 0.24;

        const hand = spot.characterGroup.getObjectByName('wavingHand');
        if (hand && spot.isOpen) {
          hand.rotation.z = Math.sin(spot.bobTime * 4) * 0.5;
        }
        const leftEar = spot.characterGroup.getObjectByName('leftEar');
        const rightEar = spot.characterGroup.getObjectByName('rightEar');
        if (leftEar && rightEar && spot.isOpen) {
          leftEar.rotation.z = -0.15 + Math.sin(spot.bobTime * 3) * 0.1;
          rightEar.rotation.z = 0.15 + Math.cos(spot.bobTime * 3) * 0.1;
        }
      }

      if (spot.isOpen && !spot.isSmashing) {
        spot.highlightRing.material.opacity = 0.4 + Math.sin(spot.bobTime * 3) * 0.3;
        spot.highlightRing.rotation.z += dt * 0.8;
      } else {
        spot.highlightRing.material.opacity = 0;
      }
    });

    for (let i = this.dynamicParticles.length - 1; i >= 0; i--) {
      const p = this.dynamicParticles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particlesGroup.remove(p.mesh);
        this.dynamicParticles.splice(i, 1);
        continue;
      }

      p.mesh.position.addScaledVector(p.velocity, dt);
      p.velocity.y -= 9.8 * dt;
      p.mesh.rotation.x += p.rotSpeed.x * dt;
      p.mesh.rotation.y += p.rotSpeed.y * dt;

      const progress = p.life / p.maxLife;
      const scale = Math.max(0.001, 1 - progress);
      p.mesh.scale.set(scale, scale, scale);
    }
  }

  public dispose() {
    this.isDisposed = true;
    if (this.activeCloseTimer) {
      clearTimeout(this.activeCloseTimer);
      this.activeCloseTimer = null;
    }

    if (this.animationFrameId) {
      if (this.isSoftwareGl) {
        clearTimeout(this.animationFrameId);
      } else {
        cancelAnimationFrame(this.animationFrameId);
      }
    }

    this.container.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('resize', this.handleResize);

    this.spots.forEach((spot) => {
      spot.numberTexture.dispose();
    });

    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
