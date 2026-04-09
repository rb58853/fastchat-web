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
        'A simple, configurable Python interface to connect to MCP servers via HTTPStream or Stdio. Works with any OpenAI-compatible model — no boilerplate, no friction.',
      openChat: 'Open chat',
      note: 'Modular by design. Add new transport protocols and LLM providers with minimal effort.',
      ideas: 'Try it out',
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
      faq: [
        'What tools are available on this MCP server?',
        'List all resources exposed by the server.',
        'Use the file tool to read README.md.',
        'What transport protocol is being used?',
        'What language model is configured?',
        'Explain what this server can do.',
        'Call the search tool with query: Python asyncio.',
        'Show me the available prompts on this server.',
        'What OpenAI models can I use with fastchat?',
        'How do I switch to a different MCP server?',
      ],
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
        'Una interfaz Python simple y configurable para interactuar con servidores MCP via HTTPStream o Stdio. Compatible con cualquier modelo OpenAI, sin configuraciones complicadas.',
      openChat: 'Abrir chat',
      note: 'Arquitectura modular. Agrega nuevos protocolos y proveedores de LLM con minimo esfuerzo.',
      ideas: 'Pruebalo',
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
      faq: [
        '¿Que herramientas estan disponibles en este servidor MCP?',
        'Lista todos los recursos expuestos por el servidor.',
        'Usa la herramienta de archivos para leer README.md.',
        '¿Que protocolo de transporte se esta usando?',
        '¿Que modelo de lenguaje esta configurado?',
        'Explica que puede hacer este servidor.',
        'Llama a la herramienta de busqueda con la consulta: Python asyncio.',
        'Muestrame los prompts disponibles del servidor.',
        '¿Que modelos de OpenAI puedo usar con fastchat?',
        '¿Como me conecto a un servidor MCP diferente?',
      ],
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
