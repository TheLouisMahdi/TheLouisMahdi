export const PROFILE_SECTIONS=[
  ["Identity",[
    "English public name: Mahdi Ghahremani.",
    "Exact Persian name spelling: مهدی قهرمانی. When answering in Persian, always write the name exactly as مهدی قهرمانی.",
    "Public handles and aliases: TheLouisMahdi, Eka, poimu, Eka Francium.",
    "Communicates comfortably in Persian and English for technical work."
  ]],
  ["Education",[
    "Electrical Engineering student at the University of Zanjan.",
    "Relevant academic areas include microcontrollers, electronics, power-system analysis, industrial electronics, protection and relays, digital systems, embedded systems, computer vision, applied AI, and FPGA design.",
    "A recurring academic interest is connecting electrical-engineering problems with software, embedded computing, digital hardware, and data-driven methods."
  ]],
  ["Programming and software",[
    "Uses Python for AI, computer vision, data processing, automation, model evaluation, scripting, and engineering utilities.",
    "Uses C and C++ for embedded firmware, Linux applications, hardware-facing software, cross-compiled ARM programs, and test systems.",
    "Uses JavaScript, HTML, and CSS for browser tools, interactive engineering demos, dashboards, and the public Windows-style portfolio.",
    "Uses Git and GitHub for source control, branches, pull requests, CI workflows, releases, and project documentation.",
    "Uses Windows PowerShell and Debian/WSL regularly for development, build automation, cross-compilation, scripting, and diagnostics."
  ]],
  ["AI and computer vision stack",[
    "Has worked with OpenCV, TensorFlow/TFLite, scikit-learn, NumPy-style data processing, image preprocessing, classification, model evaluation, and lightweight inference.",
    "Computer-vision work focuses on practical pipelines: camera/video input, face or ROI detection, grayscale/resize preprocessing, feature or CNN inference, metrics, logging, and final decision logic.",
    "Prefers models small enough to be measured, validated, exported, and integrated with embedded or FPGA systems rather than treating AI as an isolated black box."
  ]],
  ["FPGA and digital hardware stack",[
    "Works with Verilog and SystemVerilog, RTL modules, finite-state control, RAM/ROM blocks, testbenches, waveform-based debugging, simulation, synthesis-oriented design, and hardware/software partitioning.",
    "Has used FPGA toolchains including Vivado/Vitis, ModelSim-style simulation flows, and Quartus for different FPGA targets.",
    "Hardware platforms used across projects include Zynq-7000/XC7Z020-class boards and Cyclone IV-class FPGA hardware.",
    "Typical accelerator topics include convolution/MAC datapaths, ReLU, pooling, GAP/dense stages, INT8-style arithmetic, BRAM-based buffering, address generation, register interfaces, and verification against software golden models."
  ]],
  ["Microcontrollers and embedded tools",[
    "Works with STM32 microcontrollers including STM32F1-class and STM32H7-class devices, plus ESP32/Arduino-style embedded environments when appropriate.",
    "Has used STM32CubeIDE, AVR-oriented tooling, Proteus simulation, hardware debugging, GPIO, DAC/ADC-style interfaces, timers, digital I/O, serial communication, and low-level board integration.",
    "Prefers preserving known-good hardware behavior and changing mappings or low-level code only when tests, schematics, or physical measurements justify the change."
  ]],
  ["Current engineering project: ARM + FPGA fatigue monitoring",[
    "Senior-project direction: a hybrid fatigue-monitoring system on a Zynq-7000 XC7Z020-class SoC, splitting work between ARM Cortex-A9 processing system and FPGA programmable logic.",
    "The ARM/PS side is responsible for camera/video handling, face/ROI extraction, temporal metrics, logging, decision logic, and accelerator host control.",
    "The PL side is intended to accelerate a compact quantized CNN-style eye/mouth classifier using 32x32 grayscale ROIs and INT8-oriented hardware.",
    "The evolving PL architecture includes convolution, ReLU, pooling, global-average-pooling/dense-style stages, shared ROI memory, weight memory, MAC datapaths, requantization, status/error registers, and a PS-to-PL control interface.",
    "A major validation priority is hardware-free end-to-end simulation: real ROIs are exported by the software pipeline, converted to FPGA simulation stimulus, run through the RTL accelerator, and the simulated logits are fed back into software decision logic.",
    "The project emphasizes software/RTL agreement, deterministic interfaces, explicit PS/PL boundaries, and testbench/golden-model comparison before depending on physical hardware."
  ]],
  ["Public project: FPGA CNN Fatigue Monitoring",[
    "A public Python + FPGA co-processing prototype for fatigue monitoring.",
    "Python handles camera/OpenCV processing, facial landmark work, eye and mouth ROI extraction, fatigue metrics, logging, golden-reference verification, and final decision logic.",
    "The FPGA side accelerates CNN-style feature extraction from 32x32 grayscale left-eye, right-eye, and mouth ROIs using Verilog RTL and simulation-based verification.",
    "The project is explicitly a hardware-software co-design prototype; it does not claim that the entire fatigue system or a full trainable CNN runs on FPGA, and it is not a medical diagnosis system.",
    "Public repository: TheLouisMahdi/fpga-cnn-fatigue-monitoring."
  ]],
  ["Embedded Linux tester experience",[
    "Has worked on C++ software for an ARM 32-bit embedded-Linux test platform used to exercise electrical protection equipment such as recloser/sectionalizer-class devices.",
    "The work involves scenario-driven signal generation and response checking, GPIO and DAC-facing logic, digital input/output handling, timing, cross-compilation from Debian/WSL, transfer to the target board, and physical validation with measurement equipment.",
    "For this class of project, the known working hardware code is treated as the primary source of truth; schematics and pin documents support interpretation, and low-level mappings are not changed casually.",
    "Internal pin mappings, company-specific source details, credentials, and private hardware identifiers are intentionally not public profile knowledge."
  ]],
  ["Firmware build automation experience",[
    "Has worked on STM32 firmware build/release automation, including configuration variants, preprocessor-symbol handling, build validation, HEX/BIN processing, CRC-related packaging, merge guards, version metadata, and GUI/CLI workflow improvements.",
    "A public repository named bwbuilder is associated with firmware build automation work; avoid inventing company-confidential details that are not present in public data.",
    "The general engineering goal is to make build/release steps deterministic, visible, recoverable, and difficult to misuse."
  ]],
  ["Technical analysis and tooling interests",[
    "Builds practical diagnostic utilities such as firmware/HEX inspection ideas, system-inspection tools, proxy/network utilities, local converters, and engineering automation scripts.",
    "Enjoys understanding binary formats, memory maps, peripheral mappings, generated artifacts, build outputs, and the boundary between source code and what actually runs on hardware.",
    "Often prefers a small command-line or local tool that produces a clear report over a heavyweight framework when the simpler tool is easier to verify."
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
    "It combines structural breakout/breakdown analysis, separate long/short predictive models, adaptive risk controls, forecast tracking, walk-forward-oriented evaluation ideas, event-based modeling, and auditable outcome records.",
    "Research interests around the project include event models, MFE/MAE, aggregated trade/order-flow data, volume and imbalance features, and avoiding leakage through chronological validation.",
    "It is paper trading and research only; it does not place live orders and does not claim guaranteed profitability.",
    "Public repository: TheLouisMahdi/btc-hourly-forecast."
  ]],
  ["Public project: NPVT Terminal Converter",[
    "A local-first, browser-only converter between NPV Tunnel NPVT1 containers, V2Ray-style share links, and Xray/V2Ray JSON profiles.",
    "Parsing, decoding, mapping, JSON generation, NPVT building, and file output happen locally in the browser without a backend upload service.",
    "Public repository: TheLouisMahdi/npvt-terminal-converter."
  ]],
  ["Other public repositories",[
    "Other public repositories visible on GitHub include proxy-speed-tester, louis-mahdi-system-inspector, LizardSpace, Senvra, bwbuilder, and the interactive TheLouisMahdi profile repository.",
    "Do not invent a purpose or implementation detail for a repository unless that detail is present in verified profile data supplied here or in later extensions."
  ]],
  ["Engineering method and preferences",[
    "Starts from the real physical or technical constraint, builds the smallest testable version, measures failures instead of guessing, and iterates until behavior is repeatable.",
    "Enjoys crossing layers: a problem may start as an image, signal, algorithm, circuit, firmware constraint, or hardware interface and end as software, RTL, a test workflow, or a complete tool.",
    "Values practical learning through building, simulation, logs, measurements, debugging, edge cases, testbenches, and incremental refinement.",
    "Usually prefers architecture-first explanations with explicit hardware/software responsibilities, concrete data flow, test scenarios, and a clear next step.",
    "For existing hardware-tested code, prefers minimal-risk changes and preserving the original structure unless there is strong evidence that a change is necessary.",
    "For FPGA work, prefers simulation and golden-reference validation before moving to physical board integration.",
    "For automation and tools, prefers simple reproducible workflows, explicit failure states, and logs that make later continuation possible."
  ]],
  ["Contact",[
    "GitHub: TheLouisMahdi.",
    "Telegram: @thelouis_mahdi."
  ]]
];

// Future verified public facts can be added here without rewriting the Worker.
// Keep private/security-sensitive information out of this public data layer.
export const PROFILE_EXTENSIONS=[];

export function profileContext(){
  const sections=PROFILE_SECTIONS.map(([title,facts])=>`[${title}]\n${facts.map(fact=>`- ${fact}`).join("\n")}`);
  if(PROFILE_EXTENSIONS.length)sections.push(`[Additional verified facts]\n${PROFILE_EXTENSIONS.map(fact=>`- ${fact}`).join("\n")}`);
  return sections.join("\n\n");
}
