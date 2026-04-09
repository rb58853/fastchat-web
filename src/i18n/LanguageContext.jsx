import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const translations = {
  en: {
    ui: {
      language: 'Language',
      english: 'EN',
      spanish: 'ES',
      toLight: 'Switch to light mode',
      toDark: 'Switch to dark mode',
      lightMode: 'Light mode',
      darkMode: 'Dark mode',
    },
    home: {
      tag: 'Python MCP client · Built on mcp[cli]',
      eyebrow: 'fastchat-mcp',
      title: 'Interact with MCP servers through natural language.',
      description:
        'is a simple and configurable Python interface to interact with MCP servers through HTTPStream or Stdio. Compatible with any OpenAI model, without complex setup.',
      openChat: 'Open chat',
      note: '',
      ideas: 'Try it out',
      serversLabel: 'Additional MCP servers',
      serversDescription: 'Add one MCP server at a time using this form. To learn the recommended server structure, check the official configuration documentation.',
      serversDocsLinkText: 'Read the official fastchat-mcp configuration guide.',
      serverKeyLabel: 'MCP key',
      serverKeyPlaceholder: 'example_private_mcp',
      serverConfigLabel: 'MCP configuration JSON',
      serversPlaceholder: 'Paste only this MCP config object...',
      serversSave: 'Save servers',
      serversUpdate: 'Update servers',
      serversEdit: 'Edit JSON',
      serversClear: 'Remove',
      serversCancel: 'Cancel',
      serverNew: 'New MCP',
      serverNewDescription: 'Prepare a clean template to register a different MCP without touching the selected one.',
      serverNewAction: 'Create from template',
      savedServersLabel: 'Configured MCP servers',
      savedServersEmpty: 'No MCP servers configured yet.',
      serverKeyRequired: 'MCP key is required.',
      serversInvalid: 'Invalid JSON. Use only one MCP config object like { "protocol": "httpstream", ... }.',
      securityTitle: 'Security alert',
      securityText: 'This page is intended for testing MCP servers. Sensitive data added in these JSON fields is stored in your browser. Do not use sensitive or production servers. For production use, fork this project:',
      securityLinkText: 'https://github.com/rb58853/fastchat-web',
      prompts: [
        'List all available tools on this MCP server.',
        'Use the file tool to read the contents of config.json.',
        'Call the search tool and find documentation about FastAPI.',
        'What resources and prompts does this server expose?',
      ],
    },
    chat: {
      status: {
        connecting: 'Connecting',
        connected: 'Online',
        disconnected: 'Offline',
      },
      title: 'Fastchat',
      subtitle: '',
      emptyKicker: 'Ready to connect',
      emptyTitle: 'Start a new session',
      emptyText: 'Type a natural language query and let fastchat route it to the right MCP tool.',
      composerLeft: 'Natural language interface for MCP servers',
      composerRight: 'Enter to send · Shift + Enter for a new line',
      placeholder: 'Ask anything — fastchat will find and call the right tool...',
      connectingTitle: 'Connecting to MCP server',
      connectingText: 'Establishing session.',
      disconnectedTitle: 'Could not connect to the MCP server',
      disconnectedText: 'Make sure the server is running and the transport protocol is correctly configured.',
      retry: 'Retry connection',
    },
    messageLabels: {
      user: 'Your message',
      query: 'Interpreted query',
      data: 'Tool response',
      step: 'Generated subqueries',
      response: 'fastchat response',
      processing: 'Calling MCP tools',
      processingAlt: 'fastchat loading',
      processingTitle: 'Processing request',
      processingText: '',
    },
    workflow: {
      interpreting: 'Interpreting your query',
      consultingData: 'Calling tools and resources',
      writingResponse: 'Writing final answer',
      selectingServices: 'Selecting MCP tools',
      processing: 'Processing your request',
      preparingContext: 'Routing to MCP server',
    },
  },
  es: {
    ui: {
      language: 'Idioma',
      english: 'EN',
      spanish: 'ES',
      toLight: 'Cambiar a modo claro',
      toDark: 'Cambiar a modo oscuro',
      lightMode: 'Modo claro',
      darkMode: 'Modo oscuro',
    },
    home: {
      tag: 'Cliente Python para servidores MCP · Basado en mcp[cli]',
      eyebrow: 'fastchat-mcp',
      title: 'Conectate a servidores MCP a traves del lenguaje natural.',
      description:
        'es una interfaz Python simple y configurable para interactuar con servidores MCP via HTTPStream o Stdio. Compatible con cualquier modelo OpenAI, sin configuraciones complicadas.',
      openChat: 'Abrir chat',
      note: '',
      ideas: 'Pruebalo',
      serversLabel: 'Servidores MCP adicionales',
      serversDescription: 'Agrega un servidor MCP por vez usando este formulario. Para ver la estructura recomendada, revisa la documentacion oficial de configuracion.',
      serversDocsLinkText: 'Ver guia oficial de configuracion de fastchat-mcp.',
      serverKeyLabel: 'Clave MCP',
      serverKeyPlaceholder: 'example_private_mcp',
      serverConfigLabel: 'JSON de configuracion MCP',
      serversPlaceholder: 'Pega aqui solo el objeto de configuracion de este MCP...',
      serversSave: 'Guardar servidores',
      serversUpdate: 'Actualizar servidores',
      serversEdit: 'Editar JSON',
      serversClear: 'Eliminar',
      serversCancel: 'Cancelar',
      serverNew: 'Nuevo MCP',
      serverNewDescription: 'Prepara una plantilla limpia para registrar otro MCP sin tocar el seleccionado.',
      serverNewAction: 'Crear desde plantilla',
      savedServersLabel: 'Servidores MCP configurados',
      savedServersEmpty: 'Aun no hay servidores MCP configurados.',
      serverKeyRequired: 'La clave MCP es obligatoria.',
      serversInvalid: 'JSON invalido. Usa solo un objeto de configuracion MCP como { "protocol": "httpstream", ... }.',
      securityTitle: 'Alerta de seguridad',
      securityText: 'Esta pagina es para probar servidores MCP. Los datos sensibles agregados en estos JSON quedan registrados en tu navegador. No uses servidores sensibles o de produccion. Para uso en produccion, haz fork de este proyecto:',
      securityLinkText: 'https://github.com/rb58853/fastchat-web',
      prompts: [
        'Lista todas las herramientas disponibles en este servidor MCP.',
        'Usa la herramienta de archivos para leer el contenido de config.json.',
        'Llama a la herramienta de busqueda y encuentra documentacion sobre FastAPI.',
        '¿Que recursos y prompts expone este servidor?',
      ],
    },
    chat: {
      status: {
        connecting: 'Conectando',
        connected: 'En linea',
        disconnected: 'Sin conexion',
      },
      title: 'Fastchat',
      subtitle: '',
      emptyKicker: 'Listo para conectar',
      emptyTitle: 'Inicia una nueva sesion',
      emptyText: 'Escribe una consulta en lenguaje natural y fastchat la enrutara a la herramienta MCP correcta.',
      composerLeft: 'Interfaz en lenguaje natural para servidores MCP',
      composerRight: 'Enter para enviar · Shift + Enter para salto',
      placeholder: 'Pregunta lo que necesites — fastchat encontrara y llamara la herramienta adecuada...',
      connectingTitle: 'Conectando con el servidor MCP',
      connectingText: 'Estableciendo sesion.',
      disconnectedTitle: 'No se pudo conectar con el servidor MCP',
      disconnectedText: 'Verifica que el servidor esta activo y que el protocolo de transporte esta correctamente configurado.',
      retry: 'Reintentar conexion',
    },
    messageLabels: {
      user: 'Tu mensaje',
      query: 'Consulta interpretada',
      data: 'Respuesta de herramienta',
      step: 'Subconsultas generadas',
      response: 'Respuesta de fastchat',
      processing: 'Llamando herramientas MCP',
      processingAlt: 'fastchat cargando',
      processingTitle: 'Procesando consulta',
      processingText: '',
    },
    workflow: {
      interpreting: 'Interpretando tu consulta',
      consultingData: 'Llamando herramientas y recursos',
      writingResponse: 'Redactando la respuesta final',
      selectingServices: 'Seleccionando herramientas MCP',
      processing: 'Procesando tu solicitud',
      preparingContext: 'Enrutando al servidor MCP',
    },
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const storedLanguage = localStorage.getItem('fastchat-language');
    return storedLanguage === 'es' || storedLanguage === 'en' ? storedLanguage : 'en';
  });

  useEffect(() => {
    localStorage.setItem('fastchat-language', language);
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translations[language],
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
}
