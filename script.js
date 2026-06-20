import * as THREE from "./vendor/three.module.js";
import { BRAIN_FOLD_POINTS, BRAIN_POINTS } from "./assets/generated/brain-points.js";
import { IMAGE_BLACKHOLE_KINDS, IMAGE_BLACKHOLE_POINTS } from "./assets/generated/image-prototype-points.js";

const body = document.body;
const toneToggle = document.querySelector("#toneToggle");
const toneLabel = document.querySelector("#toneLabel");
const soundToggle = document.querySelector("#soundToggle");
const soundLabel = document.querySelector("#soundLabel");
const languageSelect = document.querySelector("#languageSelect");
const paletteSelect = document.querySelector("#paletteSelect");
const metaDescription = document.querySelector('meta[name="description"]');
const workGrid = document.querySelector("#workGrid");
const latestNewsList = document.querySelector("#latestNewsList");
const platformLinks = document.querySelector("#platformLinks");
const institutionStrip = document.querySelector("#institutionStrip");
const researchTimeline = document.querySelector("#researchTimeline");
const projectWall = document.querySelector("#projectWall");
const bgCanvas = document.querySelector("#particleField");
const titleCanvas = document.querySelector("#titleField");
const titleWrap = document.querySelector("#kineticTitle");
const sheroStage = document.querySelector(".shero-stage");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let width = window.innerWidth;
let height = window.innerHeight;
let scrollDepth = 0;
let animationFrame = 0;

let bgScene;
let bgCamera;
let bgRenderer;
let bgGeometry;
let bgMaterial;
let bgSystem;
let blackHoleShadowMesh;
let bgPositions;
let bgTargets;
let bgVelocities;
let bgColors;
let bgKinds;
let marbleMaterial;
let particleTexture;
let activePrototypeIndex = 0;
let contextualPrototypeKey = "";
let lastPrototypeSwitch = 0;
let sceneStartedAt = 0;
let colorAnimationTime = 0;
let siteContent = null;
let profileContent = null;
let projectContent = [];

let titleScene;
let titleCamera;
let titleRenderer;
let titleMesh;
let titleGeometry;
let titleMaterial;
let titleParticles = [];
let titleWidth = 1;
let titleHeight = 1;

const pointer = new THREE.Vector2(20, 20);
const titlePointer = {
  active: false,
  x: 9999,
  y: 9999,
  energy: 0,
};
const dummy = new THREE.Object3D();
const colorObjects = [new THREE.Color(), new THREE.Color(), new THREE.Color(), new THREE.Color()];

const audioState = {
  context: null,
  master: null,
  ambient: null,
  shimmer: null,
  delay: null,
  filter: null,
  oscillators: [],
  noise: null,
  noiseSource: null,
  noteIndex: 0,
  nextNoteAt: 0,
  ambientActive: false,
  lastMoveAt: 0,
  userUnlocked: false,
};

const LANGUAGE_META = {
  en: { htmlLang: "en", name: "English" },
  "zh-Hans": { htmlLang: "zh-Hans", name: "简体" },
  "zh-Hant": { htmlLang: "zh-Hant", name: "繁體" },
  es: { htmlLang: "es", name: "Español" },
  fr: { htmlLang: "fr", name: "Français" },
};

const I18N = {
  en: {
    "meta.title": "Wai Ka Sun — Neural Interfaces, Embodied AI, Robotics",
    "meta.description":
      "Wai Ka Sun is an AI, BCI, robotics, and spatial intelligence builder working toward neural interfaces that turn human intent into physical action.",
    "language.label": "Lang",
    "language.aria": "Select language",
    "palette.label": "Palette",
    "palette.aria": "Select color palette",
    "palette.pink": "Black Pink",
    "palette.blue": "Black Blue",
    "palette.mono": "Black White",
    "palette.purple": "Black Purple",
    "nav.aria": "Primary navigation",
    "nav.work": "Work",
    "nav.build": "Research",
    "nav.research": "Research",
    "nav.vision": "Vision",
    "nav.cv": "CV",
    "nav.journey": "Journey",
    "nav.contact": "Contact",
    "tone.aria": "Switch color tone",
    "tone.dark": "Dark",
    "tone.light": "Light",
    "system.neural": "neural signal / eeg",
    "system.orbital": "spatial compute / world model",
    "system.intent": "intent model / llm agent",
    "system.embodied": "embodied control / humanoid",
    "prototype.prefix": "prototype",
    "prototype.brain": "brain",
    "prototype.hand": "robotic arm",
    "prototype.chip": "lithographic chip city",
    "prototype.blackhole": "black hole lens",
    "hero.eyebrow": "BCI / AI / Robotics / Spatial Intelligence",
    "hero.audioHint": "sound is user-enabled",
    "hero.line": "I build neural interfaces that turn human intent into physical action.",
    "hero.text":
      "Incoming Columbia MSAI Robotics Track student and Tsinghua-trained cross-disciplinary builder working across BCI, AI systems, robot learning, humanoid control, and spatial intelligence. Trained through architecture and computational design, I think in bodies, machines, and environments; the question behind my work is how systems can understand human intent and turn it into real, usable, elegant action without phone screens as the default interface.",
    "hero.tagline": "把人的意图变成机器与环境的行动。",
    "domains.aria": "Core domains",
    "domains.bci": "BCI",
    "domains.embodied": "AI",
    "domains.robotics": "Robotics",
    "domains.space": "Spatial Intelligence",
    "actions.aria": "Featured links",
    "actions.work": "Robotics / AI opportunities",
    "actions.contact": "Start a conversation",
    "actions.research": "Research collaboration",
    "actions.build": "Build with me",
    "mobile.aria": "Mobile profile summary",
    "mobile.bci": "BCI + LLM",
    "mobile.humanoid": "Humanoid control",
    "mobile.xr": "XR systems",
    "mobile.sailing": "Sailing discipline",
    "signals.aria": "Profile signals",
    "signals.base.label": "Base",
    "signals.base.value": "Hong Kong / Beijing / New York",
    "signals.focus.label": "Current Focus",
    "signals.focus.value": "BCI, AI, robotics, spatial intelligence",
    "signals.known.label": "Known For",
    "signals.known.value": "MindBridge, Unitree G1 control, architectural AI systems",
    "intro.aria": "Introduction",
    "intro.kicker": "Profile",
    "intro.title": "Developer by method, artist by instinct, sailor by discipline.",
    "intro.text":
      "I am a Tsinghua architecture student and cross-disciplinary builder working on human-centered AI, brain-computer interfaces, robotic learning, and computational design. The constant question behind my work is simple: how can a system understand intent and turn it into something real, usable, and elegant?",
    "work.kicker": "Selected Work",
    "work.title": "Systems that translate intent into action.",
    "work.mindbridge.text":
      "A generative AI and non-invasive BCI system for decoding intent from EEG signals and translating neural classifications into environmental or robotic commands.",
    "work.mindbridge.tags": "FBCSP pipeline / motor imagery / LLM command generation",
    "work.unitree.text":
      "Sim-to-real whole-body motion tracking for a 29-DoF humanoid, with CfC-based neural circuit policies for stronger interpretability and noise robustness.",
    "work.unitree.tags": "Isaac Sim / PPO / AMASS / articulated torso",
    "work.arch.text":
      "A multimodal retrieval and analysis framework for architectural drawings, bridging professional spatial logic with AIGC-assisted conceptual workflows.",
    "work.arch.tags": "multimodal semantics / CAD-BIM logic / design retrieval",
    "work.xr.text":
      "Experimental systems connecting gesture recognition, immersive environments, brainwave interaction, digital twins, and generative design.",
    "work.xr.tags": "CCTV-featured work / national innovation selection",
    "build.kicker": "Research System",
    "build.title": "Four lenses, one operating system.",
    "build.ai.text": "RAG, agents, multimodal reasoning, product logic, and model-powered interfaces.",
    "build.bci.text": "EEG signal processing, FBCSP, motor imagery, SSVEP, and intent modeling.",
    "build.robotics.text": "Sim-to-real transfer, reinforcement learning, humanoid motion, ROS, and Isaac Sim.",
    "build.art.text": "Architecture, XR, computational design, digital twins, and spatial reasoning systems.",
    "journey.kicker": "Journey",
    "journey.title": "A path through systems, bodies, and weather.",
    "journey.text": "The work keeps changing shape. The center stays the same: perception, intention, motion, and care.",
    "journey.xr.title": "XR environments and digital twin interaction",
    "journey.xr.text": "Built immersive systems around gesture recognition, pose datasets, and early AIGC workflows.",
    "journey.bci.title": "BCI-driven generative design",
    "journey.bci.text": "Connected brainwave interaction, somatosensory games, and generative design through Pipedream.",
    "journey.llm.title": "LLM agents and robotic control",
    "journey.llm.text": "Worked on long-term dialogue systems, RAG context, robot-arm control, and sim-to-real learning.",
    "journey.now.title": "Human intent and embodied intelligence",
    "journey.now.text": "Focusing on BCI + LLM interaction, humanoid control, and AI systems that understand spatial logic.",
    "field.kicker": "Beyond The Lab",
    "field.title": "Sailing is also a way of reading systems.",
    "field.text":
      "I sail, travel, observe, and make things. Open water has trained my sense of timing, uncertainty, endurance, and trust in instruments. Those instincts come back into the way I build with machines.",
    "field.note1": "Champion, Beijing University Sailing Regatta",
    "field.note2": "Founder, Tsinghua University Sailing Association",
    "field.note3": "38 countries explored",
    "field.note4": "Poet, dancer, diver, pilot in training",
    "contact.kicker": "Contact",
    "contact.title": "Let us build something thoughtful.",
    "contact.email": "Email",
    "contact.cv": "Latest CV · updated 2026-06",
    "contact.tailored": "Need a tailored CV? Email me.",
    "sound.aria": "Enable ambient sound",
    "sound.enable": "Enable sound",
    "sound.on": "Sound on",
    "vision.kicker": "Vision",
    "vision.title": "From neural signal to environmental control.",
    "vision.text": "The phone made computation portable. The next interface should make computation ambient. I am working toward systems that infer intent from brain and body signals, reason through AI agents, and execute through robots, appliances, and spatial environments.",
  },
  "zh-Hans": {
    "meta.title": "Wai Ka Sun — Neural Interfaces, Embodied AI, Robotics",
    "meta.description": "孙暐珈是一名横跨 AI、脑机接口、机器人、计算设计、艺术与航行的开发者和研究者。",
    "language.label": "语言",
    "language.aria": "选择语言",
    "palette.label": "配色",
    "palette.aria": "选择配色方案",
    "palette.pink": "黑粉",
    "palette.blue": "蓝黑",
    "palette.mono": "黑白",
    "palette.purple": "黑紫",
    "nav.aria": "主导航",
    "nav.work": "作品",
    "nav.build": "研究",
    "nav.research": "研究",
    "nav.vision": "愿景",
    "nav.cv": "CV",
    "nav.journey": "路径",
    "nav.contact": "联系",
    "tone.aria": "切换色调",
    "tone.dark": "暗色",
    "tone.light": "亮色",
    "system.neural": "神经连接 / eeg",
    "system.orbital": "轨道工作室 / 空间站",
    "system.intent": "意图到运动 / 柔性锁定",
    "system.embodied": "具身智能 / 唤醒中",
    "prototype.prefix": "原型",
    "prototype.brain": "3D 大脑",
    "prototype.hand": "机械臂",
    "prototype.chip": "光刻芯片城",
    "prototype.blackhole": "黑洞吸积盘",
    "hero.eyebrow": "脑机接口 / AI / 机器人 / 空间智能",
    "hero.audioHint": "悬停标题 / 轻柔旋律",
    "hero.line": "我构建把人的意图变成物理行动的神经接口。",
    "hero.text":
      "我即将进入 Columbia MSAI Robotics Track，也是在清华训练出的跨学科建造者，工作横跨脑机接口、AI 系统、机器人学习、人形机器人控制与空间智能。建筑与计算设计训练让我习惯从身体、机器和环境一起思考；贯穿我工作的核心问题是：系统如何理解人的意图，并把它变成真实、可用、优雅的行动，而不是永远依赖手机屏幕。",
    "hero.tagline": "把人的意图变成机器与环境的行动。",
    "domains.aria": "核心领域",
    "domains.bci": "脑机接口",
    "domains.embodied": "AI",
    "domains.robotics": "机器人",
    "domains.space": "空间智能",
    "actions.aria": "精选链接",
    "actions.work": "机器人 / AI 机会",
    "actions.contact": "开始交流",
    "actions.research": "研究合作",
    "actions.build": "一起构建",
    "mobile.aria": "移动端简介",
    "mobile.bci": "BCI + LLM",
    "mobile.humanoid": "人形机器人控制",
    "mobile.xr": "XR 系统",
    "mobile.sailing": "航行训练",
    "signals.aria": "个人信号",
    "signals.base.label": "基地",
    "signals.base.value": "香港 / 北京 / 纽约",
    "signals.focus.label": "当前关注",
    "signals.focus.value": "脑机接口、AI、机器人、空间智能",
    "signals.known.label": "关键词",
    "signals.known.value": "MindBridge、Unitree G1 控制、建筑 AI 系统",
    "intro.aria": "介绍",
    "intro.kicker": "简介",
    "intro.title": "以开发者的方法工作，以艺术家的直觉感知，以水手的纪律前进。",
    "intro.text":
      "我是清华建筑学生，也是一名跨学科创作者，工作围绕以人为中心的 AI、脑机接口、机器人学习与计算设计。贯穿其中的问题很简单：系统如何理解人的意图，并把它变成真实、可用、优雅的行动？",
    "work.kicker": "精选作品",
    "work.title": "把信号翻译成形态的系统。",
    "work.mindbridge.text": "一个结合生成式 AI 与非侵入式 BCI 的系统，用于从 EEG 信号中解码意图，并把神经分类结果转化为环境或机器人指令。",
    "work.mindbridge.tags": "FBCSP 流程 / 运动想象 / LLM 指令生成",
    "work.unitree.text": "面向 29 自由度人形机器人的仿真到现实全身动作跟踪，并使用 CfC 神经电路策略提升可解释性与抗噪能力。",
    "work.unitree.tags": "Isaac Sim / PPO / AMASS / 躯干关节",
    "work.arch.text": "面向建筑图纸的多模态检索与分析框架，把专业空间逻辑与 AIGC 辅助概念工作流连接起来。",
    "work.arch.tags": "多模态语义 / CAD-BIM 逻辑 / 设计检索",
    "work.xr.text": "连接手势识别、沉浸式环境、脑波交互、数字孪生与生成式设计的实验系统。",
    "work.xr.tags": "CCTV 报道作品 / 国家级创新项目遴选",
    "build.kicker": "研究系统",
    "build.title": "四个视角，一个操作系统。",
    "build.ai.text": "RAG、Agent、多模态推理、产品逻辑与模型驱动界面。",
    "build.bci.text": "EEG 信号处理、FBCSP、运动想象、SSVEP 与意图建模。",
    "build.robotics.text": "仿真到现实迁移、强化学习、人形动作、ROS 与 Isaac Sim。",
    "build.art.text": "建筑、XR、计算设计、数字孪生与空间推理系统。",
    "journey.kicker": "路径",
    "journey.title": "穿过系统、身体与天气的路径。",
    "journey.text": "作品一直在变形，但中心始终相同：感知、意图、运动与关照。",
    "journey.xr.title": "XR 环境与数字孪生交互",
    "journey.xr.text": "围绕手势识别、姿态数据集与早期 AIGC 工作流构建沉浸式系统。",
    "journey.bci.title": "BCI 驱动的生成式设计",
    "journey.bci.text": "通过 Pipedream 连接脑波交互、体感游戏与生成式设计。",
    "journey.llm.title": "LLM Agent 与机器人控制",
    "journey.llm.text": "参与长期对话系统、RAG 上下文、机械臂控制与仿真到现实学习。",
    "journey.now.title": "人的意图与具身智能",
    "journey.now.text": "聚焦 BCI + LLM 交互、人形机器人控制，以及理解空间逻辑的 AI 系统。",
    "field.kicker": "实验室之外",
    "field.title": "航行也是一种阅读系统的方式。",
    "field.text": "我航行、旅行、观察，也不断制作。开阔水面训练了我对时机、不确定性、耐力与仪器信任的感知，而这些直觉会回到我和机器共同构建系统的方式里。",
    "field.note1": "北京大学生帆船赛冠军",
    "field.note2": "清华大学帆船协会创始人",
    "field.note3": "探索过 38 个国家",
    "field.note4": "诗人、舞者、潜水者、飞行训练中",
    "contact.kicker": "联系",
    "contact.title": "让我们一起构建一些有思考的东西。",
    "contact.email": "邮件",
    "contact.cv": "Latest CV · 2026-06 更新",
  },
  "zh-Hant": {
    "meta.title": "Wai Ka Sun — Neural Interfaces, Embodied AI, Robotics",
    "meta.description": "孫暐珈是一名橫跨 AI、腦機介面、機器人、計算設計、藝術與航行的開發者和研究者。",
    "language.label": "語言",
    "language.aria": "選擇語言",
    "palette.label": "配色",
    "palette.aria": "選擇配色方案",
    "palette.pink": "黑粉",
    "palette.blue": "藍黑",
    "palette.mono": "黑白",
    "palette.purple": "黑紫",
    "nav.aria": "主導覽",
    "nav.work": "作品",
    "nav.build": "研究",
    "nav.research": "研究",
    "nav.vision": "願景",
    "nav.cv": "CV",
    "nav.journey": "路徑",
    "nav.contact": "聯絡",
    "tone.aria": "切換色調",
    "tone.dark": "暗色",
    "tone.light": "亮色",
    "system.neural": "神經連接 / eeg",
    "system.orbital": "軌道工作室 / 空間站",
    "system.intent": "意圖到運動 / 柔性鎖定",
    "system.embodied": "具身智能 / 喚醒中",
    "prototype.prefix": "原型",
    "prototype.brain": "3D 大腦",
    "prototype.hand": "機械臂",
    "prototype.chip": "光刻晶片城",
    "prototype.blackhole": "黑洞吸積盤",
    "hero.eyebrow": "腦機介面 / AI / 機器人 / 空間智能",
    "hero.audioHint": "懸停標題 / 輕柔旋律",
    "hero.line": "我構建把人的意圖變成物理行動的神經介面。",
    "hero.text":
      "我即將進入 Columbia MSAI Robotics Track，也是在清華訓練出的跨學科建造者，工作橫跨腦機介面、AI 系統、機器人學習、人形機器人控制與空間智能。建築與計算設計訓練讓我習慣從身體、機器和環境一起思考；貫穿我工作的核心問題是：系統如何理解人的意圖，並把它變成真實、可用、優雅的行動，而不是永遠依賴手機螢幕。",
    "hero.tagline": "把人的意圖變成機器與環境的行動。",
    "domains.aria": "核心領域",
    "domains.bci": "腦機介面",
    "domains.embodied": "AI",
    "domains.robotics": "機器人",
    "domains.space": "空間智能",
    "actions.aria": "精選連結",
    "actions.work": "機器人 / AI 機會",
    "actions.contact": "開始交流",
    "actions.research": "研究合作",
    "actions.build": "一起構建",
    "mobile.aria": "行動端簡介",
    "mobile.bci": "BCI + LLM",
    "mobile.humanoid": "人形機器人控制",
    "mobile.xr": "XR 系統",
    "mobile.sailing": "航行訓練",
    "signals.aria": "個人信號",
    "signals.base.label": "基地",
    "signals.base.value": "香港 / 北京 / 紐約",
    "signals.focus.label": "當前關注",
    "signals.focus.value": "腦機介面、AI、機器人、空間智能",
    "signals.known.label": "關鍵詞",
    "signals.known.value": "MindBridge、Unitree G1 控制、建築 AI 系統",
    "intro.aria": "介紹",
    "intro.kicker": "簡介",
    "intro.title": "以開發者的方法工作，以藝術家的直覺感知，以水手的紀律前進。",
    "intro.text":
      "我是清華建築學生，也是一名跨學科創作者，工作圍繞以人為中心的 AI、腦機介面、機器人學習與計算設計。貫穿其中的問題很簡單：系統如何理解人的意圖，並把它變成真實、可用、優雅的行動？",
    "work.kicker": "精選作品",
    "work.title": "把信號翻譯成形態的系統。",
    "work.mindbridge.text": "一個結合生成式 AI 與非侵入式 BCI 的系統，用於從 EEG 信號中解碼意圖，並把神經分類結果轉化為環境或機器人指令。",
    "work.mindbridge.tags": "FBCSP 流程 / 運動想像 / LLM 指令生成",
    "work.unitree.text": "面向 29 自由度人形機器人的仿真到現實全身動作追蹤，並使用 CfC 神經電路策略提升可解釋性與抗噪能力。",
    "work.unitree.tags": "Isaac Sim / PPO / AMASS / 軀幹關節",
    "work.arch.text": "面向建築圖紙的多模態檢索與分析框架，把專業空間邏輯與 AIGC 輔助概念工作流連接起來。",
    "work.arch.tags": "多模態語義 / CAD-BIM 邏輯 / 設計檢索",
    "work.xr.text": "連接手勢識別、沉浸式環境、腦波互動、數位孿生與生成式設計的實驗系統。",
    "work.xr.tags": "CCTV 報導作品 / 國家級創新項目遴選",
    "build.kicker": "研究系統",
    "build.title": "四個視角，一個操作系統。",
    "build.ai.text": "RAG、Agent、多模態推理、產品邏輯與模型驅動介面。",
    "build.bci.text": "EEG 信號處理、FBCSP、運動想像、SSVEP 與意圖建模。",
    "build.robotics.text": "仿真到現實遷移、強化學習、人形動作、ROS 與 Isaac Sim。",
    "build.art.text": "建築、XR、計算設計、數位孿生與空間推理系統。",
    "journey.kicker": "路徑",
    "journey.title": "穿過系統、身體與天氣的路徑。",
    "journey.text": "作品一直在變形，但中心始終相同：感知、意圖、運動與關照。",
    "journey.xr.title": "XR 環境與數位孿生互動",
    "journey.xr.text": "圍繞手勢識別、姿態資料集與早期 AIGC 工作流構建沉浸式系統。",
    "journey.bci.title": "BCI 驅動的生成式設計",
    "journey.bci.text": "透過 Pipedream 連接腦波互動、體感遊戲與生成式設計。",
    "journey.llm.title": "LLM Agent 與機器人控制",
    "journey.llm.text": "參與長期對話系統、RAG 上下文、機械臂控制與仿真到現實學習。",
    "journey.now.title": "人的意圖與具身智能",
    "journey.now.text": "聚焦 BCI + LLM 互動、人形機器人控制，以及理解空間邏輯的 AI 系統。",
    "field.kicker": "實驗室之外",
    "field.title": "航行也是一種閱讀系統的方式。",
    "field.text": "我航行、旅行、觀察，也不斷製作。開闊水面訓練了我對時機、不確定性、耐力與儀器信任的感知，而這些直覺會回到我和機器共同構建系統的方式裡。",
    "field.note1": "北京大學生帆船賽冠軍",
    "field.note2": "清華大學帆船協會創始人",
    "field.note3": "探索過 38 個國家",
    "field.note4": "詩人、舞者、潛水者、飛行訓練中",
    "contact.kicker": "聯絡",
    "contact.title": "讓我們一起構建一些有思考的東西。",
    "contact.email": "郵件",
    "contact.cv": "Latest CV · 2026-06 更新",
  },
  es: {
    "meta.title": "Wai Ka Sun — Neural Interfaces, Embodied AI, Robotics",
    "meta.description":
      "Wai Ka Sun es desarrolladora e investigadora en IA, BCI, robótica, diseño computacional, arte y navegación.",
    "language.label": "Idioma",
    "language.aria": "Seleccionar idioma",
    "palette.label": "Paleta",
    "palette.aria": "Seleccionar paleta de color",
    "palette.pink": "Negro rosa",
    "palette.blue": "Negro azul",
    "palette.mono": "Negro blanco",
    "palette.purple": "Negro púrpura",
    "nav.aria": "Navegación principal",
    "nav.work": "Obra",
    "nav.build": "Investigación",
    "nav.journey": "Trayecto",
    "nav.contact": "Contacto",
    "tone.aria": "Cambiar tono de color",
    "tone.dark": "Oscuro",
    "tone.light": "Claro",
    "system.neural": "enlace neural / eeg",
    "system.orbital": "estudio orbital / estación",
    "system.intent": "intención a movimiento / bloqueo suave",
    "system.embodied": "ia encarnada / despierta",
    "prototype.prefix": "prototipo",
    "prototype.brain": "cerebro 3D",
    "prototype.hand": "brazo robótico",
    "prototype.chip": "ciudad chip litográfica",
    "prototype.blackhole": "lente de agujero negro",
    "hero.eyebrow": "bci / ia / robótica / inteligencia espacial",
    "hero.audioHint": "pasa el cursor / melodía suave",
    "hero.line": "Construyo interfaces neuronales que convierten la intención humana en acción física.",
    "hero.text":
      "Soy estudiante entrante del Columbia MSAI Robotics Track y constructora interdisciplinaria formada en Tsinghua, trabajando en BCI, sistemas de IA, aprendizaje robótico, control humanoide e inteligencia espacial. Formada en arquitectura y diseño computacional, pienso en cuerpos, máquinas y entornos; mi pregunta central es cómo un sistema puede entender la intención humana y convertirla en acción real, útil y elegante sin que el teléfono sea la interfaz por defecto.",
    "hero.tagline": "Convertir la intención humana en acción de máquinas y entornos.",
    "domains.aria": "Áreas centrales",
    "domains.bci": "BCI",
    "domains.embodied": "IA",
    "domains.robotics": "Robótica",
    "domains.space": "Inteligencia espacial",
    "actions.aria": "Enlaces destacados",
    "actions.work": "Oportunidades en robótica / IA",
    "actions.contact": "Iniciar conversación",
    "mobile.aria": "Resumen móvil del perfil",
    "mobile.bci": "BCI + LLM",
    "mobile.humanoid": "Control humanoide",
    "mobile.xr": "Sistemas XR",
    "mobile.sailing": "Disciplina náutica",
    "signals.aria": "Señales de perfil",
    "signals.base.label": "Base",
    "signals.base.value": "Hong Kong / Pekín",
    "signals.focus.label": "Foco actual",
    "signals.focus.value": "Señales cerebrales, IA encarnada, aprendizaje robótico, hábitats orbitales",
    "signals.known.label": "Reconocida por",
    "signals.known.value": "Sistemas BCI + LLM, control Unitree G1, conceptos de estación espacial",
    "intro.aria": "Introducción",
    "intro.kicker": "Perfil",
    "intro.title": "Desarrolladora por método, artista por instinto, navegante por disciplina.",
    "intro.text":
      "Soy estudiante de arquitectura en Tsinghua y constructora interdisciplinaria de IA centrada en humanos, interfaces cerebro-computadora, aprendizaje robótico y diseño computacional. La pregunta constante es simple: ¿cómo puede un sistema entender la intención y convertirla en algo real, útil y elegante?",
    "work.kicker": "Obra seleccionada",
    "work.title": "Sistemas que traducen señales en forma.",
    "work.mindbridge.text":
      "Un sistema de IA generativa y BCI no invasiva para decodificar intención desde señales EEG y traducir clasificaciones neuronales en comandos ambientales o robóticos.",
    "work.mindbridge.tags": "pipeline FBCSP / imaginación motora / generación de comandos LLM",
    "work.unitree.text":
      "Seguimiento de movimiento corporal completo sim-to-real para un humanoide de 29 DoF, con políticas de circuitos neuronales CfC para mayor interpretabilidad y robustez al ruido.",
    "work.unitree.tags": "Isaac Sim / PPO / AMASS / torso articulado",
    "work.arch.text":
      "Un marco multimodal de recuperación y análisis para dibujos arquitectónicos, conectando lógica espacial profesional con flujos conceptuales asistidos por AIGC.",
    "work.arch.tags": "semántica multimodal / lógica CAD-BIM / recuperación de diseño",
    "work.xr.text":
      "Sistemas experimentales que conectan reconocimiento gestual, entornos inmersivos, interacción con ondas cerebrales, gemelos digitales y diseño generativo.",
    "work.xr.tags": "obra destacada por CCTV / selección nacional de innovación",
    "build.kicker": "Sistema de investigación",
    "build.title": "Cuatro lentes, un sistema operativo.",
    "build.ai.text": "RAG, agentes, razonamiento multimodal, lógica de producto e interfaces impulsadas por modelos.",
    "build.bci.text": "Procesamiento EEG, FBCSP, imaginación motora, SSVEP y modelado de intención.",
    "build.robotics.text": "Transferencia sim-to-real, aprendizaje por refuerzo, movimiento humanoide, ROS e Isaac Sim.",
    "build.art.text": "Arquitectura, XR, diseño computacional, gemelos digitales y razonamiento espacial.",
    "journey.kicker": "Trayecto",
    "journey.title": "Un camino por sistemas, cuerpos y clima.",
    "journey.text": "El trabajo cambia de forma. El centro permanece: percepción, intención, movimiento y cuidado.",
    "journey.xr.title": "Entornos XR e interacción con gemelos digitales",
    "journey.xr.text": "Construí sistemas inmersivos alrededor de reconocimiento gestual, datasets de pose y primeros flujos AIGC.",
    "journey.bci.title": "Diseño generativo impulsado por BCI",
    "journey.bci.text": "Conecté interacción con ondas cerebrales, juegos somatosensoriales y diseño generativo mediante Pipedream.",
    "journey.llm.title": "Agentes LLM y control robótico",
    "journey.llm.text": "Trabajé en diálogo de largo plazo, contexto RAG, control de brazos robóticos y aprendizaje sim-to-real.",
    "journey.now.title": "Intención humana e inteligencia encarnada",
    "journey.now.text": "Enfoque en interacción BCI + LLM, control humanoide y sistemas de IA que entienden lógica espacial.",
    "field.kicker": "Más allá del laboratorio",
    "field.title": "Navegar también es una forma de leer sistemas.",
    "field.text":
      "Navego, viajo, observo y hago cosas. El agua abierta ha entrenado mi sentido del tiempo, la incertidumbre, la resistencia y la confianza en los instrumentos. Esos instintos vuelven a mi forma de construir con máquinas.",
    "field.note1": "Campeona, Regata Universitaria de Pekín",
    "field.note2": "Fundadora, Asociación de Vela de la Universidad Tsinghua",
    "field.note3": "38 países explorados",
    "field.note4": "Poeta, bailarina, buceadora, piloto en formación",
    "contact.kicker": "Contacto",
    "contact.title": "Construyamos algo reflexivo.",
    "contact.email": "Correo",
    "contact.cv": "Latest CV · actualizado 2026-06",
  },
  fr: {
    "meta.title": "Wai Ka Sun — Neural Interfaces, Embodied AI, Robotics",
    "meta.description":
      "Wai Ka Sun est développeuse et chercheuse à la croisée de l'IA, des BCI, de la robotique, du design computationnel, de l'art et de la voile.",
    "language.label": "Langue",
    "language.aria": "Choisir la langue",
    "palette.label": "Palette",
    "palette.aria": "Choisir une palette de couleur",
    "palette.pink": "Noir rose",
    "palette.blue": "Noir bleu",
    "palette.mono": "Noir blanc",
    "palette.purple": "Noir violet",
    "nav.aria": "Navigation principale",
    "nav.work": "Travaux",
    "nav.build": "Recherche",
    "nav.journey": "Parcours",
    "nav.contact": "Contact",
    "tone.aria": "Changer le ton de couleur",
    "tone.dark": "Sombre",
    "tone.light": "Clair",
    "system.neural": "lien neural / eeg",
    "system.orbital": "studio orbital / station",
    "system.intent": "intention vers mouvement / verrou doux",
    "system.embodied": "ia incarnée / éveillée",
    "prototype.prefix": "prototype",
    "prototype.brain": "cerveau 3D",
    "prototype.hand": "bras robotique",
    "prototype.chip": "cité-puce lithographique",
    "prototype.blackhole": "lentille de trou noir",
    "hero.eyebrow": "bci / ia / robotique / intelligence spatiale",
    "hero.audioHint": "survol du titre / mélodie douce",
    "hero.line": "Je construis des interfaces neuronales qui transforment l'intention humaine en action physique.",
    "hero.text":
      "Je vais rejoindre le Columbia MSAI Robotics Track et je suis une bâtisseuse interdisciplinaire formée à Tsinghua, travaillant sur les BCI, systèmes d'IA, apprentissage robotique, contrôle humanoïde et intelligence spatiale. Formée en architecture et design computationnel, je pense en corps, machines et environnements ; ma question centrale est de savoir comment un système peut comprendre l'intention humaine et la transformer en action réelle, utile et élégante sans faire du téléphone l'interface par défaut.",
    "hero.tagline": "Transformer l'intention humaine en action de machines et d'environnements.",
    "domains.aria": "Domaines centraux",
    "domains.bci": "BCI",
    "domains.embodied": "IA",
    "domains.robotics": "Robotique",
    "domains.space": "Intelligence spatiale",
    "actions.aria": "Liens mis en avant",
    "actions.work": "Opportunités robotique / IA",
    "actions.contact": "Ouvrir une conversation",
    "mobile.aria": "Résumé mobile du profil",
    "mobile.bci": "BCI + LLM",
    "mobile.humanoid": "Contrôle humanoïde",
    "mobile.xr": "Systèmes XR",
    "mobile.sailing": "Discipline de voile",
    "signals.aria": "Signaux du profil",
    "signals.base.label": "Base",
    "signals.base.value": "Hong Kong / Pékin",
    "signals.focus.label": "Focus actuel",
    "signals.focus.value": "Signaux cérébraux, IA incarnée, apprentissage robotique, habitats orbitaux",
    "signals.known.label": "Connue pour",
    "signals.known.value": "Systèmes BCI + LLM, contrôle Unitree G1, concepts de station spatiale",
    "intro.aria": "Introduction",
    "intro.kicker": "Profil",
    "intro.title": "Développeuse par méthode, artiste par instinct, navigatrice par discipline.",
    "intro.text":
      "Je suis étudiante en architecture à Tsinghua et bâtisseuse interdisciplinaire autour de l'IA centrée sur l'humain, des interfaces cerveau-ordinateur, de l'apprentissage robotique et du design computationnel. La question centrale est simple : comment un système peut-il comprendre une intention et la transformer en quelque chose de réel, utile et élégant ?",
    "work.kicker": "Travaux choisis",
    "work.title": "Des systèmes qui traduisent les signaux en forme.",
    "work.mindbridge.text":
      "Un système d'IA générative et de BCI non invasive pour décoder l'intention à partir de signaux EEG et traduire des classifications neurales en commandes environnementales ou robotiques.",
    "work.mindbridge.tags": "pipeline FBCSP / imagerie motrice / génération de commandes LLM",
    "work.unitree.text":
      "Suivi de mouvement corps entier sim-to-real pour un humanoïde à 29 DoF, avec des politiques de circuits neuronaux CfC pour plus d'interprétabilité et de robustesse au bruit.",
    "work.unitree.tags": "Isaac Sim / PPO / AMASS / torse articulé",
    "work.arch.text":
      "Un cadre multimodal de recherche et d'analyse de dessins architecturaux, reliant logique spatiale professionnelle et workflows conceptuels assistés par AIGC.",
    "work.arch.tags": "sémantique multimodale / logique CAD-BIM / recherche de design",
    "work.xr.text":
      "Systèmes expérimentaux reliant reconnaissance gestuelle, environnements immersifs, interaction par ondes cérébrales, jumeaux numériques et design génératif.",
    "work.xr.tags": "travail présenté par CCTV / sélection nationale d'innovation",
    "build.kicker": "Système de recherche",
    "build.title": "Quatre lentilles, un système d'exploitation.",
    "build.ai.text": "RAG, agents, raisonnement multimodal, logique produit et interfaces propulsées par des modèles.",
    "build.bci.text": "Traitement EEG, FBCSP, imagerie motrice, SSVEP et modélisation de l'intention.",
    "build.robotics.text": "Transfert sim-to-real, apprentissage par renforcement, mouvement humanoïde, ROS et Isaac Sim.",
    "build.art.text": "Architecture, XR, design computationnel, jumeaux numériques et raisonnement spatial.",
    "journey.kicker": "Parcours",
    "journey.title": "Un chemin à travers systèmes, corps et météo.",
    "journey.text": "Le travail change de forme. Le centre reste le même : perception, intention, mouvement et soin.",
    "journey.xr.title": "Environnements XR et interaction avec jumeaux numériques",
    "journey.xr.text": "Création de systèmes immersifs autour de la reconnaissance gestuelle, des jeux de poses et des premiers workflows AIGC.",
    "journey.bci.title": "Design génératif piloté par BCI",
    "journey.bci.text": "Connexion entre interaction par ondes cérébrales, jeux somatosensoriels et design génératif via Pipedream.",
    "journey.llm.title": "Agents LLM et contrôle robotique",
    "journey.llm.text": "Travail sur dialogue long terme, contexte RAG, contrôle de bras robotique et apprentissage sim-to-real.",
    "journey.now.title": "Intention humaine et intelligence incarnée",
    "journey.now.text": "Focus sur l'interaction BCI + LLM, le contrôle humanoïde et les systèmes d'IA capables de comprendre la logique spatiale.",
    "field.kicker": "Au-delà du labo",
    "field.title": "La voile est aussi une façon de lire les systèmes.",
    "field.text":
      "Je navigue, je voyage, j'observe et je fabrique. Le large a entraîné mon sens du timing, de l'incertitude, de l'endurance et de la confiance dans les instruments. Ces instincts reviennent dans ma manière de construire avec les machines.",
    "field.note1": "Championne, régate universitaire de Pékin",
    "field.note2": "Fondatrice, Association de voile de l'Université Tsinghua",
    "field.note3": "38 pays explorés",
    "field.note4": "Poète, danseuse, plongeuse, pilote en formation",
    "contact.kicker": "Contact",
    "contact.title": "Construisons quelque chose de réfléchi.",
    "contact.email": "E-mail",
    "contact.cv": "Latest CV · mis à jour 2026-06",
  },
};

let activeLanguage = "en";
let activePalette = "pink";

const PALETTE_THEMES = {
  pink: {
    clear: 0x030204,
    marbleA: "#030204",
    marbleB: "#2a0719",
    marbleC: "#58213f",
    particles: ["#ffffff", "#ffe6f4", "#ff9bd2", "#ffd0ec"],
    title: ["#fff7fb", "#ff5fb7", "#ffd3e8", "#ff9ed0"],
  },
  blue: {
    clear: 0x020407,
    marbleA: "#020407",
    marbleB: "#07101a",
    marbleC: "#26394b",
    particles: ["#ffffff", "#eef7fb", "#b9cbd6", "#819fb2"],
    title: ["#f8fcff", "#b9cbd6", "#819fb2", "#eef7fb"],
  },
  mono: {
    clear: 0x020203,
    marbleA: "#020203",
    marbleB: "#161616",
    marbleC: "#3a3a38",
    particles: ["#ffffff", "#f4f4f1", "#d9d9d4", "#bfbfba"],
    title: ["#ffffff", "#d8d8d3", "#9d9d99", "#f7f2e9"],
  },
  purple: {
    clear: 0x03020a,
    marbleA: "#03020a",
    marbleB: "#170a35",
    marbleC: "#3b1365",
    particles: ["#ffffff", "#f1e7ff", "#c9b8ff", "#ff8dff"],
    title: ["#f8f2ff", "#a78bfa", "#d946ef", "#7dd3fc"],
  },
};


function escapeHtml(value = "") {
  return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
}

function versionedAsset(file, version) {
  if (!file) return "#";
  if (!version) return file;
  return `${file}${file.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}`;
}

function applySiteData() {
  if (!siteContent) return;

  document.querySelectorAll("[data-cv-link]").forEach((link) => {
    link.href = versionedAsset(siteContent.cv?.file, siteContent.cv?.version);
    link.setAttribute("download", "");
    if (!link.classList.contains("nav-cv")) {
      link.textContent = siteContent.cv?.label || translate("contact.cv");
    }
  });
}

function usableUrl(url = "") {
  return Boolean(url && !String(url).startsWith("TODO_ADD_"));
}

function projectSlug(project) {
  return project.slug || project.id || "";
}

function projectYear(project) {
  return project.year || project.period || "Now";
}

function projectTags(project) {
  if (Array.isArray(project.tags) && project.tags.length) return project.tags;
  if (Array.isArray(project.stack) && project.stack.length) return project.stack.slice(0, 4);
  return (project.domain || "Project").split("/").map((tag) => tag.trim()).filter(Boolean);
}

function projectOneLine(project) {
  return project.oneLine || project.oneLiner || project.subtitle || "Public case study coming soon.";
}

function projectDetailHref(project) {
  return `./project.html?slug=${encodeURIComponent(projectSlug(project))}`;
}

function tileSizeClass(index, project = {}) {
  const slug = projectSlug(project);
  if (slug === "skyeye" || slug === "twinspace" || slug === "pipedream") return "size-priority";
  return ["size-wide", "size-tall", "size-medium", "size-medium", "size-small", "size-wide", "size-small", "size-medium", "size-tall"][index % 9];
}

function renderInstitutionStrip() {
  if (!institutionStrip || !Array.isArray(profileContent?.institutions)) return;

  institutionStrip.innerHTML = profileContent.institutions
    .map((item) => {
      const label = escapeHtml(item.label || "");
      const logo = item.logo
        ? `<span class="institution-logo"><img src="${escapeHtml(item.logo)}" alt="" loading="lazy"></span>`
        : `<strong>${escapeHtml(item.mark || "")}</strong>`;

      return `
        <span title="${label}">
          ${logo}
          <em>${label}</em>
        </span>`;
    })
    .join("");
}

function renderLatestNews() {
  if (!latestNewsList || !profileContent?.latestNews?.length) return;

  latestNewsList.innerHTML = profileContent.latestNews
    .map(
      (item) => `
        <li>
          <time>${escapeHtml(item.date || "Now")}</time>
          <span>${escapeHtml(item.text || "")}</span>
        </li>`,
    )
    .join("");
}

function linkIcon(label) {
  const key = String(label || "").toLowerCase();
  const common = `class="link-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"`;

  if (key === "email") {
    return `<svg ${common} fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6.5h16v11H4z"/><path d="m5 7.5 7 5.4 7-5.4"/></svg>`;
  }

  if (key === "linkedin") {
    return `<svg ${common} fill="currentColor"><path d="M5.2 8.9h3.1v9.9H5.2V8.9Zm1.6-4.7a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6Zm3.7 4.7h3v1.4h.1c.4-.8 1.5-1.6 3.1-1.6 3.3 0 3.9 2.1 3.9 4.9v5.2h-3.1v-4.6c0-1.1 0-2.5-1.6-2.5s-1.8 1.2-1.8 2.4v4.7h-3.1V8.9Z"/></svg>`;
  }

  if (key === "github") {
    return `<svg ${common} fill="currentColor"><path d="M12 3.2a8.8 8.8 0 0 0-2.8 17.1c.4.1.6-.2.6-.4v-1.5c-2.3.5-2.8-1-2.8-1-.4-.9-.9-1.2-.9-1.2-.8-.5.1-.5.1-.5.8.1 1.3.9 1.3.9.8 1.3 2 1 2.5.8.1-.6.3-1 .5-1.2-1.8-.2-3.7-.9-3.7-3.9 0-.9.3-1.6.9-2.2-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.3.8.7-.2 1.4-.3 2.1-.3s1.4.1 2.1.3c1.6-1.1 2.3-.8 2.3-.8.5 1.1.2 1.9.1 2.1.5.6.9 1.3.9 2.2 0 3-1.9 3.7-3.7 3.9.3.3.6.8.6 1.6v2.2c0 .2.2.5.6.4A8.8 8.8 0 0 0 12 3.2Z"/></svg>`;
  }

  if (key === "youtube") {
    return `<svg ${common} fill="currentColor"><path d="M21 8.1a3 3 0 0 0-2.1-2.1C17 5.5 12 5.5 12 5.5s-5 0-6.9.5A3 3 0 0 0 3 8.1 31 31 0 0 0 2.5 12 31 31 0 0 0 3 15.9a3 3 0 0 0 2.1 2.1c1.9.5 6.9.5 6.9.5s5 0 6.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-3.9 31 31 0 0 0-.5-3.9ZM10.2 15.1V8.9l5.4 3.1-5.4 3.1Z"/></svg>`;
  }

  return `<svg ${common} fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 12h10"/><path d="M13 8l4 4-4 4"/></svg>`;
}

function renderPlatformLinks() {
  if (!platformLinks) return;

  const links = profileContent?.links || {};
  const items = [
    ["Email", links.email || (profileContent?.email ? `mailto:${profileContent.email}` : "")],
    ["LinkedIn", links.linkedin],
    ["GitHub", links.github],
    ["Instagram", links.instagram],
    ["X", links.x],
    ["YouTube", links.youtube],
  ].filter(([, href]) => usableUrl(href));

  platformLinks.innerHTML = items
    .map(
      ([label, href]) =>
        `<a href="${escapeHtml(href)}" target="${href.startsWith("mailto:") ? "_self" : "_blank"}" rel="noopener">${linkIcon(label)}<span>${escapeHtml(label)}</span></a>`,
    )
    .join("");
}

function renderWorkCards() {
  if (!workGrid || !projectContent.length) return;

  workGrid.innerHTML = projectContent
    .map((project, index) => {
      const impact = project.impact?.[0] || project.oneLiner;
      const stack = (project.stack || []).slice(0, 5).map((item) => `<span>${escapeHtml(item)}</span>`).join("");
      return `
        <a class="work-card ${index === 0 ? "featured-work" : ""}" href="./project.html?id=${encodeURIComponent(project.id)}" data-prototype="${escapeHtml(project.prototype || "brain")}">
          <p class="work-meta">${escapeHtml(project.domain || "Project")}</p>
          <h3>${escapeHtml(project.title)}</h3>
          <p>${escapeHtml(project.oneLiner || project.subtitle || "Case study coming soon.")}</p>
          <p class="impact-proof">${escapeHtml(impact)}</p>
          <div class="stack-tags">${stack}</div>
          <span class="case-link">Read case study</span>
        </a>`;
    })
    .join("");
}

function renderProjectTimeline() {
  if (!researchTimeline || !projectContent.length) return;

  researchTimeline.innerHTML = projectContent
    .map((project, index) => {
      const slug = projectSlug(project);
      const tags = projectTags(project).slice(0, 3).join(" / ");
      return `
        <button class="timeline-item ${index === 0 ? "is-active" : ""}" type="button" data-slug="${escapeHtml(slug)}" data-prototype="${escapeHtml(project.prototype || "brain")}">
          <span class="timeline-year">${escapeHtml(projectYear(project))}</span>
          <strong>${escapeHtml(project.title)}</strong>
          <em>${escapeHtml(tags)}</em>
        </button>`;
    })
    .join("");
}

function renderProjectWall() {
  if (!projectWall || !projectContent.length) return;

  projectWall.innerHTML = projectContent
    .map((project, index) => {
      const slug = projectSlug(project);
      const tags = projectTags(project);
      const thumbnail = project.thumbnail || "";
      const visual = usableUrl(thumbnail)
        ? `<img src="${escapeHtml(thumbnail)}" alt="${escapeHtml(project.title)} project visual" loading="lazy" />`
        : `<span class="project-tile-visual" aria-hidden="true"></span>`;

      return `
        <a class="project-tile ${tileSizeClass(index, project)} ${index === 0 ? "is-active" : ""}" href="${projectDetailHref(project)}" data-slug="${escapeHtml(slug)}" data-prototype="${escapeHtml(project.prototype || "brain")}">
          ${visual}
          <span class="project-tile-overlay">
            <span>${escapeHtml(tags.join(" / "))}</span>
            <strong>${escapeHtml(project.title)}</strong>
            <em>${escapeHtml(projectOneLine(project))}</em>
          </span>
        </a>`;
    })
    .join("");
}

function setActiveProject(slug) {
  if (!slug) return;

  document.querySelectorAll("[data-slug]").forEach((element) => {
    element.classList.toggle("is-active", element.dataset.slug === slug);
  });

  const project = projectContent.find((item) => projectSlug(item) === slug);
  if (!isPrototypePinned() && project?.prototype) switchPrototypeByKey(project.prototype);
}

function renderProjects() {
  renderProjectTimeline();
  renderProjectWall();
  if (!projectWall && !researchTimeline) renderWorkCards();
}

async function initializeContent() {
  try {
    const [siteResponse, profileResponse, projectsResponse] = await Promise.all([
      fetch("./content/site.json"),
      fetch("./content/profile.json"),
      fetch("./content/projects.json"),
    ]);
    siteContent = await siteResponse.json();
    profileContent = await profileResponse.json();
    projectContent = await projectsResponse.json();
    applySiteData();
    renderLatestNews();
    renderPlatformLinks();
    renderInstitutionStrip();
    renderProjects();
    updateContextualPrototype();
  } catch (error) {
    console.warn("Content data could not be loaded", error);
  }
}

function updateSoundLabel() {
  if (!soundLabel) return;
  soundLabel.textContent = audioState.ambientActive ? translate("sound.on") : translate("sound.enable");
  soundToggle?.setAttribute("aria-label", translate("sound.aria"));
  soundToggle?.setAttribute("aria-pressed", audioState.ambientActive ? "true" : "false");
}

function normalizeLanguage(language) {
  if (!language) return "en";
  if (LANGUAGE_META[language]) return language;

  const lower = language.toLowerCase();
  if (lower.startsWith("zh-hant") || lower.includes("tw") || lower.includes("hk") || lower.includes("mo")) {
    return "zh-Hant";
  }
  if (lower.startsWith("zh")) return "zh-Hans";
  if (lower.startsWith("es")) return "es";
  if (lower.startsWith("fr")) return "fr";
  return "en";
}

function translate(key) {
  return I18N[activeLanguage]?.[key] || I18N.en[key] || key;
}

function updateToneLabel() {
  if (!toneLabel) return;

  toneLabel.textContent = translate(body.dataset.tone === "dark" ? "tone.dark" : "tone.light");
  toneToggle?.setAttribute("aria-label", translate("tone.aria"));
}

function setLanguage(nextLanguage) {
  activeLanguage = normalizeLanguage(nextLanguage);
  const meta = LANGUAGE_META[activeLanguage];

  document.documentElement.lang = meta.htmlLang;
  body.dataset.language = activeLanguage;
  document.title = translate("meta.title");
  if (metaDescription) {
    metaDescription.setAttribute("content", translate("meta.description"));
  }
  if (languageSelect) {
    languageSelect.value = activeLanguage;
  }

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translate(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", translate(element.dataset.i18nAria));
  });

  document.querySelector(".zh-line")?.setAttribute("lang", meta.htmlLang);
  localStorage.setItem("shero-language", activeLanguage);
  updateToneLabel();
  updateSoundLabel();
  applySiteData();
}

function normalizePalette(palette) {
  return PALETTE_THEMES[palette] ? palette : "blue";
}

function setPalette(nextPalette) {
  activePalette = normalizePalette(nextPalette);
  body.dataset.palette = activePalette;
  if (paletteSelect) {
    paletteSelect.value = activePalette;
  }

  const current = theme();
  bgRenderer?.setClearColor(current.clear, body.dataset.tone === "light" ? 0.1 : 0);
  if (marbleMaterial) {
    marbleMaterial.uniforms.uColorA.value.copy(current.marbleA);
    marbleMaterial.uniforms.uColorB.value.copy(current.marbleB);
    marbleMaterial.uniforms.uColorC.value.copy(current.marbleC);
  }
  updateBgColors();
  updateTitleColors();
  localStorage.setItem("shero-palette", activePalette);
}

function theme() {
  if (body.dataset.tone === "light") {
    return {
      clear: 0xf5f2ec,
      marbleA: new THREE.Color("#f5f2ec"),
      marbleB: new THREE.Color("#d9efe9"),
      marbleC: new THREE.Color("#f1d8c8"),
      particles: ["#10130f", "#0d8f7d", "#a57916", "#5daea2"],
      title: ["#10130f", "#0d8f7d", "#a57916", "#c94f3f"],
    };
  }

  const palette = PALETTE_THEMES[activePalette] || PALETTE_THEMES.pink;
  return {
    clear: palette.clear,
    marbleA: new THREE.Color(palette.marbleA),
    marbleB: new THREE.Color(palette.marbleB),
    marbleC: new THREE.Color(palette.marbleC),
    particles: palette.particles,
    title: palette.title,
  };
}

function setTone(nextTone) {
  body.dataset.tone = nextTone;
  updateToneLabel();
  localStorage.setItem("shero-tone", nextTone);

  const current = theme();
  bgRenderer?.setClearColor(current.clear, nextTone === "light" ? 0.1 : 0);
  if (marbleMaterial) {
    marbleMaterial.uniforms.uLightMode.value = nextTone === "light" ? 1 : 0;
    marbleMaterial.uniforms.uColorA.value.copy(current.marbleA);
    marbleMaterial.uniforms.uColorB.value.copy(current.marbleB);
    marbleMaterial.uniforms.uColorC.value.copy(current.marbleC);
  }
  applyPrototypeMaterial();
  updateBgColors();
  updateTitleColors();
}

function createParticleTexture() {
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 64;
  textureCanvas.height = 64;
  const textureContext = textureCanvas.getContext("2d");
  const gradient = textureContext.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.28, "rgba(255, 255, 255, 0.96)");
  gradient.addColorStop(0.58, "rgba(255, 255, 255, 0.4)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  textureContext.fillStyle = gradient;
  textureContext.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.needsUpdate = true;
  return texture;
}

function initBackground() {
  sceneStartedAt = performance.now();
  activePrototypeIndex = prototypeIndexFromUrl();
  bgScene = new THREE.Scene();
  bgCamera = new THREE.PerspectiveCamera(58, width / height, 0.1, 120);
  bgCamera.position.set(0, 0, 17);

  bgRenderer = new THREE.WebGLRenderer({
    canvas: bgCanvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
  bgRenderer.setSize(width, height);
  bgRenderer.setClearColor(theme().clear, body.dataset.tone === "light" ? 0.1 : 0);

  const ambient = new THREE.AmbientLight(0xffffff, body.dataset.tone === "light" ? 1.8 : 1.35);
  const key = new THREE.DirectionalLight(0xffffff, body.dataset.tone === "light" ? 1.8 : 1.45);
  key.position.set(-5, 6, 8);
  bgScene.add(ambient, key);

  createMarbleField();
  createBackgroundParticles();
}

function createMarbleField() {
  const current = theme();
  marbleMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uLightMode: { value: body.dataset.tone === "light" ? 1 : 0 },
      uColorA: { value: current.marbleA },
      uColorB: { value: current.marbleB },
      uColorC: { value: current.marbleC },
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uLightMode;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform vec3 uColorC;
      varying vec2 vUv;

      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float slow = uTime * 0.035;
        float fold = sin(p.x * 3.2 + p.y * 1.7 + sin(p.y * 6.0 + slow) * 0.9 + slow);
        float vein = smoothstep(0.78, 1.0, abs(fold));
        float mist = smoothstep(1.18, 0.18, length(p + vec2(0.14, -0.08)));
        vec3 color = mix(uColorA, uColorB, mist * 0.68);
        color = mix(color, uColorC, vein * 0.22);
        float alpha = mix(0.42, 0.24, uLightMode) * mist + vein * 0.12;
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });

  const marble = new THREE.Mesh(new THREE.PlaneGeometry(58, 34, 1, 1), marbleMaterial);
  marble.position.set(2.8, 0.6, -18);
  bgScene.add(marble);
}

const TAU = Math.PI * 2;
const PROTOTYPE_DURATION = 4500;
const PARTICLE_BRIGHTNESS = 2;
const HAND_DENSITY_MULTIPLIER = 6;
const HAND_TARGET_SCALE = 1.24;
const HAND_INTERACTION_LIMIT = 320000;
const MAX_HAND_DISPLACEMENT = 1.08;
const BLACKHOLE_DENSITY_MULTIPLIER = 2;
const BLACKHOLE_KIND = {
  OUTER_DUST: 0,
  DISK: 1,
  UNDERSIDE_ARC: 2,
  FAR_SIDE_HUMP: 3,
  PHOTON_RING: 4,
  INNER_DISK: 5,
  FLARE: 6,
};
const PROTOTYPES = [
  { key: "brain", rotation: [-0.03, -0.12, 0.0], motion: [0.035, 0.16, 0.018], speed: 0.00042 },
  { key: "hand", rotation: [-0.22, 0.28, -0.04], motion: [0.022, 0.07, 0.015], speed: 0.00043 },
  { key: "chip", rotation: [-0.64, 0.72, 0.12], motion: [0.03, 0.16, 0.018], speed: 0.00046 },
  { key: "blackhole", rotation: [-0.24, 0.46, 0.03], motion: [0.055, 0.17, 0.024], speed: 0.00038 },
];
const PINNED_PROTOTYPE_KEY = new URLSearchParams(window.location.search).get("prototype")?.trim().toLowerCase() || "";
if (PINNED_PROTOTYPE_KEY) {
  const cleanUrl = new URL(window.location.href);
  cleanUrl.searchParams.delete("prototype");
  window.history.replaceState({}, "", cleanUrl);
}

const SECTION_PROTOTYPE_HINTS = {
  ai: "brain",
  bci: "brain",
  neuroscience: "brain",
  computing: "brain",
  embodied: "hand",
  robotics: "hand",
  humanoid: "hand",
  spatial: "chip",
  architecture: "chip",
  xr: "chip",
  iot: "chip",
  exploration: "blackhole",
  sailing: "blackhole",
  space: "blackhole",
};

function prototypeIndexFromUrl() {
  const index = PROTOTYPES.findIndex((prototype) => prototype.key === PINNED_PROTOTYPE_KEY);
  return index >= 0 ? index : 0;
}

function isPrototypePinned() {
  return PROTOTYPES.some((prototype) => prototype.key === PINNED_PROTOTYPE_KEY);
}

function prototypeIndexByKey(key) {
  return PROTOTYPES.findIndex((prototype) => prototype.key === key);
}

function switchPrototypeByKey(key) {
  const index = prototypeIndexByKey(key);
  if (index < 0 || index === activePrototypeIndex) return;
  switchPrototype(index);
}

function prototypeKeyFromContent(textContent) {
  const text = (textContent || "").toLowerCase();

  if (/robot|robotics|humanoid|unitree|embodied|sim-to-real|isaac|ros|具身|机器人|機器人|人形|机械|機械|仿真到现实|仿真到現實/.test(text)) {
    return "hand";
  }

  if (/space station|orbital|orbit|universe|cosmic|sailing|exploration|explored|fieldwork|pilot|diver|太空|宇宙|轨道|軌道|空间站|空間站|航海|探索|飞行|飛行/.test(text)) {
    return "blackhole";
  }

  if (/architecture|architectural|spatial|xr|digital twin|twinspace|pipedream|computational|cad|bim|schematic|iot|internet of things|chip|space computing|spatial intelligence|空间计算|空間計算|空间智能|空間智能|物联网|物聯網|芯片|晶片|建筑|建築|数字孪生|數位孿生/.test(text)) {
    return "chip";
  }

  if (/bci|brain|eeg|neuro|neuroscience|mindbridge|llm|ai|rag|agent|motor imagery|ssvep|脑机|腦機|脑|腦|神经|神經|人工智能|大模型/.test(text)) {
    return "brain";
  }

  return "";
}

function prototypeKeyFromViewport() {
  const selectors = [
    ".intro-band",
    ".work-card",
    ".timeline-item",
    ".project-tile",
    ".capability-grid article",
    ".timeline article",
    ".field-band",
  ];
  const candidates = document.querySelectorAll(selectors.join(", "));
  const viewportHeight = window.innerHeight || height || 1;
  const focusY = viewportHeight * 0.52;
  let bestKey = "";
  let bestScore = -Infinity;

  candidates.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const visibleTop = Math.max(rect.top, viewportHeight * 0.12);
    const visibleBottom = Math.min(rect.bottom, viewportHeight * 0.9);
    const visibleHeight = visibleBottom - visibleTop;
    if (visibleHeight <= 0) return;

    const key = element.dataset.prototype || prototypeKeyFromContent(element.textContent);
    if (!key) return;

    const centerY = rect.top + rect.height / 2;
    const visibleRatio = Math.min(1, visibleHeight / Math.max(rect.height, 1));
    const distancePenalty = Math.abs(centerY - focusY) / viewportHeight;
    const score = visibleRatio - distancePenalty;
    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  });

  return bestScore > -0.22 ? bestKey : "";
}

function updateContextualPrototype() {
  if (isPrototypePinned()) return;

  const nextKey = prototypeKeyFromViewport();
  contextualPrototypeKey = nextKey;
  if (nextKey) {
    switchPrototypeByKey(nextKey);
  }
}

const BRAIN_POINT_COUNT = BRAIN_POINTS.length / 3;
const BRAIN_FOLD_POINT_COUNT = BRAIN_FOLD_POINTS.length / 3;
const IMAGE_BLACKHOLE_POINT_COUNT = IMAGE_BLACKHOLE_POINTS.length / 3;

const bionicHandSegments = [
  { start: { x: -0.36, y: 0.12, z: 0.08 }, end: { x: -0.42, y: 0.52, z: 0.12 }, radius: 0.047, kind: 1 },
  { start: { x: -0.42, y: 0.52, z: 0.12 }, end: { x: -0.47, y: 0.88, z: 0.13 }, radius: 0.04, kind: 1 },
  { start: { x: -0.47, y: 0.88, z: 0.13 }, end: { x: -0.5, y: 1.12, z: 0.1 }, radius: 0.034, kind: 1 },
  { start: { x: -0.14, y: 0.16, z: 0.09 }, end: { x: -0.15, y: 0.62, z: 0.14 }, radius: 0.054, kind: 1 },
  { start: { x: -0.15, y: 0.62, z: 0.14 }, end: { x: -0.15, y: 1.02, z: 0.15 }, radius: 0.046, kind: 1 },
  { start: { x: -0.15, y: 1.02, z: 0.15 }, end: { x: -0.15, y: 1.34, z: 0.11 }, radius: 0.039, kind: 1 },
  { start: { x: 0.08, y: 0.17, z: 0.1 }, end: { x: 0.11, y: 0.68, z: 0.16 }, radius: 0.058, kind: 1 },
  { start: { x: 0.11, y: 0.68, z: 0.16 }, end: { x: 0.13, y: 1.12, z: 0.16 }, radius: 0.049, kind: 1 },
  { start: { x: 0.13, y: 1.12, z: 0.16 }, end: { x: 0.14, y: 1.48, z: 0.11 }, radius: 0.041, kind: 1 },
  { start: { x: 0.31, y: 0.12, z: 0.08 }, end: { x: 0.37, y: 0.55, z: 0.12 }, radius: 0.05, kind: 1 },
  { start: { x: 0.37, y: 0.55, z: 0.12 }, end: { x: 0.43, y: 0.92, z: 0.13 }, radius: 0.042, kind: 1 },
  { start: { x: 0.43, y: 0.92, z: 0.13 }, end: { x: 0.48, y: 1.18, z: 0.1 }, radius: 0.035, kind: 1 },
  { start: { x: -0.42, y: -0.18, z: 0.09 }, end: { x: -0.72, y: 0.03, z: 0.2 }, radius: 0.062, kind: 1 },
  { start: { x: -0.72, y: 0.03, z: 0.2 }, end: { x: -0.96, y: 0.28, z: 0.18 }, radius: 0.048, kind: 1 },
];

const bionicHandJoints = [
  { x: -0.36, y: 0.12, z: 0.1, radius: 0.075 }, { x: -0.42, y: 0.52, z: 0.13, radius: 0.065 }, { x: -0.47, y: 0.88, z: 0.14, radius: 0.055 }, { x: -0.5, y: 1.12, z: 0.1, radius: 0.052 },
  { x: -0.14, y: 0.16, z: 0.11, radius: 0.08 }, { x: -0.15, y: 0.62, z: 0.15, radius: 0.068 }, { x: -0.15, y: 1.02, z: 0.15, radius: 0.057 }, { x: -0.15, y: 1.34, z: 0.1, radius: 0.054 },
  { x: 0.08, y: 0.17, z: 0.12, radius: 0.084 }, { x: 0.11, y: 0.68, z: 0.16, radius: 0.07 }, { x: 0.13, y: 1.12, z: 0.16, radius: 0.058 }, { x: 0.14, y: 1.48, z: 0.1, radius: 0.055 },
  { x: 0.31, y: 0.12, z: 0.1, radius: 0.076 }, { x: 0.37, y: 0.55, z: 0.13, radius: 0.064 }, { x: 0.43, y: 0.92, z: 0.13, radius: 0.054 }, { x: 0.48, y: 1.18, z: 0.1, radius: 0.052 },
  { x: -0.42, y: -0.18, z: 0.12, radius: 0.09 }, { x: -0.72, y: 0.03, z: 0.21, radius: 0.07 }, { x: -0.96, y: 0.28, z: 0.18, radius: 0.062 },
];

const bionicHandRails = [
  { start: { x: -0.42, y: -0.28, z: 0.28 }, end: { x: -0.5, y: 1.05, z: 0.25 }, radius: 0.011 },
  { start: { x: -0.18, y: -0.26, z: 0.3 }, end: { x: -0.15, y: 1.26, z: 0.28 }, radius: 0.012 },
  { start: { x: 0.04, y: -0.26, z: 0.31 }, end: { x: 0.14, y: 1.38, z: 0.28 }, radius: 0.012 },
  { start: { x: 0.27, y: -0.27, z: 0.29 }, end: { x: 0.48, y: 1.08, z: 0.25 }, radius: 0.011 },
  { start: { x: -0.52, y: -0.34, z: 0.3 }, end: { x: -0.92, y: 0.24, z: 0.26 }, radius: 0.012 },
];

const handPanelLines = [
  { start: { x: -0.36, y: -0.12, z: 0.31 }, end: { x: 0.38, y: -0.08, z: 0.31 } },
  { start: { x: -0.34, y: -0.32, z: 0.32 }, end: { x: 0.34, y: -0.28, z: 0.32 } },
  { start: { x: -0.22, y: -0.52, z: 0.31 }, end: { x: 0.24, y: -0.48, z: 0.31 } },
  { start: { x: -0.36, y: -0.08, z: 0.31 }, end: { x: -0.22, y: 0.18, z: 0.31 } },
  { start: { x: 0.28, y: -0.1, z: 0.31 }, end: { x: 0.16, y: 0.18, z: 0.31 } },
];

const handFingertips = [
  { x: -0.5, y: 1.12, z: 0.1, radius: 0.072 },
  { x: -0.15, y: 1.34, z: 0.1, radius: 0.078 },
  { x: 0.14, y: 1.48, z: 0.1, radius: 0.08 },
  { x: 0.48, y: 1.18, z: 0.1, radius: 0.072 },
  { x: -0.96, y: 0.28, z: 0.18, radius: 0.078 },
];

const HAND_KIND = {
  SHELL: 0,
  FINGER: 1,
  JOINT: 2,
  SEAM: 3,
  HIGHLIGHT: 4,
  WRIST: 5,
  SHADOW: 6,
};

const revoFingerProfiles = [
  { x: -0.34, baseY: 0.14, tipY: 1.17, radius: 0.1, lean: -0.035, joints: [0.48, 0.8] },
  { x: -0.11, baseY: 0.19, tipY: 1.44, radius: 0.108, lean: -0.01, joints: [0.61, 0.99] },
  { x: 0.12, baseY: 0.19, tipY: 1.42, radius: 0.106, lean: 0.014, joints: [0.6, 0.97] },
  { x: 0.35, baseY: 0.14, tipY: 1.15, radius: 0.094, lean: 0.04, joints: [0.47, 0.78] },
];

const revoThumbSegments = [
  { start: { x: -0.38, y: -0.45, z: 0.12 }, end: { x: -0.68, y: -0.56, z: 0.18 }, radius: 0.112 },
  { start: { x: -0.68, y: -0.56, z: 0.18 }, end: { x: -0.96, y: -0.43, z: 0.15 }, radius: 0.088 },
];

const revoDetailLines = [
  { start: { x: -0.43, y: 0.18, z: 0.27 }, end: { x: 0.44, y: 0.18, z: 0.27 }, radius: 0.008 },
  { start: { x: -0.31, y: -0.02, z: 0.29 }, end: { x: -0.25, y: 0.2, z: 0.29 }, radius: 0.007 },
  { start: { x: 0.29, y: -0.02, z: 0.29 }, end: { x: 0.24, y: 0.2, z: 0.29 }, radius: 0.007 },
  { start: { x: -0.34, y: -0.76, z: 0.21 }, end: { x: 0.35, y: -0.76, z: 0.21 }, radius: 0.01 },
  { start: { x: -0.28, y: -0.92, z: 0.18 }, end: { x: 0.3, y: -0.92, z: 0.18 }, radius: 0.011 },
  { start: { x: -0.77, y: -0.5, z: 0.28 }, end: { x: -0.52, y: -0.44, z: 0.28 }, radius: 0.007 },
];

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function signedPow(value, power) {
  return Math.sign(value) * Math.abs(value) ** power;
}

function taperedSegmentPoint(index, salt, start, end, radiusStart, radiusEnd, depthScale = 0.78) {
  const axis = new THREE.Vector3(end.x - start.x, end.y - start.y, end.z - start.z);
  const length = axis.length() || 1;
  axis.normalize();
  const helper = Math.abs(axis.y) < 0.92 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const u = new THREE.Vector3().crossVectors(axis, helper).normalize();
  const v = new THREE.Vector3().crossVectors(axis, u).normalize();
  const t = rand(index, salt);
  const angle = rand(index, salt + 1) * TAU;
  const fill = rand(index, salt + 2) < 0.52 ? Math.sqrt(rand(index, salt + 3)) : 0.74 + rand(index, salt + 3) * 0.34;
  const radius = lerp(radiusStart, radiusEnd, t) * fill;
  const point = new THREE.Vector3(start.x, start.y, start.z).addScaledVector(axis, length * t);
  point.addScaledVector(u, Math.cos(angle) * radius);
  point.addScaledVector(v, Math.sin(angle) * radius * depthScale);
  return { x: point.x, y: point.y, z: point.z };
}

function frontShellCapsulePoint(index, salt, start, end, radiusStart, radiusEnd) {
  const axisX = end.x - start.x;
  const axisY = end.y - start.y;
  const length = Math.hypot(axisX, axisY) || 1;
  const unitX = axisX / length;
  const unitY = axisY / length;
  const normalX = -unitY;
  const normalY = unitX;
  const t = rand(index, salt);
  const radius = lerp(radiusStart, radiusEnd, t);
  const fill = rand(index, salt + 1) < 0.34 ? 0.84 + rand(index, salt + 2) * 0.18 : Math.sqrt(rand(index, salt + 2));
  const side = rand(index, salt + 3) < 0.5 ? -1 : 1;
  const offset = side * radius * fill;
  const normalized = Math.min(1, Math.abs(offset) / Math.max(radius, 0.001));
  const dome = Math.sqrt(Math.max(0, 1 - normalized * normalized));
  const front = rand(index, salt + 4) < 0.9 ? 1 : -0.42;

  return {
    x: lerp(start.x, end.x, t) + normalX * offset,
    y: lerp(start.y, end.y, t) + normalY * offset,
    z: lerp(start.z, end.z, t) + front * (0.05 + dome * 0.12 + rand(index, salt + 5) * 0.025),
  };
}

function revoPalmShellPoint(index, salt = 120, highlight = false) {
  const rx = 0.5;
  const ry = 0.61;
  const exponent = 3.75;
  const angle = rand(index, salt) * TAU;
  const fill = highlight ? 0.82 + rand(index, salt + 1) * 0.18 : rand(index, salt + 1) < 0.28 ? 0.82 + rand(index, salt + 2) * 0.2 : Math.sqrt(rand(index, salt + 2));
  const localX = signedPow(Math.cos(angle), 2 / exponent) * rx * fill;
  const localY = signedPow(Math.sin(angle), 2 / exponent) * ry * fill;
  const palmY = -0.38 + localY;
  const taper = 0.92 - Math.max(0, palmY - 0.02) * 0.08 + Math.max(0, -palmY - 0.42) * 0.12;
  const x = localX * taper;
  const edge = Math.min(1, Math.abs(x / rx) ** exponent + Math.abs(localY / ry) ** exponent);
  const dome = (1 - edge) ** 0.58;
  const front = rand(index, salt + 3) < 0.9 ? 1 : -0.36;
  const z = 0.055 + front * (0.045 + rand(index, salt + 4) * 0.11) + dome * 0.14;

  return { x, y: palmY, z };
}

function revoFingerBodyPoint(index, salt = 130) {
  const finger = revoFingerProfiles[Math.floor(rand(index, salt) * revoFingerProfiles.length)];
  const start = { x: finger.x, y: finger.baseY, z: 0.1 };
  const end = { x: finger.x + finger.lean, y: finger.tipY, z: 0.12 };
  const tipRoll = rand(index, salt + 4);

  if (tipRoll > 0.9) {
    return spherePoint(index, salt + 5, end, finger.radius * 1.02, true);
  }

  return frontShellCapsulePoint(index, salt + 6, start, end, finger.radius * 1.03, finger.radius * 0.82);
}

function revoFingerJointPoint(index, salt = 140) {
  const finger = revoFingerProfiles[Math.floor(rand(index, salt) * revoFingerProfiles.length)];
  const jointY = finger.joints[Math.floor(rand(index, salt + 1) * finger.joints.length)];
  const progress = (jointY - finger.baseY) / Math.max(0.01, finger.tipY - finger.baseY);
  const centerX = finger.x + finger.lean * progress;
  const angle = rand(index, salt + 2) * TAU;
  const ringRadius = finger.radius * (0.94 + rand(index, salt + 3) * 0.18);
  return {
    x: centerX + Math.cos(angle) * ringRadius,
    y: jointY + randRange(index, salt + 4, -0.011, 0.011),
    z: 0.12 + Math.sin(angle) * ringRadius * 0.64,
  };
}

function revoThumbPoint(index, salt = 150) {
  const segment = revoThumbSegments[Math.floor(rand(index, salt) * revoThumbSegments.length)];
  if (rand(index, salt + 1) > 0.88) {
    return spherePoint(index, salt + 2, segment.end, segment.radius * 0.98, true);
  }
  return taperedSegmentPoint(index, salt + 3, segment.start, segment.end, segment.radius, segment.radius * 0.78, 0.7);
}

function revoWristPoint(index, salt = 160) {
  const point = segmentCylinderPoint(
    index,
    salt,
    { x: 0, y: -1.16, z: 0.02 },
    { x: 0, y: -0.78, z: 0.04 },
    0.235 + rand(index, salt + 1) * 0.035,
  );
  point.z *= 0.78;
  return point;
}

function revoRingDetailPoint(index, salt, center, radius, thickness = 0.012) {
  const angle = rand(index, salt) * TAU;
  const ringRadius = radius + randRange(index, salt + 1, -thickness, thickness);
  return {
    x: center.x + Math.cos(angle) * ringRadius,
    y: center.y + Math.sin(angle) * ringRadius,
    z: center.z + randRange(index, salt + 2, -0.006, 0.006),
  };
}

function revoDetailPoint(index) {
  const roll = rand(index, 170);

  if (roll < 0.22) {
    return revoRingDetailPoint(index, 171, { x: 0.1, y: -0.55, z: 0.29 }, 0.075, 0.01);
  }

  if (roll < 0.72) {
    const line = revoDetailLines[Math.floor(rand(index, 172) * revoDetailLines.length)];
    return segmentCylinderPoint(index, 173, line.start, line.end, line.radius);
  }

  const finger = revoFingerProfiles[Math.floor(rand(index, 174) * revoFingerProfiles.length)];
  const t = rand(index, 175);
  const y = lerp(finger.baseY + 0.1, finger.tipY - 0.16, t);
  const progress = (y - finger.baseY) / Math.max(0.01, finger.tipY - finger.baseY);
  return {
    x: finger.x + finger.lean * progress + randRange(index, 176, -finger.radius * 0.34, finger.radius * 0.34),
    y,
    z: 0.19 + randRange(index, 177, -0.008, 0.008),
  };
}

const roboticArmLinks = [
  { start: { x: 0.02, y: -0.88, z: 0.03 }, end: { x: -0.04, y: -0.18, z: 0.08 }, radius: 0.14 },
  { start: { x: -0.04, y: -0.18, z: 0.08 }, end: { x: -0.18, y: 0.48, z: 0.1 }, radius: 0.112 },
  { start: { x: -0.18, y: 0.48, z: 0.1 }, end: { x: -0.76, y: 0.56, z: 0.06 }, radius: 0.096 },
  { start: { x: -0.76, y: 0.56, z: 0.06 }, end: { x: -1.02, y: 0.48, z: 0.02 }, radius: 0.052 },
];

const roboticArmJoints = [
  { x: 0, y: -0.92, z: 0.02, radius: 0.3 },
  { x: -0.04, y: -0.18, z: 0.08, radius: 0.24 },
  { x: -0.18, y: 0.48, z: 0.1, radius: 0.2 },
  { x: -0.76, y: 0.56, z: 0.06, radius: 0.13 },
  { x: -1.02, y: 0.48, z: 0.02, radius: 0.085 },
];

const roboticArmRails = [
  { start: { x: -0.18, y: -0.78, z: 0.28 }, end: { x: -0.24, y: 0.38, z: 0.28 }, radius: 0.018 },
  { start: { x: 0.14, y: -0.76, z: -0.18 }, end: { x: 0.0, y: 0.38, z: -0.12 }, radius: 0.016 },
  { start: { x: -0.26, y: 0.56, z: 0.27 }, end: { x: -0.92, y: 0.58, z: 0.2 }, radius: 0.014 },
  { start: { x: -0.2, y: 0.38, z: -0.12 }, end: { x: -0.88, y: 0.48, z: -0.14 }, radius: 0.013 },
  { start: { x: -0.34, y: -0.24, z: 0.32 }, end: { x: -0.94, y: 0.5, z: 0.24 }, radius: 0.009 },
  { start: { x: 0.22, y: -0.28, z: -0.2 }, end: { x: -0.72, y: 0.42, z: -0.18 }, radius: 0.009 },
];

const roboticArmGripper = [
  { start: { x: -1.03, y: 0.49, z: 0.02 }, end: { x: -1.25, y: 0.66, z: 0.08 }, radius: 0.04 },
  { start: { x: -1.03, y: 0.48, z: 0.02 }, end: { x: -1.28, y: 0.39, z: -0.04 }, radius: 0.039 },
  { start: { x: -1.02, y: 0.48, z: 0.02 }, end: { x: -1.16, y: 0.5, z: 0.03 }, radius: 0.064 },
];

function roboticArmBasePoint(index, salt = 184) {
  const roll = rand(index, salt);

  if (roll < 0.52) {
    const point = segmentCylinderPoint(
      index,
      salt + 1,
      { x: 0, y: -1.28, z: 0.02 },
      { x: 0, y: -0.86, z: 0.02 },
      0.25 + rand(index, salt + 2) * 0.035,
    );
    point.z *= 0.82;
    return point;
  }

  if (roll < 0.8) {
    const angle = rand(index, salt + 3) * TAU;
    const radius = 0.36 * Math.sqrt(rand(index, salt + 4));
    return {
      x: Math.cos(angle) * radius,
      y: -1.28 + randRange(index, salt + 5, -0.035, 0.035),
      z: Math.sin(angle) * radius * 0.48,
    };
  }

  return boxPoint(index, salt + 6, { x: 0, y: -0.9, z: 0.02 }, { x: 0.46, y: 0.12, z: 0.38 }, 0.72);
}

function roboticArmLinkPoint(index, salt = 194) {
  const link = roboticArmLinks[Math.floor(rand(index, salt) * roboticArmLinks.length)];
  const point = taperedSegmentPoint(index, salt + 1, link.start, link.end, link.radius * 1.16, link.radius * 0.86, 0.82);
  const rib = Math.sin((point.y + point.x) * 34 + index * 0.01) * 0.008;
  point.z += rib;
  return point;
}

function roboticArmJointPoint(index, salt = 204) {
  const joint = roboticArmJoints[Math.floor(rand(index, salt) * roboticArmJoints.length)];
  const point = spherePoint(index, salt + 1, joint, joint.radius, rand(index, salt + 2) < 0.64);
  point.z *= 0.82;
  return point;
}

function roboticArmRailPoint(index, salt = 214) {
  const rail = roboticArmRails[Math.floor(rand(index, salt) * roboticArmRails.length)];
  return segmentCylinderPoint(index, salt + 1, rail.start, rail.end, rail.radius);
}

function roboticArmGripperPoint(index, salt = 224) {
  const jaw = roboticArmGripper[Math.floor(rand(index, salt) * roboticArmGripper.length)];
  const point = taperedSegmentPoint(index, salt + 1, jaw.start, jaw.end, jaw.radius * 1.08, jaw.radius * 0.72, 0.62);
  if (rand(index, salt + 2) > 0.9) {
    point.x += randRange(index, salt + 3, -0.02, 0.02);
    point.y += randRange(index, salt + 4, -0.02, 0.02);
    point.z += 0.035;
  }
  return point;
}

function roboticArmAxisPoint(index, salt = 236) {
  const joint = roboticArmJoints[Math.floor(rand(index, salt) * roboticArmJoints.length)];
  const angle = rand(index, salt + 1) * TAU;
  const radius = joint.radius * (0.18 + rand(index, salt + 2) * 0.14);
  return {
    x: joint.x + Math.cos(angle) * radius,
    y: joint.y + Math.sin(angle) * radius,
    z: joint.z + 0.18 + randRange(index, salt + 3, -0.012, 0.012),
  };
}

function roboticArmTarget(index) {
  const { scale: baseScale } = prototypePlacement("hand");
  const scale = baseScale * HAND_TARGET_SCALE;
  const roll = rand(index, 230);

  if (roll < 0.26) {
    return scaleTarget(roboticArmBasePoint(index), scale, HAND_KIND.WRIST);
  }

  if (roll < 0.55) {
    return scaleTarget(roboticArmLinkPoint(index), scale, HAND_KIND.FINGER);
  }

  if (roll < 0.74) {
    return scaleTarget(roboticArmJointPoint(index), scale, HAND_KIND.JOINT);
  }

  if (roll < 0.86) {
    return scaleTarget(roboticArmRailPoint(index), scale, HAND_KIND.SEAM);
  }

  if (roll < 0.95) {
    return scaleTarget(roboticArmGripperPoint(index), scale, HAND_KIND.HIGHLIGHT);
  }

  if (roll < 0.985) {
    return scaleTarget(roboticArmAxisPoint(index), scale, HAND_KIND.HIGHLIGHT);
  }

  const haloJoint = roboticArmJoints[Math.floor(rand(index, 231) * roboticArmJoints.length)];
  return scaleTarget(revoRingDetailPoint(index, 232, { x: haloJoint.x, y: haloJoint.y, z: haloJoint.z + 0.12 }, haloJoint.radius * 0.86, 0.012), scale, HAND_KIND.SEAM);
}

const chipBlocks = [
  { x: 0, y: 0.16, z: 0, size: { x: 0.54, y: 0.34, z: 0.44 }, core: true },
  { x: -0.68, y: 0.08, z: -0.46, size: { x: 0.24, y: 0.2, z: 0.24 } },
  { x: -0.32, y: 0.09, z: 0.46, size: { x: 0.28, y: 0.22, z: 0.24 } },
  { x: 0.42, y: 0.1, z: -0.52, size: { x: 0.24, y: 0.24, z: 0.28 } },
  { x: 0.74, y: 0.09, z: 0.34, size: { x: 0.22, y: 0.2, z: 0.3 } },
  { x: -0.76, y: 0.07, z: 0.18, size: { x: 0.18, y: 0.16, z: 0.2 } },
];

const chipTraces = [
  [{ x: -0.96, y: 0.02, z: -0.68 }, { x: -0.42, y: 0.02, z: -0.68 }, { x: -0.42, y: 0.02, z: -0.18 }, { x: -0.26, y: 0.02, z: -0.18 }],
  [{ x: -0.98, y: 0.02, z: 0.62 }, { x: -0.18, y: 0.02, z: 0.62 }, { x: -0.18, y: 0.02, z: 0.24 }],
  [{ x: 0.98, y: 0.02, z: -0.58 }, { x: 0.36, y: 0.02, z: -0.58 }, { x: 0.36, y: 0.02, z: -0.22 }, { x: 0.24, y: 0.02, z: -0.22 }],
  [{ x: 0.98, y: 0.02, z: 0.68 }, { x: 0.3, y: 0.02, z: 0.68 }, { x: 0.3, y: 0.02, z: 0.24 }],
  [{ x: -0.26, y: 0.025, z: 0 }, { x: -0.92, y: 0.025, z: 0 }, { x: -0.92, y: 0.025, z: -0.36 }],
  [{ x: 0.26, y: 0.025, z: 0 }, { x: 0.92, y: 0.025, z: 0 }, { x: 0.92, y: 0.025, z: 0.38 }],
  [{ x: 0, y: 0.03, z: -0.22 }, { x: 0, y: 0.03, z: -0.82 }],
  [{ x: 0, y: 0.03, z: 0.22 }, { x: 0, y: 0.03, z: 0.82 }],
];

const chipVias = [
  { x: -0.42, z: -0.68 }, { x: -0.42, z: -0.18 }, { x: -0.18, z: 0.62 }, { x: -0.18, z: 0.24 },
  { x: 0.36, z: -0.58 }, { x: 0.36, z: -0.22 }, { x: 0.3, z: 0.68 }, { x: 0.3, z: 0.24 },
  { x: -0.92, z: 0 }, { x: 0.92, z: 0 }, { x: 0, z: -0.82 }, { x: 0, z: 0.82 },
];

function activePrototypeKey(index = activePrototypeIndex) {
  return PROTOTYPES[index]?.key || "brain";
}

function bgParticleCount(prototypeKey = activePrototypeKey()) {
  let count = 38400;
  if (width < 620) count = 12600;
  else if (width < 980) count = 23400;

  if (prototypeKey === "hand") return count * HAND_DENSITY_MULTIPLIER;
  if (prototypeKey === "blackhole") return count * BLACKHOLE_DENSITY_MULTIPLIER;
  return count;
}

function prototypePlacement(prototypeKey = activePrototypeKey()) {
  let placement;

  if (width < 700) {
    placement = { x: 0.18, y: 1.22, scale: 2.75 };
  } else if (width < 980) {
    placement = { x: 2.95, y: 0.72, scale: 4.1 };
  } else {
    placement = { x: 5.16, y: 0.48, scale: 5.18 };
  }

  if (prototypeKey === "blackhole") {
    if (width < 700) return { ...placement, x: placement.x + 0.04, y: placement.y + 0.28, scale: placement.scale * 1.02 };
    if (width < 980) return { ...placement, x: placement.x + 0.2, y: placement.y + 0.46, scale: placement.scale * 1.03 };
    return { ...placement, x: placement.x + 0.44, y: placement.y + 1.02, scale: placement.scale * 1.04 };
  }

  if (prototypeKey !== "hand") return placement;

  if (width < 700) return { ...placement, x: placement.x + 0.1, y: placement.y - 0.05 };
  if (width < 980) return { ...placement, x: placement.x + 0.22, y: placement.y - 0.04 };
  return { ...placement, x: placement.x + 0.7, y: placement.y + 0.08 };
}

function particleSizeForPrototype(prototypeKey = activePrototypeKey()) {
  if (prototypeKey === "hand") {
    if (width < 700) return 0.68;
    if (width < 980) return 0.76;
    return 0.88;
  }

  if (prototypeKey === "blackhole") {
    if (width < 700) return 0.82;
    if (width < 980) return 0.96;
    return 1.08;
  }

  return width < 700 ? 1.18 : 1.42;
}

function particleOpacityForPrototype(prototypeKey = activePrototypeKey()) {
  if (prototypeKey === "hand") {
    return body.dataset.tone === "dark" ? 0.98 : 0.86;
  }

  if (prototypeKey === "blackhole") {
    return body.dataset.tone === "dark" ? 0.98 : 0.84;
  }

  return body.dataset.tone === "dark" ? 1 : 0.76;
}

function rendererPixelRatioForPrototype(prototypeKey = activePrototypeKey()) {
  const deviceRatio = window.devicePixelRatio || 1;
  return prototypeKey === "hand" ? Math.min(deviceRatio, 1) : Math.min(deviceRatio, 1.35);
}

function isDepthScannedPrototype(prototypeKey = activePrototypeKey()) {
  return prototypeKey === "hand" || prototypeKey === "blackhole";
}

function applyPrototypeMaterial() {
  if (!bgMaterial) return;

  const prototypeKey = activePrototypeKey();
  const depthScanned = isDepthScannedPrototype(prototypeKey);
  const pixelRatio = rendererPixelRatioForPrototype(prototypeKey);
  if (bgRenderer && bgRenderer.getPixelRatio() !== pixelRatio) {
    bgRenderer.setPixelRatio(pixelRatio);
    bgRenderer.setSize(width, height);
  }
  bgMaterial.size = particleSizeForPrototype(prototypeKey);
  bgMaterial.opacity = particleOpacityForPrototype(prototypeKey);
  bgMaterial.blending = prototypeKey === "hand" ? THREE.NormalBlending : THREE.AdditiveBlending;
  bgMaterial.depthTest = depthScanned;
  bgMaterial.depthWrite = depthScanned;
  bgMaterial.alphaTest = prototypeKey === "hand" ? 0.08 : prototypeKey === "blackhole" ? 0.035 : 0.02;
  bgMaterial.needsUpdate = true;
  updateBlackHoleShadow();
}

function createBlackHoleShadow() {
  blackHoleShadowMesh?.geometry?.dispose();
  blackHoleShadowMesh?.material?.dispose();

  const radius = prototypePlacement("blackhole").scale * 0.33;
  blackHoleShadowMesh = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 96),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.98,
      depthTest: true,
      depthWrite: true,
    }),
  );
  blackHoleShadowMesh.position.set(0, 0, 0.045);
  blackHoleShadowMesh.renderOrder = 3;
}

function updateBlackHoleShadow() {
  if (!blackHoleShadowMesh) return;
  blackHoleShadowMesh.visible = activePrototypeKey() === "blackhole";
}

function updatePrototypePlacement() {
  if (!bgSystem) return;

  const placement = prototypePlacement();
  bgSystem.position.set(placement.x, placement.y, 0);
}

function applyPrototypePose(prototype, elapsed) {
  if (!bgSystem || !prototype) return;

  const [rx, ry, rz] = prototype.rotation;
  const [mx, my, mz] = prototype.motion || [0.03, 0.12, 0.015];
  const phase = elapsed * prototype.speed + activePrototypeIndex * 0.71;
  bgSystem.rotation.set(
    rx + Math.cos(phase * 0.83 + 0.35) * mx,
    ry + Math.sin(phase) * my + Math.sin(phase * 0.43 + 1.6) * my * 0.18,
    rz + Math.sin(phase * 0.67 + 0.9) * mz,
  );
}

function fract(value) {
  return value - Math.floor(value);
}

function rand(index, salt = 0) {
  return fract(Math.sin(index * 127.1 + salt * 311.7) * 43758.5453123);
}

function randRange(index, salt, min, max) {
  return min + rand(index, salt) * (max - min);
}

function normalizePoint(point) {
  const length = Math.hypot(point.x, point.y, point.z) || 1;
  return { x: point.x / length, y: point.y / length, z: point.z / length };
}

function scaleTarget(point, scale, kind = 0) {
  return {
    x: point.x * scale,
    y: point.y * scale,
    z: point.z * scale,
    kind,
  };
}

function ellipsoidPoint(index, salt, lobe, surface = false) {
  const theta = rand(index, salt) * TAU;
  const phi = Math.acos(1 - 2 * rand(index, salt + 1.3));
  const radius = surface ? 0.9 + rand(index, salt + 2.1) * 0.13 : Math.cbrt(rand(index, salt + 2.1));
  const sinPhi = Math.sin(phi);

  return {
    x: lobe.x + Math.cos(theta) * sinPhi * lobe.rx * radius,
    y: lobe.y + Math.cos(phi) * lobe.ry * radius,
    z: lobe.z + Math.sin(theta) * sinPhi * lobe.rz * radius,
  };
}

function boxPoint(index, salt, center, size, surfaceBias = 0.68) {
  const hx = size.x / 2;
  const hy = size.y / 2;
  const hz = size.z / 2;
  let x = randRange(index, salt, -hx, hx);
  let y = randRange(index, salt + 1, -hy, hy);
  let z = randRange(index, salt + 2, -hz, hz);

  if (rand(index, salt + 3) < surfaceBias) {
    const face = Math.floor(rand(index, salt + 4) * 6);
    if (face === 0) x = hx;
    if (face === 1) x = -hx;
    if (face === 2) y = hy;
    if (face === 3) y = -hy;
    if (face === 4) z = hz;
    if (face === 5) z = -hz;
  }

  return { x: center.x + x, y: center.y + y, z: center.z + z };
}

function spherePoint(index, salt, center, radius, surface = false) {
  const theta = rand(index, salt) * TAU;
  const phi = Math.acos(1 - 2 * rand(index, salt + 1));
  const distance = surface ? radius * (0.96 + rand(index, salt + 2) * 0.08) : radius * Math.cbrt(rand(index, salt + 2));
  const sinPhi = Math.sin(phi);

  return {
    x: center.x + Math.cos(theta) * sinPhi * distance,
    y: center.y + Math.cos(phi) * distance,
    z: center.z + Math.sin(theta) * sinPhi * distance,
  };
}

function segmentCylinderPoint(index, salt, start, end, radius) {
  const axis = new THREE.Vector3(end.x - start.x, end.y - start.y, end.z - start.z);
  const length = axis.length() || 1;
  axis.normalize();
  const helper = Math.abs(axis.y) < 0.92 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const u = new THREE.Vector3().crossVectors(axis, helper).normalize();
  const v = new THREE.Vector3().crossVectors(axis, u).normalize();
  const t = rand(index, salt);
  const angle = rand(index, salt + 1) * TAU;
  const radial = radius * (0.76 + rand(index, salt + 2) * 0.3);
  const point = new THREE.Vector3(start.x, start.y, start.z).addScaledVector(axis, length * t);
  point.addScaledVector(u, Math.cos(angle) * radial);
  point.addScaledVector(v, Math.sin(angle) * radial);
  return { x: point.x, y: point.y, z: point.z };
}

function pointFromArray(array, count, index, salt) {
  const stride = Math.floor(rand(index, salt) * count) * 3;
  return {
    x: array[stride],
    y: array[stride + 1],
    z: array[stride + 2],
  };
}

function brainTarget(index) {
  const { scale } = prototypePlacement();
  const roll = rand(index, 7);

  if (roll < 0.055) {
    const stem = segmentCylinderPoint(
      index,
      11,
      { x: 0.55, y: -0.66, z: -0.02 },
      { x: 0.43, y: -1.12, z: 0.04 },
      0.07 + rand(index, 12) * 0.045,
    );
    return scaleTarget(stem, scale, 3);
  }

  if (roll < 0.17) {
    const ridge = rand(index, 13) < 0.46;
    if (ridge) {
      const t = rand(index, 14);
      const band = Math.floor(rand(index, 15) * 8);
      const x = 0.46 + t * 0.56 + Math.sin(t * TAU * 1.3 + band) * 0.035;
      const y = -0.58 + band * 0.035 + Math.sin(t * TAU * 2.1) * 0.025;
      const z = Math.sin(t * TAU + band) * 0.18;
      return scaleTarget({ x, y, z }, scale, 2);
    }

    const point = ellipsoidPoint(
      index,
      16,
      { x: 0.72, y: -0.48, z: 0.02, rx: 0.36, ry: 0.25, rz: 0.28 },
      roll > 0.1,
    );
    point.y += Math.sin(point.x * 15.0) * 0.018;
    return scaleTarget(point, scale, roll > 0.1 ? 2 : 0);
  }

  if (roll < 0.42) {
    const point = pointFromArray(BRAIN_FOLD_POINTS, BRAIN_FOLD_POINT_COUNT, index, 18);
    point.x += randRange(index, 19, -0.004, 0.004);
    point.y += randRange(index, 20, -0.004, 0.004);
    point.z += randRange(index, 21, -0.004, 0.004);
    return scaleTarget(point, scale, 2);
  }

  const point = pointFromArray(BRAIN_POINTS, BRAIN_POINT_COUNT, index, 22);
  point.x += randRange(index, 23, -0.006, 0.006);
  point.y += randRange(index, 24, -0.006, 0.006);
  point.z += randRange(index, 25, -0.006, 0.006);
  return scaleTarget(point, scale, 0);
}

function handTarget(index) {
  return roboticArmTarget(index);

  const { scale: baseScale } = prototypePlacement("hand");
  const scale = baseScale * HAND_TARGET_SCALE;
  const roll = rand(index, 30);

  if (roll < 0.34) {
    return scaleTarget(revoPalmShellPoint(index, 31), scale, HAND_KIND.SHELL);
  }

  if (roll < 0.57) {
    return scaleTarget(revoFingerBodyPoint(index, 32), scale, HAND_KIND.FINGER);
  }

  if (roll < 0.68) {
    return scaleTarget(revoFingerJointPoint(index, 34), scale, HAND_KIND.JOINT);
  }

  if (roll < 0.8) {
    return scaleTarget(revoThumbPoint(index, 37), scale, HAND_KIND.FINGER);
  }

  if (roll < 0.88) {
    return scaleTarget(revoWristPoint(index, 40), scale, HAND_KIND.WRIST);
  }

  if (roll < 0.97) {
    return scaleTarget(revoDetailPoint(index), scale, HAND_KIND.SEAM);
  }

  const point = revoPalmShellPoint(index, 44, true);
  point.x += randRange(index, 45, -0.035, 0.035);
  point.z += 0.045;
  return scaleTarget(point, scale, HAND_KIND.HIGHLIGHT);
}

function pointOnPolyline(index, salt, polyline, radius = 0.012) {
  const segment = Math.floor(rand(index, salt) * (polyline.length - 1));
  const point = segmentCylinderPoint(index, salt + 1, polyline[segment], polyline[segment + 1], radius);
  point.y += randRange(index, salt + 2, -0.004, 0.006);
  return point;
}

function chipSubstratePoint(index) {
  const point = boxPoint(index, 51, { x: 0, y: -0.18, z: 0 }, { x: 2.08, y: 0.075, z: 1.72 }, 0.9);
  point.y += Math.sin(point.x * 13 + point.z * 7) * 0.004;
  return point;
}

function chipTracePoint(index, salt = 54, pulse = false) {
  const trace = chipTraces[Math.floor(rand(index, salt) * chipTraces.length)];
  return pointOnPolyline(index, salt + 1, trace, pulse ? 0.018 : 0.012 + rand(index, salt + 2) * 0.006);
}

function chipViaPoint(index) {
  const via = chipVias[Math.floor(rand(index, 58) * chipVias.length)];
  const point = spherePoint(index, 59, { x: via.x, y: 0.05, z: via.z }, 0.045 + rand(index, 60) * 0.012, true);
  return point;
}

function chipCoreBlockPoint(index) {
  const block = chipBlocks[Math.floor(rand(index, 61) * chipBlocks.length)];
  return boxPoint(index, 62, { x: block.x, y: block.y, z: block.z }, block.size, 0.86);
}

function chipTarget(index) {
  const { scale } = prototypePlacement();
  const roll = rand(index, 50);

  if (roll < 0.28) {
    return scaleTarget(chipSubstratePoint(index), scale, 0);
  }

  if (roll < 0.48) {
    return scaleTarget(chipTracePoint(index, 54), scale, 1);
  }

  if (roll < 0.6) {
    return scaleTarget(chipViaPoint(index), scale, 2);
  }

  if (roll < 0.74) {
    const block = chipBlocks[Math.floor(rand(index, 63) * chipBlocks.length)];
    return scaleTarget(boxPoint(index, 64, { x: block.x, y: block.y, z: block.z }, block.size, 0.86), scale, block.core ? 4 : 3);
  }

  if (roll < 0.88) {
    const bus = rand(index, 65) < 0.5
      ? [{ x: -1.05, y: 0.035, z: randRange(index, 66, -0.78, 0.78) }, { x: 1.05, y: 0.035, z: randRange(index, 66, -0.78, 0.78) }]
      : [{ x: randRange(index, 67, -0.98, 0.98), y: 0.035, z: -0.86 }, { x: randRange(index, 67, -0.98, 0.98), y: 0.035, z: 0.86 }];
    return scaleTarget(pointOnPolyline(index, 68, bus, 0.009), scale, 1);
  }

  return scaleTarget(chipTracePoint(index, 70, true), scale, 5);
}

function blackHoleTarget(index) {
  const { scale: baseScale } = prototypePlacement();
  const scale = baseScale * 0.92;
  const roll = rand(index, 70);
  const angle = rand(index, 71) * TAU;
  const jitter = randRange(index, 72, -1, 1);

  if (roll < 0.24) {
    const radius = 0.46 + rand(index, 73) * 0.052;
    const point = {
      x: Math.cos(angle) * radius + jitter * 0.006,
      y: Math.sin(angle) * radius * 0.9 + randRange(index, 74, -0.006, 0.006),
      z: Math.sin(angle) * 0.115 + Math.cos(angle) * 0.045 + randRange(index, 75, -0.024, 0.024),
    };
    return scaleTarget(point, scale, BLACKHOLE_KIND.PHOTON_RING);
  }

  if (roll < 0.42) {
    const arc = -0.18 + rand(index, 76) * (Math.PI + 0.36);
    const radius = 0.58 + rand(index, 77) * 0.22;
    const point = {
      x: Math.cos(arc) * radius + randRange(index, 78, -0.025, 0.025),
      y: Math.sin(arc) * 0.52 + 0.08 + randRange(index, 79, -0.02, 0.02),
      z: -0.18 + Math.sin(arc) * 0.22 + Math.cos(arc) * 0.09 + randRange(index, 80, -0.075, 0.075),
    };
    return scaleTarget(point, scale, BLACKHOLE_KIND.FAR_SIDE_HUMP);
  }

  if (roll < 0.75) {
    const radius = 0.56 + Math.pow(rand(index, 81), 1.18) * 1.18;
    const shear = Math.cos(angle) > 0 ? 0.24 : -0.08;
    const turbulence = Math.sin(angle * 2.7 + radius * 5.4) * 0.038;
    const point = {
      x: Math.cos(angle) * radius + shear * rand(index, 82) + randRange(index, 83, -0.045, 0.045),
      y: Math.sin(angle) * radius * 0.105 + turbulence + randRange(index, 84, -0.016, 0.016),
      z: Math.sin(angle) * radius * 0.78 + Math.cos(angle) * 0.11 + randRange(index, 85, -0.16, 0.16),
    };
    const innerEdge = radius < 0.7;
    const outerWake = radius > 1.38;
    return scaleTarget(point, scale, innerEdge ? BLACKHOLE_KIND.INNER_DISK : outerWake ? BLACKHOLE_KIND.OUTER_DUST : BLACKHOLE_KIND.DISK);
  }

  if (roll < 0.84) {
    const x = randRange(index, 86, -1.52, 1.62);
    const bend = Math.exp(-Math.abs(x) * 1.7);
    const point = {
      x,
      y: -0.04 + bend * 0.06 + randRange(index, 87, -0.026, 0.026),
      z: 0.36 + Math.sin(x * 2.6) * 0.055 + randRange(index, 88, -0.1, 0.1),
    };
    return scaleTarget(point, scale, BLACKHOLE_KIND.UNDERSIDE_ARC);
  }

  if (roll < 0.91) {
    const cluster = rand(index, 89) < 0.45 ? -0.38 : rand(index, 90) < 0.5 ? 0.04 : 0.34;
    const point = {
      x: cluster + randRange(index, 91, -0.09, 0.09),
      y: randRange(index, 92, -0.035, 0.08),
      z: 0.42 + randRange(index, 93, -0.08, 0.08),
    };
    return scaleTarget(point, scale, BLACKHOLE_KIND.FLARE);
  }

  const radius = 1.12 + Math.pow(rand(index, 94), 1.9) * 1.12;
  const side = rand(index, 95) < 0.72 ? 1 : -1;
  const point = {
    x: Math.cos(angle) * radius + side * rand(index, 96) * 0.78,
    y: Math.sin(angle) * radius * 0.12 + randRange(index, 97, -0.085, 0.085),
    z: Math.sin(angle) * radius * 0.82 + Math.cos(angle) * 0.1 + randRange(index, 98, -0.28, 0.28),
  };
  return scaleTarget(point, scale, BLACKHOLE_KIND.OUTER_DUST);
}

function prototypeTarget(index, prototypeIndex = activePrototypeIndex) {
  const key = PROTOTYPES[prototypeIndex]?.key || "brain";
  if (key === "hand") return handTarget(index);
  if (key === "chip") return chipTarget(index);
  if (key === "blackhole") return blackHoleTarget(index);
  return brainTarget(index);
}

function setPrototypeTargets(prototypeIndex) {
  if (!bgTargets || !bgKinds) return;

  for (let index = 0; index < bgTargets.length / 3; index += 1) {
    const stride = index * 3;
    const target = prototypeTarget(index, prototypeIndex);
    bgTargets[stride] = target.x;
    bgTargets[stride + 1] = target.y;
    bgTargets[stride + 2] = target.z;
    bgKinds[index] = target.kind;
  }
}

function switchPrototype(nextIndex) {
  activePrototypeIndex = nextIndex % PROTOTYPES.length;
  const nextCount = bgParticleCount();
  const currentCount = bgPositions ? bgPositions.length / 3 : 0;

  if (nextCount !== currentCount) {
    createBackgroundParticles();
    return;
  }

  setPrototypeTargets(activePrototypeIndex);
  updatePrototypePlacement();
  applyPrototypeMaterial();
  updateBgColors();
  lastPrototypeSwitch = performance.now();
}

function sceneState() {
  const statePrototypeKey = activePrototypeKey();
  const stateInteractionRadius =
    width < 700 ? (statePrototypeKey === "hand" ? 86 : 62) : width < 980 ? (statePrototypeKey === "hand" ? 104 : 75) : statePrototypeKey === "hand" ? 128 : 88;

  return {
    palette: activePalette,
    prototype: PROTOTYPES[activePrototypeIndex]?.key,
    prototypeIndex: activePrototypeIndex,
    particleCount: bgPositions ? bgPositions.length / 3 : 0,
    particleSize: bgMaterial?.size || 0,
    particleBrightness: PARTICLE_BRIGHTNESS,
    particleDensityMultiplier:
      activePrototypeKey() === "hand" ? HAND_DENSITY_MULTIPLIER : activePrototypeKey() === "blackhole" ? BLACKHOLE_DENSITY_MULTIPLIER : 1,
    particleBlend:
      activePrototypeKey() === "hand" ? "normal-depth-scan" : activePrototypeKey() === "blackhole" ? "additive-depth-scan" : "additive-glow",
    contextualPrototype: contextualPrototypeKey || "carousel",
    prototypeDuration: PROTOTYPE_DURATION,
    rotationMode: "bounded-best-angle",
    interactionShape: "screen-projection",
    interactionRadius: stateInteractionRadius,
    interactionEnabled:
      statePrototypeKey === "hand"
        ? (bgPositions ? bgPositions.length / 3 : 0) < HAND_INTERACTION_LIMIT
        : (bgPositions ? bgPositions.length / 3 : 0) < 140000,
  };
}

window.sheroSceneState = sceneState;

function createBackgroundParticles() {
  const prototypeKey = activePrototypeKey();
  const count = bgParticleCount(prototypeKey);
  bgPositions = new Float32Array(count * 3);
  bgTargets = new Float32Array(count * 3);
  bgVelocities = new Float32Array(count * 3);
  bgColors = new Float32Array(count * 3);
  bgKinds = new Float32Array(count);

  setPrototypeTargets(activePrototypeIndex);

  for (let index = 0; index < count; index += 1) {
    const stride = index * 3;
    const scatter = prototypeKey === "hand" ? 0.018 + rand(index, 90) * 0.028 : 0.18 + rand(index, 90) * 0.24;

    bgPositions[stride] = bgTargets[stride] + randRange(index, 91, -scatter, scatter);
    bgPositions[stride + 1] = bgTargets[stride + 1] + randRange(index, 92, -scatter, scatter);
    bgPositions[stride + 2] = bgTargets[stride + 2] + randRange(index, 93, -scatter, scatter);
  }

  bgGeometry?.dispose();
  bgGeometry = new THREE.BufferGeometry();
  bgGeometry.setAttribute("position", new THREE.BufferAttribute(bgPositions, 3));
  bgGeometry.setAttribute("color", new THREE.BufferAttribute(bgColors, 3));

  bgMaterial?.dispose();
  particleTexture ||= createParticleTexture();
  bgMaterial = new THREE.PointsMaterial({
    size: particleSizeForPrototype(prototypeKey),
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
    opacity: particleOpacityForPrototype(prototypeKey),
    depthTest: isDepthScannedPrototype(prototypeKey),
    depthWrite: isDepthScannedPrototype(prototypeKey),
    alphaTest: prototypeKey === "hand" ? 0.08 : prototypeKey === "blackhole" ? 0.035 : 0.02,
    blending: prototypeKey === "hand" ? THREE.NormalBlending : THREE.AdditiveBlending,
    map: particleTexture,
  });

  if (bgSystem) {
    bgScene.remove(bgSystem);
  }

  bgSystem = new THREE.Points(bgGeometry, bgMaterial);
  createBlackHoleShadow();
  bgSystem.add(blackHoleShadowMesh);
  updatePrototypePlacement();
  applyPrototypePose(PROTOTYPES[activePrototypeIndex], 0);
  bgScene.add(bgSystem);
  applyPrototypeMaterial();
  lastPrototypeSwitch = performance.now();
  updateBgColors();
}

function updateBgColors() {
  if (!bgColors) return;

  const current = theme();
  const prototypeKey = activePrototypeKey();
  const handScale = prototypePlacement("hand").scale * HAND_TARGET_SCALE;
  const blackHoleScale = prototypePlacement("blackhole").scale * 0.9;
  const isScannedHand = prototypeKey === "hand";
  const isVolumetricBlackHole = prototypeKey === "blackhole";
  current.particles.forEach((value, index) => colorObjects[index].set(value));

  for (let index = 0; index < bgColors.length / 3; index += 1) {
    const stride = index * 3;
    const kind = bgKinds?.[index] || 0;
    const color = colorObjects[(index + kind) % current.particles.length];

    if (isScannedHand) {
      const localX = (bgTargets?.[stride] || 0) / handScale;
      const localY = (bgTargets?.[stride + 1] || 0) / handScale;
      const localZ = (bgTargets?.[stride + 2] || 0) / handScale;
      const relief = Math.max(0, Math.min(1, (localZ + 0.2) / 0.62));
      const vertical = Math.max(0, Math.min(1, (localY + 1.14) / 2.62));
      const shellOcclusion = Math.max(0.3, Math.min(1.16, 0.42 + relief * 0.72 + vertical * 0.16));
      const sideShadow = Math.max(0.36, Math.min(1.18, 0.82 - localX * 0.12 + relief * 0.42));
      const scanBand = 0.88 + Math.sin(localY * 38 - colorAnimationTime * 0.0042 + localX * 17 + index * 0.006) * 0.08;
      const sweep = 1 + Math.max(0, 1 - Math.abs(localY - (fract(colorAnimationTime * 0.00013) * 2.9 - 1.24)) * 5.6) * 0.52;
      const detailLift =
        kind === HAND_KIND.HIGHLIGHT
          ? 2.36
          : kind === HAND_KIND.SEAM
            ? 1.72
            : kind === HAND_KIND.JOINT
              ? 1.58
              : kind === HAND_KIND.WRIST
                ? 1.24
                : kind === HAND_KIND.FINGER
                  ? 1.36
                  : 0.96;
      const intensity = sideShadow * shellOcclusion * scanBand * sweep * detailLift * 1.46;
      const paletteTint = body.dataset.tone === "dark" ? 0.18 : 0.08;
      let metalR = 0.7;
      let metalG = 0.76;
      let metalB = 0.82;

      if (kind === HAND_KIND.FINGER) {
        metalR = 0.86;
        metalG = 0.92;
        metalB = 0.98;
      } else if (kind === HAND_KIND.JOINT || kind === HAND_KIND.SEAM) {
        metalR = 0.72;
        metalG = 0.83;
        metalB = 0.98;
      } else if (kind === HAND_KIND.HIGHLIGHT) {
        metalR = 1.18;
        metalG = 1.24;
        metalB = 1.34;
      } else if (kind === HAND_KIND.WRIST) {
        metalR = 0.7;
        metalG = 0.78;
        metalB = 0.86;
      }

      bgColors[stride] = (metalR * (1 - paletteTint) + color.r * paletteTint) * intensity;
      bgColors[stride + 1] = (metalG * (1 - paletteTint) + color.g * paletteTint) * intensity;
      bgColors[stride + 2] = (metalB * (1 - paletteTint) + color.b * paletteTint) * intensity;
      continue;
    }

    if (isVolumetricBlackHole) {
      const localX = (bgTargets?.[stride] || 0) / blackHoleScale;
      const localY = (bgTargets?.[stride + 1] || 0) / blackHoleScale;
      const localZ = (bgTargets?.[stride + 2] || 0) / blackHoleScale;
      const near = Math.max(0, Math.min(1, (localZ + 1.45) / 2.9));
      const eventRadius = Math.hypot(localX, localY * 1.05);
      const eventVoid = eventRadius < 0.43 ? Math.max(0.02, (eventRadius - 0.23) * 2.9) : 1;
      const forwardArc = Math.max(0, Math.sin(Math.atan2(localZ, localX) + 0.55));
      const orbit = Math.atan2(localZ * 0.7, localX);
      const movingGrain = 0.9 + Math.sin(orbit * 4.5 - colorAnimationTime * 0.0028 + index * 0.006) * 0.1;
      const rimLift =
        kind === BLACKHOLE_KIND.PHOTON_RING
          ? 3.9
          : kind === BLACKHOLE_KIND.FLARE
            ? 2.55
            : kind === BLACKHOLE_KIND.FAR_SIDE_HUMP
              ? 2.18
              : kind === BLACKHOLE_KIND.INNER_DISK
                ? 1.82
                : kind === BLACKHOLE_KIND.UNDERSIDE_ARC
                  ? 1.5
                  : kind === BLACKHOLE_KIND.DISK
                    ? 1.18
                    : 0.62;
      const depthLift = 0.5 + near * 1.16 + forwardArc * 0.62;
      const thinDisk = 1 + Math.max(0, 1 - Math.abs(localY) * 15) * 0.62;
      const intensity = depthLift * eventVoid * rimLift * thinDisk * movingGrain * 1.54;
      let blackR = color.r;
      let blackG = color.g;
      let blackB = color.b;

      if (kind === BLACKHOLE_KIND.FLARE) {
        blackR = 0.7;
        blackG = 0.92;
        blackB = 1.55;
      } else if (kind === BLACKHOLE_KIND.PHOTON_RING) {
        blackR = 1.18;
        blackG = 1.06;
        blackB = 0.9;
      } else if (kind === BLACKHOLE_KIND.FAR_SIDE_HUMP) {
        blackR = 1.08;
        blackG = 0.9;
        blackB = 0.68;
      } else if (kind === BLACKHOLE_KIND.UNDERSIDE_ARC) {
        blackR = 1.12;
        blackG = 0.72 + near * 0.16;
        blackB = 0.42;
      } else if (kind === BLACKHOLE_KIND.DISK) {
        blackR = 0.95;
        blackG = 0.54 + near * 0.18;
        blackB = 0.28;
      } else {
        blackR = 0.62;
        blackG = 0.42;
        blackB = 0.3;
      }

      bgColors[stride] = blackR * intensity;
      bgColors[stride + 1] = blackG * intensity;
      bgColors[stride + 2] = blackB * intensity;
      continue;
    }

    if (prototypeKey === "chip") {
      const chipScale = prototypePlacement("chip").scale;
      const localX = (bgTargets?.[stride] || 0) / chipScale;
      const localZ = (bgTargets?.[stride + 2] || 0) / chipScale;
      const scan = Math.max(0, 1 - Math.abs(localX * 0.75 + localZ * 0.35 - (fract(colorAnimationTime * 0.00008) * 2.6 - 1.3)) * 1.35);
      const pulse = kind === 5 ? 1.8 + Math.sin(colorAnimationTime * 0.008 + index * 0.09) * 0.36 : 1;
      const chipLift = kind === 4 ? 1.7 : kind === 2 ? 1.55 : kind === 1 ? 1.28 : kind === 3 ? 1.16 : 0.62;
      const intensity = (0.72 + scan * 0.82) * chipLift * pulse * 1.32;
      bgColors[stride] = color.r * intensity * (kind === 0 ? 0.58 : 0.9);
      bgColors[stride + 1] = color.g * intensity * (kind === 0 ? 0.72 : 1.08);
      bgColors[stride + 2] = color.b * intensity * (1.05 + scan * 0.28);
      continue;
    }

    const depth = 0.92 + rand(index, 101 + kind) * 0.34;
    const edgeLift = kind === 2 ? 1.42 : kind === 3 ? 1.72 : kind === 1 ? 1.16 : 1;
    const overlapPulse = kind > 1 ? 1 + Math.sin(index * 0.071 + kind * 1.9) * 0.12 : 1;
    const intensity = depth * edgeLift * overlapPulse * PARTICLE_BRIGHTNESS;
    bgColors[stride] = color.r * intensity;
    bgColors[stride + 1] = color.g * intensity;
    bgColors[stride + 2] = color.b * intensity;
  }

  bgGeometry?.attributes.color && (bgGeometry.attributes.color.needsUpdate = true);
}

function initTitleScene() {
  titleScene = new THREE.Scene();
  titleRenderer = new THREE.WebGLRenderer({
    canvas: titleCanvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  titleRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  titleRenderer.setClearColor(0x000000, 0);

  const ambient = new THREE.AmbientLight(0xffffff, 1.4);
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(-2, 3, 6);
  titleScene.add(ambient, key);
  rebuildTitle();
}

function measureTitle(fontSize, context, lines) {
  context.font = `700 ${fontSize}px Fraunces, Georgia, serif`;
  return Math.max(...lines.map((line) => context.measureText(line).width));
}

function createTitleTargets() {
  const rect = titleWrap.getBoundingClientRect();
  titleWidth = Math.max(280, Math.round(rect.width));
  titleHeight = Math.max(220, Math.round(rect.height));

  titleRenderer.setSize(titleWidth, titleHeight, false);
  titleCamera = new THREE.OrthographicCamera(
    -titleWidth / 2,
    titleWidth / 2,
    titleHeight / 2,
    -titleHeight / 2,
    -1000,
    1000,
  );
  titleCamera.position.z = 500;

  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = titleWidth;
  sampleCanvas.height = titleHeight;
  const context = sampleCanvas.getContext("2d", { willReadFrequently: true });
  const lines = ["Wai Ka", "Sun"];

  let fontSize = titleWidth < 520 ? Math.min(88, titleWidth * 0.24) : Math.min(164, titleWidth * 0.22);
  let lineHeight = fontSize * 0.82;
  while (
    (measureTitle(fontSize, context, lines) > titleWidth * 0.96 || lineHeight * lines.length > titleHeight * 0.92) &&
    fontSize > 42
  ) {
    fontSize -= 2;
    lineHeight = fontSize * 0.82;
  }

  context.clearRect(0, 0, titleWidth, titleHeight);
  context.fillStyle = "#ffffff";
  context.textBaseline = "alphabetic";
  context.font = `700 ${fontSize}px Fraunces, Georgia, serif`;

  const totalHeight = lineHeight * 2 + fontSize;
  let baseline = (titleHeight - totalHeight) / 2 + fontSize * 0.86;
  const left = titleWidth < 620 ? 4 : 6;

  lines.forEach((line, index) => {
    context.fillText(line, left, baseline + index * lineHeight);
  });

  const image = context.getImageData(0, 0, titleWidth, titleHeight).data;
  const step = titleWidth < 520 ? 7 : 8;
  const targets = [];

  for (let y = 0; y < titleHeight; y += step) {
    for (let x = 0; x < titleWidth; x += step) {
      const alpha = image[(y * titleWidth + x) * 4 + 3];
      if (alpha > 48) {
        targets.push({
          x: x - titleWidth / 2,
          y: titleHeight / 2 - y,
          z: (Math.random() - 0.5) * 28,
        });
      }
    }
  }

  const limit = titleWidth < 520 ? 760 : 1500;
  if (targets.length <= limit) return targets;

  const stride = targets.length / limit;
  return Array.from({ length: limit }, (_, index) => targets[Math.floor(index * stride)]);
}

function rebuildTitle() {
  const targets = createTitleTargets();
  const blockSize = titleWidth < 520 ? 5.2 : 6.2;

  if (titleMesh) {
    titleScene.remove(titleMesh);
  }
  titleGeometry?.dispose();
  titleMaterial?.dispose();

  titleGeometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize * 0.62);
  titleMaterial = new THREE.MeshBasicMaterial({
    color: body.dataset.tone === "dark" ? "#fff7e8" : "#10130f",
    vertexColors: false,
    transparent: true,
    opacity: body.dataset.tone === "dark" ? 1 : 0.94,
    blending: THREE.NormalBlending,
  });

  titleMesh = new THREE.InstancedMesh(titleGeometry, titleMaterial, targets.length);
  titleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  titleParticles = targets.map((target, index) => {
    const drift = titleWidth < 520 ? 52 : 88;
    return {
      target: new THREE.Vector3(target.x, target.y, target.z),
      position: new THREE.Vector3(
        target.x + (Math.random() - 0.5) * drift,
        target.y + (Math.random() - 0.5) * drift,
        target.z + (Math.random() - 0.5) * 90,
      ),
      velocity: new THREE.Vector3(0, 0, 0),
      seed: Math.random() * 1000,
      scale: 0.72 + Math.random() * 0.52,
      colorIndex: index % 4,
    };
  });

  titleScene.add(titleMesh);
  updateTitleColors();
  updateTitleInstances(0);
}

function updateTitleColors() {
  if (!titleMesh) return;

  const solidTitleColor = body.dataset.tone === "dark" ? "#fff7e8" : "#10130f";
  titleMaterial.color.set(solidTitleColor);
  titleMaterial.opacity = body.dataset.tone === "dark" ? 1 : 0.94;
  titleMaterial.blending = THREE.NormalBlending;
  titleMaterial.needsUpdate = true;

  colorObjects[0].set(solidTitleColor);
  titleParticles.forEach((particle, index) => {
    titleMesh.setColorAt(index, colorObjects[0]);
  });
  titleMesh.instanceColor.needsUpdate = true;
}

function updateTitleInstances(time) {
  if (!titleMesh) return;

  titleParticles.forEach((particle, index) => {
    const driftX = Math.sin(time * 0.00032 + particle.seed) * 1.5;
    const driftY = Math.cos(time * 0.00028 + particle.seed * 1.17) * 1.2;
    const targetX = particle.target.x + driftX;
    const targetY = particle.target.y + driftY;
    const targetZ = particle.target.z + Math.sin(time * 0.00026 + particle.seed) * 6;

    const dx = particle.position.x - titlePointer.x;
    const dy = particle.position.y - titlePointer.y;
    const distanceSq = dx * dx + dy * dy + 90;
    const radius = titleWidth < 520 ? 118 : 155;
    const radiusSq = radius * radius;

    if (titlePointer.active && distanceSq < radiusSq) {
      const force = (1 - distanceSq / radiusSq) * (titleWidth < 520 ? 2.8 : 4.2);
      particle.velocity.x += (dx / Math.sqrt(distanceSq)) * force;
      particle.velocity.y += (dy / Math.sqrt(distanceSq)) * force;
      particle.velocity.z += (Math.sin(particle.seed + time * 0.001) + 1) * force * 0.55;
    }

    particle.velocity.x += (targetX - particle.position.x) * 0.024;
    particle.velocity.y += (targetY - particle.position.y) * 0.024;
    particle.velocity.z += (targetZ - particle.position.z) * 0.018;

    particle.velocity.multiplyScalar(0.875);
    particle.position.add(particle.velocity);

    const breathing = 1 + Math.sin(time * 0.00055 + particle.seed) * 0.08;
    dummy.position.copy(particle.position);
    dummy.rotation.set(
      Math.sin(time * 0.0002 + particle.seed) * 0.28,
      Math.cos(time * 0.00018 + particle.seed) * 0.28,
      Math.sin(time * 0.00016 + particle.seed) * 0.12,
    );
    dummy.scale.setScalar(particle.scale * breathing);
    dummy.updateMatrix();
    titleMesh.setMatrixAt(index, dummy.matrix);
  });

  titleMesh.instanceMatrix.needsUpdate = true;
}

function updatePointer(event) {
  pointer.x = (event.clientX / width) * 2 - 1;
  pointer.y = -(event.clientY / height) * 2 + 1;

  if (!sheroStage || prefersReducedMotion || !audioState.userUnlocked) return;

  const rect = sheroStage.getBoundingClientRect();
  const insideHero =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;

  if (!insideHero) return;

  const now = performance.now();
  if (now - audioState.lastMoveAt < 90) return;

  audioState.lastMoveAt = now;
  const centerPull = 1 - Math.min(1, Math.hypot(pointer.x * 0.72, pointer.y * 0.58));
  const strength = Math.max(0.26, Math.min(1, 0.42 + centerPull * 0.58));
  setAmbientMusic(true, strength);
  playBell(strength);
}

function updateTitlePointer(event) {
  const rect = titleWrap.getBoundingClientRect();
  titlePointer.active = true;
  titlePointer.x = event.clientX - rect.left - titleWidth / 2;
  titlePointer.y = titleHeight / 2 - (event.clientY - rect.top);
  titlePointer.energy = Math.min(1, titlePointer.energy + 0.08);
  playBell(titlePointer.energy);
}

function releaseTitlePointer() {
  titlePointer.active = false;
  titlePointer.x = 9999;
  titlePointer.y = 9999;
}

function updateScrollDepth() {
  const maxScroll = Math.max(document.documentElement.scrollHeight - height, 1);
  scrollDepth = window.scrollY / maxScroll;
  updateContextualPrototype();
}

function ensureAudio() {
  if (prefersReducedMotion) return null;

  if (!audioState.context) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;

    const context = new AudioContext();
    const master = context.createGain();
    const ambient = context.createGain();
    const shimmer = context.createGain();
    const filter = context.createBiquadFilter();
    const delay = context.createDelay(2.2);
    const feedback = context.createGain();

    master.gain.value = 0.0001;
    ambient.gain.value = 0.0001;
    shimmer.gain.value = 0.0001;
    filter.type = "lowpass";
    filter.frequency.value = 3200;
    filter.Q.value = 0.58;
    delay.delayTime.value = 0.52;
    feedback.gain.value = 0.11;

    [55, 110, 220].forEach((frequency, index) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = index === 0 ? "sine" : "triangle";
      osc.frequency.value = frequency;
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(ambient);
      osc.start();
      audioState.oscillators.push({ osc, gain });
    });

    const noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i += 1) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.16;
    }
    const noiseSource = context.createBufferSource();
    const noiseGain = context.createGain();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    noiseGain.gain.value = 0.0001;
    noiseSource.connect(noiseGain);
    noiseGain.connect(ambient);
    noiseSource.start();

    ambient.connect(filter);
    shimmer.connect(filter);
    filter.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(master);
    filter.connect(master);
    master.connect(context.destination);

    audioState.context = context;
    audioState.master = master;
    audioState.ambient = ambient;
    audioState.shimmer = shimmer;
    audioState.delay = delay;
    audioState.filter = filter;
    audioState.noise = noiseGain;
    audioState.noiseSource = noiseSource;
  }

  if (audioState.context.state === "suspended") {
    audioState.context.resume().catch(() => {});
  }

  return audioState.context;
}

function setAmbientMusic(active, strength = 0.45) {
  if (active && !audioState.userUnlocked) return;

  const context = ensureAudio();
  if (!context) return;

  const now = context.currentTime;
  const prototypeKey = activePrototypeKey();
  audioState.ambientActive = active;
  body.dataset.audio = active ? "awake" : "idle";
  audioState.master.gain.cancelScheduledValues(now);
  audioState.ambient.gain.cancelScheduledValues(now);
  audioState.shimmer.gain.cancelScheduledValues(now);
  audioState.filter.frequency.cancelScheduledValues(now);
  audioState.noise?.gain.cancelScheduledValues(now);

  const prototypeFilter = prototypeKey === "hand" ? 2600 : prototypeKey === "chip" ? 4200 : prototypeKey === "blackhole" ? 1200 : 3400;
  const masterTarget = active ? 0.16 : 0.0001;
  const ambientTarget = active ? 0.018 + strength * 0.012 : 0.0001;
  const shimmerTarget = active ? 0.00016 + strength * 0.00016 : 0.0001;
  const noiseTarget = active ? 0.0035 + strength * 0.002 : 0.0001;
  const filterTarget = active ? prototypeFilter + strength * 1400 : 2400;

  audioState.master.gain.setTargetAtTime(masterTarget, now, active ? 0.65 : 1.1);
  audioState.ambient.gain.setTargetAtTime(ambientTarget, now, active ? 0.7 : 1.2);
  audioState.shimmer.gain.setTargetAtTime(shimmerTarget, now, active ? 0.6 : 1.1);
  audioState.noise?.gain.setTargetAtTime(noiseTarget, now, active ? 0.9 : 1.25);
  audioState.filter.frequency.setTargetAtTime(filterTarget, now, 0.9);
  audioState.oscillators.forEach(({ gain }, index) => {
    gain.gain.cancelScheduledValues(now);
    gain.gain.setTargetAtTime(active ? ambientTarget * (index === 0 ? 0.52 : 0.24) : 0.0001, now, active ? 0.8 : 1.1);
  });
  updateSoundLabel();
}

function playBell(strength) {
  if (!audioState.userUnlocked) return;
  const context = ensureAudio();
  if (!context) return;

  const now = context.currentTime;
  if (now < audioState.nextNoteAt) return;

  setAmbientMusic(true, strength);

  const melody = [440.0, 554.37, 659.25, 880.0, 987.77, 880.0];
  const frequency = melody[audioState.noteIndex % melody.length];
  audioState.noteIndex += 1;
  audioState.nextNoteAt = now + 2.8 + Math.random() * 1.9;

  const gain = context.createGain();
  const overtoneGain = context.createGain();
  const osc = context.createOscillator();
  const overtone = context.createOscillator();

  osc.type = "sine";
  overtone.type = "sine";
  osc.frequency.setValueAtTime(frequency, now);
  overtone.frequency.setValueAtTime(frequency * 2.01, now);

  const volume = 0.0018 + strength * 0.0024;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
  overtoneGain.gain.setValueAtTime(0.0001, now);
  overtoneGain.gain.exponentialRampToValueAtTime(volume * 0.26, now + 0.09);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);

  osc.connect(gain);
  overtone.connect(overtoneGain);
  gain.connect(audioState.filter);
  overtoneGain.connect(audioState.shimmer);

  osc.start(now);
  overtone.start(now);
  osc.stop(now + 1.9);
  overtone.stop(now + 1.2);
}

function toggleAmbientMusic() {
  audioState.userUnlocked = true;
  if (audioState.ambientActive) {
    setAmbientMusic(false);
    return;
  }

  setAmbientMusic(true, 0.5);
  playBell(0.32);
}

function releaseAmbientMusic() {
  setAmbientMusic(false);
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;

  if (bgRenderer) {
    bgCamera.aspect = width / height;
    bgCamera.updateProjectionMatrix();
    bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
    bgRenderer.setSize(width, height);
    createBackgroundParticles();
  }

  if (titleRenderer) {
    rebuildTitle();
  }
}

function animate(time = 0) {
  animationFrame = requestAnimationFrame(animate);

  marbleMaterial.uniforms.uTime.value = time * 0.001;
  colorAnimationTime = time;
  let prototype = PROTOTYPES[activePrototypeIndex];
  let prototypeKey = prototype.key;
  bgMaterial.opacity = particleOpacityForPrototype(prototypeKey);
  const elapsed = Math.max(0, time - sceneStartedAt);

  if (!prefersReducedMotion) {
    if (!isPrototypePinned()) {
      if (contextualPrototypeKey) {
        switchPrototypeByKey(contextualPrototypeKey);
      } else if (time - lastPrototypeSwitch > PROTOTYPE_DURATION) {
        switchPrototype(activePrototypeIndex + 1);
      }
      prototype = PROTOTYPES[activePrototypeIndex];
      prototypeKey = prototype.key;
      bgMaterial.opacity = particleOpacityForPrototype(prototypeKey);
    }

    applyPrototypePose(prototype, elapsed);

    const bgCount = bgPositions.length / 3;
    const useHandPrototype = prototypeKey === "hand";
    const useBlackHolePrototype = prototypeKey === "blackhole";
    const useScreenInteraction = bgCount < (useHandPrototype ? HAND_INTERACTION_LIMIT : 140000);
    let matrix;
    let pointerScreenX = 0;
    let pointerScreenY = 0;
    let projectionScale = 0;
    let interactionRadiusSq = 0;

    if (useScreenInteraction) {
      bgSystem.updateMatrixWorld(true);
      matrix = bgSystem.matrixWorld.elements;
      pointerScreenX = ((pointer.x + 1) * width) / 2;
      pointerScreenY = ((1 - pointer.y) * height) / 2;
      projectionScale = 1 / Math.tan((bgCamera.fov * Math.PI) / 360);
      const interactionRadius = width < 700 ? (useHandPrototype ? 86 : 62) : width < 980 ? (useHandPrototype ? 104 : 75) : useHandPrototype ? 128 : 88;
      interactionRadiusSq = interactionRadius * interactionRadius;
    }

    const timeScale = time * 0.00018;
    const handTimeScale = time * 0.00042;
    const driftScale = useHandPrototype ? 0.46 : useBlackHolePrototype ? 0.62 : 1;
    const handFlex = useHandPrototype ? 0.18 + Math.sin(time * 0.0011) * 0.12 : 0;
    const scrollYShift = useHandPrototype ? -scrollDepth * 0.08 : -scrollDepth * 0.38;
    const scrollZShift = useHandPrototype ? scrollDepth * 0.14 : scrollDepth * 0.58;
    const springXY = useHandPrototype ? 0.038 : 0.058;
    const springZ = useHandPrototype ? 0.034 : 0.052;
    const dampingXY = useHandPrototype ? 0.72 : 0.66;
    const dampingZ = useHandPrototype ? 0.74 : 0.68;

    for (let index = 0; index < bgCount; index += 1) {
      const stride = index * 3;
      const handPulse = useHandPrototype ? Math.sin(handTimeScale + index * 0.019 + bgKinds[index] * 1.7) * 0.007 : 0;
      let targetX = bgTargets[stride] + Math.sin(timeScale + index * 0.013) * 0.024 * driftScale + handPulse;
      let targetY =
        bgTargets[stride + 1] +
        Math.cos(timeScale + index * 0.017) * 0.022 * driftScale +
        scrollYShift +
        (useHandPrototype ? Math.sin(handTimeScale * 0.8 + index * 0.011) * 0.005 : 0);
      let targetZ =
        bgTargets[stride + 2] +
        Math.cos(timeScale + index * 0.01) * 0.03 * driftScale +
        scrollZShift +
        (useHandPrototype ? Math.cos(handTimeScale * 1.1 + index * 0.017) * 0.008 : 0);

      if (useHandPrototype) {
        const handScale = prototypePlacement("hand").scale * HAND_TARGET_SCALE;
        const localX = bgTargets[stride] / handScale;
        const localY = bgTargets[stride + 1] / handScale;
        const fingerCurl = Math.max(0, Math.min(1, (localY - 0.18) / 1.18)) * handFlex;
        const detailBoost = bgKinds[index] === 4 ? 1.25 : bgKinds[index] === 2 ? 0.75 : 1;
        targetX += -localX * fingerCurl * 0.055 * detailBoost;
        targetY -= fingerCurl * 0.09 * detailBoost;
        targetZ -= fingerCurl * 0.24 * detailBoost;
      }

      let repelX = 0;
      let repelY = 0;
      let repelZ = 0;

      if (useScreenInteraction) {
        const px = bgPositions[stride];
        const py = bgPositions[stride + 1];
        const pz = bgPositions[stride + 2];
        const worldX = matrix[0] * px + matrix[4] * py + matrix[8] * pz + matrix[12];
        const worldY = matrix[1] * px + matrix[5] * py + matrix[9] * pz + matrix[13];
        const worldZ = matrix[2] * px + matrix[6] * py + matrix[10] * pz + matrix[14];
        const cameraDepth = Math.max(0.1, bgCamera.position.z - worldZ);
        const ndcX = (worldX * projectionScale) / (bgCamera.aspect * cameraDepth);
        const ndcY = (worldY * projectionScale) / cameraDepth;
        const screenX = ((ndcX + 1) * width) / 2;
        const screenY = ((1 - ndcY) * height) / 2;
        const screenDx = screenX - pointerScreenX;
        const screenDy = screenY - pointerScreenY;
        const distSq = screenDx * screenDx + screenDy * screenDy + 0.001;

        if (distSq < interactionRadiusSq) {
          const dist = Math.sqrt(distSq);
          const falloff = (1 - distSq / interactionRadiusSq) ** 1.55;
          const worldDirX = screenDx / dist;
          const worldDirY = -screenDy / dist;

          if (useBlackHolePrototype) {
            const tangentX = -worldDirY;
            const tangentY = worldDirX;
            const swirl = falloff * falloff * (width < 700 ? 0.18 : 0.34);
            const radial = falloff * 0.045;
            repelX = (matrix[0] * tangentX + matrix[1] * tangentY) * swirl + (matrix[0] * worldDirX + matrix[1] * worldDirY) * radial;
            repelY = (matrix[4] * tangentX + matrix[5] * tangentY) * swirl + (matrix[4] * worldDirX + matrix[5] * worldDirY) * radial;
            repelZ = (matrix[8] * tangentX + matrix[9] * tangentY) * swirl + (matrix[8] * worldDirX + matrix[9] * worldDirY) * radial;
          } else {
            const force = falloff * (width < 700 ? 0.34 : 0.48);
            repelX = (matrix[0] * worldDirX + matrix[1] * worldDirY) * force;
            repelY = (matrix[4] * worldDirX + matrix[5] * worldDirY) * force;
            repelZ = (matrix[8] * worldDirX + matrix[9] * worldDirY) * force;
          }
        }
      }

      bgVelocities[stride] += (targetX - bgPositions[stride]) * springXY + repelX;
      bgVelocities[stride + 1] += (targetY - bgPositions[stride + 1]) * springXY + repelY;
      bgVelocities[stride + 2] += (targetZ - bgPositions[stride + 2]) * springZ + repelZ;
      bgVelocities[stride] *= dampingXY;
      bgVelocities[stride + 1] *= dampingXY;
      bgVelocities[stride + 2] *= dampingZ;

      bgPositions[stride] += bgVelocities[stride];
      bgPositions[stride + 1] += bgVelocities[stride + 1];
      bgPositions[stride + 2] += bgVelocities[stride + 2];

      if (useHandPrototype) {
        const dx = bgPositions[stride] - targetX;
        const dy = bgPositions[stride + 1] - targetY;
        const dz = bgPositions[stride + 2] - targetZ;
        const distance = Math.hypot(dx, dy, dz);
        if (distance > MAX_HAND_DISPLACEMENT) {
          const clamp = MAX_HAND_DISPLACEMENT / distance;
          bgPositions[stride] = targetX + dx * clamp;
          bgPositions[stride + 1] = targetY + dy * clamp;
          bgPositions[stride + 2] = targetZ + dz * clamp;
          bgVelocities[stride] *= 0.35;
          bgVelocities[stride + 1] *= 0.35;
          bgVelocities[stride + 2] *= 0.35;
        }
      }
    }

    bgGeometry.attributes.position.needsUpdate = true;

    if (prototypeKey === "hand" || prototypeKey === "chip" || prototypeKey === "blackhole") updateBgColors();
    titlePointer.energy *= 0.96;
    if (titleMesh) updateTitleInstances(time);
  }

  bgRenderer.render(bgScene, bgCamera);
  if (titleRenderer && titleScene && titleCamera) {
    titleRenderer.render(titleScene, titleCamera);
  }
}

toneToggle?.addEventListener("click", () => {
  setTone(body.dataset.tone === "dark" ? "light" : "dark");
});

researchTimeline?.addEventListener("pointerover", (event) => {
  const item = event.target.closest("[data-slug]");
  if (item) setActiveProject(item.dataset.slug);
});

researchTimeline?.addEventListener("focusin", (event) => {
  const item = event.target.closest("[data-slug]");
  if (item) setActiveProject(item.dataset.slug);
});

researchTimeline?.addEventListener("click", (event) => {
  const item = event.target.closest("[data-slug]");
  if (!item) return;
  event.preventDefault();
  setActiveProject(item.dataset.slug);
});

projectWall?.addEventListener("pointerover", (event) => {
  const tile = event.target.closest("[data-slug]");
  if (tile) setActiveProject(tile.dataset.slug);
});

projectWall?.addEventListener("focusin", (event) => {
  const tile = event.target.closest("[data-slug]");
  if (tile) setActiveProject(tile.dataset.slug);
});

languageSelect?.addEventListener("change", (event) => {
  setLanguage(event.target.value);
});

paletteSelect?.addEventListener("change", (event) => {
  setPalette(event.target.value);
});

window.addEventListener("resize", resize);
window.addEventListener("pointermove", updatePointer);
soundToggle?.addEventListener("click", toggleAmbientMusic);
window.addEventListener("scroll", updateScrollDepth, { passive: true });
window.addEventListener("beforeunload", () => cancelAnimationFrame(animationFrame));
document.addEventListener("visibilitychange", () => {
  if (document.hidden) releaseAmbientMusic();
});
bgCanvas?.addEventListener("pointerleave", releaseAmbientMusic);
sheroStage?.addEventListener("pointerleave", releaseAmbientMusic);
titleWrap?.addEventListener("pointerenter", updateTitlePointer);
titleWrap?.addEventListener("pointermove", updateTitlePointer);
titleWrap?.addEventListener("pointerleave", releaseTitlePointer);

const urlParams = new URLSearchParams(window.location.search);

initializeContent();
setLanguage(localStorage.getItem("shero-language") || navigator.language || "en");
setPalette(urlParams.get("palette") || localStorage.getItem("shero-palette") || "blue");
setTone(localStorage.getItem("shero-tone") || "dark");
updateSoundLabel();

try {
  const fontReady = document.fonts?.ready || Promise.resolve();
  fontReady.then(() => {
    initBackground();
    if (titleCanvas) {
      initTitleScene();
    }
    updateScrollDepth();
    setTone(body.dataset.tone);
    animate();
  });
} catch (error) {
  console.error("Three.js shero scene failed to initialize", error);
}
