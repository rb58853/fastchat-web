import useChatLogic from "./useChatLogic";

import { useEffect, useRef } from 'react';
import "./style/desktop.css";
import { Icon } from '@iconify/react/dist/iconify.js'
import { SubqueryBlock, UserQueryComponent, WorkflowLoader } from './components/ChatComponents';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

const Chat = () => {
  const { t } = useLanguage();
  const {
    messages,
    input,
    setInput,
    sendMessage,
    connectionStatus,
    isProcessing,
    workflowSteps,
    activeWorkflowStep,
  } = useChatLogic();
  const inputRef = useRef(null);

  useEffect(() => {
    const inputElement = inputRef.current;

    if (!inputElement) return;

    inputElement.style.height = '0px';
    inputElement.style.height = `${Math.min(inputElement.scrollHeight, 180)}px`;
  }, [input]);

  const _sendMessage = () => {
    sendMessage();
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const hasMessages = messages.length > 0;
  const isIdle = !hasMessages && !isProcessing && !input.trim();
  const statusText = t.chat.status[connectionStatus];

  let screen = ConnectionScreens(connectionStatus, t);
  if (screen) {
    return screen;
  }

  return (
    <section className={`chat-shell ${isIdle ? 'chat-shell-idle' : ''}`}>
      <header className="chat-header">
        <div className="chat-header-copy">
          <p className="chat-eyebrow">Fastchat</p>
          <h1 className="chat-title">{t.chat.title}</h1>
          {t.chat.subtitle ? <p className="chat-subtitle">{t.chat.subtitle}</p> : null}
        </div>
        <span className={`chat-status-pill status-${connectionStatus}`}>{statusText}</span>
      </header>

      <div className={`chat-surface ${hasMessages ? 'chat-surface-active' : ''} ${isIdle ? 'chat-surface-idle' : ''}`}>
        {isIdle && (
          <div className="chat-empty-state">
            <div className="chat-empty-copy">
              <p className="chat-empty-kicker">{t.chat.emptyKicker}</p>
              <h2>{t.chat.emptyTitle}</h2>
              {t.chat.emptyText ? <p>{t.chat.emptyText}</p> : null}
            </div>
          </div>
        )}

        <div className={`chat-box ${isIdle ? 'chat-box-idle' : ''}`}>
          {messages.map((msg) => (
            <div key={msg.id} className="chat-message">
              {msg.kind === 'user' ? (
                <UserQueryComponent input={msg.input} />
              ) : (
                <SubqueryBlock subquery={msg} />
              )}
            </div>
          ))}

          {isProcessing && (
            <WorkflowLoader
              activeStep={activeWorkflowStep}
              workflowSteps={workflowSteps}
            />
          )}
        </div>

        {isIdle && (
          <div className="composer-shell composer-shell-centered">
            <div className="composer-meta">
              <span>{t.chat.composerLeft}</span>
              <span>{t.chat.composerRight}</span>
            </div>

            <div className="input-container">
              <textarea
                ref={inputRef}
                className="chat-input"
                value={input}
                onChange={handleInputChange}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    _sendMessage();
                  }
                }}
                placeholder={t.chat.placeholder}
                rows={1}
              />
              <button className="chat-button" onClick={_sendMessage} disabled={!input.trim()}>
                <Icon icon="majesticons:send" />
              </button>
            </div>
          </div>
        )}
      </div>

      {!isIdle && (
      <div className="composer-shell">
        <div className="composer-meta">
          <span>{t.chat.composerLeft}</span>
          <span>{t.chat.composerRight}</span>
        </div>

        <div className="input-container">
          <textarea
            ref={inputRef}
            className="chat-input"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                _sendMessage();
              }
            }}
            placeholder={t.chat.placeholder}
            rows={1}
          />
          <button className="chat-button" onClick={_sendMessage} disabled={!input.trim()}>
            <Icon icon="majesticons:send" />
          </button>
        </div>
      </div>
      )}
    </section>
  );
};

const ConnectionScreens = (connectionStatus, t) => {
  if (connectionStatus === 'connecting') {
    return (
      <div className="connection-screen">
        <img className="connection-loader" src={`${process.env.PUBLIC_URL}/loader-orbit.svg`} alt={t.messageLabels.processingAlt} />
        <div className="connection-copy">
          <p className="chat-eyebrow">Fastchat</p>
          <h2>{t.chat.connectingTitle}</h2>
          <p>{t.chat.connectingText}</p>
        </div>
      </div>
    );
  }

  if (connectionStatus === 'disconnected') {
    return (
      <div className="connection-screen connection-screen-error">
        <div className="connection-copy">
          <p className="chat-eyebrow">Fastchat</p>
          <h2>{t.chat.disconnectedTitle}</h2>
          <p>{t.chat.disconnectedText}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            {t.chat.retry}
          </button>
        </div>
      </div>
    );
  }
  return null;
};


export default Chat;
