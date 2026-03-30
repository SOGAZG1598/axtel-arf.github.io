import { useState } from "react";

// ============================================================
// PORTAL DE REQUERIMIENTOS DE FIREWALL
// ============================================================
// ARQUITECTURA Y GUÍA DE EXTENSIÓN
//
// Para agregar un nuevo tipo de requerimiento:
//   1. Agrega una nueva clave en REQUERIMIENTOS con su
//      configuración (etiqueta, icono, color, campos[]).
//   2. Cada campo necesita:
//      - id:          identificador único (snake_case)
//      - etiqueta:    nombre visible en el formulario
//      - tipo:        uno de los TIPOS (T) definidos abajo
//      - descripcion: texto de ayuda que aparece en el campo
//      - requerido:   true / false
//      - opciones:    (solo para SELECT / CHECKBOX_GRUPO)
//
// Los campos generales (solicitante, llave de servicio, cuenta)
// son fijos para todos los tipos y se gestionan por separado.
// ============================================================

const CORREO_DESTINO = "soportecdc@axtel.com.mx";

const T = {
  TEXTO:         "texto",
  TEXTAREA:      "textarea",
  PASSWORD:      "password",
  SELECT:        "select",
  CHECKBOX_GRUPO:"checkbox_grupo",
};

// ============================================================
// DEFINICIÓN DE REQUERIMIENTOS (extraído de templates.xlsx)
// ============================================================
const REQUERIMIENTOS = {
  alta_usuario: {
    etiqueta: "Alta de usuario",
    icono: "👤",
    colorAccento: "#4f46e5",
    colorFondo: "#eef2ff",
    descripcion: "Creación de un nuevo usuario en el sistema de acceso",
    campos: [
      { id:"usuario",      etiqueta:"Usuario",              tipo:T.TEXTO,    descripcion:"alfanumérico",                                          requerido:true  },
      { id:"password",     etiqueta:"Contraseña",           tipo:T.PASSWORD, descripcion:"Mayor a 15 caracteres, alfanumérico",                   requerido:true  },
      { id:"grupo",        etiqueta:"Grupo",                tipo:T.TEXTO,    descripcion:"Nombre del grupo al que pertenecerá el usuario",        requerido:false },
      { id:"politica",     etiqueta:"Política",             tipo:T.TEXTO,    descripcion:"Política de acceso a aplicar al usuario",               requerido:false },
      { id:"donde_aplica", etiqueta:"¿En dónde se aplica?", tipo:T.TEXTO,   descripcion:"Equipo, segmento o zona donde se habilitará el usuario", requerido:true  },
    ],
  },

  nat_pat_homologacion: {
    etiqueta: "NAT / PAT / Homologación",
    icono: "🔀",
    colorAccento: "#0891b2",
    colorFondo: "#ecfeff",
    descripcion: "Configuración de traducción de direcciones de red",
    campos: [
      { id:"ip_origen",          etiqueta:"IP origen",             tipo:T.TEXTO,          descripcion:"Dirección IP de origen a traducir",                  requerido:true  },
      { id:"ip_nateada",         etiqueta:"IP nateada",            tipo:T.TEXTO,          descripcion:"Dirección IP resultante después de la traducción",   requerido:true  },
      { id:"puerto",             etiqueta:"Puerto",                tipo:T.TEXTO,          descripcion:"Número de puerto a redirigir o traducir",            requerido:true  },
      { id:"interfaz_origen",    etiqueta:"Interfaz origen",       tipo:T.TEXTO,          descripcion:"Interfaz de red de entrada del tráfico",             requerido:false },
      { id:"interfaz_destino",   etiqueta:"Interfaz destino",      tipo:T.TEXTO,          descripcion:"Interfaz de red de salida del tráfico",              requerido:false },
      { id:"perfiles_seguridad", etiqueta:"Perfiles de seguridad", tipo:T.CHECKBOX_GRUPO, descripcion:"AV / WF / AC / IPS — selecciona los que apliquen",  requerido:false, opciones:["AV (Antivirus)","WF (Web Filter)","AC (App Control)","IPS"] },
      { id:"duracion",           etiqueta:"Duración",              tipo:T.SELECT,         descripcion:"Permanente / programado",                            requerido:false, opciones:["Permanente","Programado (especificar en notas)"] },
    ],
  },

  politicas_flujos: {
    etiqueta: "Políticas / Flujos",
    icono: "📋",
    colorAccento: "#7c3aed",
    colorFondo: "#f5f3ff",
    descripcion: "Alta o modificación de reglas de tráfico en el firewall",
    campos: [
      { id:"nombre",             etiqueta:"Nombre",                tipo:T.TEXTO,          descripcion:"Nombre descriptivo de la política o flujo",          requerido:false },
      { id:"ip_origen",          etiqueta:"IP origen",             tipo:T.TEXTO,          descripcion:"Direccionamiento IP de origen",                       requerido:true  },
      { id:"ip_destino",         etiqueta:"IP destino",            tipo:T.TEXTO,          descripcion:"Direccionamiento IP de destino",                      requerido:true  },
      { id:"puertos",            etiqueta:"Puertos",               tipo:T.TEXTO,          descripcion:"Número(s) de puerto separados por coma",              requerido:true  },
      { id:"interfaz_origen",    etiqueta:"Interfaz origen",       tipo:T.TEXTO,          descripcion:"Interfaz de red de entrada",                          requerido:false },
      { id:"interfaz_destino",   etiqueta:"Interfaz destino",      tipo:T.TEXTO,          descripcion:"Interfaz de red de salida",                           requerido:false },
      { id:"nat",                etiqueta:"NAT",                   tipo:T.TEXTO,          descripcion:"Especificar si aplica NAT en esta política",           requerido:false },
      { id:"perfiles_seguridad", etiqueta:"Perfiles de seguridad", tipo:T.CHECKBOX_GRUPO, descripcion:"AV / WF / AC / IPS — selecciona los que apliquen",   requerido:false, opciones:["AV (Antivirus)","WF (Web Filter)","AC (App Control)","IPS"] },
      { id:"duracion",           etiqueta:"Duración",              tipo:T.SELECT,         descripcion:"Permanente / programado",                             requerido:false, opciones:["Permanente","Programado (especificar en notas)"] },
    ],
  },

  whitelist_blacklist: {
    etiqueta: "Whitelist / Blacklist",
    icono: "🛡️",
    colorAccento: "#059669",
    colorFondo: "#ecfdf5",
    descripcion: "Permitir o bloquear sitios, IPs o direcciones MAC",
    campos: [
      { id:"nombre",             etiqueta:"Nombre",                tipo:T.TEXTO,          descripcion:"Alias para identificar esta regla",                   requerido:false },
      { id:"tipo_lista",         etiqueta:"Tipo de lista",         tipo:T.SELECT,         descripcion:"¿Es una regla de permiso o de bloqueo?",              requerido:true,  opciones:["Whitelist (permitir)","Blacklist (bloquear)"] },
      { id:"origen",             etiqueta:"Origen",                tipo:T.TEXTO,          descripcion:"IP / URL / MAC del origen",                           requerido:true  },
      { id:"destino",            etiqueta:"Destino",               tipo:T.TEXTO,          descripcion:"IP / URL del destino",                                requerido:true  },
      { id:"puertos",            etiqueta:"Puertos",               tipo:T.TEXTO,          descripcion:"Puerto(s) separados por coma",                        requerido:true  },
      { id:"interfaz_origen",    etiqueta:"Interfaz origen",       tipo:T.TEXTO,          descripcion:"Interfaz de red de entrada",                          requerido:false },
      { id:"interfaz_destino",   etiqueta:"Interfaz destino",      tipo:T.TEXTO,          descripcion:"Interfaz de red de salida",                           requerido:false },
      { id:"nat",                etiqueta:"NAT",                   tipo:T.TEXTO,          descripcion:"Especificar si aplica NAT",                            requerido:false },
      { id:"perfiles_seguridad", etiqueta:"Perfiles de seguridad", tipo:T.CHECKBOX_GRUPO, descripcion:"AV / WF / AC / IPS — selecciona los que apliquen",   requerido:false, opciones:["AV (Antivirus)","WF (Web Filter)","AC (App Control)","IPS"] },
      { id:"duracion",           etiqueta:"Duración",              tipo:T.SELECT,         descripcion:"Permanente / programado",                             requerido:false, opciones:["Permanente","Programado (especificar en notas)"] },
    ],
  },

  modificacion_perfiles_seguridad: {
    etiqueta: "Modificación de perfiles de seguridad",
    icono: "⚙️",
    colorAccento: "#d97706",
    colorFondo: "#fffbeb",
    descripcion: "Ajuste de configuración en perfiles AV, WF, AC o IPS",
    campos: [
      { id:"nombre_perfil", etiqueta:"Nombre del perfil", tipo:T.TEXTO, descripcion:"Nombre exacto del perfil a modificar en el firewall", requerido:true  },
      { id:"origen",        etiqueta:"Origen",            tipo:T.TEXTO, descripcion:"IP / URL / MAC del origen afectado",                   requerido:false },
      { id:"destino",       etiqueta:"Destino",           tipo:T.TEXTO, descripcion:"IP / URL del destino afectado",                       requerido:false },
    ],
  },
};

// ============================================================
// ESTILOS BASE REUTILIZABLES
// ============================================================
const s = {
  label: { display:"block", fontSize:"13px", fontWeight:"600", color:"#374151", marginBottom:"4px", fontFamily:"system-ui,sans-serif" },
  hint:  { fontSize:"11px", color:"#9ca3af", marginBottom:"6px", fontFamily:"system-ui,sans-serif", fontStyle:"italic" },
  input: { width:"100%", padding:"8px 12px", fontSize:"14px", border:"1.5px solid #e5e7eb", borderRadius:"8px", outline:"none", fontFamily:"system-ui,sans-serif", color:"#111827", background:"#fff", boxSizing:"border-box", transition:"border-color 0.15s" },
  req:   { color:"#ef4444", marginLeft:"2px" },
  grupo: { marginBottom:"16px" },
  secTitle: { fontSize:"10px", fontWeight:"700", color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em", margin:"0 0 14px" },
  hr:    { border:"none", borderTop:"1px solid #f1f5f9", margin:"6px 0 20px" },
};

// ============================================================
// COMPONENTES DE CAMPO INDIVIDUALES
// ============================================================
function CampoTexto({ campo, valor, onChange }) {
  const [foco, setFoco] = useState(false);
  return (
    <div style={s.grupo}>
      <label style={s.label}>{campo.etiqueta}{campo.requerido && <span style={s.req}>*</span>}</label>
      {campo.descripcion && <p style={s.hint}>{campo.descripcion}</p>}
      <input type="text" value={valor||""} onChange={e=>onChange(campo.id,e.target.value)}
        onFocus={()=>setFoco(true)} onBlur={()=>setFoco(false)}
        style={{...s.input,...(foco?{borderColor:"#6366f1"}:{})}} placeholder={campo.descripcion||""} />
    </div>
  );
}

function CampoPassword({ campo, valor, onChange }) {
  const [foco, setFoco] = useState(false);
  const [ver, setVer]   = useState(false);
  return (
    <div style={s.grupo}>
      <label style={s.label}>{campo.etiqueta}{campo.requerido && <span style={s.req}>*</span>}</label>
      {campo.descripcion && <p style={s.hint}>{campo.descripcion}</p>}
      <div style={{position:"relative"}}>
        <input type={ver?"text":"password"} value={valor||""} onChange={e=>onChange(campo.id,e.target.value)}
          onFocus={()=>setFoco(true)} onBlur={()=>setFoco(false)}
          style={{...s.input,paddingRight:"42px",...(foco?{borderColor:"#6366f1"}:{})}} placeholder={campo.descripcion||""} />
        <button type="button" onClick={()=>setVer(!ver)}
          style={{position:"absolute",right:"10px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:"14px",color:"#9ca3af"}}>
          {ver?"🙈":"👁️"}
        </button>
      </div>
    </div>
  );
}

function CampoSelect({ campo, valor, onChange }) {
  return (
    <div style={s.grupo}>
      <label style={s.label}>{campo.etiqueta}{campo.requerido && <span style={s.req}>*</span>}</label>
      {campo.descripcion && <p style={s.hint}>{campo.descripcion}</p>}
      <select value={valor||""} onChange={e=>onChange(campo.id,e.target.value)} style={{...s.input,cursor:"pointer"}}>
        <option value="">— Seleccionar —</option>
        {campo.opciones.map(op=><option key={op} value={op}>{op}</option>)}
      </select>
    </div>
  );
}

function CampoCheckboxGrupo({ campo, valor=[], onChange }) {
  const toggle = op => {
    const arr = Array.isArray(valor) ? valor : [];
    onChange(campo.id, arr.includes(op) ? arr.filter(v=>v!==op) : [...arr,op]);
  };
  return (
    <div style={s.grupo}>
      <label style={s.label}>{campo.etiqueta}{campo.requerido && <span style={s.req}>*</span>}</label>
      {campo.descripcion && <p style={s.hint}>{campo.descripcion}</p>}
      <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
        {campo.opciones.map(op=>{
          const on = Array.isArray(valor)&&valor.includes(op);
          return (
            <button key={op} type="button" onClick={()=>toggle(op)} style={{
              padding:"5px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"500",cursor:"pointer",
              border:on?"1.5px solid #6366f1":"1.5px solid #e5e7eb",
              background:on?"#eef2ff":"#f9fafb",color:on?"#4f46e5":"#6b7280",
              transition:"all .15s",fontFamily:"system-ui,sans-serif",
            }}>
              {on?"✓ ":""}{op}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RenderCampo({ campo, valor, onChange }) {
  switch(campo.tipo) {
    case T.PASSWORD:       return <CampoPassword      campo={campo} valor={valor} onChange={onChange}/>;
    case T.SELECT:         return <CampoSelect        campo={campo} valor={valor} onChange={onChange}/>;
    case T.CHECKBOX_GRUPO: return <CampoCheckboxGrupo campo={campo} valor={valor} onChange={onChange}/>;
    default:               return <CampoTexto         campo={campo} valor={valor} onChange={onChange}/>;
  }
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function PortalRequerimientos() {
  const [tipo, setTipo]                 = useState(null);
  const [valores, setValores]           = useState({});
  const [solicitante, setSolicitante]   = useState("");
  const [llaveServicio, setLlaveServicio] = useState("");
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [notas, setNotas]               = useState("");
  const [archivos, setArchivos]         = useState([]);
  const [enviado, setEnviado]           = useState(false);
  const [errores, setErrores]           = useState([]);

  const cambiarCampo = (id, val) => setValores(p=>({...p,[id]:val}));

  const seleccionarTipo = clave => {
    setTipo(clave); setValores({}); setEnviado(false); setErrores([]);
  };

  const validar = () => {
    if(!tipo) return ["Debes seleccionar un tipo de requerimiento."];
    const cfg = REQUERIMIENTOS[tipo];
    const err = [];
    if(!solicitante.trim())   err.push("Nombre del solicitante");
    if(!llaveServicio.trim()) err.push("Llave de Servicio / Sitio");
    cfg.campos.filter(c=>c.requerido&&!valores[c.id]).forEach(c=>err.push(c.etiqueta));
    return err;
  };

  const construirDatos = () => {
    const cfg = REQUERIMIENTOS[tipo];
    return {
      requerimiento: { tipo, etiqueta: cfg.etiqueta },
      solicitante: solicitante.trim(),
      llave_servicio_sitio: llaveServicio.trim(),
      numero_cuenta_razon_social: numeroCuenta.trim()||null,
      fecha_hora: new Date().toISOString(),
      parametros: valores,
      notas_adicionales: notas.trim()||null,
      archivos_adjuntos: archivos.map(f=>f.name),
    };
  };

  const descargarJSON = datos => {
    const blob = new Blob([JSON.stringify(datos,null,2)],{type:"application/json"});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    const ts   = new Date().toISOString().replace(/[:.]/g,"-").slice(0,19);
    a.href=url; a.download=`requerimiento_${tipo}_${ts}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const construirCorreo = datos => {
    const cfg    = REQUERIMIENTOS[tipo];
    const ahora  = new Date();
    const fStr   = ahora.toLocaleString("es-MX",{dateStyle:"full",timeStyle:"short"});
    const asunto = `Requerimiento ${cfg.etiqueta} — ${ahora.toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"})}`;

    const L = [];
    const sep = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
    L.push("PORTAL DE REQUERIMIENTOS DE FIREWALL");
    L.push(sep);
    L.push("");
    L.push(`Tipo de requerimiento : ${cfg.etiqueta}`);
    L.push(`Fecha y hora          : ${fStr}`);
    L.push("");
    L.push(sep);
    L.push("DATOS DEL SOLICITANTE");
    L.push(sep);
    L.push(`Nombre del solicitante    : ${datos.solicitante}`);
    L.push(`Llave de Servicio / Sitio : ${datos.llave_servicio_sitio}`);
    if(datos.numero_cuenta_razon_social)
      L.push(`No. Cuenta / Razón Social : ${datos.numero_cuenta_razon_social}`);
    L.push("");
    L.push(sep);
    L.push("PARÁMETROS DEL REQUERIMIENTO");
    L.push(sep);

    cfg.campos.forEach(campo=>{
      const val = datos.parametros[campo.id];
      if(val!==undefined&&val!==""&&val!==null){
        const display = Array.isArray(val) ? val.join(", ") : val;
        const texto   = campo.tipo===T.PASSWORD ? "••••••••••••••• (omitida por seguridad)" : display;
        L.push(`${campo.etiqueta.padEnd(28," ")}: ${texto}`);
      }
    });

    if(datos.notas_adicionales){
      L.push(""); L.push(sep); L.push("NOTAS ADICIONALES"); L.push(sep);
      L.push(datos.notas_adicionales);
    }

    if(archivos.length>0){
      L.push(""); L.push(sep); L.push("ARCHIVOS ADJUNTOS"); L.push(sep);
      archivos.forEach((f,i)=>L.push(`  ${i+1}. ${f.name}`));
      L.push("");
      L.push("IMPORTANTE: Adjunta manualmente los archivos listados y el JSON");
      L.push("descargado antes de enviar este correo.");
    }

    L.push(""); L.push(sep);
    L.push("Correo generado automáticamente — Portal de Requerimientos.");

    return { asunto, cuerpo: L.join("\n") };
  };

  const enviarSolicitud = () => {
    const errs = validar();
    if(errs.length>0){ setErrores(errs); return; }
    setErrores([]);

    const datos = construirDatos();
    descargarJSON(datos);

    const { asunto, cuerpo } = construirCorreo(datos);
    window.location.href = `mailto:${CORREO_DESTINO}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;

    setEnviado(true);
  };

  const reiniciar = () => {
    setTipo(null); setValores({}); setSolicitante(""); setLlaveServicio("");
    setNumeroCuenta(""); setNotas(""); setArchivos([]); setEnviado(false); setErrores([]);
  };

  const config = tipo ? REQUERIMIENTOS[tipo] : null;

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%)",fontFamily:"system-ui,-apple-system,sans-serif"}}>

      {/* ── Encabezado ─────────────────────────── */}
      <div style={{background:"#1e293b",padding:"18px 32px",display:"flex",alignItems:"center",gap:"14px"}}>
        <div style={{width:"38px",height:"38px",background:"#4f46e5",borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",flexShrink:0}}>🔥</div>
        <div>
          <h1 style={{margin:0,color:"#f1f5f9",fontSize:"17px",fontWeight:"700"}}>Portal de Requerimientos</h1>
          <p  style={{margin:0,color:"#94a3b8",fontSize:"11px"}}>Firewall Engineering — Gestión de solicitudes</p>
        </div>
      </div>

      <div style={{maxWidth:"780px",margin:"0 auto",padding:"28px 18px"}}>

        {/* ── Selector de tipo ─────────────────── */}
        <div style={{marginBottom:"24px"}}>
          <h2 style={{...s.secTitle,marginBottom:"10px"}}>Tipo de requerimiento</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:"8px"}}>
            {Object.entries(REQUERIMIENTOS).map(([clave,conf])=>{
              const activo = tipo===clave;
              return (
                <button key={clave} type="button" onClick={()=>seleccionarTipo(clave)} style={{
                  padding:"13px 14px",borderRadius:"12px",
                  border:activo?`2px solid ${conf.colorAccento}`:"2px solid transparent",
                  background:activo?conf.colorFondo:"#fff",
                  cursor:"pointer",textAlign:"left",transition:"all .15s",
                  boxShadow:activo?`0 0 0 3px ${conf.colorAccento}22`:"0 1px 3px rgba(0,0,0,.08)",
                }}>
                  <div style={{fontSize:"20px",marginBottom:"5px"}}>{conf.icono}</div>
                  <div style={{fontSize:"12px",fontWeight:"600",color:activo?conf.colorAccento:"#374151",lineHeight:"1.3"}}>{conf.etiqueta}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Formulario ───────────────────────── */}
        {config && !enviado && (
          <div style={{background:"#fff",borderRadius:"16px",boxShadow:"0 4px 24px rgba(0,0,0,.08)",overflow:"hidden"}}>

            {/* Cabecera de tarjeta */}
            <div style={{padding:"18px 26px",borderBottom:"1px solid #f1f5f9",background:config.colorFondo,display:"flex",alignItems:"center",gap:"12px"}}>
              <span style={{fontSize:"26px"}}>{config.icono}</span>
              <div>
                <h2 style={{margin:0,fontSize:"16px",fontWeight:"700",color:config.colorAccento}}>{config.etiqueta}</h2>
                <p  style={{margin:0,fontSize:"11px",color:"#64748b"}}>{config.descripcion}</p>
              </div>
            </div>

            <div style={{padding:"22px 26px"}}>

              {/* ─ Datos generales ─ */}
              <p style={s.secTitle}>Datos generales</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 22px"}}>

                <div style={{...s.grupo,gridColumn:"1 / -1"}}>
                  <label style={s.label}>Nombre del solicitante <span style={s.req}>*</span></label>
                  <p style={s.hint}>Nombre completo de quien realiza la solicitud</p>
                  <input type="text" value={solicitante} onChange={e=>setSolicitante(e.target.value)}
                    style={s.input} placeholder="Ej. Juan Pérez"/>
                </div>

                <div style={s.grupo}>
                  <label style={s.label}>Llave de Servicio / Sitio <span style={s.req}>*</span></label>
                  <p style={s.hint}>Identificador del servicio o sitio afectado</p>
                  <input type="text" value={llaveServicio} onChange={e=>setLlaveServicio(e.target.value)}
                    style={s.input} placeholder="Ej. 1-2B3C4D / SITIO-MTY"/>
                </div>

                <div style={s.grupo}>
                  <label style={s.label}>No. Cuenta / No. Cliente / Razón Social</label>
                  <p style={s.hint}>Opcional — número de cuenta, cliente o razón social</p>
                  <input type="text" value={numeroCuenta} onChange={e=>setNumeroCuenta(e.target.value)}
                    style={s.input} placeholder="Ej. 014123456 / Empresa S.A. de C.V."/>
                </div>

              </div>

              <hr style={s.hr}/>

              {/* ─ Parámetros del requerimiento ─ */}
              <p style={s.secTitle}>Parámetros del requerimiento</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 22px"}}>
                {config.campos.map(campo=>(
                  <div key={campo.id} style={{gridColumn:(campo.tipo===T.TEXTAREA||campo.tipo===T.CHECKBOX_GRUPO)?"1 / -1":"auto"}}>
                    <RenderCampo campo={campo} valor={valores[campo.id]} onChange={cambiarCampo}/>
                  </div>
                ))}
              </div>

              <hr style={s.hr}/>

              {/* ─ Información adicional ─ */}
              <p style={s.secTitle}>Información adicional</p>

              <div style={s.grupo}>
                <label style={s.label}>Notas adicionales</label>
                <p style={s.hint}>Cualquier información extra relevante para el ingeniero</p>
                <textarea value={notas} onChange={e=>setNotas(e.target.value)} rows={3}
                  style={{...s.input,resize:"vertical"}}
                  placeholder="Observaciones, contexto adicional, fechas de mantenimiento, etc."/>
              </div>

              {/* Adjuntar archivos */}
              <div style={s.grupo}>
                <label style={s.label}>Archivos adjuntos</label>
                <p style={s.hint}>Para adjuntar evidencias solo da click en "Enviar Solicitud" y se pueden adjuntar los archivos en la ventana del correo</p>
              </div>

              {/* Nota informativa */}
              <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:"10px",padding:"11px 14px",marginBottom:"18px",display:"flex",gap:"10px",alignItems:"flex-start"}}>
                <span style={{fontSize:"16px",flexShrink:0}}>ℹ️</span>
                <p style={{margin:0,fontSize:"12px",color:"#1e40af",lineHeight:"1.6"}}>
                  Al presionar <strong>Enviar Solicitud</strong> se abrirá tu cliente de correo
                  con la plantilla completa dirigida a <strong>{CORREO_DESTINO}</strong>.
                  En caso de ser necesario, recuerda adjuntar los archivos adicionales antes de enviar el correo.
                </p>
              </div>

              {/* Errores de validación */}
              {errores.length>0 && (
                <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:"10px",padding:"13px 16px",marginBottom:"16px"}}>
                  <p style={{margin:"0 0 5px",fontSize:"13px",fontWeight:"600",color:"#dc2626"}}>⚠️ Campos requeridos faltantes:</p>
                  <ul style={{margin:0,paddingLeft:"18px"}}>
                    {errores.map(e=><li key={e} style={{fontSize:"13px",color:"#b91c1c"}}>{e}</li>)}
                  </ul>
                </div>
              )}

              {/* Botones */}
              <div style={{display:"flex",gap:"10px",justifyContent:"flex-end"}}>
                <button type="button" onClick={reiniciar} style={{
                  padding:"10px 20px",borderRadius:"8px",fontSize:"14px",
                  border:"1.5px solid #e5e7eb",background:"#fff",color:"#374151",
                  cursor:"pointer",fontWeight:"500",
                }}>
                  Limpiar
                </button>
                <button type="button" onClick={enviarSolicitud} style={{
                  padding:"10px 26px",borderRadius:"8px",fontSize:"14px",
                  border:"none",background:config.colorAccento,color:"#fff",
                  cursor:"pointer",fontWeight:"700",
                  display:"flex",alignItems:"center",gap:"8px",
                  boxShadow:`0 4px 14px ${config.colorAccento}55`,
                }}>
                  ✉️ Enviar Solicitud
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ── Confirmación ─────────────────────── */}
        {enviado && (
          <div style={{background:"#fff",borderRadius:"16px",boxShadow:"0 4px 24px rgba(0,0,0,.08)",padding:"48px 28px",textAlign:"center"}}>
            <div style={{fontSize:"52px",marginBottom:"14px"}}>✅</div>
            <h2 style={{fontSize:"20px",fontWeight:"700",color:"#059669",margin:"0 0 8px"}}>¡Solicitud enviada!</h2>
            <p style={{color:"#94a3b8",fontSize:"13px",marginBottom:"28px"}}>
              En caso de que sea necesario, recuerda adjuntar los archivos adicionales en la ventana del correo. Este se enviará a <strong>{CORREO_DESTINO}</strong>.
            </p>
            <button type="button" onClick={reiniciar} style={{
              padding:"12px 28px",borderRadius:"8px",fontSize:"14px",
              border:"none",background:"#4f46e5",color:"#fff",cursor:"pointer",fontWeight:"600",
            }}>
              Nueva solicitud
            </button>
          </div>
        )}

        {/* ── Estado vacío ─────────────────────── */}
        {!tipo && (
          <div style={{background:"#fff",borderRadius:"16px",boxShadow:"0 4px 24px rgba(0,0,0,.08)",padding:"40px 28px",textAlign:"center"}}>
            <div style={{fontSize:"46px",marginBottom:"12px"}}>☝️</div>
            <h2 style={{fontSize:"17px",fontWeight:"700",color:"#1e293b",margin:"0 0 8px"}}>Selecciona un tipo de requerimiento</h2>
            <p style={{color:"#94a3b8",fontSize:"13px",maxWidth:"380px",margin:"0 auto"}}>
              Elige arriba la categoría que mejor describe tu solicitud. El formulario
              se adaptará automáticamente con los campos necesarios.
            </p>
          </div>
        )}

        <p style={{textAlign:"center",fontSize:"11px",color:"#cbd5e1",marginTop:"28px"}}>
          Los campos con <span style={{color:"#ef4444"}}>*</span> son obligatorios.
          El correo incluye todos los parámetros para el equipo de ingeniería.
        </p>
      </div>
    </div>
  );
}
