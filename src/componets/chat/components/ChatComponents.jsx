import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './styles.css';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';


export function UserQueryComponent({ input }) {
    return (
        <div className="message-card user-query-container">
            <p className="user-query-text">{input}</p>
        </div>
    );
}

export function SubqueryBlock({ subquery }) {
    const { t } = useLanguage();
    const [isFlowOpen, setIsFlowOpen] = useState(false);
    const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
    const [hasClosedOnResponse, setHasClosedOnResponse] = useState(false);
    const isSubqueryKey = (key) => /querys|queries|subqueries|subquery/i.test(key);
    const isPromptKey = (key) => /selected[_\s-]?prompt|prompt[_\s-]?selected|prompt/i.test(key);

    const renderDataValue = (key, value) => {
        if (isSubqueryKey(key) && Array.isArray(value)) {
            return (
                <div>
                    <ul className="data-list">
                        {value.map((item, idx) => (
                            <li key={idx}>{String(item)}</li>
                        ))}
                    </ul>
                </div>
            );
        }

        if (isPromptKey(key) && typeof value === 'string') {
            return (
                <p className="data-inline-row service-row">
                    <span className="data-inline-key">Selected prompt:</span>
                    <span className="data-inline-value">{value}</span>
                </p>
            );
        }

        if (typeof value === 'string') {
            return (
                <p className={`data-inline-row ${key.toLowerCase() === 'service' ? 'service-row' : ''}`}>
                    <span className="data-inline-key">{key}:</span>
                    <span className="data-inline-value">{value}</span>
                </p>
            );
        }

        if (Array.isArray(value)) {
            if (value.length > 0 && value.every((item) => typeof item === 'string' || typeof item === 'number')) {
                return (
                    <p className="data-inline-row">
                        <span className="data-inline-key">{key}:</span>
                        <span className="data-inline-value">{value.join(', ')}</span>
                    </p>
                );
            }

            return (
                <div>
                    <h4 className="data-key">{key}:</h4>
                    <ul className="data-list">
                        {value.map((item, idx) => (
                            <li key={idx}>{String(item)}</li>
                        ))}
                    </ul>
                </div>
            );
        }

        if (typeof value === 'object' && value !== null) {
            return (
                <div>
                    <h4 className="data-key">{key}:</h4>
                    <pre className="data-json">{JSON.stringify(value, null, 2)}</pre>
                </div>
            );
        }

        return (
            <p className="data-inline-row">
                <span className="data-inline-key">{key}:</span>
                <span className="data-inline-value">{String(value)}</span>
            </p>
        );
    };

    const sections = (subquery?.sections || []).filter((section) => {
        if (!section) return false;
        if (section.type === 'query') return Boolean(section.query?.trim());
        if (section.type === 'step') return Boolean(section.step?.trim()) && Boolean(section.message?.trim());
        if (section.type === 'response') return Boolean(section.response?.trim());
        if (section.type === 'data') {
            const entries = Object.entries(section.data || {}).filter(([_, value]) => {
                if (value === null || value === undefined) return false;
                if (typeof value === 'string') return value.trim().length > 0;
                if (Array.isArray(value)) return value.length > 0;
                if (typeof value === 'object') return Object.keys(value).length > 0;
                return true;
            });
            return entries.length > 0;
        }
        return false;
    });

    const nonResponseSections = sections.filter((section) => section.type !== 'response' && section.type !== 'query');
    const responseSections = sections.filter((section) => section.type === 'response');
    const hasResponseStarted = responseSections.some((section) => Boolean(section.response?.trim()));
    const executedSubquery = sections.find((section) => section.type === 'query' && section.query?.trim())?.query;
    const hasFlowDropdown = Boolean(executedSubquery) || nonResponseSections.length > 0;

    useEffect(() => {
        if (hasFlowDropdown && !hasOpenedOnce) {
            setIsFlowOpen(true);
            setHasOpenedOnce(true);
        }
    }, [hasFlowDropdown, hasOpenedOnce]);

    useEffect(() => {
        if (hasResponseStarted && !hasClosedOnResponse) {
            setIsFlowOpen(false);
            setHasClosedOnResponse(true);
        }
    }, [hasResponseStarted, hasClosedOnResponse]);

    if (sections.length === 0) {
        return null;
    }

    const renderSection = (section, index, withDivider = true) => (
        <div
            key={section.id || `${section.type}-${index}`}
            className={`subquery-section section-${section.type}`}
        >
            {withDivider && index > 0 && <hr className="subquery-divider" />}
            {section.type === 'step' && (
                <>
                    <p className="step-inline-row">
                        <span className="step-inline-key">{section.step}:</span>
                        <span className="step-inline-value">{section.message}</span>
                    </p>
                </>
            )}

            {section.type === 'data' && (
                <>
                    {Object.entries(section.data || {}).map(([key, value]) => {
                        if (value === null || value === undefined) return null;
                        if (typeof value === 'string' && !value.trim()) return null;
                        if (Array.isArray(value) && value.length === 0) return null;
                        if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return null;

                        return (
                            <div key={key} className="data-section">
                                {renderDataValue(key, value)}
                            </div>
                        );
                    })}
                </>
            )}

            {section.type === 'response' && (
                <>
                    <div className="response-container">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkBreaks]}
                            components={{
                                code({ inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <SyntaxHighlighter
                                            style={vscDarkPlus}
                                            language={match[1]}
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    );
                                }
                            }}
                        >
                            {section.response}
                        </ReactMarkdown>
                    </div>
                </>
            )}
        </div>
    );

    return (
        <div className="subquery-block">
            {hasFlowDropdown && (
                <div className="flow-dropdown">
                    <button
                        type="button"
                        className="flow-dropdown-trigger"
                        onClick={() => setIsFlowOpen((prev) => !prev)}
                        aria-expanded={isFlowOpen}
                    >
                        <span className="flow-dropdown-title">{executedSubquery || t.messageLabels.step}</span>
                        <span className={`flow-dropdown-icon ${isFlowOpen ? 'is-open' : ''}`}>▾</span>
                    </button>

                    <div className={`flow-dropdown-content ${isFlowOpen ? 'is-open' : 'is-closed'}`}>
                        <div className="flow-dropdown-content-inner">
                            {nonResponseSections.map((section, index) => renderSection(section, index))}
                        </div>
                    </div>
                </div>
            )}

            {responseSections.map((section, index) => renderSection(section, index, false))}
        </div>
    );
}

export const WorkflowLoader = ({ activeStep, workflowSteps }) => {
    const { t } = useLanguage();

    return (
        <div className="workflow-loader-card">
            <div className="workflow-loader-header">
                <img
                    className="workflow-loader-gif"
                    src={`${process.env.PUBLIC_URL}/loader-orbit.svg`}
                    alt={t.messageLabels.processingAlt}
                />
                <div className="workflow-loader-copy">
                    <span className="message-label">{t.messageLabels.processing}</span>
                    <h3>{activeStep || t.messageLabels.processingTitle}</h3>
                    {t.messageLabels.processingText ? <p>{t.messageLabels.processingText}</p> : null}
                </div>
            </div>

            <div className="workflow-steps">
                {workflowSteps.map((step) => (
                    <span key={step.id} className={`workflow-step-chip tone-${step.tone}`}>
                        {step.label}
                    </span>
                ))}
            </div>
        </div>
    );
};
