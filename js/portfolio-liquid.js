const PROFILE_HTML=`
  <div class="ps-stage">
    <a class="ps-github" href="https://github.com/TheLouisMahdi" target="_blank" rel="noreferrer" aria-label="GitHub profile">
      <img src="https://avatars.githubusercontent.com/u/284312505?v=4" alt="GitHub profile">
    </a>

    <section class="ps-window" aria-label="Windows PowerShell biography">
      <header class="ps-titlebar">
        <span class="ps-icon">›_</span><span>Windows PowerShell</span>
        <div class="ps-controls" aria-hidden="true"><i>—</i><i>□</i><i class="ps-close">×</i></div>
      </header>

      <div class="ps-console">
        <p class="ps-banner">Windows PowerShell<br>Copyright (C) Microsoft Corporation. All rights reserved.</p>

        <div class="ps-entry ps-reveal"><p><b>PS C:\&gt;</b> Get-Identity</p><div class="ps-output">Electrical Engineering student at the University of Zanjan.<br>Working across computer vision, applied AI, embedded systems, digital hardware, and hardware-software co-design.</div></div>

        <div class="ps-entry ps-reveal"><p><b>PS C:\&gt;</b> Get-Story</p><div class="ps-output">I like problems that cross layers. A project may begin as an image, a signal, or a hardware constraint and end as code, RTL, a test workflow, or a complete tool. The interesting part is connecting those layers until the system behaves as one thing.</div></div>

        <div class="ps-entry ps-reveal"><p><b>PS C:\&gt;</b> Get-Focus</p><div class="ps-output"><span class="ps-key">Computer Vision</span>  Image processing, model evaluation, intelligent monitoring<br><span class="ps-key">Embedded</span>         C/C++, Linux, STM32, hardware-facing software<br><span class="ps-key">Digital Hardware</span> Verilog, FPGA architecture, simulation and verification<br><span class="ps-key">Engineering</span>      Automation, debugging, validation and practical tooling</div></div>

        <div class="ps-entry ps-reveal"><p><b>PS C:\&gt;</b> Get-Method</p><div class="ps-output">Understand the real constraint.<br>Build the smallest version that can be tested.<br>Measure what fails instead of guessing.<br>Refine until the solution is simpler than the problem looked at first.</div></div>

        <div class="ps-entry ps-reveal"><p><b>PS C:\&gt;</b> Get-Reason</p><div class="ps-output">I learn by building. The part I enjoy most is the stretch between “this should work” and “this works repeatedly.” That usually means simulation, logs, edge cases, failed attempts, and one more iteration.</div></div>

        <div class="ps-entry ps-reveal"><p><b>PS C:\&gt;</b> Get-Contact</p><div class="ps-output"><a href="https://github.com/TheLouisMahdi" target="_blank" rel="noreferrer">GitHub   : TheLouisMahdi</a><br><a href="https://t.me/thelouis_mahdi" target="_blank" rel="noreferrer">Telegram : @thelouis_mahdi</a></div></div>

        <div class="ps-entry ps-signature ps-reveal"><p><b>PS C:\&gt;</b> whoami</p><div class="ps-output"><strong>Mahdi Ghahremani</strong><br>TheLouisMahdi / Eka<br><span>Engineering × Software × AI × Hardware</span></div></div>

        <p class="ps-prompt"><b>PS C:\&gt;</b> <span class="ps-caret">_</span></p>
      </div>
    </section>
  </div>`

function loadStyles(){
  if(document.querySelector('link[data-liquid-portfolio]'))return
  const link=document.createElement("link")
  link.rel="stylesheet";link.href="css/portfolio-liquid.css";link.dataset.liquidPortfolio=""
  document.head.appendChild(link)
}

function reveal(root){
  const nodes=[...root.querySelectorAll(".ps-reveal")]
  if(!("IntersectionObserver"in window)){nodes.forEach(node=>node.classList.add("is-visible"));return}
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target)}}),{threshold:.15})
  nodes.forEach(node=>observer.observe(node))
}

function followPointer(root){
  if(matchMedia("(pointer: coarse)").matches)return
  root.addEventListener("pointermove",event=>{
    const box=root.getBoundingClientRect()
    root.style.setProperty("--mx",`${event.clientX-box.left}px`)
    root.style.setProperty("--my",`${event.clientY-box.top}px`)
  },{passive:true})
}

export function initLiquidBiography(){
  loadStyles()
  const root=document.getElementById("about")
  if(!root||root.dataset.liquidMounted)return
  root.dataset.liquidMounted="true";root.className="readme portfolio-liquid";root.innerHTML=PROFILE_HTML
  reveal(root);followPointer(root)
}
