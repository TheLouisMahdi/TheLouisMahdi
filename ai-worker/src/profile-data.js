export const PROFILE_SECTIONS=[
  ["Identity",[
    "English public name: Mahdi Ghahremani.",
    "Exact Persian name spelling: مهدی قهرمانی. When answering in Persian, always write the name exactly as مهدی قهرمانی.",
    "Public handles and aliases: TheLouisMahdi, Eka, poimu, Eka Francium."
  ]],
  ["Education",[
    "Electrical Engineering student at the University of Zanjan.",
    "Academic and engineering interests connect electronics, digital systems, embedded systems, computer vision, applied AI, FPGA design, and hardware-software co-design."
  ]],
  ["Technical focus",[
    "Computer vision and applied AI: image processing, classification, model evaluation, lightweight inference, and vision systems connected to real hardware.",
    "Embedded systems: C/C++, Linux, STM32, hardware interfaces, data acquisition, test logic, and hardware/software integration.",
    "Digital hardware: FPGA architecture, Verilog RTL, testbenches, simulation, verification, and accelerator-oriented design.",
    "Engineering automation: repeatable build/test workflows, diagnostics, validation, scripting, and tooling that connects software with hardware."
  ]],
  ["Tools and technologies",[
    "Frequently used technologies include Python, C/C++, Verilog, JavaScript, HTML/CSS, Linux, Windows, Git, GitHub Actions, OpenCV, MediaPipe, ModelSim, FFmpeg, STM32, Arduino, and ESP32.",
    "The common pattern is practical integration rather than isolated technology demos: vision plus FPGA, desktop software plus FFmpeg, browser tools plus local parsing, and automation around real engineering workflows."
  ]],
  ["Public project: FPGA CNN Fatigue Monitoring",[
    "A Python + FPGA co-processing prototype for fatigue monitoring.",
    "Python handles camera/OpenCV processing, facial landmark work, eye and mouth ROI extraction, fatigue metrics, logging, golden-reference verification, and final decision logic.",
    "The FPGA side accelerates CNN-style feature extraction from 32x32 grayscale left-eye, right-eye, and mouth ROIs using Verilog RTL and ModelSim verification.",
    "The project is explicitly a hardware-software co-design prototype; it does not claim that the entire fatigue system or a full trainable CNN runs on FPGA, and it is not a medical diagnosis system.",
    "Public repository: TheLouisMahdi/fpga-cnn-fatigue-monitoring."
  ]],
  ["Public project: VideoX Compressor",[
    "A Windows GUI video-compression tool built around FFmpeg/FFprobe.",
    "It targets recorded classes, tutorials, screen recordings, meetings, slide-based educational videos, and other low-motion material.",
    "It can use NVIDIA NVENC, Intel Quick Sync, AMD AMF, or CPU fallback depending on the system, with Simple and Advanced modes, output validation, diagnostic reports, no-upscale protection, and a device-ID based activation flow.",
    "Public repository: TheLouisMahdi/VideoX_Compressor."
  ]],
  ["Public project: Lights Out GF(2) Solver",[
    "An offline browser-based Lights Out puzzle engine, custom map builder, solvability checker, and automatic solver.",
    "The solver models the puzzle as linear algebra over GF(2) and uses Gaussian elimination with BigInt bitset/XOR operations.",
    "The project grew from a Linear Algebra course assignment into a fuller offline tool supporting custom boards and larger board sizes.",
    "Public repository: TheLouisMahdi/lights-out-gf2-solver."
  ]],
  ["Public project: BTC Adaptive Directional Breakout Trader",[
    "A research-oriented Bitcoin market-intelligence and paper-trading platform operating around completed one-hour candles.",
    "It combines structural breakout/breakdown analysis, separate long/short predictive models, adaptive risk controls, forecast tracking, and auditable outcome records.",
    "It is paper trading and research only; it does not place live orders and does not claim guaranteed profitability.",
    "Public repository: TheLouisMahdi/btc-hourly-forecast."
  ]],
  ["Public project: NPVT Terminal Converter",[
    "A local-first, browser-only converter between NPV Tunnel NPVT1 containers, V2Ray-style share links, and Xray/V2Ray JSON profiles.",
    "Parsing, decoding, mapping, JSON generation, NPVT building, and file output happen locally in the browser without a backend upload service.",
    "Public repository: TheLouisMahdi/npvt-terminal-converter."
  ]],
  ["Other public repositories",[
    "Other public repositories visible on GitHub include proxy-speed-tester, louis-mahdi-system-inspector, Senvra, bwbuilder, and the interactive TheLouisMahdi profile repository.",
    "Do not invent a purpose or implementation detail for these repositories unless that detail is present in verified profile data supplied later."
  ]],
  ["Working style",[
    "Starts from the real physical or technical constraint, builds the smallest testable version, measures failures instead of guessing, and iterates until behavior is repeatable.",
    "Enjoys crossing layers: a problem may start as an image, signal, algorithm, circuit, or hardware constraint and end as software, RTL, a test workflow, or a complete tool.",
    "Values practical learning through building, simulation, logs, measurements, debugging, edge cases, and incremental refinement."
  ]],
  ["Contact",[
    "GitHub: TheLouisMahdi.",
    "Telegram: @thelouis_mahdi."
  ]]
];

// Add future verified public facts as plain strings here. They are appended to the
// structured profile context without changing the assistant logic.
export const PROFILE_EXTENSIONS=[];

export function profileContext(){
  const sections=PROFILE_SECTIONS.map(([title,facts])=>`[${title}]\n${facts.map(fact=>`- ${fact}`).join("\n")}`);
  if(PROFILE_EXTENSIONS.length)sections.push(`[Additional verified facts]\n${PROFILE_EXTENSIONS.map(fact=>`- ${fact}`).join("\n")}`);
  return sections.join("\n\n");
}
