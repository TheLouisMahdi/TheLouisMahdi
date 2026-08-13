import{requestElevation}from"./uac.js"

const toolButton=name=>`<button data-generic-app="${name}">${name}</button>`

const emptyState=(title,text)=>`<h3>${title}</h3><section class="setting-hero"><span>ⓘ</span><div><h3>${title}</h3><p>${text}</p></div></section>`

export function supplementalControlPages(icon){
  return{
    "administrative-tools":`<h3>Administrative Tools</h3><p>Use these tools to configure and monitor Windows.</p><div class="admin-tools">${["Computer Management","Component Services","Data Sources (ODBC)","Event Viewer","Local Security Policy","Performance Monitor","Print Management","Services","System Configuration","Task Scheduler","Windows Firewall with Advanced Security","Windows Memory Diagnostic"].map(toolButton).join("")}</div>`,
    biometric:emptyState("Biometric Devices","Windows did not find any biometric devices on this computer."),
    bitlocker:emptyState("BitLocker Drive Encryption","BitLocker drive management is not included in Windows 7 Professional. Upgrade to Enterprise or Ultimate to use BitLocker."),
    "color-management":`<h3>Color Management</h3><div class="property-tabs">Devices · All Profiles · Advanced</div><label>Device <select><option>Display: EKA Generic PnP Monitor</option><option>EKA Profile Printer</option></select></label><p>No custom ICC profiles are associated with this device.</p><button data-control-action="add-profile">Add...</button><button data-control-action="save-setting">Close</button>`,
    "credential-manager":`<h3>Credential Manager</h3><div class="property-tabs">Windows Credentials · Certificate-Based Credentials · Generic Credentials</div><section class="setting-hero"><span>${icon("system")}</span><div><h3>No Windows credentials</h3><p>No network passwords are stored in this local browser session.</p></div></section><button data-control-action="add-credential">Add a Windows credential</button>`,
    "device-manager":`<h3>Device Manager</h3><p>View and manage the hardware installed on EKA-PC.</p><button data-generic-app="Device Manager">Open Device Manager</button>`,
    "windows-features":`<h3>Turn Windows features on or off</h3><p>To turn a feature on, select its check box. A filled box means that only part of the feature is enabled.</p><div class="feature-tree">${[["games","Games",true],["ie","Internet Explorer 8",true],["iis","Internet Information Services",false],["media","Media Features",true],["net","Microsoft .NET Framework 3.5.1",true],["print","Print and Document Services",true],["tablet","Tablet PC Components",true],["telnet","Telnet Client",false],["gadget","Windows Gadget Platform",true],["search","Windows Search",true],["xps","XPS Services",true],["viewer","XPS Viewer",true]].map(([id,name,on])=>`<label><input data-feature="${id}" type="checkbox"${on?" checked":""}> <span>${name}</span></label>`).join("")}</div><button data-control-action="save-features">OK</button><button data-control-action="cancel-setting">Cancel</button><p class="feature-status" id="featureStatus"></p>`,
    "windows-cardspace":emptyState("Windows CardSpace","No information cards are installed. Windows CardSpace is retained as a period-correct Windows 7 component."),
    infrared:emptyState("Infrared","No infrared devices are installed."),
    iscsi:`<h3>iSCSI Initiator Properties</h3><div class="property-tabs">Targets · Discovery · Favorite Targets · Volumes and Devices · RADIUS · Configuration</div><p>No iSCSI targets are connected.</p><button data-control-action="refresh-targets">Refresh</button>`,
    "pen-touch":emptyState("Pen and Touch","No pen or touch input is available for this display."),
    "tablet-settings":emptyState("Tablet PC Settings","A compatible tablet or pen display was not found."),
    mobility:`<h3>Windows Mobility Center</h3><div class="mobility-grid"><label>Display brightness<input type="range" value="80"></label><label>Volume<input type="range" value="70"></label><label>Battery status<select><option>Balanced</option><option>Power saver</option><option>High performance</option></select></label><button data-generic-app="Connect to a Projector">Connect display</button></div>`,
    mouse:`<h3>Mouse Properties</h3><div class="property-tabs">Buttons · Pointers · Pointer Options · Wheel · Hardware</div><label>Select your primary button <select><option>Left</option><option>Right</option></select></label><label>Double-click speed <input type="range" value="50"></label><label><input type="checkbox" checked> Enhance pointer precision</label><button data-control-action="save-setting">OK</button>`,
    keyboard:`<h3>Keyboard Properties</h3><div class="property-tabs">Speed · Hardware</div><label>Repeat delay <input type="range" value="60"></label><label>Repeat rate <input type="range" value="70"></label><label>Cursor blink rate <input type="range" value="55"></label><button data-control-action="save-setting">OK</button>`,
    "indexing-options":`<h3>Indexing Options</h3><section class="setting-hero good"><span>${icon("folder")}</span><div><h3>Indexing complete</h3><p>1,284 indexed items in Start menu and user folders.</p></div></section><button data-control-action="rebuild-index">Advanced...</button>`,
    performance:`<h3>Performance Information and Tools</h3><section class="setting-hero"><span>5.9</span><div><h3>Windows Experience Index</h3><p>Your base score is determined by the lowest subscore.</p></div></section><button data-generic-app="Performance Monitor">Open advanced performance tools</button><button data-generic-app="Resource Monitor">Open Resource Monitor</button>`,
    recovery:`<h3>Recovery</h3><p>Restore your computer to an earlier point in time or use an advanced recovery method.</p><button data-generic-app="System Restore">Open System Restore</button><button data-generic-app="Create a System Repair Disc">Create a system repair disc</button>`,
    remoteapp:emptyState("RemoteApp and Desktop Connections","You have not set up any connections yet. Select Access RemoteApp and desktops to add a workspace."),
    "speech-recognition":`<h3>Configure your Speech Recognition experience</h3><div class="setting-list">${["Start Speech Recognition","Set up microphone","Take Speech Tutorial","Train your computer to better understand you","Open the Speech Reference Card"].map(toolButton).join("")}</div>`,
    "sync-center":`<h3>Sync Center</h3><p>There are no sync partnerships set up on this computer.</p><button data-generic-app="Sync Center">View sync results</button>`,
    "windows-defender":`<h3>Windows Defender</h3><section class="setting-hero good"><span>✓</span><div><h3>Your computer is running normally</h3><p id="defenderStatus">No unwanted or harmful software detected.</p></div></section><button data-control-action="defender-scan">Scan</button><button data-control-action="defender-history">History</button>`,
    "windows-anytime":emptyState("Windows Anytime Upgrade","Windows 7 Professional can be upgraded to Windows 7 Ultimate. The historical online purchase service is no longer available."),
    "phone-modem":emptyState("Phone and Modem","No modem is installed. Configure dialing rules after a modem is connected."),
    "getting-started":`<h3>Getting Started</h3><div class="getting-started-grid">${["Personalize Windows","Transfer files and settings","Back up your files","Add new users","Connect to the Internet","Discover Windows 7"].map(name=>`<button data-control-action="getting-started">${name}</button>`).join("")}</div>`
  }
}

export function handleSupplementalControlAction(action){
  if(action==="save-features"){
    const status=document.getElementById("featureStatus")
    requestElevation("Windows Features",()=>{if(status)status.textContent="Please wait while Windows makes changes to features...";setTimeout(()=>{if(status)status.textContent="Windows completed the requested changes."},900)})
    return true
  }
  if(action==="defender-scan"){
    const status=document.getElementById("defenderStatus")
    if(status)status.textContent="Quick scan in progress..."
    setTimeout(()=>{if(status)status.textContent="Scan complete. No unwanted software detected."},1100)
    return true
  }
  return false
}
