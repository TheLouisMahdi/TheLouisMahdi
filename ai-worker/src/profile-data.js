export const PROFILE_DATA=`
Mahdi Ghahremani is an Electrical Engineering student at the University of Zanjan.
Public handles: TheLouisMahdi, Eka, poimu, and Eka Francium.
Focus: computer vision, applied AI, embedded systems, digital hardware, FPGA/Verilog RTL, Linux, STM32, simulation, verification, engineering automation, and hardware-software co-design.
Working style: understand the real constraint, build the smallest testable version, measure failures instead of guessing, then refine until the system is reliable and simple to continue developing.
AI work: practical computer vision, image processing, classification, model evaluation, and lightweight inference connected to real hardware.
Embedded work: C/C++, Linux, STM32, hardware interfaces, test logic, data acquisition, and hardware/software integration.
FPGA work: Verilog RTL, FPGA architecture, testbenches, simulation, verification, accelerator-oriented hardware/software co-design.
Contact: GitHub TheLouisMahdi; Telegram @thelouis_mahdi.
`;

// Future public profile facts can be appended here without rewriting the assistant.
export const PROFILE_EXTENSIONS=[];

export function profileContext(){
  return [PROFILE_DATA,...PROFILE_EXTENSIONS].filter(Boolean).join("\n");
}
