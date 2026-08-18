const PROFILE_HTML=`
  <div class="liquid-ambient" aria-hidden="true">
    <i class="liquid-orb liquid-orb-a"></i><i class="liquid-orb liquid-orb-b"></i><i class="liquid-orb liquid-orb-c"></i>
    <i class="liquid-grid"></i><i class="liquid-pointer-glow"></i>
  </div>

  <nav class="liquid-nav liquid-glass" aria-label="Portfolio sections">
    <a class="liquid-brand" href="#about"><span class="liquid-brand-mark">M</span><span>Mahdi Ghahremani</span></a>
    <div class="liquid-nav-links">
      <a href="#story">Story</a><a href="#work">Work</a><a href="#stack">Stack</a><a href="#contact">Contact</a>
    </div>
    <a class="liquid-nav-cta" href="https://github.com/TheLouisMahdi" target="_blank" rel="noreferrer">GitHub ↗</a>
  </nav>

  <header class="liquid-hero" id="story">
    <div class="liquid-hero-copy liquid-reveal">
      <div class="liquid-eyebrow"><span class="liquid-live-dot"></span> Electrical Engineering · AI · Embedded · FPGA</div>
      <h1>I build systems where <em>software thinks</em> and <em>hardware acts.</em></h1>
      <p class="liquid-lead">I’m Mahdi Ghahremani — <strong>TheLouisMahdi</strong> online — an Electrical Engineering student at the University of Zanjan working across computer vision, applied AI, embedded systems, digital hardware and practical engineering tools.</p>
      <div class="liquid-actions">
        <a class="liquid-button liquid-button-primary" href="#work">Explore selected work <span>↓</span></a>
        <a class="liquid-button" href="https://t.me/thelouis_mahdi" target="_blank" rel="noreferrer">Telegram ↗</a>
      </div>
      <div class="liquid-microline"><span>Engineer</span><i></i><span>Builder</span><i></i><span>Experimenter</span><i></i><span>Always learning</span></div>
    </div>

    <aside class="liquid-identity liquid-glass liquid-reveal" data-tilt>
      <div class="liquid-card-glare"></div>
      <div class="liquid-identity-top"><span class="liquid-avatar">MG</span><span class="liquid-status"><b>Current focus</b><small>Hardware × AI co-design</small></span></div>
      <div class="liquid-signal"><span></span><span></span><span></span><span></span><span></span></div>
      <div class="liquid-facts">
        <div><small>Field</small><strong>Electrical Engineering</strong></div>
        <div><small>University</small><strong>University of Zanjan</strong></div>
        <div><small>Alias</small><strong>TheLouisMahdi</strong></div>
      </div>
      <div class="liquid-terminal"><span>eka@portfolio:~$</span> build --useful --experimental<span class="liquid-caret">_</span></div>
    </aside>
  </header>

  <section class="liquid-marquee" aria-label="Focus areas">
    <div><span>Computer Vision</span><i>✦</i><span>Applied AI</span><i>✦</i><span>FPGA / Verilog</span><i>✦</i><span>Embedded Systems</span><i>✦</i><span>Hardware–Software Co-design</span><i>✦</i><span>Engineering Automation</span><i>✦</i></div>
    <div aria-hidden="true"><span>Computer Vision</span><i>✦</i><span>Applied AI</span><i>✦</i><span>FPGA / Verilog</span><i>✦</i><span>Embedded Systems</span><i>✦</i><span>Hardware–Software Co-design</span><i>✦</i><span>Engineering Automation</span><i>✦</i></div>
  </section>

  <section class="liquid-section liquid-about liquid-reveal">
    <div class="liquid-section-kicker">01 · Biography</div>
    <div class="liquid-about-grid">
      <h2>I like turning complicated technical problems into systems that actually work.</h2>
      <div class="liquid-prose">
        <p>My work lives between engineering disciplines. I can be training or evaluating a vision model, writing Python or C/C++, debugging an embedded target, designing RTL, verifying a hardware block, or building a tool that makes an engineering workflow less painful.</p>
        <p>I’m most interested in projects where the boundary between software and hardware matters: intelligent monitoring, edge AI, digital systems, automation and tools built for real constraints rather than demos that only work once.</p>
        <p>I tend to learn by building. The process I enjoy most is taking an uncertain idea, breaking it into testable pieces, finding what fails, and iterating until the whole system becomes dependable.</p>
      </div>
    </div>
  </section>

  <section class="liquid-section" id="work">
    <div class="liquid-section-head liquid-reveal"><div><div class="liquid-section-kicker">02 · Selected work</div><h2>Projects with a point of view.</h2></div><p>Small utilities, engineering tools and hardware/software experiments — selected for the way they solve a real problem.</p></div>
    <div class="liquid-project-grid">
      <a class="liquid-project liquid-project-featured liquid-glass liquid-reveal" data-tilt href="https://github.com/TheLouisMahdi/fpga-cnn-fatigue-monitoring" target="_blank" rel="noreferrer">
        <div class="liquid-card-glare"></div><span class="liquid-project-index">01</span><span class="liquid-project-type">AI × FPGA</span>
        <h3>FPGA CNN Fatigue Monitoring</h3><p>A Python + FPGA co-processing prototype that connects camera-based fatigue monitoring with Verilog RTL acceleration and simulation-driven verification.</p>
        <div class="liquid-tags"><span>Computer Vision</span><span>Python</span><span>Verilog</span><span>FPGA</span></div><b class="liquid-project-arrow">↗</b>
      </a>
      <a class="liquid-project liquid-glass liquid-reveal" data-tilt href="https://github.com/TheLouisMahdi/npvt-terminal-converter" target="_blank" rel="noreferrer"><div class="liquid-card-glare"></div><span class="liquid-project-index">02</span><span class="liquid-project-type">Local-first tool</span><h3>NPVT Terminal Converter</h3><p>Browser-side conversion between NPVT containers, links and Xray/V2Ray JSON profiles.</p><div class="liquid-tags"><span>Web</span><span>Local-first</span></div><b class="liquid-project-arrow">↗</b></a>
      <a class="liquid-project liquid-glass liquid-reveal" data-tilt href="https://github.com/TheLouisMahdi/lights-out-gf2-solver" target="_blank" rel="noreferrer"><div class="liquid-card-glare"></div><span class="liquid-project-index">03</span><span class="liquid-project-type">Algorithms</span><h3>Lights Out GF(2) Solver</h3><p>An offline puzzle engine using linear algebra over GF(2), custom boards and automatic solving.</p><div class="liquid-tags"><span>Linear Algebra</span><span>Solver</span></div><b class="liquid-project-arrow">↗</b></a>
      <a class="liquid-project liquid-glass liquid-reveal" data-tilt href="https://github.com/TheLouisMahdi/VideoX_Compressor" target="_blank" rel="noreferrer"><div class="liquid-card-glare"></div><span class="liquid-project-index">04</span><span class="liquid-project-type">Windows utility</span><h3>VideoX Compressor</h3><p>An FFmpeg-based compression tool with NVIDIA, Intel, AMD and CPU processing paths.</p><div class="liquid-tags"><span>FFmpeg</span><span>Windows</span></div><b class="liquid-project-arrow">↗</b></a>
      <a class="liquid-project liquid-glass liquid-reveal" data-tilt href="https://github.com/TheLouisMahdi/proxy-speed-tester" target="_blank" rel="noreferrer"><div class="liquid-card-glare"></div><span class="liquid-project-index">05</span><span class="liquid-project-type">Networking</span><h3>Proxy Speed Tester</h3><p>A Python HTTP CONNECT validator for authorized latency and HTTPS transfer-speed testing.</p><div class="liquid-tags"><span>Python</span><span>Networking</span></div><b class="liquid-project-arrow">↗</b></a>
    </div>
  </section>

  <section class="liquid-section" id="stack">
    <div class="liquid-section-head liquid-reveal"><div><div class="liquid-section-kicker">03 · Technical landscape</div><h2>From signals to systems.</h2></div><p>I prefer a broad toolkit when a problem crosses layers. The goal is not collecting technologies — it is choosing the right layer to solve the problem.</p></div>
    <div class="liquid-capability-grid">
      <article class="liquid-capability liquid-glass liquid-reveal" data-tilt><div class="liquid-card-glare"></div><span>01</span><h3>AI & Vision</h3><p>Computer vision pipelines, classification, model evaluation, image processing and practical inference workflows.</p><div class="liquid-tags"><span>Python</span><span>OpenCV</span><span>TensorFlow</span><span>scikit-learn</span></div></article>
      <article class="liquid-capability liquid-glass liquid-reveal" data-tilt><div class="liquid-card-glare"></div><span>02</span><h3>Embedded</h3><p>Microcontrollers, low-level interfaces, test logic, firmware workflows and hardware-facing C/C++.</p><div class="liquid-tags"><span>C/C++</span><span>STM32</span><span>ESP32</span><span>Linux</span></div></article>
      <article class="liquid-capability liquid-glass liquid-reveal" data-tilt><div class="liquid-card-glare"></div><span>03</span><h3>Digital Hardware</h3><p>RTL design, FPGA architecture, testbenches, simulation and accelerator-oriented hardware/software partitioning.</p><div class="liquid-tags"><span>Verilog</span><span>FPGA</span><span>Vivado</span><span>ModelSim</span></div></article>
      <article class="liquid-capability liquid-glass liquid-reveal" data-tilt><div class="liquid-card-glare"></div><span>04</span><h3>Engineering Tools</h3><p>Automation, local-first utilities, debugging workflows, validation and technical documentation.</p><div class="liquid-tags"><span>Git</span><span>JavaScript</span><span>HTML/CSS</span><span>Proteus</span></div></article>
    </div>
  </section>

  <section class="liquid-section liquid-path">
    <div class="liquid-section-kicker liquid-reveal">04 · How I work</div>
    <div class="liquid-path-line">
      <article class="liquid-reveal"><span>Discover</span><h3>Understand the real constraint.</h3><p>I start by separating the actual engineering problem from symptoms and assumptions.</p></article>
      <article class="liquid-reveal"><span>Prototype</span><h3>Make the idea testable early.</h3><p>I prefer a measurable prototype over a perfect diagram that has never touched reality.</p></article>
      <article class="liquid-reveal"><span>Verify</span><h3>Break it before it matters.</h3><p>Simulation, logs, edge cases and repeatable tests turn a promising build into a dependable one.</p></article>
      <article class="liquid-reveal"><span>Refine</span><h3>Remove unnecessary complexity.</h3><p>The final system should be easier to understand, operate and continue developing.</p></article>
    </div>
  </section>

  <section class="liquid-section liquid-contact liquid-glass liquid-reveal" id="contact" data-tilt>
    <div class="liquid-card-glare"></div>
    <div><div class="liquid-section-kicker">05 · Contact</div><h2>Have a technical idea worth building?</h2><p>GitHub is where I publish work. Telegram is where I’m reachable socially.</p></div>
    <div class="liquid-contact-actions"><a class="liquid-button liquid-button-primary" href="https://github.com/TheLouisMahdi" target="_blank" rel="noreferrer">TheLouisMahdi on GitHub ↗</a><a class="liquid-button" href="https://t.me/thelouis_mahdi" target="_blank" rel="noreferrer">@thelouis_mahdi ↗</a></div>
  </section>

  <footer class="liquid-footer"><span>Mahdi Ghahremani · TheLouisMahdi</span><span>Engineering × Software × AI × Hardware</span><button type="button" data-liquid-top>Back to top ↑</button></footer>
`

function loadLiquidStyles(){
  if(document.querySelector('link[data-liquid-portfolio]'))return
  const link=document.createElement("link")
  link.rel="stylesheet"
  link.href="css/portfolio-liquid.css"
  link.dataset.liquidPortfolio=""
  document.head.appendChild(link)
}

function mountBiography(){
  const root=document.getElementById("about")
  if(!root||root.dataset.liquidMounted)return null
  root.dataset.liquidMounted="true"
  root.className="readme portfolio-liquid"
  root.innerHTML=PROFILE_HTML
  return root
}

function setupReveal(root){
  const nodes=[...root.querySelectorAll(".liquid-reveal")]
  if(!("IntersectionObserver"in window)){nodes.forEach(node=>node.classList.add("is-visible"));return}
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:"0px 0px -6%"})
  nodes.forEach(node=>observer.observe(node))
}

function setupPointer(root){
  if(matchMedia("(pointer: coarse)").matches||matchMedia("(prefers-reduced-motion: reduce)").matches)return
  let frame=0,lastEvent=null
  root.addEventListener("pointermove",event=>{
    lastEvent=event
    if(frame)return
    frame=requestAnimationFrame(()=>{
      frame=0
      const rect=root.getBoundingClientRect()
      const x=lastEvent.clientX-rect.left,y=lastEvent.clientY-rect.top
      root.style.setProperty("--mouse-x",`${x}px`)
      root.style.setProperty("--mouse-y",`${y}px`)
    })
  },{passive:true})

  root.querySelectorAll("[data-tilt]").forEach(card=>{
    const glare=card.querySelector(".liquid-card-glare")
    card.addEventListener("pointermove",event=>{
      const rect=card.getBoundingClientRect(),px=(event.clientX-rect.left)/rect.width,py=(event.clientY-rect.top)/rect.height
      card.style.setProperty("--rx",`${(0.5-py)*6}deg`)
      card.style.setProperty("--ry",`${(px-0.5)*7}deg`)
      card.style.setProperty("--gx",`${px*100}%`)
      card.style.setProperty("--gy",`${py*100}%`)
      glare?.style.setProperty("opacity","1")
    },{passive:true})
    card.addEventListener("pointerleave",()=>{card.style.setProperty("--rx","0deg");card.style.setProperty("--ry","0deg");glare?.style.removeProperty("opacity")},{passive:true})
  })
}

function setupNavigation(root){
  root.querySelector("[data-liquid-top]")?.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}))
  root.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener("click",event=>{
    const target=document.querySelector(link.getAttribute("href"))
    if(!target)return
    event.preventDefault()
    target.scrollIntoView({behavior:"smooth",block:"start"})
  }))
}

export function initLiquidBiography(){
  loadLiquidStyles()
  const root=mountBiography()
  if(!root)return
  setupReveal(root)
  setupPointer(root)
  setupNavigation(root)
}
