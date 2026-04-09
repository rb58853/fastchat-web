import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import "./style/desktop.css"
import { useLanguage } from '../../i18n/LanguageContext.jsx';

const ADDITIONAL_SERVERS_STORAGE_KEY = 'fastchat-additional-servers';
const SAMPLE_MCP_KEY = 'example_private_mcp';
const SAMPLE_MCP_CONFIG = {
  protocol: 'httpstream',
  'httpstream-url': 'http://127.0.0.1:8000/example-mcp-server/mcp',
  name: 'example-mpc-server',
  description: 'Example MCP server with oauth required.',
  headers: {
    Authorization: 'Bearer {your-access-token}',
    Other: '{your-private-token}',
  },
  auth: {
    required: true,
    post_body: {
      username: 'user',
      password: 'password',
    },
  },
};

const loadStoredServers = () => {
  try {
    const raw = localStorage.getItem(ADDITIONAL_SERVERS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed;
  } catch (error) {
    return null;
  }
};

function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const initialServers = useMemo(() => loadStoredServers() || {}, []);
  const initialKeys = Object.keys(initialServers);
  const firstKey = initialKeys[0] || SAMPLE_MCP_KEY;
  const [savedServers, setSavedServers] = useState(initialServers);
  const [selectedServerKey, setSelectedServerKey] = useState(initialKeys[0] || '');
  const [serverKeyInput, setServerKeyInput] = useState(firstKey);
  const [serverInput, setServerInput] = useState(
    JSON.stringify(initialServers[firstKey] || SAMPLE_MCP_CONFIG, null, 2),
  );
  const [serverError, setServerError] = useState('');
  const jsonInputRef = useRef(null);

  useEffect(() => {
    const textarea = jsonInputRef.current;
    if (!textarea) return;

    textarea.style.height = '0px';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [serverInput]);

  const goToChat = () => {
    navigate('/chat');
  };

  const persistServers = (serversMap) => {
    localStorage.setItem(ADDITIONAL_SERVERS_STORAGE_KEY, JSON.stringify(serversMap));
    setSavedServers(serversMap);
  };

  const handleSaveServer = () => {
    const cleanKey = serverKeyInput.trim();
    if (!cleanKey) {
      setServerError(t.home.serverKeyRequired);
      return;
    }

    try {
      const parsed = JSON.parse(serverInput);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        setServerError(t.home.serversInvalid);
        return;
      }

      const nextServers = {
        ...savedServers,
        [cleanKey]: parsed,
      };

      persistServers(nextServers);
      setSelectedServerKey(cleanKey);
      setServerKeyInput(cleanKey);
      setServerError('');
    } catch (error) {
      setServerError(t.home.serversInvalid);
    }
  };

  const handleSelectServer = (serverKey) => {
    const selected = savedServers[serverKey];
    if (!selected) return;
    setSelectedServerKey(serverKey);
    setServerKeyInput(serverKey);
    setServerInput(JSON.stringify(selected, null, 2));
    setServerError('');
  };

  const handleRemoveServer = (serverKey) => {
    if (!savedServers[serverKey]) return;

    const nextServers = { ...savedServers };
    delete nextServers[serverKey];

    if (Object.keys(nextServers).length === 0) {
      localStorage.removeItem(ADDITIONAL_SERVERS_STORAGE_KEY);
    } else {
      persistServers(nextServers);
    }

    setSavedServers(nextServers);
    setSelectedServerKey('');
    setServerKeyInput(SAMPLE_MCP_KEY);
    setServerInput(JSON.stringify(SAMPLE_MCP_CONFIG, null, 2));
    setServerError('');
  };

  const handleCreateNew = () => {
    setSelectedServerKey('');
    setServerKeyInput(SAMPLE_MCP_KEY);
    setServerInput(JSON.stringify(SAMPLE_MCP_CONFIG, null, 2));
    setServerError('');
  };

  const hasSavedServers = Object.keys(savedServers).length > 0;

  return (
    <section className="home-shell">
      <div className="home-nav">
        <span className="home-brand">Fastchat</span>
        <span className="home-tag">{t.home.tag}</span>
      </div>

      <div className="home-hero">
        <div className="home-copy">
          <div className="home-copy-main">
            <p className="home-eyebrow">{t.home.eyebrow}</p>
            <h1>{t.home.title}</h1>
            <p className="home-description">
              <a
                className="home-doc-link"
                href="https://github.com/rb58853/fastchat-mcp"
                target="_blank"
                rel="noreferrer"
              >
                fastchat-mcp
              </a>{' '}
              {t.home.description}
            </p>
          </div>

          <div className="home-actions">
            <button className="button-chat" onClick={goToChat}>
              {t.home.openChat}
            </button>
            {t.home.note ? <p className="home-note">{t.home.note}</p> : null}
          </div>

          <div className="home-security-alert" role="note" aria-live="polite">
            <p className="home-security-title">{t.home.securityTitle}</p>
            <p className="home-security-text">
              {t.home.securityText}{' '}
              <a
                className="home-security-link"
                href="https://github.com/rb58853/fastchat-web"
                target="_blank"
                rel="noreferrer"
              >
                {t.home.securityLinkText}
              </a>
            </p>
          </div>
        </div>

        <div className="home-card">
          <p className="home-card-label">{t.home.serversLabel}</p>
          <p className="home-card-description">
            {t.home.serversDescription}{' '}
            <a
              className="home-doc-link"
              href="https://github.com/rb58853/fastchat-mcp?tab=readme-ov-file#file-fastchatconfigjson"
              target="_blank"
              rel="noreferrer"
            >
              {t.home.serversDocsLinkText}
            </a>
          </p>

          <div className="home-servers-grid">
            <div className="home-server-editor">
              <label className="home-field-label" htmlFor="mcp-server-key">{t.home.serverKeyLabel}</label>
              <input
                id="mcp-server-key"
                className="home-text-input"
                value={serverKeyInput}
                onChange={(event) => setServerKeyInput(event.target.value)}
                placeholder={t.home.serverKeyPlaceholder}
              />

              <label className="home-field-label" htmlFor="mcp-server-json">{t.home.serverConfigLabel}</label>
              <textarea
                id="mcp-server-json"
                ref={jsonInputRef}
                className="home-json-input"
                value={serverInput}
                onChange={(event) => setServerInput(event.target.value)}
                placeholder={t.home.serversPlaceholder}
                spellCheck={false}
              />

              {serverError ? <p className="home-json-error">{serverError}</p> : null}

              <div className="home-json-actions">
                <button className="button-chat" onClick={handleSaveServer}>
                  {selectedServerKey ? t.home.serversUpdate : t.home.serversSave}
                </button>
              </div>
            </div>

            <div className="home-sidebar">
              <div className="home-server-list">
                <p className="home-field-label">{t.home.savedServersLabel}</p>

                {hasSavedServers ? (
                  <div className="home-server-items">
                    {Object.keys(savedServers).map((serverKey) => (
                      <div key={serverKey} className={`home-server-item ${serverKey === selectedServerKey ? 'is-selected' : ''}`}>
                        <button
                          className="home-server-select"
                          onClick={() => handleSelectServer(serverKey)}
                        >
                          {serverKey}
                        </button>
                        <button
                          className="home-server-delete"
                          onClick={() => handleRemoveServer(serverKey)}
                        >
                          {t.home.serversClear}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="home-empty-list">{t.home.savedServersEmpty}</p>
                )}
              </div>

              <div className="home-new-server-card">
                <p className="home-field-label">{t.home.serverNew}</p>
                <p className="home-new-server-text">{t.home.serverNewDescription}</p>
                <button className="home-button-ghost" onClick={handleCreateNew}>
                  {t.home.serverNewAction}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home